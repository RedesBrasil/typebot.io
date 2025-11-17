import prisma from "@typebot.io/prisma";
import { executeTagTriggers } from "./executeTagTriggers";

interface AddTagToContactProps {
  contactId: string;
  tagId?: string;
  tagName?: string;
  workspaceId: string;
  addedBy?: string;
  skipTriggers?: boolean;
}

export const addTagToContact = async ({
  contactId,
  tagId,
  tagName,
  workspaceId,
  addedBy,
  skipTriggers = false,
}: AddTagToContactProps) => {
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

    // Create tag if it doesn't exist
    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          workspaceId,
          name: tagName,
        },
      });
    }
  }

  if (!tag) throw new Error("Tag not found and tagName not provided");

  // Check if contact already has the tag
  const existing = await prisma.tagOnContact.findUnique({
    where: {
      contactId_tagId: {
        contactId,
        tagId: tag.id,
      },
    },
  });

  if (existing) {
    // Already has the tag, skip
    return { tag, alreadyExists: true };
  }

  // Add tag to contact
  await prisma.tagOnContact.create({
    data: {
      contactId,
      tagId: tag.id,
      addedBy,
    },
  });

  // Execute triggers
  if (!skipTriggers) {
    await executeTagTriggers({
      contactId,
      tagId: tag.id,
      triggerType: "tag_added",
      workspaceId,
    });
  }

  return { tag, alreadyExists: false };
};
