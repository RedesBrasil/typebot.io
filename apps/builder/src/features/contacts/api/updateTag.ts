import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { tagSchema } from "./schemas";

export const updateTag = authenticatedProcedure
  .meta({
    openapi: {
      method: "PATCH",
      path: "/v1/tags/{tagId}",
      protect: true,
      summary: "Update a tag",
      tags: ["Tag"],
    },
  })
  .input(
    z.object({
      tagId: z.string(),
      name: z.string().min(1).optional(),
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
    async ({ input: { tagId, name, color, description }, ctx: { user } }) => {
      const existingTag = await prisma.tag.findUnique({
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

      if (!existingTag)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });

      const userRole = getUserModeInWorkspace(
        user.id,
        existingTag.workspace.members,
      );
      if (userRole === "guest")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });

      // Check for name conflict if renaming
      if (name && name !== existingTag.name) {
        const conflictingTag = await prisma.tag.findFirst({
          where: {
            workspaceId: existingTag.workspaceId,
            name: { equals: name, mode: "insensitive" },
            id: { not: tagId },
          },
        });

        if (conflictingTag)
          throw new TRPCError({
            code: "CONFLICT",
            message: "A tag with this name already exists",
          });
      }

      const updateData: Parameters<typeof prisma.tag.update>[0]["data"] = {};
      if (name !== undefined) updateData.name = name;
      if (color !== undefined) updateData.color = color;
      if (description !== undefined) updateData.description = description;

      const updatedTag = await prisma.tag.update({
        where: { id: tagId },
        data: updateData,
        include: {
          _count: {
            select: {
              contacts: true,
            },
          },
        },
      });

      return { tag: updatedTag };
    },
  );
