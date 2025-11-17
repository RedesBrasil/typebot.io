import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@typebot.io/ui/components/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@typebot.io/ui/components/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@typebot.io/ui/components/Table";
import { AlertCircle02Icon } from "@typebot.io/ui/icons/AlertCircle02Icon";
import { CheckCircle01Icon } from "@typebot.io/ui/icons/CheckCircle01Icon";
import { ClockIcon } from "@typebot.io/ui/icons/ClockIcon";
import { ListIcon } from "@typebot.io/ui/icons/ListIcon";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { XCircleIcon } from "@typebot.io/ui/icons/XCircleIcon";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { trpc } from "@/lib/queryClient";
import type { Tag } from "../api/schemas";

type Props = {
  tag: Tag;
  onClose: () => void;
};

const statusIcons: Record<string, React.ReactNode> = {
  SUCCESS: <CheckCircle01Icon className="w-4 h-4 text-green-600" />,
  SKIPPED: <ClockIcon className="w-4 h-4 text-yellow-600" />,
  ERROR: <XCircleIcon className="w-4 h-4 text-red-600" />,
  SCHEDULED: <ClockIcon className="w-4 h-4 text-blue-600" />,
};

const statusColors: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-50 dark:bg-green-900/20",
  SKIPPED: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  ERROR: "text-red-600 bg-red-50 dark:bg-red-900/20",
  SCHEDULED: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
};

export const TriggerLogsDialog = ({ tag, onClose }: Props) => {
  const { t } = useTranslate();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery(
    trpc.contacts.listTriggerLogs.queryOptions({
      tagId: tag.id,
      limit: 100,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  );

  const getContactDisplay = (contact?: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  }) => {
    if (!contact) return "Unknown";
    return contact.name || contact.phone || contact.email || contact.id;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListIcon className="w-5 h-5" />
            {t("contacts.logs.title", {
              defaultValue: "Trigger Execution Logs",
            })}{" "}
            -
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

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-11">
              {data?.totalCount !== undefined &&
                t("contacts.logs.count", {
                  defaultValue: `${data.totalCount} log entries`,
                  count: data.totalCount,
                })}
            </p>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("contacts.logs.allStatuses", {
                    defaultValue: "All Statuses",
                  })}
                </SelectItem>
                <SelectItem value="SUCCESS">
                  {t("contacts.logs.success", { defaultValue: "Success" })}
                </SelectItem>
                <SelectItem value="SKIPPED">
                  {t("contacts.logs.skipped", { defaultValue: "Skipped" })}
                </SelectItem>
                <SelectItem value="ERROR">
                  {t("contacts.logs.error", { defaultValue: "Error" })}
                </SelectItem>
                <SelectItem value="SCHEDULED">
                  {t("contacts.logs.scheduled", { defaultValue: "Scheduled" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderCircleIcon className="animate-spin w-6 h-6" />
            </div>
          ) : !data?.logs.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-11">
              <ListIcon className="w-10 h-10 mb-2" />
              <p>
                {t("contacts.logs.empty", {
                  defaultValue: "No execution logs found",
                })}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">
                      {t("contacts.logs.status", { defaultValue: "Status" })}
                    </TableHead>
                    <TableHead>
                      {t("contacts.logs.contact", { defaultValue: "Contact" })}
                    </TableHead>
                    <TableHead>
                      {t("contacts.logs.trigger", { defaultValue: "Trigger" })}
                    </TableHead>
                    <TableHead>
                      {t("contacts.logs.message", { defaultValue: "Message" })}
                    </TableHead>
                    <TableHead className="w-40">
                      {t("contacts.logs.executedAt", {
                        defaultValue: "Executed",
                      })}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusColors[log.status] || "text-gray-600 bg-gray-50"}`}
                        >
                          {statusIcons[log.status] || (
                            <AlertCircle02Icon className="w-4 h-4" />
                          )}
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getContactDisplay(log.contact)}
                      </TableCell>
                      <TableCell>
                        {log.trigger?.triggerType === "TAG_ADDED" ? (
                          <span className="text-green-600">
                            {t("contacts.logs.onAdd", {
                              defaultValue: "On Add",
                            })}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {t("contacts.logs.onRemove", {
                              defaultValue: "On Remove",
                            })}
                          </span>
                        )}
                        {log.trigger?.typebot && (
                          <span className="text-gray-11 ml-1">
                            → {log.trigger.typebot.name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.message || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-11">
                        {formatDistanceToNow(new Date(log.executedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data?.nextCursor && (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm">
                {t("contacts.logs.loadMore", { defaultValue: "Load More" })}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
