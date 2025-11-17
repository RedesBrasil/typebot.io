import prisma from "@typebot.io/prisma";

interface FindOrCreateContactProps {
  workspaceId: string;
  phone?: string | null;
  email?: string | null;
  externalId?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  customFields?: Record<string, unknown>;
}

export const findOrCreateContact = async ({
  workspaceId,
  phone,
  email,
  externalId,
  name,
  firstName,
  lastName,
  customFields,
}: FindOrCreateContactProps) => {
  // Build OR conditions for finding existing contact
  const orConditions: Array<Record<string, string>> = [];
  if (phone) orConditions.push({ phone });
  if (email) orConditions.push({ email });
  if (externalId) orConditions.push({ externalId });

  if (orConditions.length === 0) {
    throw new Error(
      "At least one identifier (phone, email, or externalId) is required",
    );
  }

  // Try to find existing contact
  const existingContact = await prisma.contact.findFirst({
    where: {
      workspaceId,
      OR: orConditions,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (existingContact) {
    // Update last interaction and any new data
    const updateData: Record<string, unknown> = {
      lastInteraction: new Date(),
    };

    // Update name if provided and not set
    if (name && !existingContact.name) updateData.name = name;
    if (firstName && !existingContact.firstName)
      updateData.firstName = firstName;
    if (lastName && !existingContact.lastName) updateData.lastName = lastName;

    // Merge custom fields
    if (customFields) {
      updateData.customFields = {
        ...(existingContact.customFields as Record<string, unknown>),
        ...customFields,
      };
    }

    return prisma.contact.update({
      where: { id: existingContact.id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  // Create new contact
  return prisma.contact.create({
    data: {
      workspaceId,
      phone,
      email,
      externalId,
      name,
      firstName,
      lastName,
      customFields: customFields ?? {},
      lastInteraction: new Date(),
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
