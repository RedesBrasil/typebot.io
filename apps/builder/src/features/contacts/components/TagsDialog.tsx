import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@typebot.io/ui/components/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@typebot.io/ui/components/DropdownMenu";
import { Input } from "@typebot.io/ui/components/Input";
import { Label } from "@typebot.io/ui/components/Label";
import { DotsVertical02Icon } from "@typebot.io/ui/icons/DotsVertical02Icon";
import { Edit04Icon } from "@typebot.io/ui/icons/Edit04Icon";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { Plus01Icon } from "@typebot.io/ui/icons/Plus01Icon";
import { Tag03Icon } from "@typebot.io/ui/icons/Tag03Icon";
import { Trash04Icon } from "@typebot.io/ui/icons/Trash04Icon";
import { useState } from "react";
import { trpc } from "@/lib/queryClient";
import type { Tag } from "../api/schemas";

type Props = {
  workspaceId: string;
  onClose: () => void;
};

export const TagsDialog = ({ workspaceId, onClose }: Props) => {
  const { t } = useTranslate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  const { data, isLoading, refetch } = useQuery(
    trpc.contacts.listTags.queryOptions({
      workspaceId,
    }),
  );

  const { mutate: createTag, isPending: isCreatingTag } = useMutation(
    trpc.contacts.createTag.mutationOptions({
      onSuccess: () => {
        setIsCreating(false);
        setNewTagName("");
        setNewTagColor("#6366f1");
        refetch();
      },
    }),
  );

  const { mutate: updateTag, isPending: isUpdatingTag } = useMutation(
    trpc.contacts.updateTag.mutationOptions({
      onSuccess: () => {
        setEditingTag(null);
        refetch();
      },
    }),
  );

  const { mutate: deleteTag } = useMutation(
    trpc.contacts.deleteTag.mutationOptions({
      onSuccess: () => {
        refetch();
      },
    }),
  );

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTag({
      workspaceId,
      name: newTagName.trim(),
      color: newTagColor,
    });
  };

  const handleUpdateTag = () => {
    if (!editingTag || !editingTag.name.trim()) return;
    updateTag({
      tagId: editingTag.id,
      name: editingTag.name.trim(),
      color: editingTag.color ?? undefined,
      description: editingTag.description ?? undefined,
    });
  };

  const handleDeleteTag = (tagId: string, contactCount: number) => {
    const message =
      contactCount > 0
        ? t("contacts.tags.deleteWithContacts", {
            defaultValue: `This tag is assigned to ${contactCount} contacts. Are you sure you want to delete it?`,
            count: contactCount,
          })
        : t("contacts.tags.deleteConfirm", {
            defaultValue: "Are you sure you want to delete this tag?",
          });

    if (window.confirm(message)) {
      deleteTag({ tagId });
    }
  };

  const predefinedColors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#a855f7",
    "#ec4899",
    "#6b7280",
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("contacts.tags.title", { defaultValue: "Manage Tags" })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-11">
              {t("contacts.tags.description", {
                defaultValue:
                  "Create and manage tags to organize your contacts",
              })}
            </p>
            {!isCreating && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCreating(true)}
              >
                <Plus01Icon className="w-4 h-4" />
                {t("contacts.tags.create", { defaultValue: "Create Tag" })}
              </Button>
            )}
          </div>

          {isCreating && (
            <div className="border rounded-lg p-4 bg-gray-2">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label>
                    {t("contacts.tags.name", { defaultValue: "Tag Name" })}
                  </Label>
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder={t("contacts.tags.namePlaceholder", {
                      defaultValue: "e.g., VIP Customer",
                    })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>
                    {t("contacts.tags.color", { defaultValue: "Color" })}
                  </Label>
                  <div className="flex gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full border-2 ${
                          newTagColor === color
                            ? "border-gray-12"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setNewTagName("");
                    }}
                  >
                    {t("cancel", { defaultValue: "Cancel" })}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={isCreatingTag || !newTagName.trim()}
                  >
                    {isCreatingTag
                      ? t("creating", { defaultValue: "Creating..." })
                      : t("create", { defaultValue: "Create" })}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderCircleIcon className="animate-spin w-6 h-6" />
            </div>
          ) : !data?.tags.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-11">
              <Tag03Icon className="w-10 h-10 mb-2" />
              <p>
                {t("contacts.tags.empty", {
                  defaultValue: "No tags created yet",
                })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {data.tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  {editingTag?.id === tag.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingTag.name}
                        onChange={(e) =>
                          setEditingTag((prev) =>
                            prev ? { ...prev, name: e.target.value } : null,
                          )
                        }
                        className="flex-1"
                      />
                      <div className="flex gap-1">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-5 h-5 rounded-full border ${
                              editingTag.color === color
                                ? "border-gray-12"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              setEditingTag((prev) =>
                                prev ? { ...prev, color } : null,
                              )
                            }
                          />
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingTag(null)}
                      >
                        {t("cancel", { defaultValue: "Cancel" })}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateTag}
                        disabled={isUpdatingTag}
                      >
                        {t("save", { defaultValue: "Save" })}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: tag.color || "#6b7280",
                          }}
                        />
                        <span className="font-medium">{tag.name}</span>
                        <span className="text-sm text-gray-11">
                          ({tag._count?.contacts ?? 0}{" "}
                          {t("contacts.tags.contacts", {
                            defaultValue: "contacts",
                          })}
                          )
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <DotsVertical02Icon className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTag(tag)}>
                            <Edit04Icon className="w-4 h-4 mr-2" />
                            {t("edit", { defaultValue: "Edit" })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteTag(tag.id, tag._count?.contacts ?? 0)
                            }
                            className="text-destructive"
                          >
                            <Trash04Icon className="w-4 h-4 mr-2" />
                            {t("delete", { defaultValue: "Delete" })}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
