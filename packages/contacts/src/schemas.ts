import { z } from "@typebot.io/zod";

export const contactSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  externalId: z.string().nullish(),
  name: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  customFields: z.record(z.unknown()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastInteraction: z.date().nullish(),
});

export type Contact = z.infer<typeof contactSchema>;

export const contactWithTagsSchema = contactSchema.extend({
  tags: z.array(
    z.object({
      tag: z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().nullish(),
      }),
      addedAt: z.date(),
    }),
  ),
});

export type ContactWithTags = z.infer<typeof contactWithTagsSchema>;
