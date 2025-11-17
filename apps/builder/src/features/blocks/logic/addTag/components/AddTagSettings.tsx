import type { AddTagBlock } from "@typebot.io/blocks-logic/addTag/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";

type Props = {
  options: AddTagBlock["options"];
  onOptionsChange: (options: AddTagBlock["options"]) => void;
};

export const AddTagSettings = ({ options, onOptionsChange }: Props) => {
  const updateTagName = (value: string) =>
    onOptionsChange({
      ...options,
      tagName: value,
    });

  const updateSkipTriggers = (value: boolean) =>
    onOptionsChange({
      ...options,
      skipTriggers: value,
    });

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Tag name:</Field.Label>
        <DebouncedTextInput
          defaultValue={options?.tagName ?? ""}
          onChange={updateTagName}
          placeholder="e.g., lead_qualificado"
        />
        <Field.HelperText>
          Tag will be created if it doesn't exist. Supports variables like{" "}
          {"{{variableName}}"}
        </Field.HelperText>
      </Field.Root>

      <Field.Root>
        <Field.Label>Skip triggers:</Field.Label>
        <Switch
          checked={options?.skipTriggers ?? false}
          onCheckedChange={updateSkipTriggers}
        />
        <Field.HelperText>
          If enabled, tag triggers will not be executed
        </Field.HelperText>
      </Field.Root>
    </div>
  );
};
