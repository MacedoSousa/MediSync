import type { Session, User as NextAuthUser, AuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import argon2 from "argon2";

interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "DOCTOR" | "PATIENT" | "PHARMACY_ADMIN";
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    EmailProvider({
      from: process.env.NOTIFY_FROM_EMAIL || "no-reply@medisync.local",
      sendVerificationRequest: async ({ identifier, url }) => {
        const { ses } = await import("@/lib/aws");
        const { SendEmailCommand } = await import("@aws-sdk/client-sesv2");
        const from = process.env.NOTIFY_FROM_EMAIL || "no-reply@medisync.local";
        const subject = "Seu link de acesso - MediSync";
        const html = `<p>Use o link para entrar:</p><p><a href="${url}">${url}</a></p>`;
        await ses.send(new SendEmailCommand({
          FromEmailAddress: from,
          Destination: { ToAddresses: [identifier] },
          Content: { Simple: { Subject: { Data: subject }, Body: { Html: { Data: html } } } },
        }));
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) return null;
        const appUser: AppUser = { id: user.id, email: user.email, name: user.name ?? null, role: user.role as AppUser["role"] };
        return appUser as unknown as NextAuthUser;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async session({ session, user }: { session: Session; user: AdapterUser }) {
      const s = session as Session & { user: (Session["user"] & { id?: string; role?: AppUser["role"] }) };
      const u = user as AdapterUser & { role?: AppUser["role"] };
      if (s.user && u) {
        s.user.id = u.id;
        if (u.role) s.user.role = u.role;
      }
      return s;
    },
  },
};


