import { GET } from './route';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase.admin';
import { exportOkrsToCsv } from '@/lib/export';

// Mock the firebase.admin module
jest.mock('@/lib/firebase.admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

// Mock the export module
jest.mock('@/lib/export', () => ({
  exportOkrsToCsv: jest.fn(),
}));

const mockVerifyIdToken = adminAuth.verifyIdToken as jest.Mock;
const mockExportOkrsToCsv = exportOkrsToCsv as jest.Mock;

describe('GET /api/export-okrs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case 1: Valid token
  it('should return 200 with CSV data for a valid token', async () => {
    const mockDecodedToken = { uid: 'test-uid' };
    const mockCsvData = 'Objective,Key Result,Progress\nTest Objective,Test KR,50%';

    mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
    mockExportOkrsToCsv.mockResolvedValue(mockCsvData);

    const request = new NextRequest('http://localhost/api/export-okrs', {
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="okrs.csv"'
    );
    expect(response.body).toBe(mockCsvData);
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(mockExportOkrsToCsv).toHaveBeenCalledWith('test-uid');
  });

  // Test case 2: Missing Bearer Token
  it('should return 401 for a missing bearer token', async () => {
    const requestWithoutHeader = new NextRequest(
      'http://localhost/api/export-okrs',
      {
        headers: {}, // No Authorization header
      }
    );

    const responseWithoutHeader = await GET(requestWithoutHeader);
    expect(responseWithoutHeader.status).toBe(401);
    expect(responseWithoutHeader.body).toBe('Unauthorized');

    const requestWithInvalidHeader = new NextRequest(
      'http://localhost/api/export-okrs',
      {
        headers: {
          Authorization: 'InvalidToken valid-token',
        },
      }
    );

    const responseWithInvalidHeader = await GET(requestWithInvalidHeader);
    expect(responseWithInvalidHeader.status).toBe(401);
    expect(responseWithInvalidHeader.body).toBe('Unauthorized');

    expect(mockVerifyIdToken).not.toHaveBeenCalled();
    expect(mockExportOkrsToCsv).not.toHaveBeenCalled();
  });

  // Test case 3: Invalid Token (e.g., Expired)
  it('should return 401 for an expired token', async () => {
    const expiredTokenError = new Error('Token has expired');
    (expiredTokenError as any).code = 'auth/id-token-expired';
    mockVerifyIdToken.mockRejectedValue(expiredTokenError);

    const request = new NextRequest('http://localhost/api/export-okrs', {
      headers: {
        Authorization: 'Bearer expired-token',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(response.body).toBe('Unauthorized');
    expect(mockVerifyIdToken).toHaveBeenCalledWith('expired-token');
    expect(mockExportOkrsToCsv).not.toHaveBeenCalled();
  });

  // Test case 4: Invalid Token (e.g., Invalid Issuer)
  it('should return 401 for an invalid issuer', async () => {
    const invalidIssuerError = new Error('Firebase ID token has invalid issuer.');
    (invalidIssuerError as any).code = 'auth/invalid-issuer';
    mockVerifyIdToken.mockRejectedValue(invalidIssuerError);

    const request = new NextRequest('http://localhost/api/export-okrs', {
      headers: {
        Authorization: 'Bearer token-with-invalid-issuer',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(response.body).toBe('Unauthorized');
    expect(mockVerifyIdToken).toHaveBeenCalledWith('token-with-invalid-issuer');
    expect(mockExportOkrsToCsv).not.toHaveBeenCalled();
  });

  // Test case 5: Error during Export Logic
  it('should return 500 if an error occurs during export logic', async () => {
    const mockDecodedToken = { uid: 'test-uid' };
    const exportError = new Error('Failed to fetch OKRs');

    mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
    mockExportOkrsToCsv.mockRejectedValue(exportError);

    const request = new NextRequest('http://localhost/api/export-okrs', {
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(500);
    const jsonBody = await response.json(); // Use the new mock json method
    expect(jsonBody).toEqual({
      error: 'Error exporting data: Failed to fetch OKRs',
    });
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(mockExportOkrsToCsv).toHaveBeenCalledWith('test-uid');
  });
});