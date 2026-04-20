import { NextRequest, NextResponse } from "next/server";
import { listMembers, type Member } from "@/lib/members";
import { getDemoMembers, shouldUseDemoMembers } from "@/lib/demo-members";
import { getRateLimitKey, takeRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(request: NextRequest) {
  const rateLimit = takeRateLimit(
    getRateLimitKey(getClientIp(request), "public-members"),
    20,
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

  let members: Member[] = [];

  try {
    members = await listMembers();
  } catch (error) {
    if (!shouldUseDemoMembers()) {
      throw error;
    }
  }

  if (shouldUseDemoMembers() && members.length === 0) {
    members = getDemoMembers();
  }

  const publicMembers = members
    .filter((member) => member.registryVisibility === "public" && !member.erasedAt)
    .map((member) => ({
      id: member.id,
      name: member.name,
      tier: member.tier,
      date: member.date,
      dedication: member.dedication,
      referralCode: member.referralCode,
      referredBy: member.referredBy,
      referralCount: member.referralCount,
      registryVisibility: member.registryVisibility,
    }));
  return NextResponse.json(publicMembers);
}

export async function POST(request: NextRequest) {
  void request;

  return NextResponse.json(
    {
      error:
        "Direct member creation is disabled. Use the checkout flow or an approved promo flow.",
    },
    { status: 403 }
  );
}
