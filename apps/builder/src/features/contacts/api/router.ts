import { router } from "@/helpers/server/trpc";
import { addTagToContact } from "./addTagToContact";
import { createContact } from "./createContact";
import { createTag } from "./createTag";
import { createTagTrigger } from "./createTagTrigger";
import { deleteContact } from "./deleteContact";
import { deleteTag } from "./deleteTag";
import { deleteTagTrigger } from "./deleteTagTrigger";
import { getContact } from "./getContact";
import { listContacts } from "./listContacts";
import { listTags } from "./listTags";
import { listTagTriggers } from "./listTagTriggers";
import { removeTagFromContact } from "./removeTagFromContact";
import { updateContact } from "./updateContact";
import { updateTag } from "./updateTag";
import { updateTagTrigger } from "./updateTagTrigger";

export const contactsRouter = router({
  // Contacts
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,

  // Contact tags
  addTagToContact,
  removeTagFromContact,

  // Tags
  listTags,
  createTag,
  updateTag,
  deleteTag,

  // Tag triggers
  listTagTriggers,
  createTagTrigger,
  updateTagTrigger,
  deleteTagTrigger,
});
