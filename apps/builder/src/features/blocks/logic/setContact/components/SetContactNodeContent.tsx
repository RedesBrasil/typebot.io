import type { SetContactBlock } from "@typebot.io/blocks-logic/setContact/schema";

type Props = {
  options: SetContactBlock["options"];
};

export const SetContactNodeContent = ({ options }: Props) => {
  const fieldToSet = options?.fieldToSet ?? "name";
  const displayField =
    fieldToSet === "customField"
      ? options?.customFieldName ?? "custom field"
      : fieldToSet;

  return (
    <p className="text-gray-11">
      Set <span className="text-gray-12">{displayField}</span>
    </p>
  );
};
