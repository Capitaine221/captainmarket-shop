import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { slug: true } } } } },
      });
      if (order && order.status !== "PAID") {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: {
              status: "PAID",
              email: session.customer_details?.email || order.email,
              shippingName: session.customer_details?.name || undefined,
              shippingAddress: session.customer_details?.address?.line1 || undefined,
              shippingCity: session.customer_details?.address?.city || undefined,
              shippingCountry: session.customer_details?.address?.country || undefined,
              shippingPostal: session.customer_details?.address?.postal_code || undefined,
            },
          }),
          ...order.items.map((item) =>
            prisma.productVariant.update({
              where: { id: item.variantId },
              data: { inventoryQuantity: { decrement: item.quantity } },
            })
          ),
        ]);

        revalidatePath("/admin/orders");
        revalidatePath("/admin");
        revalidatePath("/");
        for (const item of order.items) {
          revalidatePath(`/product/${item.product.slug}`);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
