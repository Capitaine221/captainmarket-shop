import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rateLimit";

type IncomingItem = { variantId: string; quantity: number };

const CHECKOUT_MAX_ATTEMPTS = 10;
const CHECKOUT_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const { allowed } = checkRateLimit(`checkout:${ip}`, CHECKOUT_MAX_ATTEMPTS, CHECKOUT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives, réessaie dans un instant." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];

  if (items.length === 0) {
    return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
  });

  const lineItems: {
    variantId: string;
    productId: string;
    title: string;
    variantTitle: string;
    priceCents: number;
    quantity: number;
    imageUrl?: string;
  }[] = [];

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) continue;
    const quantity = Math.max(1, Math.min(item.quantity, variant.inventoryQuantity));
    if (quantity <= 0) continue;
    lineItems.push({
      variantId: variant.id,
      productId: variant.productId,
      title: variant.product.title,
      variantTitle: variant.title,
      priceCents: variant.priceCents,
      quantity,
      imageUrl: variant.product.images[0]?.url,
    });
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "Aucun article disponible en stock." }, { status: 400 });
  }

  const totalCents = lineItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      email: "pending@checkout",
      status: "PENDING",
      totalCents,
      currency: "CAD",
      items: {
        create: lineItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          titleSnapshot: i.title,
          variantSnapshot: i.variantTitle,
          priceCents: i.priceCents,
          quantity: i.quantity,
        })),
      },
    },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "cad",
          unit_amount: i.priceCents,
          product_data: {
            name: `${i.title} — ${i.variantTitle}`,
            images: i.imageUrl ? [i.imageUrl] : undefined,
          },
        },
      })),
      shipping_address_collection: { allowed_countries: ["CA", "US"] },
      success_url: `${siteUrl}/checkout/success?order=${order.id}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Le paiement n'est pas encore configuré. Ajoute tes clés Stripe dans .env." },
      { status: 500 }
    );
  }
}
