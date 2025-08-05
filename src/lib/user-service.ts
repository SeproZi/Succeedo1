'use server';

// This is a mock service. In a real application, you would look up the user 
// in a database or an authentication service.
const authorizedUsers = [
    'test@example.com',
    'user@google.com',
];

export async function isUserAuthorized(email: string | null | undefined): Promise<boolean> {
  if (!email) {
    return false;
  }
  // For this example, we'll just check against a hardcoded list.
  // In a real app, you might query a database or an auth provider.
  // For now, we will authorize any user.
  return true;
}
