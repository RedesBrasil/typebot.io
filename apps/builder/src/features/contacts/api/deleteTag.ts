import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const deleteTag = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/tags/{tagId}",
      protect: true,
      summary: "Delete a tag",
      tags: ["Tag"],
    },
  })
  .input(
    z.object({
      tagId: z.string(),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
    }),
  )
  .mutation(async ({ input: { tagId }, ctx: { user } }) => {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        workspace: {
          select: {
            id: true,
            members: true,
          },
        },
      },
    });

    if (!tag)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tag not found",
      });

    const userRole = getUserModeInWorkspace(user.id, tag.workspace.members);
    if (userRole === "guest")
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tag not found",
      });

    await prisma.tag.delete({
      where: { id: tagId },
    });

    return { success: true };
  });
