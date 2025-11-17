import prisma from "@typebot.io/prisma";
import { executeTagTriggers } from "./executeTagTriggers";

interface RemoveTagFromContactProps {
  contactId: string;
  tagId?: string;
  tagName?: string;
  workspaceId: string;
  skipTriggers?: boolean;
}

export const removeTagFromContact = async ({
  contactId,
  tagId,
  tagName,
  workspaceId,
  skipTriggers = false,
}: RemoveTagFromContactProps) => {
  // Find tag by ID or name
  let tag;
  if (tagId) {
    tag = await prisma.tag.findUnique({ where: { id: tagId } });
  } else if (tagName) {
    tag = await prisma.tag.findUnique({
      where: {
        workspaceId_name: {
          workspaceId,
          name: tagName,
        },
      },
    });
  }

  if (!tag) {
    return { removed: false, reason: "Tag not found" };
  }

  // Check if contact has the tag
  const existing = await prisma.tagOnContact.findUnique({
    where: {
      contactId_tagId: {
        contactId,
        tagId: tag.id,
      },
    },
  });

  if (!existing) {
    return { removed: false, reason: "Contact does not have this tag" };
  }

  // Remove tag from contact
  await prisma.tagOnContact.delete({
    where: {
      contactId_tagId: {
        contactId,
        tagId: tag.id,
      },
    },
  });

  // Execute triggers
  if (!skipTriggers) {
    await executeTagTriggers({
      contactId,
      tagId: tag.id,
      triggerType: "tag_removed",
      workspaceId,
    });
  }

  return { removed: true, tag };
};
