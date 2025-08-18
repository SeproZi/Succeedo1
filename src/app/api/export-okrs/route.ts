import { exportOkrsToCsv } from '@/lib/export';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase'; // Assuming admin is exported from your firebase setup

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
 return new NextResponse('Unauthorized', { status: 401 });
    }
    const idToken = authHeader.substring(7);

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying ID token:', error);
 return new NextResponse('Unauthorized', { status: 401 });
    }

    const csvData = await exportOkrsToCsv(decodedToken.uid); // Pass the user's UID to the export function
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="okrs.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting OKRs:', error);
    let errorMessage = 'An unexpected error occurred during export';
    if (error instanceof Error) {
      errorMessage = `Error exporting data: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}