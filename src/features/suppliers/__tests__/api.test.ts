import { suppliersApi } from '../api';

jest.mock('@features/auth/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@features/auth/client';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('suppliersApi.getAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns suppliers with id and name', async () => {
    mockApiFetch.mockResolvedValueOnce({
      data: [
        { id: 's-1', name: 'Acme Corp' },
        { id: 's-2', name: 'Globex' },
      ],
    });

    const result = await suppliersApi.getAll();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Acme Corp');
  });

  it('calls the suppliers endpoint with a high limit', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: [] });

    await suppliersApi.getAll();

    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/suppliers');
    expect(calledUrl).toMatch(/limit=\d+/);
  });

  it('returns empty array when no suppliers exist', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: [] });

    const result = await suppliersApi.getAll();

    expect(result).toEqual([]);
  });
});
