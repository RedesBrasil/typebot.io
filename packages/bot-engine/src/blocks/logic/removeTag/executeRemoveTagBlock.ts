import type { RemoveTagBlock } from "@typebot.io/blocks-logic/removeTag/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { removeTagFromContact } from "@typebot.io/contact-tags/removeTagFromContact";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { ExecuteLogicResponse } from "../../../types";

export const executeRemoveTagBlock = async (
  block: RemoveTagBlock,
  {
    state,
    sessionStore,
  }: {
    state: SessionState;
    sessionStore: SessionStore;
  },
): Promise<ExecuteLogicResponse> => {
  const contactId = state.contactId;

  if (!contactId) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "info",
          description: "No contact linked to session",
          details: "Cannot remove tag without a linked contact",
        },
      ],
    };
  }

  if (!block.options?.tagId && !block.options?.tagName) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "warning",
          description: "No tag ID or name specified",
        },
      ],
    };
  }

  try {
    const variables = state.typebotsQueue[0]?.typebot.variables ?? [];

    // Parse tag name if it contains variables
    const tagName = block.options.tagName
      ? parseVariables(block.options.tagName, { variables, sessionStore })
      : undefined;

    const { removed, reason, tag } = await removeTagFromContact({
      contactId,
      tagId: block.options.tagId,
      tagName,
      workspaceId: state.workspaceId,
      skipTriggers: block.options.skipTriggers ?? false,
    });

    if (!removed) {
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [
          {
            status: "info",
            description: `Tag not removed: ${reason}`,
          },
        ],
      };
    }

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "success",
          description: `Tag removed from contact: ${tag?.name ?? "unknown"}`,
        },
      ],
    };
  } catch (error) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "error",
          description: "Error removing tag from contact",
          details: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
};
