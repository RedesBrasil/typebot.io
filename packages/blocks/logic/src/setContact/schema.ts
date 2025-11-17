import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const setContactFieldTypes = [
  "name",
  "firstName",
  "lastName",
  "phone",
  "email",
  "externalId",
  "customField",
] as const;

export const setContactOptionsSchema = z.object({
  fieldToSet: z.enum(setContactFieldTypes).optional(),
  customFieldName: z.string().optional(),
  value: z.string().optional(),
});

export const setContactBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.SET_CONTACT]),
    options: setContactOptionsSchema.optional(),
  }),
);

export type SetContactBlock = z.infer<typeof setContactBlockSchema>;
