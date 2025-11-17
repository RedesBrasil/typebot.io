-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "externalId" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastInteraction" TIMESTAMP(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagOnContact" (
    "contactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagOnContact_pkey" PRIMARY KEY ("contactId","tagId")
);

-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagTrigger" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "typebotId" TEXT NOT NULL,
    "eventId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "delaySeconds" INTEGER NOT NULL DEFAULT 0,
    "onlyIfNoActiveSession" BOOLEAN NOT NULL DEFAULT true,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 60,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagTriggerLog" (
    "id" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TagTriggerLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_workspaceId_idx" ON "Contact"("workspaceId");

-- CreateIndex
CREATE INDEX "Contact_phone_idx" ON "Contact"("phone");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_externalId_idx" ON "Contact"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_workspaceId_phone_key" ON "Contact"("workspaceId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_workspaceId_email_key" ON "Contact"("workspaceId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_workspaceId_externalId_key" ON "Contact"("workspaceId", "externalId");

-- CreateIndex
CREATE INDEX "Tag_workspaceId_idx" ON "Tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_workspaceId_name_key" ON "Tag"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "TagOnContact_contactId_idx" ON "TagOnContact"("contactId");

-- CreateIndex
CREATE INDEX "TagOnContact_tagId_idx" ON "TagOnContact"("tagId");

-- CreateIndex
CREATE INDEX "CustomFieldDefinition_workspaceId_idx" ON "CustomFieldDefinition"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDefinition_workspaceId_name_key" ON "CustomFieldDefinition"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "TagTrigger_tagId_idx" ON "TagTrigger"("tagId");

-- CreateIndex
CREATE INDEX "TagTrigger_typebotId_idx" ON "TagTrigger"("typebotId");

-- CreateIndex
CREATE INDEX "TagTriggerLog_triggerId_idx" ON "TagTriggerLog"("triggerId");

-- CreateIndex
CREATE INDEX "TagTriggerLog_contactId_idx" ON "TagTriggerLog"("contactId");

-- CreateIndex
CREATE INDEX "TagTriggerLog_tagId_idx" ON "TagTriggerLog"("tagId");

-- CreateIndex
CREATE INDEX "TagTriggerLog_executedAt_idx" ON "TagTriggerLog"("executedAt");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnContact" ADD CONSTRAINT "TagOnContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagOnContact" ADD CONSTRAINT "TagOnContact_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFieldDefinition" ADD CONSTRAINT "CustomFieldDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTrigger" ADD CONSTRAINT "TagTrigger_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTrigger" ADD CONSTRAINT "TagTrigger_typebotId_fkey" FOREIGN KEY ("typebotId") REFERENCES "Typebot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTriggerLog" ADD CONSTRAINT "TagTriggerLog_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "TagTrigger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagTriggerLog" ADD CONSTRAINT "TagTriggerLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable (add contactId to Result)
ALTER TABLE "Result" ADD COLUMN "contactId" TEXT;

-- CreateIndex
CREATE INDEX "Result_contactId_idx" ON "Result"("contactId");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
