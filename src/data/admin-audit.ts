import "server-only";

import { getDatabase } from "@/db";
import { adminAuditEvents, type AuditSummary } from "@/db/schema";

export async function recordAdminAudit(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: AuditSummary;
}) {
  await getDatabase().insert(adminAuditEvents).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
  });
}
