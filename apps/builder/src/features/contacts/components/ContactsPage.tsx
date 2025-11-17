import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@typebot.io/ui/components/Table";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { Search01Icon } from "@typebot.io/ui/icons/Search01Icon";
import { Tag03Icon } from "@typebot.io/ui/icons/Tag03Icon";
import { Users01Icon } from "@typebot.io/ui/icons/Users01Icon";
import Link from "next/link";
import { useState } from "react";
import { Seo } from "@/components/Seo";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { ContactRow } from "./ContactRow";
import { TagsDialog } from "./TagsDialog";

export const ContactsPage = () => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    trpc.contacts.listContacts.queryOptions(
      {
        workspaceId: workspace?.id ?? "",
        search: searchQuery || undefined,
        limit: 50,
      },
      {
        enabled: !!workspace?.id,
      },
    ),
  );

  return (
    <div className="flex flex-col gap-2 min-h-screen">
      <Seo title={t("contacts.title", { defaultValue: "Contacts" })} />
      <DashboardHeader />
      <div className="flex flex-col flex-1 max-w-[1200px] w-full mx-auto px-4">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <Users01Icon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">
              {t("contacts.title", { defaultValue: "Contacts" })}
            </h1>
            {data?.totalCount !== undefined && (
              <span className="text-gray-11 text-sm">
                ({data.totalCount})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setIsTagsDialogOpen(true)}>
              <Tag03Icon />
              {t("contacts.manageTags", { defaultValue: "Manage Tags" })}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-11 w-4 h-4" />
            <Input
              placeholder={t("contacts.searchPlaceholder", {
                defaultValue: "Search by name, email, or phone...",
              })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoaderCircleIcon className="animate-spin w-8 h-8" />
          </div>
        ) : !data?.contacts.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-11">
            <Users01Icon className="w-12 h-12 mb-4" />
            <p className="text-lg">
              {searchQuery
                ? t("contacts.noResults", { defaultValue: "No contacts found" })
                : t("contacts.empty", {
                    defaultValue: "No contacts yet. Contacts will appear here when users interact with your flows.",
                  })}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("contacts.table.name", { defaultValue: "Name" })}
                  </TableHead>
                  <TableHead>
                    {t("contacts.table.phone", { defaultValue: "Phone" })}
                  </TableHead>
                  <TableHead>
                    {t("contacts.table.email", { defaultValue: "Email" })}
                  </TableHead>
                  <TableHead>
                    {t("contacts.table.tags", { defaultValue: "Tags" })}
                  </TableHead>
                  <TableHead>
                    {t("contacts.table.lastInteraction", {
                      defaultValue: "Last Interaction",
                    })}
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.contacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onUpdate={() => refetch()}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {data?.nextCursor && (
          <div className="flex justify-center py-4">
            <Button variant="secondary">
              {t("contacts.loadMore", { defaultValue: "Load More" })}
            </Button>
          </div>
        )}
      </div>

      {isTagsDialogOpen && workspace && (
        <TagsDialog
          workspaceId={workspace.id}
          onClose={() => setIsTagsDialogOpen(false)}
        />
      )}
    </div>
  );
};
