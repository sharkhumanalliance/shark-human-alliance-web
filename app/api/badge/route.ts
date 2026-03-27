
import { NextRequest, NextResponse } from "next/server";
import { getMemberByAccessToken } from "@/lib/members";
import { generateNonSnackBadgeSvg } from "@/lib/non-snack-badge";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const download = request.nextUrl.searchParams.get("download") === "1";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const member = await getMemberByAccessToken(token);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (member.tier !== "nonsnack") {
    return NextResponse.json({ error: "Badge available only for Non-Snack members" }, { status: 404 });
  }

  const svg = generateNonSnackBadgeSvg(member.name);
  const filename = `${member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "member"}-non-snack-badge.svg`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
    },
  });
}
