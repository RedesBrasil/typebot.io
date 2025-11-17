import { blockBaseSchema } from "@typebot.io/blocks-base/schemas";
import { z } from "@typebot.io/zod";
import { LogicBlockType } from "../constants";

export const getContactFieldTypes = [
  "name",
  "firstName",
  "lastName",
  "phone",
  "email",
  "externalId",
  "customField",
  "tags",
  "all",
] as const;

export const getContactOptionsSchema = z.object({
  fieldToGet: z.enum(getContactFieldTypes).optional(),
  customFieldName: z.string().optional(),
  variableId: z.string().optional(),
});

export const getContactBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.GET_CONTACT]),
    options: getContactOptionsSchema.optional(),
  }),
);

export type GetContactBlock = z.infer<typeof getContactBlockSchema>;
