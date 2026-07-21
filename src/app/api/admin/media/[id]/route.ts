import { removeVehicleImage, updateVehicleImage } from "@/data/media";
import { getAuthenticatedStaff } from "@/lib/auth/server";
import { mediaEditSchema } from "@/lib/media-validation";
import { hasTrustedMutationOrigin } from "@/lib/security/request-origin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Untrusted request origin." }, { status: 403 });
  const staff = await getAuthenticatedStaff();
  if (!staff) return Response.json({ error: "Unauthorized." }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = mediaEditSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Review the image details." }, { status: 422 });
  try {
    const { id } = await context.params;
    await updateVehicleImage(id, parsed.data, staff.id);
    return Response.json({ updated: true });
  } catch {
    return Response.json({ error: "Image details could not be saved." }, { status: 409 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Untrusted request origin." }, { status: 403 });
  const staff = await getAuthenticatedStaff();
  if (!staff) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id } = await context.params;
    await removeVehicleImage(id, staff.id);
    return Response.json({ removed: true });
  } catch {
    return Response.json({ error: "Image could not be removed." }, { status: 409 });
  }
}
