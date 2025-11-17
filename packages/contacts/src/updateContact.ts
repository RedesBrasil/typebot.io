import prisma from "@typebot.io/prisma";

interface UpdateContactProps {
  contactId: string;
  data: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    externalId?: string | null;
    customFields?: Record<string, unknown>;
  };
}

export const updateContact = async ({ contactId, data }: UpdateContactProps) => {
  const existingContact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!existingContact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.externalId !== undefined) updateData.externalId = data.externalId;

  // Merge custom fields
  if (data.customFields) {
    updateData.customFields = {
      ...(existingContact.customFields as Record<string, unknown>),
      ...data.customFields,
    };
  }

  return prisma.contact.update({
    where: { id: contactId },
    data: updateData,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

export const setContactCustomField = async (
  contactId: string,
  fieldName: string,
  value: unknown,
) => {
  const existingContact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!existingContact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  const customFields = {
    ...(existingContact.customFields as Record<string, unknown>),
    [fieldName]: value,
  };

  return prisma.contact.update({
    where: { id: contactId },
    data: { customFields },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};
