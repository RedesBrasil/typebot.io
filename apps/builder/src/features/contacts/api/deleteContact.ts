import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const deleteContact = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/contacts/{contactId}",
      protect: true,
      summary: "Delete a contact",
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
      success: z.boolean(),
    }),
  )
  .mutation(async ({ input: { contactId }, ctx: { user } }) => {
    const contact = await prisma.contact.findUnique({
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

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return { success: true };
  });
