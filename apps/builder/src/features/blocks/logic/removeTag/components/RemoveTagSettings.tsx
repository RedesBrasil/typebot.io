import type { RemoveTagBlock } from "@typebot.io/blocks-logic/removeTag/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";

type Props = {
  options: RemoveTagBlock["options"];
  onOptionsChange: (options: RemoveTagBlock["options"]) => void;
};

export const RemoveTagSettings = ({ options, onOptionsChange }: Props) => {
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
          Supports variables like {"{{variableName}}"}
        </Field.HelperText>
      </Field.Root>

      <Field.Root>
        <Field.Label>Skip triggers:</Field.Label>
        <Switch
          checked={options?.skipTriggers ?? false}
          onCheckedChange={updateSkipTriggers}
        />
        <Field.HelperText>
          If enabled, tag removal triggers will not be executed
        </Field.HelperText>
      </Field.Root>
    </div>
  );
};
