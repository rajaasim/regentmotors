import { ServerConfigurationError } from "@/lib/env/server";
import { getAuth } from "@/lib/auth/server";

async function handle(request: Request) {
  try {
    return await getAuth().handler(request);
  } catch (error) {
    if (error instanceof ServerConfigurationError) {
      return Response.json(
        { error: "Staff authentication is not configured." },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "Authentication request failed." },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
