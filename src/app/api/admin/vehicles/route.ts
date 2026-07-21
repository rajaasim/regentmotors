import { createAdminVehicle } from "@/data/admin-vehicles";
import { getAuthenticatedStaff } from "@/lib/auth/server";
import { vehicleCreateSchema } from "@/lib/vehicle-validation";
import { hasTrustedMutationOrigin } from "@/lib/security/request-origin";
import { revalidatePath } from "next/cache";

export async function GET() {
  const staff = await getAuthenticatedStaff();
  if (!staff) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json({ error: "Use the administration page for vehicle reads." }, { status: 405 });
}

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

  const parsed = vehicleCreateSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "Review the vehicle fields." }, { status: 422 });
  }

  try {
    const id = await createAdminVehicle(parsed.data, staff.id);
    revalidatePath("/");
    revalidatePath("/inventory");
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "Vehicle could not be created." }, { status: 500 });
  }
}
