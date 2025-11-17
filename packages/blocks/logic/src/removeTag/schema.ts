import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const removeTagOptionsSchema = z.object({
  tagId: z.string().optional(),
  tagName: z.string().optional(),
  skipTriggers: z.boolean().optional(),
});

export const removeTagBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.REMOVE_TAG]),
    options: removeTagOptionsSchema.optional(),
  }),
);

export type RemoveTagBlock = z.infer<typeof removeTagBlockSchema>;
