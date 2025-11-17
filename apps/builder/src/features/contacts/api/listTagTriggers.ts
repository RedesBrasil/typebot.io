import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { tagTriggerSchema } from "./schemas";

export const listTagTriggers = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/tags/{tagId}/triggers",
      protect: true,
      summary: "List tag triggers",
      tags: ["TagTrigger"],
    },
  })
  .input(
    z.object({
      tagId: z.string(),
    }),
  )
  .output(
    z.object({
      triggers: z.array(tagTriggerSchema),
    }),
  )
  .query(async ({ input: { tagId }, ctx: { user } }) => {
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

    const triggers = await prisma.tagTrigger.findMany({
      where: { tagId },
      orderBy: { priority: "asc" },
      include: {
        typebot: {
          select: {
            id: true,
            name: true,
            publicId: true,
          },
        },
      },
    });

    return { triggers };
  });
