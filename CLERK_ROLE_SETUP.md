# Clerk Role Setup Guide

This guide explains how to configure Clerk to include role claims in JWT tokens.

## Method 1: Using Clerk Dashboard (Recommended)

### Step 1: Configure Session Token Customization

1. Go to your Clerk Dashboard
2. Navigate to **JWT Templates** in the left sidebar
3. Click **"New template"** or edit the default template
4. Add the following custom claims:

```json
{
  "role": "{{user.public_metadata.role}}",
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}"
}
```

### Step 2: Set User Roles

#### Option A: Via Clerk Dashboard
1. Go to **Users** in your Clerk Dashboard
2. Click on a user
3. In the **Public metadata** section, add:
```json
{
  "role": "admin"
}
```

#### Option B: Via Clerk API
```javascript
import { clerkClient } from '@clerk/nextjs/server'

// Set user role
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'admin' // or 'nutritionist' or 'end-user'
  }
})
```

## Method 2: Using Webhooks (Advanced)

If you need real-time role updates, you can use webhooks:

### Step 1: Create Webhook Endpoint

Create `/src/app/api/webhooks/clerk/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, public_metadata } = evt.data
    
    // Auto-assign admin role based on email
    if (email_addresses?.[0]?.email_address && isAdminEmail(email_addresses[0].email_address)) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          ...public_metadata,
          role: 'admin'
        }
      })
    }
  }

  return NextResponse.json({ message: 'Webhook received' })
}
```

### Step 2: Configure Webhook in Clerk Dashboard

1. Go to **Webhooks** in your Clerk Dashboard
2. Click **"Add Endpoint"**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`
5. Copy the webhook secret to your `.env.local`

## Method 3: Programmatic Role Assignment

Create a utility function to assign roles:

```typescript
// src/lib/role-management.ts
import { clerkClient } from '@clerk/nextjs/server'
import { type UserRole } from '@/types/auth'

export async function assignUserRole(userId: string, role: UserRole) {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role
    }
  })
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const user = await clerkClient.users.getUser(userId)
  return user.publicMetadata?.role as UserRole || null
}
```

## Environment Variables

Add to your `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_...
```

## Testing

To test if roles are working:

1. Set a user's role in Clerk Dashboard
2. Check the JWT token in browser dev tools (Application > Local Storage > Clerk session)
3. Decode the JWT at jwt.io to verify the role claim is present
4. Test your auth functions:

```typescript
// Test in a component or API route
const role = await getCurrentUserRole()
console.log('User role:', role)
```

## Troubleshooting

### Role not appearing in JWT
- Check if JWT template is properly configured
- Verify user has role in public metadata
- Clear browser cache and re-login

### Role changes not reflecting
- JWT tokens are cached, user needs to re-login
- Or implement webhook to force token refresh

### Type errors
- Ensure your `UserRole` type matches the roles in Clerk
- Check that role validation is working in `isValidRole()`
