"use server"

import { getPartnerSession } from "@/lib/auth-partner-session";

export async function GetPartnerSessionAction() {
  const session = await getPartnerSession();
  return session ? { id: session.user.id, name: session.user.name } : null;
}
