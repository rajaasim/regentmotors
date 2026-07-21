import { revalidatePath } from "next/cache";

import { recordAdminAudit } from "@/data/admin-audit";
import { upsertSiteSettings } from "@/data/site-settings-repository";
import { getAuthenticatedStaff } from "@/lib/auth/server";
import { siteSettingsSchema } from "@/lib/site-settings-validation";
import { hasTrustedMutationOrigin } from "@/lib/security/request-origin";

export async function PATCH(request: Request) {
  if (!hasTrustedMutationOrigin(request)) return Response.json({ error: "Untrusted request origin." }, { status: 403 });
  const staff = await getAuthenticatedStaff();
  if (!staff) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Review the settings fields." }, { status: 422 });

  try {
    await upsertSiteSettings(parsed.data, staff.id);
    await recordAdminAudit({ actorUserId: staff.id, action: "settings.updated", entityType: "site_settings", entityId: "default", summary: {} });
    for (const path of ["/", "/inventory", "/financing", "/contact"]) revalidatePath(path);
    revalidatePath("/", "layout");
    return Response.json({ updated: true });
  } catch {
    return Response.json({ error: "Settings could not be saved." }, { status: 500 });
  }
}
