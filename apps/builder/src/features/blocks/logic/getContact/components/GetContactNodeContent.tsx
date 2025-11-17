import type { GetContactBlock } from "@typebot.io/blocks-logic/getContact/schema";

type Props = {
  options: GetContactBlock["options"];
};

export const GetContactNodeContent = ({ options }: Props) => {
  const fieldToGet = options?.fieldToGet ?? "name";
  const displayField =
    fieldToGet === "customField"
      ? options?.customFieldName ?? "custom field"
      : fieldToGet === "all"
        ? "all data"
        : fieldToGet;

  return (
    <p className="text-gray-11">
      Get <span className="text-gray-12">{displayField}</span>
    </p>
  );
};
