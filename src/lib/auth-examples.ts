// Example usage of the updated auth functions

import { getCurrentUserRole, getCurrentUserWithRole, requireRole, isValidRole } from './auth'

// Example 1: Get current user's role
export async function exampleGetRole() {
  const role = await getCurrentUserRole()
  console.log('Current user role:', role)
  return role
}

// Example 2: Get full user info with role
export async function exampleGetUserWithRole() {
  const userInfo = await getCurrentUserWithRole()
  if (userInfo) {
    console.log('User ID:', userInfo.id)
    console.log('Email:', userInfo.email)
    console.log('Role:', userInfo.role)
  }
  return userInfo
}

// Example 3: Check if user has specific role
export async function exampleCheckRole() {
  const role = await getCurrentUserRole()
  
  if (role === 'admin') {
    console.log('User is an admin')
  } else if (role === 'nutritionist') {
    console.log('User is a nutritionist')
  } else {
    console.log('User is an end-user')
  }
}

// Example 4: Require specific role (throws error if not authorized)
export async function exampleRequireAdmin() {
  try {
    const { userId, role } = await requireRole('admin')
    console.log('Admin user:', userId, 'with role:', role)
    return { userId, role }
  } catch (error) {
    console.error('Not authorized:', error)
    throw error
  }
}

// Example 5: Validate role from external source
export function exampleValidateRole(roleString: string) {
  if (isValidRole(roleString)) {
    console.log('Valid role:', roleString)
    return roleString
  } else {
    console.error('Invalid role:', roleString)
    return null
  }
}

// Example 6: Role-based access control
export async function exampleRoleBasedAccess() {
  const role = await getCurrentUserRole()
  
  switch (role) {
    case 'admin':
      return {
        canCreateForms: true,
        canEditForms: true,
        canDeleteForms: true,
        canViewAllResponses: true,
        canExportData: true
      }
    case 'nutritionist':
      return {
        canCreateForms: true,
        canEditForms: true,
        canDeleteForms: false,
        canViewAllResponses: true,
        canExportData: true
      }
    case 'end-user':
      return {
        canCreateForms: false,
        canEditForms: false,
        canDeleteForms: false,
        canViewAllResponses: false,
        canExportData: false
      }
    default:
      return {
        canCreateForms: false,
        canEditForms: false,
        canDeleteForms: false,
        canViewAllResponses: false,
        canExportData: false
      }
  }
}
