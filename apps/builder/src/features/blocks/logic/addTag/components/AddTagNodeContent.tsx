import type { AddTagBlock } from "@typebot.io/blocks-logic/addTag/schema";

type Props = {
  options: AddTagBlock["options"];
};

export const AddTagNodeContent = ({ options }: Props) => {
  const tagName = options?.tagName ?? "tag";

  return (
    <p className="text-gray-11">
      Add tag <span className="text-gray-12">{tagName}</span>
    </p>
  );
};
