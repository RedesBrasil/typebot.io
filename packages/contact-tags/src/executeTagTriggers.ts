import prisma from "@typebot.io/prisma";
import type { TagTriggerType } from "./schemas";

interface ExecuteTagTriggersProps {
  contactId: string;
  tagId: string;
  triggerType: TagTriggerType;
  workspaceId: string;
  excludeSessionId?: string;
}

interface TriggerExecutionLog {
  triggerId: string;
  contactId: string;
  status: "success" | "skipped" | "error";
  reason?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

const DEFAULT_COOLDOWN_SECONDS = 60; // 1 minute default cooldown

export const executeTagTriggers = async ({
  contactId,
  tagId,
  triggerType,
  workspaceId,
}: ExecuteTagTriggersProps) => {
  const executionLogs: TriggerExecutionLog[] = [];

  // Find triggers configured for this tag
  const triggers = await prisma.tagTrigger.findMany({
    where: {
      tagId,
      triggerType,
      isEnabled: true,
    },
    include: {
      typebot: {
        select: {
          id: true,
          publicId: true,
          workspaceId: true,
        },
      },
    },
  });

  if (triggers.length === 0) {
    return { triggersExecuted: 0, logs: executionLogs };
  }

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!contact) {
    return { triggersExecuted: 0, logs: executionLogs };
  }

  let triggersExecuted = 0;

  // Sort triggers by priority (lower number = higher priority)
  const sortedTriggers = [...triggers].sort(
    (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
  );

  for (const trigger of sortedTriggers) {
    const logEntry: TriggerExecutionLog = {
      triggerId: trigger.id,
      contactId,
      status: "skipped",
      timestamp: new Date(),
    };

    // Check cooldown period
    const cooldownSeconds = trigger.cooldownSeconds ?? DEFAULT_COOLDOWN_SECONDS;
    if (cooldownSeconds > 0) {
      const cooldownCutoff = new Date(Date.now() - cooldownSeconds * 1000);
      const recentExecution = await prisma.tagTriggerLog.findFirst({
        where: {
          triggerId: trigger.id,
          contactId,
          status: "SUCCESS",
          executedAt: {
            gte: cooldownCutoff,
          },
        },
        orderBy: {
          executedAt: "desc",
        },
      });

      if (recentExecution) {
        logEntry.reason = `Cooldown period active (last executed at ${recentExecution.executedAt.toISOString()})`;
        logEntry.details = {
          cooldownSeconds,
          lastExecution: recentExecution.executedAt,
        };
        executionLogs.push(logEntry);

        // Log to database
        await logTriggerExecution({
          triggerId: trigger.id,
          contactId,
          tagId,
          status: "SKIPPED",
          message: logEntry.reason,
        });

        console.log(
          `Skipping trigger ${trigger.id}: ${logEntry.reason}`,
        );
        continue;
      }
    }

    // Check if contact has active session
    if (trigger.onlyIfNoActiveSession) {
      const activeSession = await prisma.chatSession.findFirst({
        where: {
          state: {
            path: ["contactId"],
            equals: contactId,
          },
        },
      });

      if (activeSession) {
        logEntry.reason = "Contact has active session";
        logEntry.details = { sessionId: activeSession.id };
        executionLogs.push(logEntry);

        await logTriggerExecution({
          triggerId: trigger.id,
          contactId,
          tagId,
          status: "SKIPPED",
          message: logEntry.reason,
        });

        console.log(
          `Skipping trigger ${trigger.id}: contact has active session`,
        );
        continue;
      }
    }

    // Handle delay
    if (trigger.delaySeconds > 0) {
      // TODO: Implement delayed trigger execution with job queue (BullMQ/Redis)
      logEntry.reason = `Delayed execution scheduled (${trigger.delaySeconds}s)`;
      logEntry.details = { delaySeconds: trigger.delaySeconds };
      executionLogs.push(logEntry);

      await logTriggerExecution({
        triggerId: trigger.id,
        contactId,
        tagId,
        status: "SCHEDULED",
        message: `Scheduled for ${trigger.delaySeconds}s delay`,
      });

      console.log(
        `Trigger ${trigger.id} scheduled with ${trigger.delaySeconds}s delay`,
      );
      // For now, we'll skip delayed triggers
      continue;
    }

    // Execute trigger immediately
    try {
      const result = await startTypebotForContact({
        contact,
        typebotPublicId: trigger.typebot.publicId,
        eventId: trigger.eventId,
      });

      logEntry.status = "success";
      logEntry.reason = "Trigger executed successfully";
      logEntry.details = result;
      executionLogs.push(logEntry);

      await logTriggerExecution({
        triggerId: trigger.id,
        contactId,
        tagId,
        status: "SUCCESS",
        message: `Started typebot ${trigger.typebot.publicId}`,
        metadata: result,
      });

      triggersExecuted++;
    } catch (error) {
      logEntry.status = "error";
      logEntry.reason = error instanceof Error ? error.message : String(error);
      executionLogs.push(logEntry);

      await logTriggerExecution({
        triggerId: trigger.id,
        contactId,
        tagId,
        status: "ERROR",
        message: logEntry.reason,
      });

      console.error(`Error executing trigger ${trigger.id}:`, error);
    }
  }

  return { triggersExecuted, logs: executionLogs };
};

interface LogTriggerExecutionProps {
  triggerId: string;
  contactId: string;
  tagId: string;
  status: "SUCCESS" | "SKIPPED" | "ERROR" | "SCHEDULED";
  message?: string;
  metadata?: Record<string, unknown>;
}

const logTriggerExecution = async ({
  triggerId,
  contactId,
  tagId,
  status,
  message,
  metadata,
}: LogTriggerExecutionProps) => {
  try {
    await prisma.tagTriggerLog.create({
      data: {
        triggerId,
        contactId,
        tagId,
        status,
        message,
        metadata: metadata ?? {},
        executedAt: new Date(),
      },
    });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error("Failed to log trigger execution:", error);
  }
};

interface StartTypebotForContactProps {
  contact: {
    id: string;
    phone?: string | null;
    email?: string | null;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    customFields: unknown;
    tags: Array<{
      tag: {
        name: string;
      };
    }>;
  };
  typebotPublicId: string | null;
  eventId?: string | null;
}

const startTypebotForContact = async ({
  contact,
  typebotPublicId,
  eventId,
}: StartTypebotForContactProps) => {
  if (!typebotPublicId) {
    throw new Error("Typebot public ID is required");
  }

  // Prepare prefilled variables with contact data
  const prefilledVariables: Record<string, unknown> = {
    "contact.id": contact.id,
    "contact.phone": contact.phone,
    "contact.email": contact.email,
    "contact.name": contact.name,
    "contact.firstName": contact.firstName,
    "contact.lastName": contact.lastName,
    "contact.tags": contact.tags.map((t) => t.tag.name),
  };

  // Add custom fields
  if (
    contact.customFields &&
    typeof contact.customFields === "object" &&
    !Array.isArray(contact.customFields)
  ) {
    for (const [key, value] of Object.entries(
      contact.customFields as Record<string, unknown>,
    )) {
      prefilledVariables[`contact.customFields.${key}`] = value;
    }
  }

  // Note: The actual bot flow will be started by the external system (Evolution API)
  // This function prepares the data for the trigger
  // In a full implementation, this would call the Typebot API or use internal methods

  console.log(
    `Starting typebot ${typebotPublicId} for contact ${contact.id}`,
    {
      eventId,
      prefilledVariables,
    },
  );

  // Store trigger execution info for external systems to pick up
  // This is a placeholder - in production, you'd use a queue or webhook
  return {
    typebotPublicId,
    contactId: contact.id,
    prefilledVariables,
    eventId,
  };
};
