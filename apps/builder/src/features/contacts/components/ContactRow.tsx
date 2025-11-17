import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@typebot.io/ui/components/DropdownMenu";
import { TableCell, TableRow } from "@typebot.io/ui/components/Table";
import { DotsVertical02Icon } from "@typebot.io/ui/icons/DotsVertical02Icon";
import { Edit04Icon } from "@typebot.io/ui/icons/Edit04Icon";
import { Tag03Icon } from "@typebot.io/ui/icons/Tag03Icon";
import { Trash04Icon } from "@typebot.io/ui/icons/Trash04Icon";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { trpc } from "@/lib/queryClient";
import type { Contact } from "../api/schemas";
import { ContactEditDialog } from "./ContactEditDialog";

type Props = {
  contact: Contact;
  onUpdate: () => void;
};

export const ContactRow = ({ contact, onUpdate }: Props) => {
  const { t } = useTranslate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { mutate: deleteContact, isPending: isDeleting } = useMutation(
    trpc.contacts.deleteContact.mutationOptions({
      onSuccess: () => {
        onUpdate();
      },
    }),
  );

  const handleDelete = () => {
    if (
      window.confirm(
        t("contacts.deleteConfirm", {
          defaultValue: "Are you sure you want to delete this contact?",
        }),
      )
    ) {
      deleteContact({ contactId: contact.id });
    }
  };

  const displayName =
    contact.name ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    contact.phone ||
    contact.email ||
    "Unknown";

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{displayName}</TableCell>
        <TableCell>{contact.phone || "-"}</TableCell>
        <TableCell>{contact.email || "-"}</TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {contact.tags?.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: tag.color
                    ? `${tag.color}20`
                    : "var(--gray-4)",
                  color: tag.color || "var(--gray-11)",
                  border: `1px solid ${tag.color || "var(--gray-6)"}`,
                }}
              >
                <Tag03Icon className="w-3 h-3 mr-1" />
                {tag.name}
              </span>
            )) || "-"}
          </div>
        </TableCell>
        <TableCell>
          {contact.lastInteraction
            ? formatDistanceToNow(new Date(contact.lastInteraction), {
                addSuffix: true,
              })
            : "-"}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isDeleting}>
                <DotsVertical02Icon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit04Icon className="w-4 h-4 mr-2" />
                {t("contacts.edit", { defaultValue: "Edit" })}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash04Icon className="w-4 h-4 mr-2" />
                {t("contacts.delete", { defaultValue: "Delete" })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {isEditDialogOpen && (
        <ContactEditDialog
          contact={contact}
          onClose={() => setIsEditDialogOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};
