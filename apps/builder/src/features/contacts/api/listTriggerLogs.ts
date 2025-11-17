import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

const triggerLogSchema = z.object({
  id: z.string(),
  triggerId: z.string(),
  contactId: z.string(),
  tagId: z.string(),
  status: z.string(),
  message: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  executedAt: z.date(),
  contact: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      phone: z.string().nullable(),
      email: z.string().nullable(),
    })
    .optional(),
  trigger: z
    .object({
      id: z.string(),
      triggerType: z.string(),
      typebot: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export const listTriggerLogs = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/tags/{tagId}/trigger-logs",
      protect: true,
      summary: "List trigger execution logs",
      tags: ["TagTrigger"],
    },
  })
  .input(
    z.object({
      tagId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      status: z.string().optional(),
    }),
  )
  .output(
    z.object({
      logs: z.array(triggerLogSchema),
      nextCursor: z.string().optional(),
      totalCount: z.number(),
    }),
  )
  .query(
    async ({ input: { tagId, cursor, limit, status }, ctx: { user } }) => {
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

      const where: Parameters<
        typeof prisma.tagTriggerLog.findMany
      >[0]["where"] = {
        tagId,
      };

      if (status) {
        where.status = status;
      }

      const [logs, totalCount] = await Promise.all([
        prisma.tagTriggerLog.findMany({
          where,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { executedAt: "desc" },
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
            trigger: {
              select: {
                id: true,
                triggerType: true,
                typebot: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        prisma.tagTriggerLog.count({ where }),
      ]);

      let nextCursor: string | undefined;
      if (logs.length > limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id;
      }

      const formattedLogs = logs.map((log) => ({
        ...log,
        metadata: (log.metadata as Record<string, unknown>) ?? {},
      }));

      return {
        logs: formattedLogs,
        nextCursor,
        totalCount,
      };
    },
  );
