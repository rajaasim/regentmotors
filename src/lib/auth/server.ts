import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDatabase } from "@/db";
import { ServerConfigurationError } from "@/lib/env/server";
import { createRegentAuth } from "@/lib/auth/factory";
import { getAuthEnvironment } from "@/lib/env/server";

type CreateAuthOptions = {
  allowSignUp?: boolean;
};

export function createAuth(options: CreateAuthOptions = {}) {
  const environment = getAuthEnvironment();

  return createRegentAuth({
    database: getDatabase(),
    secret: environment.secret,
    baseURL: environment.baseURL,
    allowSignUp: options.allowSignUp,
  });
}

export const getAuth = cache(() => createAuth());

export type AuthenticatedStaff = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

function normalizeRole(role: unknown): AuthenticatedStaff["role"] {
  if (role === "admin" || role === "editor") return role;
  throw new Error("Staff account has an invalid role.");
}

export const getAuthenticatedStaff = cache(
  async (): Promise<AuthenticatedStaff | null> => {
    let result: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
    try {
      const auth = getAuth();
      result = await auth.api.getSession({ headers: await headers() });
    } catch (error) {
      if (error instanceof ServerConfigurationError) return null;
      throw error;
    }

    if (!result?.user) {
      return null;
    }

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: normalizeRole(result.user.role),
    };
  },
);

export async function requireStaff() {
  const staff = await getAuthenticatedStaff();

  if (!staff) {
    redirect("/admin/login");
  }

  return staff;
}

export async function requireAdmin() {
  const staff = await requireStaff();

  if (staff.role !== "admin") {
    redirect("/admin");
  }

  return staff;
}
