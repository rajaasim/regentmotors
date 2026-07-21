import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle";

import { account, session, user, verification } from "@/db/schema";

type RegentDatabase = DB;

type RegentAuthOptions = {
  database: RegentDatabase;
  secret: string;
  baseURL: string;
  allowSignUp?: boolean;
};

export function createRegentAuth(options: RegentAuthOptions) {
  const secureCookies = options.baseURL.startsWith("https://");
  return betterAuth({
    appName: "Regent Motors Administration",
    baseURL: options.baseURL,
    secret: options.secret,
    database: drizzleAdapter(options.database, {
      provider: "pg",
      schema: { account, session, user, verification },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !options.allowSignUp,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    rateLimit: {
      enabled: true,
    },
    trustedOrigins: [options.baseURL],
    advanced: {
      useSecureCookies: secureCookies,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookies,
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "admin",
          input: false,
        },
      },
    },
  });
}
