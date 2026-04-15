import type { Member } from "@/lib/members";

type PromoMember = Member;

declare global {
  // eslint-disable-next-line no-var
  var __shaDevPromoMembersBySession: Map<string, PromoMember> | undefined;
  // eslint-disable-next-line no-var
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
