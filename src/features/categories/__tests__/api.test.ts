import { categoriesApi } from '../api';

jest.mock('@features/auth/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@features/auth/client';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('categoriesApi.getAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns categories with id and name', async () => {
    mockApiFetch.mockResolvedValueOnce({
      data: [
        { id: 'c-1', name: 'Tools' },
        { id: 'c-2', name: 'Electronics' },
      ],
    });

    const result = await categoriesApi.getAll();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'c-1', name: 'Tools' });
  });

  it('calls the categories endpoint with a high limit', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: [] });

    await categoriesApi.getAll();

    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/categories');
    expect(calledUrl).toMatch(/limit=\d+/);
  });

  it('throws when the response shape is invalid', async () => {
    mockApiFetch.mockResolvedValueOnce({ bogus: true });

    await expect(categoriesApi.getAll()).rejects.toThrow();
  });
});
