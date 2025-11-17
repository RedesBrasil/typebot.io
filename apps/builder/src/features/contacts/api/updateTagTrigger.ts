import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { tagTriggerSchema } from "./schemas";

export const updateTagTrigger = authenticatedProcedure
  .meta({
    openapi: {
      method: "PATCH",
      path: "/v1/tag-triggers/{triggerId}",
      protect: true,
      summary: "Update a tag trigger",
      tags: ["TagTrigger"],
    },
  })
  .input(
    z.object({
      triggerId: z.string(),
      triggerType: z.enum(["TAG_ADDED", "TAG_REMOVED"]).optional(),
      typebotId: z.string().optional(),
      eventId: z.string().nullable().optional(),
      isEnabled: z.boolean().optional(),
      delaySeconds: z.number().optional(),
      onlyIfNoActiveSession: z.boolean().optional(),
      cooldownSeconds: z.number().optional(),
      priority: z.number().optional(),
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
        triggerId,
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
      const existingTrigger = await prisma.tagTrigger.findUnique({
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

      if (!existingTrigger)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trigger not found",
        });

      const userRole = getUserModeInWorkspace(
        user.id,
        existingTrigger.tag.workspace.members,
      );
      if (userRole === "guest")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trigger not found",
        });

      // If typebotId is changing, verify it belongs to same workspace
      if (typebotId && typebotId !== existingTrigger.typebotId) {
        const typebot = await prisma.typebot.findFirst({
          where: {
            id: typebotId,
            workspaceId: existingTrigger.tag.workspaceId,
          },
        });

        if (!typebot)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Typebot not found in workspace",
          });
      }

      const updateData: Parameters<
        typeof prisma.tagTrigger.update
      >[0]["data"] = {};
      if (triggerType !== undefined) updateData.triggerType = triggerType;
      if (typebotId !== undefined) updateData.typebotId = typebotId;
      if (eventId !== undefined) updateData.eventId = eventId;
      if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
      if (delaySeconds !== undefined) updateData.delaySeconds = delaySeconds;
      if (onlyIfNoActiveSession !== undefined)
        updateData.onlyIfNoActiveSession = onlyIfNoActiveSession;
      if (cooldownSeconds !== undefined)
        updateData.cooldownSeconds = cooldownSeconds;
      if (priority !== undefined) updateData.priority = priority;

      const updatedTrigger = await prisma.tagTrigger.update({
        where: { id: triggerId },
        data: updateData,
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

      return { trigger: updatedTrigger };
    },
  );
