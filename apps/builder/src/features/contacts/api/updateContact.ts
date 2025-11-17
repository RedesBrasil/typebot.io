import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { contactSchema } from "./schemas";

export const updateContact = authenticatedProcedure
  .meta({
    openapi: {
      method: "PATCH",
      path: "/v1/contacts/{contactId}",
      protect: true,
      summary: "Update a contact",
      tags: ["Contact"],
    },
  })
  .input(
    z.object({
      contactId: z.string(),
      name: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      customFields: z.record(z.unknown()).optional(),
    }),
  )
  .output(
    z.object({
      contact: contactSchema,
    }),
  )
  .mutation(
    async ({
      input: { contactId, name, firstName, lastName, email, customFields },
      ctx: { user },
    }) => {
      const existingContact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          workspace: {
            select: {
              id: true,
              members: true,
            },
          },
        },
      });

      if (!existingContact)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });

      const userRole = getUserModeInWorkspace(
        user.id,
        existingContact.workspace.members,
      );
      if (userRole === "guest")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });

      const updateData: Parameters<typeof prisma.contact.update>[0]["data"] =
        {};

      if (name !== undefined) updateData.name = name;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;

      if (customFields !== undefined) {
        const existingCustomFields =
          (existingContact.customFields as Record<string, unknown>) ?? {};
        updateData.customFields = {
          ...existingCustomFields,
          ...customFields,
        };
      }

      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: updateData,
        include: {
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      });

      return {
        contact: {
          ...updatedContact,
          customFields:
            (updatedContact.customFields as Record<string, unknown>) ?? {},
          tags: updatedContact.tags.map((t) => ({
            id: t.tag.id,
            name: t.tag.name,
            color: t.tag.color,
          })),
        },
      };
    },
  );
