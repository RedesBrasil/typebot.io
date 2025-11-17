import prisma from "@typebot.io/prisma";
import type { TagTriggerType } from "./schemas";

interface ExecuteTagTriggersProps {
  contactId: string;
  tagId: string;
  triggerType: TagTriggerType;
  workspaceId: string;
  excludeSessionId?: string;
}

export const executeTagTriggers = async ({
  contactId,
  tagId,
  triggerType,
  workspaceId,
}: ExecuteTagTriggersProps) => {
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

  if (triggers.length === 0) return { triggersExecuted: 0 };

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

  if (!contact) return { triggersExecuted: 0 };

  let triggersExecuted = 0;

  for (const trigger of triggers) {
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
        console.log(
          `Skipping trigger ${trigger.id}: contact has active session`,
        );
        continue;
      }
    }

    // Handle delay
    if (trigger.delaySeconds > 0) {
      // TODO: Implement delayed trigger execution with job queue (BullMQ/Redis)
      console.log(
        `Trigger ${trigger.id} scheduled with ${trigger.delaySeconds}s delay`,
      );
      // For now, we'll skip delayed triggers
      continue;
    }

    // Execute trigger immediately
    try {
      await startTypebotForContact({
        contact,
        typebotPublicId: trigger.typebot.publicId,
        eventId: trigger.eventId,
      });
      triggersExecuted++;
    } catch (error) {
      console.error(`Error executing trigger ${trigger.id}:`, error);
    }
  }

  return { triggersExecuted };
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
