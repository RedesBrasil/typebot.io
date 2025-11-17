import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@typebot.io/ui/components/Dialog";
import { Input } from "@typebot.io/ui/components/Input";
import { Label } from "@typebot.io/ui/components/Label";
import { useState } from "react";
import { trpc } from "@/lib/queryClient";
import type { Contact } from "../api/schemas";

type Props = {
  contact: Contact;
  onClose: () => void;
  onUpdate: () => void;
};

export const ContactEditDialog = ({ contact, onClose, onUpdate }: Props) => {
  const { t } = useTranslate();
  const [formData, setFormData] = useState({
    name: contact.name || "",
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    email: contact.email || "",
  });

  const { mutate: updateContact, isPending } = useMutation(
    trpc.contacts.updateContact.mutationOptions({
      onSuccess: () => {
        onUpdate();
        onClose();
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact({
      contactId: contact.id,
      name: formData.name || undefined,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      email: formData.email || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("contacts.editDialog.title", { defaultValue: "Edit Contact" })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              {t("contacts.editDialog.name", { defaultValue: "Full Name" })}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("contacts.editDialog.namePlaceholder", {
                defaultValue: "John Doe",
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">
                {t("contacts.editDialog.firstName", {
                  defaultValue: "First Name",
                })}
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="John"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">
                {t("contacts.editDialog.lastName", {
                  defaultValue: "Last Name",
                })}
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              {t("contacts.editDialog.email", { defaultValue: "Email" })}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="john@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t("contacts.editDialog.phone", { defaultValue: "Phone" })}
            </Label>
            <Input value={contact.phone || ""} disabled />
            <p className="text-xs text-gray-11">
              {t("contacts.editDialog.phoneNote", {
                defaultValue: "Phone number cannot be changed",
              })}
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("saving", { defaultValue: "Saving..." })
                : t("save", { defaultValue: "Save" })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
