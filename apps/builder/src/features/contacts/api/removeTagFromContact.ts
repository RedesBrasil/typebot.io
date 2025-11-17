import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const removeTagFromContact = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/contacts/{contactId}/tags/{tagId}",
      protect: true,
      summary: "Remove a tag from a contact",
      tags: ["Contact"],
    },
  })
  .input(
    z.object({
      contactId: z.string(),
      tagId: z.string(),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
      hadTag: z.boolean(),
    }),
  )
  .mutation(async ({ input: { contactId, tagId }, ctx: { user } }) => {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        workspace: {
          select: {
            id: true,
            members: true,
          },
        },
        tags: {
          where: { tagId },
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

    // Check if contact has this tag
    if (contact.tags.length === 0) {
      return { success: true, hadTag: false };
    }

    await prisma.tagOnContact.delete({
      where: {
        contactId_tagId: {
          contactId,
          tagId,
        },
      },
    });

    return { success: true, hadTag: true };
  });
