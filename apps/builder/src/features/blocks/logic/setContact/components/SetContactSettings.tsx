import type { SetContactBlock } from "@typebot.io/blocks-logic/setContact/schema";
import { setContactFieldTypes } from "@typebot.io/blocks-logic/setContact/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";

type Props = {
  options: SetContactBlock["options"];
  onOptionsChange: (options: SetContactBlock["options"]) => void;
};

export const SetContactSettings = ({ options, onOptionsChange }: Props) => {
  const updateFieldToSet = (value?: string) =>
    onOptionsChange({
      ...options,
      fieldToSet: value as (typeof setContactFieldTypes)[number],
    });

  const updateCustomFieldName = (value: string) =>
    onOptionsChange({
      ...options,
      customFieldName: value,
    });

  const updateValue = (value: string) =>
    onOptionsChange({
      ...options,
      value,
    });

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Field to set:</Field.Label>
        <BasicSelect
          value={options?.fieldToSet ?? "name"}
          items={setContactFieldTypes.map((type) => ({
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value: type,
          }))}
          onChange={updateFieldToSet}
        />
      </Field.Root>

      {options?.fieldToSet === "customField" && (
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
        <Field.Label>Value:</Field.Label>
        <DebouncedTextareaWithVariablesButton
          defaultValue={options?.value ?? ""}
          onChange={updateValue}
          placeholder="Value or {{variable}}"
        />
      </Field.Root>
    </div>
  );
};
