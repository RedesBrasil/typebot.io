import type { SetContactBlock } from "@typebot.io/blocks-logic/setContact/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { updateContact } from "@typebot.io/contacts/updateContact";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { ExecuteLogicResponse } from "../../../types";

export const executeSetContactBlock = async (
  block: SetContactBlock,
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
          details: "Cannot update contact data without a linked contact",
        },
      ],
    };
  }

  if (!block.options?.fieldToSet || !block.options?.value) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "warning",
          description: "No field or value specified for contact update",
        },
      ],
    };
  }

  try {
    const variables = state.typebotsQueue[0]?.typebot.variables ?? [];
    const parsedValue = parseVariables(block.options.value, {
      variables,
      sessionStore,
    });

    const updateData: Record<string, unknown> = {};

    switch (block.options.fieldToSet) {
      case "name":
        updateData.name = parsedValue;
        break;
      case "firstName":
        updateData.firstName = parsedValue;
        break;
      case "lastName":
        updateData.lastName = parsedValue;
        break;
      case "phone":
        updateData.phone = parsedValue;
        break;
      case "email":
        updateData.email = parsedValue;
        break;
      case "externalId":
        updateData.externalId = parsedValue;
        break;
      case "customField":
        if (block.options.customFieldName) {
          updateData.customFields = {
            [block.options.customFieldName]: parsedValue,
          };
        }
        break;
    }

    await updateContact({
      contactId,
      data: updateData as {
        name?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
        email?: string | null;
        externalId?: string | null;
        customFields?: Record<string, unknown>;
      },
    });

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "success",
          description: `Contact ${block.options.fieldToSet} updated`,
          details: `Set to: ${parsedValue}`,
        },
      ],
    };
  } catch (error) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "error",
          description: "Error updating contact",
          details: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
};
