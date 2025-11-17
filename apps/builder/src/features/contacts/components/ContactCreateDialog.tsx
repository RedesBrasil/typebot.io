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

type Props = {
  workspaceId: string;
  onClose: () => void;
  onCreate: () => void;
};

export const ContactCreateDialog = ({
  workspaceId,
  onClose,
  onCreate,
}: Props) => {
  const { t } = useTranslate();
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    name: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState<string | null>(null);

  const { mutate: createContact, isPending } = useMutation(
    trpc.contacts.createContact.mutationOptions({
      onSuccess: () => {
        onCreate();
        onClose();
      },
      onError: (err) => {
        setError(err.message);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.phone && !formData.email) {
      setError(
        t("contacts.createDialog.identifierRequired", {
          defaultValue: "At least phone or email must be provided",
        }),
      );
      return;
    }

    createContact({
      workspaceId,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      name: formData.name || undefined,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("contacts.createDialog.title", {
              defaultValue: "Create Contact",
            })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">
              {t("contacts.createDialog.phone", { defaultValue: "Phone" })}
              <span className="text-gray-11 text-xs ml-1">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder={t("contacts.createDialog.phonePlaceholder", {
                defaultValue: "5511999999999",
              })}
            />
            <p className="text-xs text-gray-11">
              {t("contacts.createDialog.phoneHelp", {
                defaultValue: "International format without + symbol",
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              {t("contacts.createDialog.email", { defaultValue: "Email" })}
              <span className="text-gray-11 text-xs ml-1">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="contact@example.com"
            />
          </div>

          <p className="text-xs text-gray-11 -mt-2">
            {t("contacts.createDialog.identifierNote", {
              defaultValue: "* At least one identifier (phone or email) is required",
            })}
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              {t("contacts.createDialog.name", { defaultValue: "Full Name" })}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">
                {t("contacts.createDialog.firstName", {
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
                {t("contacts.createDialog.lastName", {
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

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("creating", { defaultValue: "Creating..." })
                : t("create", { defaultValue: "Create" })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
