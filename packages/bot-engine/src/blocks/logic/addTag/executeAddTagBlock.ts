import type { AddTagBlock } from "@typebot.io/blocks-logic/addTag/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { addTagToContact } from "@typebot.io/contact-tags/addTagToContact";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { ExecuteLogicResponse } from "../../../types";

export const executeAddTagBlock = async (
  block: AddTagBlock,
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
          details: "Cannot add tag without a linked contact",
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

    const { tag, alreadyExists } = await addTagToContact({
      contactId,
      tagId: block.options.tagId,
      tagName,
      workspaceId: state.workspaceId,
      skipTriggers: block.options.skipTriggers ?? false,
    });

    if (alreadyExists) {
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [
          {
            status: "info",
            description: `Contact already has tag: ${tag.name}`,
          },
        ],
      };
    }

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "success",
          description: `Tag added to contact: ${tag.name}`,
        },
      ],
    };
  } catch (error) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "error",
          description: "Error adding tag to contact",
          details: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
};
