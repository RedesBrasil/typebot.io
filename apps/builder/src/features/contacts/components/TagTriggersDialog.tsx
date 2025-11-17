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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@typebot.io/ui/components/Select";
import { Switch } from "@typebot.io/ui/components/Switch";
import { DotsVertical02Icon } from "@typebot.io/ui/icons/DotsVertical02Icon";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { Plus01Icon } from "@typebot.io/ui/icons/Plus01Icon";
import { Trash04Icon } from "@typebot.io/ui/icons/Trash04Icon";
import { Zap04Icon } from "@typebot.io/ui/icons/Zap04Icon";
import { useState } from "react";
import { trpc } from "@/lib/queryClient";
import type { Tag, TagTrigger } from "../api/schemas";

type Props = {
  tag: Tag;
  workspaceId: string;
  onClose: () => void;
};

type TriggerFormData = {
  triggerType: "TAG_ADDED" | "TAG_REMOVED";
  typebotId: string;
  isEnabled: boolean;
  delaySeconds: number;
  cooldownSeconds: number;
  priority: number;
};

export const TagTriggersDialog = ({ tag, workspaceId, onClose }: Props) => {
  const { t } = useTranslate();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<TriggerFormData>({
    triggerType: "TAG_ADDED",
    typebotId: "",
    isEnabled: true,
    delaySeconds: 0,
    cooldownSeconds: 60,
    priority: 100,
  });

  const { data: triggersData, isLoading, refetch } = useQuery(
    trpc.contacts.listTagTriggers.queryOptions({
      tagId: tag.id,
    }),
  );

  const { data: typebotsData } = useQuery(
    trpc.typebot.listTypebots.queryOptions({
      workspaceId,
      limit: 100,
    }),
  );

  const { mutate: createTrigger, isPending: isCreatingTrigger } = useMutation(
    trpc.contacts.createTagTrigger.mutationOptions({
      onSuccess: () => {
        setIsCreating(false);
        setFormData({
          triggerType: "TAG_ADDED",
          typebotId: "",
          isEnabled: true,
          delaySeconds: 0,
          cooldownSeconds: 60,
          priority: 100,
        });
        refetch();
      },
    }),
  );

  const { mutate: updateTrigger } = useMutation(
    trpc.contacts.updateTagTrigger.mutationOptions({
      onSuccess: () => refetch(),
    }),
  );

  const { mutate: deleteTrigger } = useMutation(
    trpc.contacts.deleteTagTrigger.mutationOptions({
      onSuccess: () => refetch(),
    }),
  );

  const handleCreateTrigger = () => {
    if (!formData.typebotId) return;
    createTrigger({
      tagId: tag.id,
      ...formData,
    });
  };

  const handleToggleEnabled = (triggerId: string, isEnabled: boolean) => {
    updateTrigger({
      triggerId,
      isEnabled,
    });
  };

  const handleDeleteTrigger = (triggerId: string) => {
    if (
      window.confirm(
        t("contacts.triggers.deleteConfirm", {
          defaultValue: "Are you sure you want to delete this trigger?",
        }),
      )
    ) {
      deleteTrigger({ triggerId });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap04Icon className="w-5 h-5" />
            {t("contacts.triggers.title", {
              defaultValue: "Triggers for",
            })}{" "}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : "var(--gray-4)",
                color: tag.color || "var(--gray-11)",
                border: `1px solid ${tag.color || "var(--gray-6)"}`,
              }}
            >
              {tag.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-11">
              {t("contacts.triggers.description", {
                defaultValue:
                  "Configure automated flows when this tag is added or removed",
              })}
            </p>
            {!isCreating && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCreating(true)}
              >
                <Plus01Icon className="w-4 h-4" />
                {t("contacts.triggers.create", { defaultValue: "Add Trigger" })}
              </Button>
            )}
          </div>

          {isCreating && (
            <div className="border rounded-lg p-4 bg-gray-2">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>
                      {t("contacts.triggers.type", { defaultValue: "Trigger Type" })}
                    </Label>
                    <Select
                      value={formData.triggerType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          triggerType: value as "TAG_ADDED" | "TAG_REMOVED",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TAG_ADDED">
                          {t("contacts.triggers.tagAdded", {
                            defaultValue: "When tag is added",
                          })}
                        </SelectItem>
                        <SelectItem value="TAG_REMOVED">
                          {t("contacts.triggers.tagRemoved", {
                            defaultValue: "When tag is removed",
                          })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>
                      {t("contacts.triggers.typebot", { defaultValue: "Flow to Execute" })}
                    </Label>
                    <Select
                      value={formData.typebotId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, typebotId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("contacts.triggers.selectTypebot", {
                            defaultValue: "Select a flow...",
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {typebotsData?.typebots.map((typebot) => (
                          <SelectItem key={typebot.id} value={typebot.id}>
                            {typebot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>
                      {t("contacts.triggers.delay", { defaultValue: "Delay (seconds)" })}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.delaySeconds}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          delaySeconds: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>
                      {t("contacts.triggers.cooldown", { defaultValue: "Cooldown (seconds)" })}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.cooldownSeconds}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cooldownSeconds: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>
                      {t("contacts.triggers.priority", { defaultValue: "Priority" })}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: parseInt(e.target.value) || 100,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-11">
                      {t("contacts.triggers.priorityHelp", {
                        defaultValue: "Lower number = higher priority",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsCreating(false)}
                  >
                    {t("cancel", { defaultValue: "Cancel" })}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateTrigger}
                    disabled={isCreatingTrigger || !formData.typebotId}
                  >
                    {isCreatingTrigger
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
          ) : !triggersData?.triggers.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-11">
              <Zap04Icon className="w-10 h-10 mb-2" />
              <p>
                {t("contacts.triggers.empty", {
                  defaultValue: "No triggers configured for this tag",
                })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {triggersData.triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={trigger.isEnabled}
                      onCheckedChange={(checked) =>
                        handleToggleEnabled(trigger.id, checked)
                      }
                    />
                    <div>
                      <div className="font-medium">
                        {trigger.triggerType === "TAG_ADDED" ? (
                          <span className="text-green-600">
                            {t("contacts.triggers.onAdd", {
                              defaultValue: "On Add",
                            })}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {t("contacts.triggers.onRemove", {
                              defaultValue: "On Remove",
                            })}
                          </span>
                        )}
                        {" → "}
                        {trigger.typebot?.name || "Unknown Flow"}
                      </div>
                      <div className="text-xs text-gray-11">
                        {t("contacts.triggers.info", {
                          defaultValue: `Delay: ${trigger.delaySeconds}s | Cooldown: ${trigger.cooldownSeconds}s | Priority: ${trigger.priority}`,
                          delay: trigger.delaySeconds,
                          cooldown: trigger.cooldownSeconds,
                          priority: trigger.priority,
                        })}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <DotsVertical02Icon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteTrigger(trigger.id)}
                        className="text-destructive"
                      >
                        <Trash04Icon className="w-4 h-4 mr-2" />
                        {t("delete", { defaultValue: "Delete" })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
