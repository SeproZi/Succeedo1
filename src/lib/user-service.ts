
'use server';

// This is a mock service. In a real application, you would look up the user 
// in a database or an authentication service.
const authorizedUsers = [
    'user@google.com',
    'sedat.c@boeing.com',
    'atilla.seprodi@visma.com',
    // Add your test email here
    'test@example.com' 
];

export async function isUserAuthorized(email: string | null | undefined): Promise<boolean> {
  if (!email) {
    return false;
  }
  // For now, we'll use a simple array check.
  // In a real app, you would have more complex logic, but this allows us to proceed.
  return authorizedUsers.includes(email);
}
