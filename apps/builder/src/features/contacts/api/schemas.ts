import { z } from "@typebot.io/zod";

export const contactSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  externalId: z.string().nullable(),
  name: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  customFields: z.record(z.unknown()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastInteraction: z.date().nullable(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().nullable(),
      }),
    )
    .optional(),
});

export const tagSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
  _count: z
    .object({
      contacts: z.number(),
    })
    .optional(),
});

export const tagTriggerSchema = z.object({
  id: z.string(),
  tagId: z.string(),
  triggerType: z.enum(["TAG_ADDED", "TAG_REMOVED"]),
  typebotId: z.string(),
  eventId: z.string().nullable(),
  isEnabled: z.boolean(),
  delaySeconds: z.number(),
  onlyIfNoActiveSession: z.boolean(),
  cooldownSeconds: z.number(),
  priority: z.number(),
  createdAt: z.date(),
  typebot: z
    .object({
      id: z.string(),
      name: z.string(),
      publicId: z.string().nullable(),
    })
    .optional(),
});

export type Contact = z.infer<typeof contactSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type TagTrigger = z.infer<typeof tagTriggerSchema>;
