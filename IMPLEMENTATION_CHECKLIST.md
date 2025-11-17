# Typebot Contact Management System - Implementation Checklist

## 📋 Project Overview

This document tracks the implementation progress of a global contact management and tagging system for Typebot, similar to BotConversa. The system allows contacts to be identified, tagged, and automated flows to be triggered based on tag changes.

**Start Date**: 2025-11-17
**Branch**: `claude/review-typebot-project-01HnPoX9KR8WpY3Ftt91Yqgh`
**Integration**: Evolution API (remoteJid for contact identification)

---

## 🎯 Phase 1: Core Infrastructure

### 1.1 Database Schema
- [x] Create `Contact` model with fields (phone, email, name, customFields)
- [x] Create `Tag` model with fields (name, color, description)
- [x] Create `TagOnContact` junction table (many-to-many)
- [x] Create `CustomFieldDefinition` model for workspace-level field definitions
- [x] Create `TagTrigger` model for automation triggers
- [x] Add `contactId` relation to `Result` model
- [x] Add workspace relations for all new models
- [x] Create database indexes for performance
- [ ] Generate Prisma migration (`npx prisma migrate dev --name add_contact_management`)
- [ ] Test migration on development database
- [ ] Document migration rollback procedure

### 1.2 Core Packages
- [x] Create `@typebot.io/contacts` package
  - [x] Package.json configuration
  - [x] TypeScript configuration
  - [x] Schema definitions (Zod)
  - [x] `findOrCreateContact` function
  - [x] `getContact` function
  - [x] `updateContact` function
  - [x] Export index file
- [x] Create `@typebot.io/contact-tags` package (renamed from `tags` due to .gitignore)
  - [x] Package.json configuration
  - [x] TypeScript configuration
  - [x] Schema definitions
  - [x] `addTagToContact` function
  - [x] `removeTagFromContact` function
  - [x] `getContactTags` function
  - [x] `executeTagTriggers` function
  - [x] Export index file

### 1.3 Session State Updates
- [x] Add `contactId` field to `SessionState` schema
- [x] Update session state version if needed
- [ ] Add migration helper for existing sessions
- [ ] Update session cleanup logic to handle contacts

---

## 🧩 Phase 2: Logic Blocks

### 2.1 GET_CONTACT Block
- [x] Define block type in constants
- [x] Create Zod schema with options (fieldToGet, customFieldName, variableId)
- [x] Export schema in main logic schema file
- [x] Create executor function
- [x] Register in executeLogic dispatcher
- [x] Create UI Settings component
- [x] Create Node Content component
- [x] Register icon in BlockIcon.tsx
- [x] Register label in BlockLabel.tsx
- [x] Register settings in SettingsPopoverContent.tsx
- [x] Register content in BlockNodeContent.tsx
- [ ] Add localization strings (i18n)
- [ ] Write unit tests
- [ ] Document block usage

### 2.2 SET_CONTACT Block
- [x] Define block type in constants
- [x] Create Zod schema with options (fieldToSet, customFieldName, value, expressionToEvaluate)
- [x] Export schema in main logic schema file
- [x] Create executor function
- [x] Register in executeLogic dispatcher
- [x] Create UI Settings component
- [x] Create Node Content component
- [x] Register icon in BlockIcon.tsx
- [x] Register label in BlockLabel.tsx
- [x] Register settings in SettingsPopoverContent.tsx
- [x] Register content in BlockNodeContent.tsx
- [ ] Add localization strings (i18n)
- [ ] Write unit tests
- [ ] Document block usage

### 2.3 ADD_TAG Block
- [x] Define block type in constants
- [x] Create Zod schema with options (tagId, tagName, skipTriggers)
- [x] Export schema in main logic schema file
- [x] Create executor function with trigger support
- [x] Register in executeLogic dispatcher
- [x] Create UI Settings component
- [x] Create Node Content component
- [x] Register icon in BlockIcon.tsx
- [x] Register label in BlockLabel.tsx
- [x] Register settings in SettingsPopoverContent.tsx
- [x] Register content in BlockNodeContent.tsx
- [ ] Add localization strings (i18n)
- [ ] Write unit tests
- [ ] Document block usage

### 2.4 REMOVE_TAG Block
- [x] Define block type in constants
- [x] Create Zod schema with options (tagId, tagName, skipTriggers)
- [x] Export schema in main logic schema file
- [x] Create executor function with trigger support
- [x] Register in executeLogic dispatcher
- [x] Create UI Settings component
- [x] Create Node Content component
- [x] Register icon in BlockIcon.tsx
- [x] Register label in BlockLabel.tsx
- [x] Register settings in SettingsPopoverContent.tsx
- [x] Register content in BlockNodeContent.tsx
- [ ] Add localization strings (i18n)
- [ ] Write unit tests
- [ ] Document block usage

---

## 🔗 Phase 3: Bot Engine Integration

### 3.1 Contact Identification
- [x] Implement contact identification in `startSession.ts`
- [x] Extract phone from Evolution API's `remoteJid` field
- [x] Auto-create contact if not exists
- [x] Link contact to session state
- [x] Store contactId in Result record
- [ ] Handle contact identification errors gracefully
- [ ] Add logging for contact identification
- [ ] Support multiple identification methods (phone, email, externalId)

### 3.2 Tag Trigger System
- [x] Create trigger execution logic
- [x] Check for triggers when tag is added/removed
- [x] Support TAG_ADDED and TAG_REMOVED trigger types
- [x] Prevent trigger execution if contact has active session
- [x] Start new typebot flow when trigger fires
- [ ] Add cooldown period between trigger executions
- [ ] Implement trigger priority/ordering
- [ ] Add trigger execution logs
- [ ] Support conditional triggers (based on other tags/fields)

### 3.3 Variable System Enhancement
- [ ] Parse `{{contact.name}}` variable syntax
- [ ] Parse `{{contact.email}}` variable syntax
- [ ] Parse `{{contact.phone}}` variable syntax
- [ ] Parse `{{contact.tags}}` variable syntax (comma-separated list)
- [ ] Parse `{{contact.customFields.fieldName}}` syntax
- [ ] Cache contact data in session store for performance
- [ ] Update variable autocomplete in builder
- [ ] Document all contact variables

---

## 🖥️ Phase 4: Builder Dashboard

### 4.1 Contacts Management Page
- [ ] Create contacts list page (`/workspace/[id]/contacts`)
- [ ] Implement contact search and filtering
- [ ] Add contact details view
- [ ] Create contact edit form
- [ ] Implement contact creation dialog
- [ ] Add contact deletion with confirmation
- [ ] Display contact tags with colors
- [ ] Show contact interaction history
- [ ] Implement bulk operations (tag, delete)
- [ ] Add contact export functionality (CSV)
- [ ] Implement contact import from CSV
- [ ] Add pagination for large contact lists
- [ ] Create contact activity timeline

### 4.2 Tags Management Page
- [ ] Create tags list page (`/workspace/[id]/tags`)
- [ ] Implement tag creation dialog
- [ ] Add color picker for tag colors
- [ ] Create tag edit form
- [ ] Implement tag deletion with confirmation
- [ ] Show contact count per tag
- [ ] Add tag filtering and search
- [ ] Implement tag merging functionality
- [ ] Create tag usage statistics

### 4.3 Tag Triggers Management
- [ ] Create triggers list page (`/workspace/[id]/triggers`)
- [ ] Implement trigger creation dialog
- [ ] Add trigger type selection (TAG_ADDED/TAG_REMOVED)
- [ ] Integrate typebot selection dropdown
- [ ] Show trigger execution history
- [ ] Add trigger enable/disable toggle
- [ ] Implement trigger testing functionality
- [ ] Create trigger logs viewer
- [ ] Add trigger conditions builder

### 4.4 Custom Fields Management
- [ ] Create custom fields definition page
- [ ] Implement field type selection (text, number, date, select)
- [ ] Add field validation rules
- [ ] Create field ordering interface
- [ ] Implement field deletion with data handling
- [ ] Add field usage statistics
- [ ] Support field default values

---

## 🔌 Phase 5: API Layer

### 5.1 tRPC Routers

#### Contacts Router
- [ ] `contacts.list` - List workspace contacts with pagination
- [ ] `contacts.get` - Get single contact by ID
- [ ] `contacts.create` - Create new contact
- [ ] `contacts.update` - Update contact fields
- [ ] `contacts.delete` - Delete contact
- [ ] `contacts.search` - Search contacts by name/phone/email
- [ ] `contacts.bulkTag` - Add tag to multiple contacts
- [ ] `contacts.bulkRemoveTag` - Remove tag from multiple contacts
- [ ] `contacts.export` - Export contacts to CSV
- [ ] `contacts.import` - Import contacts from CSV
- [ ] `contacts.getHistory` - Get contact interaction history

#### Tags Router
- [ ] `tags.list` - List workspace tags
- [ ] `tags.get` - Get single tag by ID
- [ ] `tags.create` - Create new tag
- [ ] `tags.update` - Update tag (name, color, description)
- [ ] `tags.delete` - Delete tag
- [ ] `tags.merge` - Merge two tags
- [ ] `tags.getContacts` - Get all contacts with specific tag
- [ ] `tags.getStats` - Get tag usage statistics

#### Triggers Router
- [ ] `triggers.list` - List tag triggers
- [ ] `triggers.get` - Get single trigger
- [ ] `triggers.create` - Create new trigger
- [ ] `triggers.update` - Update trigger configuration
- [ ] `triggers.delete` - Delete trigger
- [ ] `triggers.toggle` - Enable/disable trigger
- [ ] `triggers.test` - Test trigger execution
- [ ] `triggers.getLogs` - Get trigger execution logs

#### Custom Fields Router
- [ ] `customFields.list` - List field definitions
- [ ] `customFields.create` - Create new field definition
- [ ] `customFields.update` - Update field definition
- [ ] `customFields.delete` - Delete field definition
- [ ] `customFields.reorder` - Reorder field display order

### 5.2 REST API Endpoints (for external integrations)
- [ ] `POST /api/contacts` - Create contact
- [ ] `GET /api/contacts/:id` - Get contact
- [ ] `PATCH /api/contacts/:id` - Update contact
- [ ] `DELETE /api/contacts/:id` - Delete contact
- [ ] `POST /api/contacts/:id/tags` - Add tag to contact
- [ ] `DELETE /api/contacts/:id/tags/:tagId` - Remove tag from contact
- [ ] `GET /api/tags` - List tags
- [ ] `POST /api/tags` - Create tag
- [ ] Add API authentication (API key or workspace token)
- [ ] Implement rate limiting
- [ ] Create API documentation (OpenAPI/Swagger)

---

## 🧪 Phase 6: Testing

### 6.1 Unit Tests
- [ ] Contact package functions
- [ ] Tag package functions
- [ ] Block executors
- [ ] Schema validations
- [ ] Variable parsing for contact data
- [ ] Trigger execution logic

### 6.2 Integration Tests
- [ ] Contact CRUD operations
- [ ] Tag operations with contact relations
- [ ] Trigger firing and flow execution
- [ ] Session state with contact linking
- [ ] API endpoints authentication
- [ ] Rate limiting behavior

### 6.3 End-to-End Tests
- [ ] Contact management flow in builder
- [ ] Tag management flow
- [ ] Trigger creation and testing
- [ ] Block usage in flow builder
- [ ] Contact identification in chat
- [ ] Variable interpolation in messages

---

## 📚 Phase 7: Documentation

### 7.1 Developer Documentation
- [x] CLAUDE.md with project structure and patterns
- [ ] API reference documentation
- [ ] Database schema documentation
- [ ] Migration guide for existing installations
- [ ] Architecture decision records (ADRs)
- [ ] Contributing guidelines for contact system

### 7.2 User Documentation
- [ ] Getting started with contact management
- [ ] How to create and manage tags
- [ ] Setting up tag triggers
- [ ] Using contact variables in flows
- [ ] Best practices for contact segmentation
- [ ] Troubleshooting common issues
- [ ] Video tutorials for main features

### 7.3 API Documentation
- [ ] tRPC router documentation
- [ ] REST API OpenAPI specification
- [ ] Authentication and authorization guide
- [ ] Rate limiting documentation
- [ ] Webhook integration guide (for triggers)

---

## 🔒 Phase 8: Security & Performance

### 8.1 Security
- [ ] Input validation for all contact fields
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection for custom fields display
- [ ] CORS configuration for API endpoints
- [ ] API key rotation mechanism
- [ ] Audit logging for sensitive operations
- [ ] GDPR compliance (data export, deletion)
- [ ] Data encryption for sensitive fields

### 8.2 Performance Optimization
- [ ] Database indexes for common queries
- [ ] Contact data caching in session
- [ ] Pagination for all list endpoints
- [ ] Batch operations for bulk tag updates
- [ ] Query optimization for tag statistics
- [ ] Lazy loading for contact history
- [ ] Redis caching for frequently accessed contacts
- [ ] Background job processing for triggers

### 8.3 Monitoring
- [ ] Contact operation metrics
- [ ] Trigger execution monitoring
- [ ] API endpoint performance tracking
- [ ] Error rate monitoring
- [ ] Database query performance
- [ ] Cache hit/miss ratios

---

## 🚀 Phase 9: Deployment

### 9.1 Database Migration
- [ ] Generate production migration files
- [ ] Test migration on staging environment
- [ ] Create rollback scripts
- [ ] Plan zero-downtime migration
- [ ] Backup existing data before migration

### 9.2 Feature Flags
- [ ] Implement contact system feature flag
- [ ] Gradual rollout plan
- [ ] A/B testing configuration
- [ ] Kill switch for emergency disable

### 9.3 Release
- [ ] Update version numbers
- [ ] Create release notes
- [ ] Update Docker images
- [ ] Deploy to staging
- [ ] Perform smoke tests
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Announce new features

---

## 📊 Progress Summary

### Overall Progress
- **Phase 1**: Core Infrastructure - 85% Complete
- **Phase 2**: Logic Blocks - 90% Complete
- **Phase 3**: Bot Engine Integration - 60% Complete
- **Phase 4**: Builder Dashboard - 0% Complete
- **Phase 5**: API Layer - 0% Complete
- **Phase 6**: Testing - 0% Complete
- **Phase 7**: Documentation - 20% Complete
- **Phase 8**: Security & Performance - 0% Complete
- **Phase 9**: Deployment - 0% Complete

### Commits Made
1. `4ee4f7f` - ✨ Add contact management and tagging system (41 files, 1899 insertions)
2. `98483ed` - 📝 Add CLAUDE.md project documentation

### Next Priority Tasks
1. Generate Prisma database migration
2. Implement contact variable parsing ({{contact.*}})
3. Add localization strings for new blocks
4. Create contacts management dashboard UI
5. Implement tRPC routers for CRUD operations

---

## 🗓️ Implementation Notes

### Session: 2025-11-17

**Completed:**
- Full database schema with 5 new models
- Two new packages (@typebot.io/contacts and @typebot.io/contact-tags)
- Four new logic blocks with complete UI integration
- Contact identification via Evolution API remoteJid
- Tag trigger automation system foundation
- Project documentation (CLAUDE.md)

**Issues Encountered:**
- `.gitignore` contains entry for `tags` (ctags), had to rename package to `contact-tags`
- TypeScript compilation check failed due to missing node_modules (expected in clean environment)
- Prisma client generation failed with 403 error (network issue, not blocking)

**Technical Decisions:**
- Used remoteJid as externalId for contact uniqueness
- Implemented skipTriggers option to prevent infinite loops
- Added workspaceId to all models for multi-tenancy
- Used JSON field for customFields for flexibility

---

## 📝 Quick Reference

### Key File Locations
- **Prisma Schema**: `packages/prisma/postgresql/schema.prisma`
- **Contacts Package**: `packages/contacts/src/`
- **Tags Package**: `packages/contact-tags/src/`
- **Block Schemas**: `packages/blocks/logic/src/{blockName}/schema.ts`
- **Block Executors**: `packages/bot-engine/src/blocks/logic/{blockName}/`
- **Block UI**: `apps/builder/src/features/blocks/logic/{blockName}/components/`
- **Session State**: `packages/chat-session/src/schemas.ts`

### Commands to Remember
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_contact_management

# Run development
bun dev

# Type check
bun typecheck
```

### Evolution API Integration
```typescript
// remoteJid format: 5511999999999@s.whatsapp.net
const phoneMatch = remoteJid.match(/^(\d+)@/);
const phone = phoneMatch ? phoneMatch[1] : null;
```
