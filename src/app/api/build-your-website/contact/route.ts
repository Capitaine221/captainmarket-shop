import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const CONTACT_MAX_ATTEMPTS = 5;
const CONTACT_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  const ip = await getClientIp();
  const { allowed } = checkRateLimit(`website-package-contact:${ip}`, CONTACT_MAX_ATTEMPTS, CONTACT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives, réessaie dans un instant." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const packageId = String(body?.packageId ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const phone = String(body?.phone ?? "").trim();

  if (!packageId || !message || !email) {
    return NextResponse.json({ error: "Merci de remplir les champs requis." }, { status: 400 });
  }

  const pkg = await prisma.websitePackage.findUnique({ where: { id: packageId } });
  if (!pkg) {
    return NextResponse.json({ error: "Forfait introuvable." }, { status: 404 });
  }

  const to = process.env.WEBSITE_PACKAGE_CONTACT_EMAIL;
  if (!to) {
    return NextResponse.json({ error: "Destinataire non configuré." }, { status: 500 });
  }

  try {
    const resend = getResend();
    const { error: sendError } = await resend.emails.send({
      from: "CaptainMarket <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Build your website — ${pkg.name}`,
      text: [
        `Forfait: ${pkg.name}`,
        `Email: ${email}`,
        `Téléphone: ${phone || "(non fourni)"}`,
        "",
        "Description du projet:",
        message,
      ].join("\n"),
    });
    if (sendError) {
      console.error("[build-your-website/contact] Resend rejected the email:", sendError);
      return NextResponse.json({ error: "L'envoi a échoué. Réessaie plus tard." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[build-your-website/contact] Resend send failed:", e);
    return NextResponse.json({ error: "L'envoi a échoué. Réessaie plus tard." }, { status: 500 });
  }
}
