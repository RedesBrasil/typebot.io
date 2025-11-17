import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { tagSchema } from "./schemas";

export const listTags = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/tags",
      protect: true,
      summary: "List tags",
      tags: ["Tag"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      search: z.string().optional(),
    }),
  )
  .output(
    z.object({
      tags: z.array(tagSchema),
    }),
  )
  .query(async ({ input: { workspaceId, search }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, members: true },
    });

    const userRole = getUserModeInWorkspace(user.id, workspace?.members);
    if (userRole === "guest" || !workspace)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    const where: Parameters<typeof prisma.tag.findMany>[0]["where"] = {
      workspaceId,
    };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            contacts: true,
          },
        },
      },
    });

    return { tags };
  });
