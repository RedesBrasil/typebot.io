import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const addTagOptionsSchema = z.object({
  tagId: z.string().optional(),
  tagName: z.string().optional(),
  skipTriggers: z.boolean().optional(),
});

export const addTagBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.ADD_TAG]),
    options: addTagOptionsSchema.optional(),
  }),
);

export type AddTagBlock = z.infer<typeof addTagBlockSchema>;
