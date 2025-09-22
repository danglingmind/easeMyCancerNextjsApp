# Setup Instructions for Ease My Cancer Forms App

This guide provides detailed instructions for configuring the application environment and Clerk authentication with role-based access control.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Google Cloud Platform account with Sheets API enabled
- Clerk account

## 1. Environment Variables Setup

### 1.1 Create Environment File

Create a `.env.local` file in the root directory of your project:

```bash
touch .env.local
```

### 1.2 Required Environment Variables

Add the following variables to your `.env.local` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/forms_app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/forms_app

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Sheets Configuration
NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID=your_google_sheet_id_here
GOOGLE_SHEETS_CLIENT_ID=your_google_client_id
GOOGLE_SHEETS_CLIENT_SECRET=your_google_client_secret
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Webhook Configuration (for automatic role assignment)
CLERK_WEBHOOK_SECRET=whsec_...

# Admin Configuration
ADMIN_EMAILS=admin@yourorg.com,founder@yourorg.com

# Optional: Supabase (if using for additional features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### 1.3 Getting Google Sheets ID

1. Open your Google Sheet
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. Replace `your_google_sheet_id_here` with the actual ID

### 1.4 Getting Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" section
4. Copy the Publishable Key and Secret Key

## 2. Clerk Role Configuration

### 2.1 Method A: Using JWT Templates (Recommended)

#### Step 1: Create JWT Template in Clerk Dashboard

1. Go to Clerk Dashboard → "JWT Templates"
2. Click "New template" or edit the default template
3. Set the following configuration:

**Template Name:** `default` (or create a custom name)

**Signing Algorithm:** `HS256`

**Claims Configuration:**
```json
{
  "role": "{{user.public_metadata.role}}",
  "metadata": {
    "role": "{{user.public_metadata.role}}"
  }
}
```

#### Step 2: Set User Roles in Public Metadata

**Option A: Manual Assignment via Clerk Dashboard**
1. Go to Clerk Dashboard → "Users"
2. Select a user
3. Go to "Public metadata" section
4. Add the following JSON:
```json
{
  "role": "admin"
}
```
Replace `"admin"` with one of: `"admin"`, `"nutritionist"`, `"end-user"`

**Option B: Automatic Assignment via Webhook**

Create the webhook endpoint:

```typescript
// src/app/api/clerk/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { type UserJSON } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";
import { isAdminEmail } from "@/config/admin-emails";

export async function POST(req: Request) {
  const payload = await req.text();
  const hdrs = headers();
  const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    const evt = svix.verify(payload, {
      "svix-id": hdrs.get("svix-id")!,
      "svix-timestamp": hdrs.get("svix-timestamp")!,
      "svix-signature": hdrs.get("svix-signature")!,
    });

    if (evt.type === "user.created") {
      const user = evt.data as UserJSON;
      const email = user.email_addresses?.[0]?.email_address || "";

      // Determine role based on email
      const role = isAdminEmail(email) ? "admin" : "end-user";

      await clerkClient.users.updateUser(user.id, {
        publicMetadata: { role },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
```

Create the admin email configuration:

```typescript
// src/config/admin-emails.ts
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
```

#### Step 3: Configure Webhook in Clerk Dashboard

1. Go to Clerk Dashboard → "Webhooks"
2. Click "Add endpoint"
3. Set the endpoint URL: `https://yourdomain.com/api/clerk/webhook`
4. Select events: `user.created`
5. Copy the signing secret and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

### 2.2 Method B: Using Organizations (Advanced)

If you prefer using Clerk Organizations for role management:

#### Step 1: Enable Organizations

1. Go to Clerk Dashboard → "Organizations"
2. Enable organizations for your application

#### Step 2: Create Roles and Permissions

1. Go to "Roles" section
2. Create the following roles:
   - `admin` - Full access
   - `nutritionist` - Can manage forms and view responses
   - `end-user` - Can fill forms and view own data

3. Create permissions:
   - `org:schema:edit` - Edit form schemas
   - `org:forms:publish` - Publish forms
   - `org:responses:view` - View form responses
   - `org:pdf:generate` - Generate PDFs

4. Assign permissions to roles:
   - `admin`: All permissions
   - `nutritionist`: `org:schema:edit`, `org:forms:publish`, `org:responses:view`, `org:pdf:generate`
   - `end-user`: `org:pdf:generate` (for own submissions)

#### Step 3: Update Authentication Logic

Update your auth helpers to use organization roles:

```typescript
// src/lib/orgAuth.ts
import { auth } from "@clerk/nextjs/server";

export async function requireOrg(): Promise<{ orgId: string }> {
  const { sessionClaims } = await auth();
  const orgId = sessionClaims?.org_id as string | undefined;
  if (!orgId) throw new Error("Organization required");
  return { orgId };
}

export async function requireOrgRole(role: "admin" | "nutritionist" | "end-user") {
  const { has } = await auth();
  const ok = has({ role });
  if (!ok) throw new Error("Forbidden");
}

export async function requirePermission(permission: string) {
  const { has } = await auth();
  const ok = has({ permission });
  if (!ok) throw new Error("Forbidden");
}
```

## 3. Testing the Setup

### 3.1 Test Environment Variables

1. Start your development server:
```bash
npm run dev
```

2. Check the console for any missing environment variable errors

### 3.2 Test Authentication

1. Go to `http://localhost:3000`
2. Click "Join Program" to sign up
3. Complete the sign-up process
4. Check if you're redirected to the correct dashboard based on your role

### 3.3 Test Role-Based Access

1. **Admin/Nutritionist Access:**
   - Should be able to access `/dashboard/admin/forms`
   - Should be able to create new forms

2. **End-User Access:**
   - Should be redirected to `/dashboard/user`
   - Should be able to fill forms

## 4. Troubleshooting

### Common Issues

1. **"Unauthorized" errors:**
   - Check if Clerk keys are correctly set
   - Verify JWT template includes role claims
   - Ensure user has role in publicMetadata

2. **"Missing NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID":**
   - Verify the environment variable is set
   - Check if the Google Sheet ID is correct
   - Ensure the sheet is accessible

3. **Webhook not working:**
   - Verify webhook URL is accessible
   - Check webhook secret in environment variables
   - Ensure webhook events are properly selected

4. **Role not updating:**
   - Users need to sign out and sign in again after role changes
   - Check if JWT template is properly configured
   - Verify publicMetadata is correctly set

### Debug Steps

1. **Check user session claims:**
```typescript
// Add this to any page to debug
import { auth } from "@clerk/nextjs/server";

export default async function DebugPage() {
  const { sessionClaims } = await auth();
  return <pre>{JSON.stringify(sessionClaims, null, 2)}</pre>;
}
```

2. **Check environment variables:**
```typescript
// Add this to verify env vars (remove after testing)
console.log({
  hasMongoUri: !!process.env.MONGODB_URI,
  hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  hasSpreadsheetId: !!process.env.NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID,
});
```

## 5. Production Deployment

### 5.1 Environment Variables for Production

Set the same environment variables in your production environment (Vercel, Netlify, etc.):

- Replace `localhost:3000` URLs with your production domain
- Use production MongoDB URI
- Use production Clerk keys
- Set production Google Sheets credentials

### 5.2 Webhook URL for Production

Update the webhook URL in Clerk Dashboard to point to your production domain:
`https://yourdomain.com/api/clerk/webhook`

## 6. Security Considerations

1. **Never commit `.env.local` to version control**
2. **Use different Clerk applications for development and production**
3. **Restrict Google Sheets API access to necessary scopes only**
4. **Regularly rotate API keys and secrets**
5. **Monitor webhook endpoints for unauthorized access**

## 7. Next Steps

After completing this setup:

1. Test all user flows (signup, login, role-based access)
2. Configure Google Sheets API integration
3. Set up form schema management
4. Test PDF generation functionality
5. Deploy to production environment

For additional help, refer to:
- [Clerk Documentation](https://clerk.com/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
