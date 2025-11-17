import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { contactSchema } from "./schemas";

export const createContact = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/contacts",
      protect: true,
      summary: "Create a contact",
      tags: ["Contact"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      name: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      customFields: z.record(z.unknown()).optional(),
    }),
  )
  .output(
    z.object({
      contact: contactSchema,
    }),
  )
  .mutation(
    async ({
      input: {
        workspaceId,
        phone,
        email,
        name,
        firstName,
        lastName,
        customFields,
      },
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

      // At least one identifier must be provided
      if (!phone && !email)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least phone or email must be provided",
        });

      // Check for existing contact with same phone or email
      if (phone) {
        const existingPhone = await prisma.contact.findFirst({
          where: { workspaceId, phone },
        });
        if (existingPhone)
          throw new TRPCError({
            code: "CONFLICT",
            message: "A contact with this phone number already exists",
          });
      }

      if (email) {
        const existingEmail = await prisma.contact.findFirst({
          where: { workspaceId, email },
        });
        if (existingEmail)
          throw new TRPCError({
            code: "CONFLICT",
            message: "A contact with this email already exists",
          });
      }

      const newContact = await prisma.contact.create({
        data: {
          workspaceId,
          phone: phone ?? null,
          email: email ?? null,
          name: name ?? null,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          customFields: customFields ?? {},
        },
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
      });

      return {
        contact: {
          ...newContact,
          customFields:
            (newContact.customFields as Record<string, unknown>) ?? {},
          tags: newContact.tags.map((t) => ({
            id: t.tag.id,
            name: t.tag.name,
            color: t.tag.color,
          })),
        },
      };
    },
  );
