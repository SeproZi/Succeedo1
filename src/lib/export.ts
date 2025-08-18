// src/lib/export.ts
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { admin } from '@/lib/firebase'; // Assuming admin is exported from here
import { Okr } from '@/lib/types'; // Assuming you have an Okr type
import { DecodedIdToken } from 'firebase-admin/auth';

export async function exportOkrsToCsv(userToken: DecodedIdToken): Promise<string> {
  try {
    console.error('Fetching OKRs...');
    // Create a Firestore instance that acts on behalf of the authenticated user
    const userFirestore = admin.firestore().collection('okrs');
    const okrSnapshot = await userFirestore.get();

    console.error('OKRs fetched. Processing...');
    okrSnapshot.forEach((doc) => {
      okrs.push({ id: doc.id, ...doc.data() } as Okr);
    });

    // Sort OKRs to ensure objectives come before their key results in the CSV
    okrs.sort((a, b) => {
      if (!a.parentId && b.parentId) return -1; // Objectives first
      if (a.parentId && !b.parentId) return 1;
      if (a.parentId && b.parentId) return a.parentId.localeCompare(b.parentId); // Sort by parent if both are KRs
      return 0; // Keep objectives order as is
    });

    console.error('OKRs processed. Formatting CSV...');
    let csvString = "ID,Type,Title,Description,Progress,Parent ID\n"; // CSV Header

    for (const okr of okrs) {
      try {
        console.error('Processing OKR:', okr.id);
      // ... rest of your processing
      } catch (innerError) {
        console.error('Error processing individual OKR:', okr.id, innerError);
      }
      const type = okr.parentId ? 'Key Result' : 'Objective';
      const row = [
        okr.id,
        type,
        `"${okr.title.replace(/"/g, '""')}"`, // Handle quotes in title
        `"${(okr.description || '').replace(/"/g, '""')}"`, // Handle quotes in description
        okr.progress !== undefined ? okr.progress : '', // Include progress if exists
        okr.parentId || '', // Include parent ID if exists
      ];
      csvString += row.join(',') + '\n';
    }

    console.error('CSV formatted. Returning...');
    return csvString;
  } catch (error) {
    console.error('Error exporting OKRs to CSV:', error);
    return `Failed to export OKRs: ${error instanceof Error ? error.message : String(error)}`;
  }
}