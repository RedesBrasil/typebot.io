# Contact Management Blocks - User Guide

This document provides detailed information on how to use the new contact management blocks in Typebot.

## Overview

The contact management system allows you to:
- Identify and track users across multiple conversations
- Tag contacts for segmentation and automation
- Store custom information about contacts
- Trigger automated flows based on tag changes

## Prerequisites

- **Evolution API Integration**: Contacts are automatically identified via the `remoteJid` field sent by Evolution API
- **Workspace Setup**: All contacts and tags are workspace-scoped

---

## GET_CONTACT Block

### Purpose
Retrieves specific information from the current contact and stores it in a variable.

### Configuration Options

| Option | Description | Required |
|--------|-------------|----------|
| **Field to get** | Which contact field to retrieve | Yes |
| **Custom field name** | Name of custom field (only if fieldToGet = "customField") | Conditional |
| **Save to variable** | Variable ID where the value will be stored | Yes |

### Available Fields

- **name**: Full name of the contact
- **firstName**: First name only
- **lastName**: Last name only
- **email**: Email address
- **phone**: Phone number
- **tags**: Comma-separated list of tag names
- **all**: JSON object with all contact data
- **customField**: Specific custom field value

### Example Usage

1. **Get contact name for greeting**
   ```
   Field: name
   Variable: contactName
   ```
   Then use in text bubble: "Hello {{contactName}}!"

2. **Check contact tags**
   ```
   Field: tags
   Variable: contactTags
   ```
   Use with condition block to check if tag exists.

3. **Get all contact data**
   ```
   Field: all
   Variable: contactData
   ```
   Returns JSON: `{"name": "John", "email": "john@example.com", "tags": ["VIP", "Lead"], ...}`

### Important Notes
- Returns empty string if contact not linked to session
- Returns empty string if requested field is not set
- Custom fields return their stored value or empty string if not found

---

## SET_CONTACT Block

### Purpose
Updates contact information with new values.

### Configuration Options

| Option | Description | Required |
|--------|-------------|----------|
| **Field to set** | Which contact field to update | Yes |
| **Custom field name** | Name of custom field (only if fieldToSet = "customField") | Conditional |
| **Value** | The new value to set | Yes |
| **Expression to evaluate** | JavaScript expression for complex values | Optional |

### Available Fields

- **name**: Set full name
- **firstName**: Set first name
- **lastName**: Set last name
- **email**: Set email address
- **customField**: Set a custom field value

### Example Usage

1. **Set contact name from input**
   ```
   Field: name
   Value: {{Name Input Variable}}
   ```

2. **Set custom field**
   ```
   Field: customField
   Custom field name: subscription_plan
   Value: premium
   ```

3. **Use expression for dynamic value**
   ```
   Field: customField
   Custom field name: last_contact
   Expression: new Date().toISOString()
   ```

### Important Notes
- Changes are immediately persisted to database
- Phone number cannot be changed (used for identification)
- Custom fields support any JSON-serializable value

---

## ADD_TAG Block

### Purpose
Adds a tag to the current contact. Can trigger automated flows.

### Configuration Options

| Option | Description | Required |
|--------|-------------|----------|
| **Tag ID** | Database ID of existing tag | Conditional |
| **Tag name** | Name of the tag to add | Conditional |
| **Skip triggers** | If true, don't execute tag triggers | No (default: false) |

*Note: Either Tag ID or Tag name must be provided*

### Features

- **Automatic Tag Creation**: If tag doesn't exist and name is provided, it's created automatically
- **Trigger Execution**: When skipTriggers is false, checks for TAG_ADDED triggers and starts associated flows
- **Idempotent**: If contact already has the tag, no action is taken
- **Variable Support**: Tag name can include variables like `{{userSegment}}`

### Example Usage

1. **Add static tag**
   ```
   Tag name: VIP Customer
   Skip triggers: false
   ```

2. **Add dynamic tag based on user input**
   ```
   Tag name: {{interestArea}}
   Skip triggers: true
   ```

3. **Tag with trigger**
   - Create tag "New Lead" in dashboard
   - Set trigger: When "New Lead" is added → Start "Welcome Sequence" flow
   - Use block with Tag name: "New Lead", Skip triggers: false
   - Result: Contact is tagged AND welcome flow starts

### Important Notes
- Tags are workspace-scoped (same tag name can exist in different workspaces)
- skipTriggers prevents infinite loops when called from trigger flows
- Logs show if tag was added or already existed

---

## REMOVE_TAG Block

### Purpose
Removes a tag from the current contact. Can trigger automated flows.

### Configuration Options

| Option | Description | Required |
|--------|-------------|----------|
| **Tag ID** | Database ID of existing tag | Conditional |
| **Tag name** | Name of the tag to remove | Conditional |
| **Skip triggers** | If true, don't execute tag triggers | No (default: false) |

*Note: Either Tag ID or Tag name must be provided*

### Features

- **Trigger Execution**: When skipTriggers is false, checks for TAG_REMOVED triggers
- **Idempotent**: If contact doesn't have the tag, no action is taken
- **Error Handling**: Logs appropriate message if tag not found

### Example Usage

1. **Remove tag after qualification**
   ```
   Tag name: Unqualified Lead
   Skip triggers: false
   ```

2. **Downgrade user status**
   ```
   Tag name: Active Subscriber
   Skip triggers: true
   ```
   Then add "Churned" tag separately.

3. **Tag removal trigger**
   - Create trigger: When "Premium Plan" is removed → Start "Retention Offer" flow
   - Use block with Tag name: "Premium Plan", Skip triggers: false
   - Result: Tag is removed AND retention flow starts

### Important Notes
- If tag doesn't exist in workspace, operation is logged as "not found"
- Triggers only execute if contact doesn't have active session (prevents overlapping flows)

---

## Contact Identification

### How It Works

1. **Evolution API sends message** with prefilled variables including `remoteJid`
2. **Format**: `5511999999999@s.whatsapp.net` (Brazilian number example)
3. **Phone extraction**: System extracts `5511999999999` from the remoteJid
4. **Contact lookup**: System searches for existing contact with matching phone
5. **Auto-creation**: If not found, creates new contact automatically
6. **Session linking**: ContactId is stored in session state for all block operations

### Identification Priority

1. Phone number (from remoteJid)
2. Email (if provided in prefilled variables)
3. ExternalId (remoteJid itself as fallback identifier)

---

## Tag Triggers System

### Trigger Types

- **TAG_ADDED**: Fires when a specific tag is added to any contact
- **TAG_REMOVED**: Fires when a specific tag is removed from any contact

### Trigger Configuration

1. **Tag**: Which tag to monitor
2. **Trigger Type**: TAG_ADDED or TAG_REMOVED
3. **Typebot ID**: Which flow to start when trigger fires

### Safety Features

- **Active Session Check**: Trigger doesn't fire if contact has ongoing conversation
- **Skip Triggers Option**: Prevents cascade/infinite loops
- **Workspace Isolation**: Triggers only work within same workspace

### Use Cases

1. **Lead Nurturing**
   - Tag: "Marketing Qualified Lead"
   - Trigger: TAG_ADDED
   - Flow: "MQL Follow-up Sequence"

2. **Churn Prevention**
   - Tag: "At Risk"
   - Trigger: TAG_ADDED
   - Flow: "Customer Retention Offer"

3. **Subscription Management**
   - Tag: "Subscription Expired"
   - Trigger: TAG_ADDED
   - Flow: "Renewal Reminder"

4. **Completion Tracking**
   - Tag: "Onboarding Complete"
   - Trigger: TAG_ADDED
   - Flow: "Post-Onboarding Survey"

---

## Best Practices

### Naming Conventions
- Use descriptive tag names: "VIP Customer" instead of "vip"
- Group related tags: "Plan: Basic", "Plan: Pro", "Plan: Enterprise"
- Use consistent casing: Either all "Title Case" or all "lowercase"

### Performance
- Avoid too many triggers on same tag
- Use skipTriggers when calling from trigger flows
- Batch tag operations when possible

### Data Consistency
- Validate contact data before setting
- Use custom fields for structured data
- Keep phone numbers normalized (digits only)

### Error Handling
- Check if contact exists before operations
- Handle "no contact linked" scenario in your flow
- Monitor trigger execution logs

---

## Troubleshooting

### Contact Not Identified
- Check if Evolution API is sending remoteJid
- Verify phone number format in remoteJid
- Check workspace ID matches

### Tag Not Added
- Verify tag exists or auto-creation is working
- Check for workspace mismatch
- Review block configuration

### Trigger Not Firing
- Contact might have active session
- skipTriggers might be set to true
- Trigger might not be enabled

### Custom Field Empty
- Field name might be misspelled
- Field might not exist in customFields JSON
- Contact might not have any custom fields set

---

## API Reference

### Contact Schema
```typescript
{
  id: string;
  workspaceId: string;
  phone?: string;
  email?: string;
  externalId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastInteraction?: Date;
}
```

### Tag Schema
```typescript
{
  id: string;
  workspaceId: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: Date;
}
```

### Block Response
```typescript
{
  outgoingEdgeId: string;
  logs: Array<{
    status: "success" | "error" | "warning" | "info";
    description: string;
    details?: string;
  }>;
}
```
