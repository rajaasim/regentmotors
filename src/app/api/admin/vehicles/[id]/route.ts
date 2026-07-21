import { updateAdminVehicle } from "@/data/admin-vehicles";
import { getAuthenticatedStaff } from "@/lib/auth/server";
import { vehicleUpdateSchema } from "@/lib/vehicle-validation";
import { hasTrustedMutationOrigin } from "@/lib/security/request-origin";
import { revalidatePath } from "next/cache";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Untrusted request origin." }, { status: 403 });
  const staff = await getAuthenticatedStaff();
  if (!staff) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = vehicleUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "Review the vehicle fields." }, { status: 422 });
  }

  try {
    const { id } = await context.params;
    await updateAdminVehicle(id, parsed.data, staff.id);
    revalidatePath("/");
    revalidatePath("/inventory");
    return Response.json({ updated: true });
  } catch {
    return Response.json({ error: "Vehicle could not be updated." }, { status: 500 });
  }
}
