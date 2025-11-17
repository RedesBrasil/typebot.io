import type { GetContactBlock } from "@typebot.io/blocks-logic/getContact/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { getContact } from "@typebot.io/contacts/getContact";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ExecuteLogicResponse } from "../../../types";
import { updateVariablesInSession } from "../../../updateVariablesInSession";

export const executeGetContactBlock = async (
  block: GetContactBlock,
  {
    state,
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
          details: "Cannot get contact data without a linked contact",
        },
      ],
    };
  }

  if (!block.options?.variableId) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "warning",
          description: "No variable selected to store contact data",
        },
      ],
    };
  }

  try {
    const contact = await getContact(contactId);

    if (!contact) {
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [
          {
            status: "error",
            description: `Contact not found: ${contactId}`,
          },
        ],
      };
    }

    let value: unknown;

    switch (block.options.fieldToGet) {
      case "name":
        value = contact.name ?? "";
        break;
      case "firstName":
        value = contact.firstName ?? "";
        break;
      case "lastName":
        value = contact.lastName ?? "";
        break;
      case "phone":
        value = contact.phone ?? "";
        break;
      case "email":
        value = contact.email ?? "";
        break;
      case "externalId":
        value = contact.externalId ?? "";
        break;
      case "customField":
        if (block.options.customFieldName) {
          const customFields = contact.customFields as Record<string, unknown>;
          value = customFields[block.options.customFieldName] ?? "";
        } else {
          value = "";
        }
        break;
      case "tags":
        value = contact.tags.map((t) => t.tag.name);
        break;
      case "all":
        value = {
          id: contact.id,
          name: contact.name,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          email: contact.email,
          externalId: contact.externalId,
          customFields: contact.customFields,
          tags: contact.tags.map((t) => t.tag.name),
        };
        break;
      default:
        value = "";
    }

    const existingVariable = state.typebotsQueue[0]?.typebot.variables.find(
      (v) => v.id === block.options?.variableId,
    );

    if (!existingVariable) {
      return {
        outgoingEdgeId: block.outgoingEdgeId,
        logs: [
          {
            status: "error",
            description: "Variable not found",
          },
        ],
      };
    }

    const newVariable = {
      ...existingVariable,
      value:
        typeof value === "object" ? JSON.stringify(value) : String(value ?? ""),
    };

    const { updatedState, newSetVariableHistory } = updateVariablesInSession({
      state,
      newVariables: [newVariable],
      currentBlockId: block.id,
    });

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState: updatedState,
      newSetVariableHistory,
    };
  } catch (error) {
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: [
        {
          status: "error",
          description: "Error getting contact",
          details: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
};
