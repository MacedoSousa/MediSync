import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/auth";

export type AppRole = "ADMIN" | "DOCTOR" | "PATIENT" | "PHARMACY_ADMIN";
export type SessionUser = { id: string; role?: AppRole };
export type SessionWithRole = Session & { user: SessionUser };
export type RequireSessionResult = { session: SessionWithRole } | { error: Response };

export async function requireSession(allowedRoles?: AppRole[]): Promise<RequireSessionResult> {
  const raw = await getServerSession(authOptions);
  if (!raw || !raw.user) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const session = raw as unknown as SessionWithRole;
  const role = session.user.role;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}


