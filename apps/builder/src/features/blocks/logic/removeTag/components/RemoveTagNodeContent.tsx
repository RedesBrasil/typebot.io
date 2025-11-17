import type { RemoveTagBlock } from "@typebot.io/blocks-logic/removeTag/schema";

type Props = {
  options: RemoveTagBlock["options"];
};

export const RemoveTagNodeContent = ({ options }: Props) => {
  const tagName = options?.tagName ?? "tag";

  return (
    <p className="text-gray-11">
      Remove tag <span className="text-gray-12">{tagName}</span>
    </p>
  );
};
