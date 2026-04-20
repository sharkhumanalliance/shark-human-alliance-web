import type { Member } from "@/lib/members";

const DEMO_MEMBERS: Member[] = [
  {
    id: "m-demo-finnley-001",
    name: "Marina Vale",
    tier: "protected",
    date: "2026-04-14T09:15:00.000Z",
    dedication: "Filed preemptively before summer holidays.",
    referralCode: "SHA-MRVA",
    referralCount: 0,
    registryVisibility: "public",
    dedicationReviewStatus: "approved",
  },
  {
    id: "m-demo-liaison-002",
    name: "Jonah Mercer",
    tier: "protected",
    date: "2026-04-13T16:40:00.000Z",
    dedication: "For morale, optics, and mild ocean anxiety.",
    referralCode: "SHA-JNMR",
    referralCount: 1,
    registryVisibility: "public",
    dedicationReviewStatus: "approved",
  },
  {
    id: "m-demo-field-003",
    name: "Petra Bloom",
    tier: "nonsnack",
    date: "2026-04-12T11:05:00.000Z",
    dedication: "Officially too organized to be edible.",
    referralCode: "SHA-PTBL",
    referralCount: 3,
    registryVisibility: "public",
    dedicationReviewStatus: "approved",
  },
  {
    id: "m-demo-senior-004",
    name: "Oliver Grant",
    tier: "business",
    date: "2026-04-09T08:20:00.000Z",
    dedication: "Certified on behalf of an unnecessarily serious office.",
    referralCode: "SHA-OLGR",
    referralCount: 6,
    registryVisibility: "public",
    dedicationReviewStatus: "approved",
  },
  {
    id: "m-demo-envoy-005",
    name: "Lucia Ortega",
    tier: "nonsnack",
    date: "2026-04-07T14:30:00.000Z",
    dedication: "Now operating under formal shark-friendly standing.",
    referralCode: "SHA-LUOR",
    referralCount: 12,
    registryVisibility: "public",
    dedicationReviewStatus: "approved",
  },
  {
    id: "m-demo-chief-006",
    name: "North Sea Studio",
    tier: "business",
    date: "2026-04-03T10:00:00.000Z",
    dedication: "Entire premises placed under symbolic marine protection.",
    referralCode: "SHA-NSS6",
    referralCount: 29,
    registryVisibility: "public",
    dedicationReviewStatus: "approved",
  },
];

export function shouldUseDemoMembers() {
  return process.env.NODE_ENV !== "production" || !process.env.VERCEL;
}

export function getDemoMembers(): Member[] {
  return DEMO_MEMBERS;
}

export function getDemoMemberById(id: string): Member | null {
  return DEMO_MEMBERS.find((member) => member.id === id) ?? null;
}
