import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const addTagToContact = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/contacts/{contactId}/tags",
      protect: true,
      summary: "Add a tag to a contact",
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
      alreadyHasTag: z.boolean(),
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

    // Check if tag exists and belongs to same workspace
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        workspaceId: contact.workspaceId,
      },
    });

    if (!tag)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tag not found in workspace",
      });

    // Check if contact already has this tag
    if (contact.tags.length > 0) {
      return { success: true, alreadyHasTag: true };
    }

    await prisma.tagOnContact.create({
      data: {
        contactId,
        tagId,
      },
    });

    return { success: true, alreadyHasTag: false };
  });
