import { z } from "@typebot.io/zod";

export const tagSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  color: z.string().nullish(),
  description: z.string().nullish(),
  createdAt: z.date(),
});

export type Tag = z.infer<typeof tagSchema>;

export const tagTriggerTypeSchema = z.enum(["tag_added", "tag_removed"]);
export type TagTriggerType = z.infer<typeof tagTriggerTypeSchema>;

export const tagTriggerSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  tagId: z.string(),
  typebotId: z.string(),
  eventId: z.string().nullish(),
  triggerType: tagTriggerTypeSchema,
  isEnabled: z.boolean(),
  delaySeconds: z.number(),
  onlyIfNoActiveSession: z.boolean(),
  createdAt: z.date(),
});

export type TagTrigger = z.infer<typeof tagTriggerSchema>;
