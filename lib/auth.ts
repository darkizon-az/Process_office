import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

const COOKIE = "process_office_session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "local-development-secret-change-in-production");

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId, role: "ADMIN" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
}

export async function clearSession() { (await cookies()).delete(COOKIE); }

export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "ADMIN" || typeof payload.userId !== "string") return null;
    return prisma.user.findFirst({ where: { id: payload.userId, role: "ADMIN", active: true } });
  } catch { return null; }
}

export async function requireAdmin() { const user = await getAdmin(); if (!user) redirect("/login"); return user; }

export async function requireAdminApi() { const user = await getAdmin(); if (!user) throw new Error("UNAUTHORIZED"); return user; }
