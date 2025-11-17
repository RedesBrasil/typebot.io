import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const deleteTagTrigger = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/tag-triggers/{triggerId}",
      protect: true,
      summary: "Delete a tag trigger",
      tags: ["TagTrigger"],
    },
  })
  .input(
    z.object({
      triggerId: z.string(),
    }),
  )
  .output(
    z.object({
      success: z.boolean(),
    }),
  )
  .mutation(async ({ input: { triggerId }, ctx: { user } }) => {
    const trigger = await prisma.tagTrigger.findUnique({
      where: { id: triggerId },
      include: {
        tag: {
          include: {
            workspace: {
              select: {
                id: true,
                members: true,
              },
            },
          },
        },
      },
    });

    if (!trigger)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Trigger not found",
      });

    const userRole = getUserModeInWorkspace(
      user.id,
      trigger.tag.workspace.members,
    );
    if (userRole === "guest")
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Trigger not found",
      });

    await prisma.tagTrigger.delete({
      where: { id: triggerId },
    });

    return { success: true };
  });
