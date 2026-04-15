import { NextRequest, NextResponse } from "next/server";
import { listMembers, type Member } from "@/lib/members";
import { getDemoMembers, shouldUseDemoMembers } from "@/lib/demo-members";

export async function GET() {
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
