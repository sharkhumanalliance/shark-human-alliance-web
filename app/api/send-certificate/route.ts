import { buildAbsoluteLocalizedUrl, buildReferralHref } from "@/lib/navigation";
import { NextRequest, NextResponse } from "next/server";
import {
  EMAIL_FROM,
  certificateEmailHtml,
  certificateEmailSubject,
  logEmailRouteEntered,
  sendEmailStrict,
} from "@/lib/email";
import { getMemberById } from "@/lib/members";
import { BASE_URL } from "@/lib/config";
import { getCertificateTemplateQueryParam } from "@/lib/certificate-templates";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { to, name, tier, memberId, referralCode } = body;

  logEmailRouteEntered({
    flow: "manual-send-certificate",
    route: "/api/send-certificate",
    recipient: to,
    memberId: memberId || null,
    tier: tier || null,
  });

  if (!to || !name || !tier) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[SHA Email] RESEND_API_KEY not set");
    return NextResponse.json(
      { error: "Email sending is not configured" },
      { status: 500 }
    );
  }

  try {
    const member = await getMemberById(memberId);

    if (!member?.accessToken) {
      console.warn("[SHA Email] Member missing or certificate unavailable", {
        memberId: memberId || null,
        hasRecipient: typeof to === "string" && to.trim().length > 0,
      });
      return NextResponse.json(
        { error: "Member not found or certificate not available" },
        { status: 404 }
      );
    }

    const locale = member.locale || "en";
    const templateQuery = getCertificateTemplateQueryParam(member.template);
    const certificateUrl = buildAbsoluteLocalizedUrl(
      BASE_URL,
      locale,
      `/certificate/view?token=${member.accessToken}${templateQuery}&download=1`
    );

    await sendEmailStrict(
      {
        from: EMAIL_FROM,
        to,
        subject: certificateEmailSubject({ name, locale }),
        html: certificateEmailHtml({
          name,
          tier,
          registryId: (memberId || "SHA-XXXX").toUpperCase(),
          referralCode: referralCode || "",
          downloadUrl: certificateUrl,
          registryUrl:
            member.registryVisibility === "public"
              ? buildAbsoluteLocalizedUrl(BASE_URL, locale, `/registry?highlight=${memberId}`)
              : undefined,
          careerUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, "/career"),
          termsUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, "/terms"),
          manageUrl: buildAbsoluteLocalizedUrl(
            BASE_URL,
            locale,
            `/certificate/view?token=${member.accessToken}#record-controls`
          ),
          referralUrl: buildAbsoluteLocalizedUrl(BASE_URL, locale, buildReferralHref(referralCode || "")),
          locale,
        }),
      },
      {
        flow: "manual-send-certificate",
        route: "/api/send-certificate",
        recipient: to,
        memberId,
        tier,
        locale,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SHA Email] Send failed:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
