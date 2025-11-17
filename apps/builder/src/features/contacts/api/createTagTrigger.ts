import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { tagTriggerSchema } from "./schemas";

export const createTagTrigger = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/tags/{tagId}/triggers",
      protect: true,
      summary: "Create a tag trigger",
      tags: ["TagTrigger"],
    },
  })
  .input(
    z.object({
      tagId: z.string(),
      triggerType: z.enum(["TAG_ADDED", "TAG_REMOVED"]),
      typebotId: z.string(),
      eventId: z.string().optional(),
      isEnabled: z.boolean().default(true),
      delaySeconds: z.number().default(0),
      onlyIfNoActiveSession: z.boolean().default(true),
      cooldownSeconds: z.number().default(60),
      priority: z.number().default(100),
    }),
  )
  .output(
    z.object({
      trigger: tagTriggerSchema,
    }),
  )
  .mutation(
    async ({
      input: {
        tagId,
        triggerType,
        typebotId,
        eventId,
        isEnabled,
        delaySeconds,
        onlyIfNoActiveSession,
        cooldownSeconds,
        priority,
      },
      ctx: { user },
    }) => {
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

      // Verify typebot belongs to same workspace
      const typebot = await prisma.typebot.findFirst({
        where: {
          id: typebotId,
          workspaceId: tag.workspaceId,
        },
      });

      if (!typebot)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Typebot not found in workspace",
        });

      const newTrigger = await prisma.tagTrigger.create({
        data: {
          tagId,
          triggerType,
          typebotId,
          eventId: eventId ?? null,
          isEnabled,
          delaySeconds,
          onlyIfNoActiveSession,
          cooldownSeconds,
          priority,
        },
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

      return { trigger: newTrigger };
    },
  );
