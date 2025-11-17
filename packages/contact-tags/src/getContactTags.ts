import prisma from "@typebot.io/prisma";

export const getContactTags = async (contactId: string) => {
  const tagsOnContact = await prisma.tagOnContact.findMany({
    where: { contactId },
    include: {
      tag: true,
    },
    orderBy: {
      addedAt: "desc",
    },
  });

  return tagsOnContact.map((toc) => ({
    id: toc.tag.id,
    name: toc.tag.name,
    color: toc.tag.color,
    addedAt: toc.addedAt,
    addedBy: toc.addedBy,
  }));
};

export const contactHasTag = async (
  contactId: string,
  tagIdentifier: string,
): Promise<boolean> => {
  // Check by tag ID first
  const byId = await prisma.tagOnContact.findUnique({
    where: {
      contactId_tagId: {
        contactId,
        tagId: tagIdentifier,
      },
    },
  });

  if (byId) return true;

  // Check by tag name
  const byName = await prisma.tagOnContact.findFirst({
    where: {
      contactId,
      tag: {
        name: tagIdentifier,
      },
    },
  });

  return !!byName;
};

export const getTagsByWorkspace = async (workspaceId: string) => {
  return prisma.tag.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
  });
};
