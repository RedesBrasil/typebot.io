import prisma from "@typebot.io/prisma";

export const getContact = async (contactId: string) => {
  return prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

export const getContactByPhone = async (
  workspaceId: string,
  phone: string,
) => {
  return prisma.contact.findUnique({
    where: {
      workspaceId_phone: {
        workspaceId,
        phone,
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

export const getContactByEmail = async (
  workspaceId: string,
  email: string,
) => {
  return prisma.contact.findUnique({
    where: {
      workspaceId_email: {
        workspaceId,
        email,
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

export const getContactByExternalId = async (
  workspaceId: string,
  externalId: string,
) => {
  return prisma.contact.findUnique({
    where: {
      workspaceId_externalId: {
        workspaceId,
        externalId,
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};
