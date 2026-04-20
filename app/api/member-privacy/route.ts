import { NextRequest, NextResponse } from "next/server";
import {
  eraseMemberById,
  getMemberByAccessToken,
  setMemberRegistryVisibility,
} from "@/lib/members";
import {
  eraseDevPromoMember,
  getDevPromoMemberByAccessToken,
  setDevPromoMemberRegistryVisibility,
} from "@/lib/dev-promo-store";
import { getRateLimitKey, takeRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const rateLimit = takeRateLimit(
    getRateLimitKey(getClientIp(request), "member-privacy"),
    10,
    60_000
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await request.json();
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const action = typeof body?.action === "string" ? body.action.trim() : "";

  if (!token || !["hide", "erase"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let member = null;
  try {
    member = await getMemberByAccessToken(token);
  } catch {
    member = null;
  }

  if (!member) {
    const devMember = getDevPromoMemberByAccessToken(token);
    if (!devMember) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (action === "hide") {
      const updated = setDevPromoMemberRegistryVisibility(token, "private");
      return NextResponse.json({
        success: true,
        action,
        registryVisibility: updated?.registryVisibility ?? "private",
      });
    }

    eraseDevPromoMember(token);
    return NextResponse.json({
      success: true,
      action,
      registryVisibility: "private",
      erased: true,
    });
  }

  if (action === "hide") {
    const updated = await setMemberRegistryVisibility(member.id, "private");
    return NextResponse.json({
      success: true,
      action,
      registryVisibility: updated?.registryVisibility ?? "private",
    });
  }

  await eraseMemberById(member.id);
  return NextResponse.json({
    success: true,
    action,
    registryVisibility: "private",
    erased: true,
  });
}
