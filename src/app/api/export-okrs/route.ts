import { exportOkrsToCsv } from '@/lib/export';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase.admin'; // Import adminAuth from the new file

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401, headers: {'Cache-Control':'no-store'} });
    }
    const idToken = authHeader.substring(7);

 console.log('Received ID token:', idToken);

    let decodedToken;
    console.log('Attempting to verify ID token...');
    try {
      // Verify the ID token using the Admin SDK's adminAuth instance
      decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('ID token successfully verified:', decodedToken);
    } catch (error: any) { // Use any for now to easily access error properties
      console.error('Error verifying ID token:', error);
      if (error instanceof Error) {
        console.error('Verification error message:', error.message);
      }
       console.error('verifyIdToken failed', { code: error?.code, message: error?.message }); // Add detailed logging here

      return new NextResponse('Unauthorized', { status: 401, headers: {'Cache-Control':'no-store'} });
    }

    console.log('User UID:', decodedToken.uid);
    console.log('Exporting OKRs...');
    const csvData = await exportOkrsToCsv(decodedToken.uid); // Pass the user's UID to the export function
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="okrs.csv"',
         'Cache-Control':'no-store'
      },
    });
  } catch (error: any) { // Use any for now
    console.error('Error exporting OKRs:', error);
    let errorMessage = 'An unexpected error occurred during export';
    if (error instanceof Error) {
      errorMessage = `Error exporting data: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}