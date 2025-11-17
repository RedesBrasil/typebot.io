import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { contactSchema } from "./schemas";

export const getContact = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/contacts/{contactId}",
      protect: true,
      summary: "Get a contact",
      tags: ["Contact"],
    },
  })
  .input(
    z.object({
      contactId: z.string(),
    }),
  )
  .output(
    z.object({
      contact: contactSchema,
    }),
  )
  .query(async ({ input: { contactId }, ctx: { user } }) => {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
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
        workspace: {
          select: {
            id: true,
            members: true,
          },
        },
      },
    });

    if (!contact)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Contact not found",
      });

    const userRole = getUserModeInWorkspace(user.id, contact.workspace.members);
    if (userRole === "guest")
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Contact not found",
      });

    return {
      contact: {
        ...contact,
        customFields: (contact.customFields as Record<string, unknown>) ?? {},
        tags: contact.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          color: t.tag.color,
        })),
      },
    };
  });
