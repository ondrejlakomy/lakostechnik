import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Role } from "./permissions";
import { hasPermission } from "./permissions";

type Permission = Parameters<typeof hasPermission>[1];

export async function getSessionOrError() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Nepřihlášen" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function requirePermission(permission: Permission) {
  const { error, session } = await getSessionOrError();
  if (error) return { error, session: null };

  if (!hasPermission(session!.user.role as Role, permission)) {
    return {
      error: NextResponse.json({ error: "Nedostatečná oprávnění" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session: session! };
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
