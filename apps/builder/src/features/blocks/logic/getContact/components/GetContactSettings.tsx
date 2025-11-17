import type { GetContactBlock } from "@typebot.io/blocks-logic/getContact/schema";
import { getContactFieldTypes } from "@typebot.io/blocks-logic/getContact/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  options: GetContactBlock["options"];
  onOptionsChange: (options: GetContactBlock["options"]) => void;
};

export const GetContactSettings = ({ options, onOptionsChange }: Props) => {
  const updateFieldToGet = (value?: string) =>
    onOptionsChange({
      ...options,
      fieldToGet: value as (typeof getContactFieldTypes)[number],
    });

  const updateCustomFieldName = (value: string) =>
    onOptionsChange({
      ...options,
      customFieldName: value,
    });

  const updateVariableId = (variable?: Pick<Variable, "id">) =>
    onOptionsChange({
      ...options,
      variableId: variable?.id,
    });

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Field to get:</Field.Label>
        <BasicSelect
          value={options?.fieldToGet ?? "name"}
          items={getContactFieldTypes.map((type) => ({
            label:
              type === "all"
                ? "All data (JSON)"
                : type.charAt(0).toUpperCase() + type.slice(1),
            value: type,
          }))}
          onChange={updateFieldToGet}
        />
      </Field.Root>

      {options?.fieldToGet === "customField" && (
        <Field.Root>
          <Field.Label>Custom field name:</Field.Label>
          <DebouncedTextInput
            defaultValue={options?.customFieldName ?? ""}
            onChange={updateCustomFieldName}
            placeholder="e.g., company"
          />
        </Field.Root>
      )}

      <Field.Root>
        <Field.Label>Save to variable:</Field.Label>
        <VariablesCombobox
          onSelectVariable={updateVariableId}
          initialVariableId={options?.variableId}
        />
      </Field.Root>
    </div>
  );
};
