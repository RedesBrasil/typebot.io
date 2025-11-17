import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { tagSchema } from "./schemas";

export const createTag = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/tags",
      protect: true,
      summary: "Create a tag",
      tags: ["Tag"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      name: z.string().min(1),
      color: z.string().optional(),
      description: z.string().optional(),
    }),
  )
  .output(
    z.object({
      tag: tagSchema,
    }),
  )
  .mutation(
    async ({
      input: { workspaceId, name, color, description },
      ctx: { user },
    }) => {
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

      // Check if tag with same name already exists
      const existingTag = await prisma.tag.findFirst({
        where: {
          workspaceId,
          name: { equals: name, mode: "insensitive" },
        },
      });

      if (existingTag)
        throw new TRPCError({
          code: "CONFLICT",
          message: "A tag with this name already exists",
        });

      const newTag = await prisma.tag.create({
        data: {
          workspaceId,
          name,
          color: color ?? null,
          description: description ?? null,
        },
        include: {
          _count: {
            select: {
              contacts: true,
            },
          },
        },
      });

      return { tag: newTag };
    },
  );
