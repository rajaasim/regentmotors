import { createMediaUploadIntent } from "@/data/media";
import { getAuthenticatedStaff } from "@/lib/auth/server";
import { uploadIntentSchema } from "@/lib/media-validation";
import { hasTrustedMutationOrigin } from "@/lib/security/request-origin";

export async function POST(request: Request) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Untrusted request origin." }, { status: 403 });
  const staff = await getAuthenticatedStaff();
  if (!staff) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = uploadIntentSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json(
      { error: "Review the selected image." },
      { status: 422 },
    );
  }

  try {
    return Response.json(
      await createMediaUploadIntent(parsed.data, staff.id),
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "The image upload could not be prepared." },
      { status: 500 },
    );
  }
}
