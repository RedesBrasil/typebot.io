# CLAUDE.md - Typebot Project Documentation

## Project Overview

Typebot is an open-source conversational form builder that allows users to create interactive chat flows. It uses a visual drag-and-drop interface to build complex conversation logic.

## Technology Stack

- **Runtime**: Node.js with Bun package manager
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React with Next.js (App Router)
- **Styling**: Tailwind CSS with Radix UI primitives
- **Validation**: Zod schemas
- **Monorepo**: Turborepo with pnpm workspaces

## Project Structure

```
typebot.io/
├── apps/                          # Main applications
│   ├── builder/                   # Flow builder UI (Next.js)
│   ├── viewer/                    # Chat runtime/preview (Next.js)
│   ├── chat-api/                  # API for chat interactions
│   └── docs/                      # Documentation site
├── packages/                      # Shared packages (39+)
│   ├── prisma/                    # Database schema and client
│   ├── bot-engine/                # Core bot execution logic
│   ├── blocks-*/                  # Block definitions
│   │   ├── blocks-core/           # Base block schemas
│   │   ├── blocks-bubbles/        # Message blocks (text, image, video)
│   │   ├── blocks-inputs/         # Input blocks (text, email, buttons)
│   │   ├── blocks-logic/          # Logic blocks (conditions, scripts)
│   │   └── blocks-integrations/   # External service integrations
│   ├── chat-session/              # Session state management
│   ├── variables/                 # Variable parsing system
│   ├── contacts/                  # Contact management (NEW)
│   ├── contact-tags/              # Tag system and triggers (NEW)
│   └── ui/                        # Shared UI components
└── ee/                            # Enterprise Edition features
```

## Key Concepts

### 1. Blocks

Blocks are the building units of a typebot flow. Each block type has:

- **Schema** (`packages/blocks-*/src/{blockName}/schema.ts`)
- **Executor** (`packages/bot-engine/src/blocks/{category}/{blockName}/`)
- **UI Settings** (`apps/builder/src/features/blocks/{category}/{blockName}/`)

Block categories:
- **Bubbles**: Display messages (text, image, video, audio, embed)
- **Inputs**: Collect user input (text, email, buttons, rating, file)
- **Logic**: Control flow (conditions, scripts, jumps, variables)
- **Integrations**: External services (HTTP, Google Sheets, OpenAI)

### 2. Session State

The `SessionState` object (`packages/chat-session/src/schemas.ts`) contains:
- `typebotsQueue`: Stack of active typebots
- `progressMetadata`: Tracking information
- `currentVisitedEdgeIndex`: Flow position
- `contactId`: Linked contact (NEW)
- `workspaceId`: Workspace context

### 3. Variables System

Variables use the `{{variableName}}` syntax and are parsed by `packages/variables/parseVariables`.

Types:
- **Session variables**: Stored in typebot definition
- **System variables**: Built-in values (timestamp, etc.)
- **Contact variables**: `{{contact.name}}`, `{{contact.tags}}` (NEW)

### 4. Contact Management System (NEW)

Located in `packages/contacts/` and `packages/contact-tags/`:

**Contact Identification**:
- Uses Evolution API's `remoteJid` field
- Format: `5511999999999@s.whatsapp.net`
- Automatically extracts phone number and creates/finds contact

**Database Models**:
```prisma
Contact {
  id, workspaceId, phone, email, externalId
  name, firstName, lastName, customFields
  tags: TagOnContact[]
}

Tag {
  id, workspaceId, name, color, description
  contacts: TagOnContact[]
  triggers: TagTrigger[]
}

TagTrigger {
  id, tagId, triggerType (TAG_ADDED | TAG_REMOVED)
  typebotId (flow to execute)
}
```

**New Logic Blocks**:
- `GET_CONTACT`: Retrieve contact fields
- `SET_CONTACT`: Update contact data
- `ADD_TAG`: Add tag to contact (triggers automation)
- `REMOVE_TAG`: Remove tag from contact

## Adding a New Block

### 1. Define the Schema

```typescript
// packages/blocks-logic/src/{blockName}/schema.ts
import { blockBaseSchema } from "@typebot.io/blocks-core/schemas/schema";
import { LogicBlockType } from "../constants";
import { z } from "@typebot.io/zod";

export const myBlockOptionsSchema = z.object({
  option1: z.string().optional(),
  option2: z.boolean().optional(),
});

export const myBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.MY_BLOCK]),
    options: myBlockOptionsSchema.optional(),
  }),
);

export type MyBlock = z.infer<typeof myBlockSchema>;
```

### 2. Register Block Type

```typescript
// packages/blocks-logic/src/constants.ts
export enum LogicBlockType {
  // ... existing types
  MY_BLOCK = "My block",
}
```

### 3. Export Schema

```typescript
// packages/blocks-logic/src/schema.ts
import { myBlockSchema } from "./myBlock/schema";

export const logicBlockSchema = z.discriminatedUnion("type", [
  // ... existing schemas
  myBlockSchema,
]);
```

### 4. Create Executor

```typescript
// packages/bot-engine/src/blocks/logic/myBlock/executeMyBlock.ts
import type { MyBlock } from "@typebot.io/blocks-logic/myBlock/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { ExecuteLogicResponse } from "../../../types";

export const executeMyBlock = async (
  block: MyBlock,
  { state }: { state: SessionState },
): Promise<ExecuteLogicResponse> => {
  // Implementation
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    logs: [{ status: "success", description: "Block executed" }],
  };
};
```

### 5. Register in Dispatcher

```typescript
// packages/bot-engine/src/executeLogic.ts
case LogicBlockType.MY_BLOCK:
  return executeMyBlock(block, { state, sessionStore });
```

### 6. Create UI Components

```typescript
// apps/builder/src/features/blocks/logic/myBlock/components/MyBlockSettings.tsx
type Props = {
  options: MyBlock["options"];
  onOptionsChange: (options: MyBlock["options"]) => void;
};

export const MyBlockSettings = ({ options, onOptionsChange }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Settings UI */}
    </div>
  );
};
```

### 7. Register UI Components

Update these files:
- `apps/builder/src/features/editor/components/BlockIcon.tsx` - Add icon
- `apps/builder/src/features/editor/components/BlockLabel.tsx` - Add label
- `apps/builder/src/features/graph/components/nodes/block/BlockNodeContent.tsx` - Add node content
- `apps/builder/src/features/graph/components/nodes/block/SettingsPopoverContent.tsx` - Add settings

## Database Operations

### Prisma Schema Location
`packages/prisma/postgresql/schema.prisma`

### Common Commands
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

## Development Commands

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build all packages
bun build

# Type checking
bun typecheck

# Linting
bun lint

# Format code
bun format
```

## Code Conventions

### TypeScript
- Strict mode enabled
- Use Zod for runtime validation
- Prefer `type` over `interface`
- Use explicit return types for exported functions

### File Naming
- Components: PascalCase (`MyComponent.tsx`)
- Utilities: camelCase (`myHelper.ts`)
- Schemas: camelCase with `schema` suffix (`myBlock/schema.ts`)
- Constants: camelCase (`constants.ts`)

### Import Order
1. External packages
2. Internal packages (@typebot.io/*)
3. Relative imports (@/ or ./)

### Git Commits
Use Gitmoji convention:
- `✨` New feature
- `🐛` Bug fix
- `♻️` Refactor
- `🔧` Configuration
- `📝` Documentation
- `🚑️` Critical hotfix

## Important Patterns

### Block Execution Flow
1. `startSession()` - Initialize session, identify contact
2. `walkFlowForward()` - Process blocks sequentially
3. `continueBotFlow()` - Handle input and continue
4. Block executors return `ExecuteLogicResponse`

### Error Handling
- Use typed error responses in executors
- Log errors with status: "error", "warning", "info", "success"
- Always provide user-friendly error descriptions

### State Management
- SessionState is immutable-style (return new state)
- Use Prisma for persistence
- SessionStore for runtime variables

## Evolution API Integration

The Evolution API integration sends prefilled variables when starting a flow:
- `remoteJid`: WhatsApp ID (e.g., `5511999999999@s.whatsapp.net`)
- Used for automatic contact identification
- Phone extracted from remoteJid: `remoteJid.match(/^(\d+)@/)`

## Package Dependencies

When creating new packages:
```json
{
  "name": "@typebot.io/package-name",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "exports": {
    "./*": "./src/*.ts"
  },
  "dependencies": {
    "@typebot.io/lib": "workspace:*",
    "@typebot.io/zod": "workspace:*",
    "@typebot.io/prisma": "workspace:*"
  },
  "devDependencies": {
    "@typebot.io/tsconfig": "workspace:*"
  }
}
```

## Testing Considerations

- Unit tests with Vitest
- Integration tests for API endpoints
- E2E tests with Playwright
- Test database should be isolated

## Security Notes

- Validate all user input with Zod schemas
- Sanitize HTML content in bubble blocks
- Use prepared statements (Prisma handles this)
- Rate limiting on API endpoints
- CORS configuration for embeds

## Performance Tips

- Use Prisma's `include` sparingly
- Index frequently queried fields
- Implement pagination for large datasets
- Cache static block definitions
- Lazy load heavy UI components

## Common Issues

1. **"tags" directory ignored by git**: The `.gitignore` has an entry for `tags` (ctags). Use `contact-tags` instead.

2. **TypeScript compilation errors**: Ensure all workspace dependencies are installed and linked properly.

3. **Block not appearing in sidebar**: Check that block type is added to enum constants and all UI registrations are complete.

4. **Session state not persisting**: Verify contactId is being passed through session state transformations.
