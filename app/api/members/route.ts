import { NextRequest, NextResponse } from "next/server";
import { listMembers } from "@/lib/members";

export async function GET() {
  const members = await listMembers();
  // Strip sensitive fields from public response
  const publicMembers = members.map((member) => {
    const sanitized = { ...member };
    delete sanitized.accessToken;
    delete sanitized.stripeSessionId;
    delete sanitized.email;
    delete sanitized.template;
    delete sanitized.locale;
    return sanitized;
  });
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
