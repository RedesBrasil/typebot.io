import { isDefined } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { safeStringify } from "@typebot.io/lib/safeStringify";

// Contact variable pattern: {{contact.fieldName}} or {{contact.customFields.fieldName}}
const contactVariableRegex = /^contact\.(.+)$/;

export type ContactData = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  tags?: string[];
  customFields?: Record<string, unknown>;
};

/**
 * Check if a variable name is a contact variable (e.g., contact.name, contact.tags)
 */
export const isContactVariable = (variableName: string): boolean => {
  return contactVariableRegex.test(variableName);
};

/**
 * Parse a contact variable and return its value
 * Supports:
 * - contact.name
 * - contact.firstName
 * - contact.lastName
 * - contact.email
 * - contact.phone
 * - contact.tags (returns comma-separated list)
 * - contact.id
 * - contact.customFields.fieldName
 */
export const parseContactVariable = (
  variableName: string,
  sessionStore: SessionStore,
): string | undefined => {
  const match = variableName.match(contactVariableRegex);
  if (!match) return undefined;

  const fieldPath = match[1];
  const contactData = sessionStore.get("contactData") as
    | ContactData
    | undefined;

  if (!contactData) return "";

  // Handle nested customFields access
  if (fieldPath.startsWith("customFields.")) {
    const customFieldName = fieldPath.substring("customFields.".length);
    const customFieldValue = contactData.customFields?.[customFieldName];
    if (isDefined(customFieldValue)) {
      return safeStringify(customFieldValue) ?? "";
    }
    return "";
  }

  // Handle direct field access
  switch (fieldPath) {
    case "id":
      return contactData.id ?? "";
    case "name":
      return contactData.name ?? "";
    case "firstName":
      return contactData.firstName ?? "";
    case "lastName":
      return contactData.lastName ?? "";
    case "email":
      return contactData.email ?? "";
    case "phone":
      return contactData.phone ?? "";
    case "tags":
      return contactData.tags?.join(", ") ?? "";
    default:
      // Try to access as a direct property
      const value = (contactData as Record<string, unknown>)[fieldPath];
      if (isDefined(value)) {
        return safeStringify(value) ?? "";
      }
      return "";
  }
};

/**
 * Load contact data into session store for variable parsing
 */
export const loadContactDataIntoStore = (
  sessionStore: SessionStore,
  contactData: ContactData,
): void => {
  sessionStore.set("contactData", contactData);
};

/**
 * Get contact data from session store
 */
export const getContactDataFromStore = (
  sessionStore: SessionStore,
): ContactData | undefined => {
  return sessionStore.get("contactData") as ContactData | undefined;
};
