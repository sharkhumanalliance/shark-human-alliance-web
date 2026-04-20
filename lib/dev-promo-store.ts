import type { Member } from "@/lib/members";

type PromoMember = Member;

declare global {
  var __shaDevPromoMembersBySession: Map<string, PromoMember> | undefined;
  var __shaDevPromoMembersByToken: Map<string, PromoMember> | undefined;
}

function getSessionStore() {
  if (!globalThis.__shaDevPromoMembersBySession) {
    globalThis.__shaDevPromoMembersBySession = new Map<string, PromoMember>();
  }
  return globalThis.__shaDevPromoMembersBySession;
}

function getTokenStore() {
  if (!globalThis.__shaDevPromoMembersByToken) {
    globalThis.__shaDevPromoMembersByToken = new Map<string, PromoMember>();
  }
  return globalThis.__shaDevPromoMembersByToken;
}

export function saveDevPromoMember(sessionId: string, member: PromoMember) {
  getSessionStore().set(sessionId, member);
  if (member.accessToken) {
    getTokenStore().set(member.accessToken, member);
  }
}

export function getDevPromoMemberBySession(sessionId: string) {
  return getSessionStore().get(sessionId) ?? null;
}

export function getDevPromoMemberByAccessToken(token: string) {
  return getTokenStore().get(token) ?? null;
}

export function setDevPromoMemberRegistryVisibility(
  token: string,
  registryVisibility: PromoMember["registryVisibility"]
) {
  const member = getTokenStore().get(token);
  if (!member) return null;

  const updated = { ...member, registryVisibility };
  getTokenStore().set(token, updated);

  if (member.stripeSessionId) {
    getSessionStore().set(member.stripeSessionId, updated);
  }

  return updated;
}

export function eraseDevPromoMember(token: string) {
  const member = getTokenStore().get(token);
  if (!member) return null;

  const erased: PromoMember = {
    ...member,
    name: "Deleted Member",
    dedication: "",
    email: undefined,
    accessToken: undefined,
    registryVisibility: "private",
    erasedAt: new Date().toISOString(),
  };

  getTokenStore().delete(token);
  if (member.stripeSessionId) {
    getSessionStore().set(member.stripeSessionId, erased);
  }

  return erased;
}
