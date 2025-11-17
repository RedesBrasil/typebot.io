import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { contactSchema } from "./schemas";

export const listContacts = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/contacts",
      protect: true,
      summary: "List contacts",
      tags: ["Contact"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      search: z.string().optional(),
      tagId: z.string().optional(),
    }),
  )
  .output(
    z.object({
      contacts: z.array(contactSchema),
      nextCursor: z.string().optional(),
      totalCount: z.number(),
    }),
  )
  .query(
    async ({
      input: { workspaceId, cursor, limit, search, tagId },
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

      const where: Parameters<typeof prisma.contact.findMany>[0]["where"] = {
        workspaceId,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ];
      }

      if (tagId) {
        where.tags = {
          some: {
            tagId,
          },
        };
      }

      const [contacts, totalCount] = await Promise.all([
        prisma.contact.findMany({
          where,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { updatedAt: "desc" },
          include: {
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
        }),
        prisma.contact.count({ where }),
      ]);

      let nextCursor: string | undefined;
      if (contacts.length > limit) {
        const nextItem = contacts.pop();
        nextCursor = nextItem?.id;
      }

      const formattedContacts = contacts.map((contact) => ({
        ...contact,
        customFields: (contact.customFields as Record<string, unknown>) ?? {},
        tags: contact.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          color: t.tag.color,
        })),
      }));

      return {
        contacts: formattedContacts,
        nextCursor,
        totalCount,
      };
    },
  );
