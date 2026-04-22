import { warehousesApi } from '../api';

jest.mock('@features/auth/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@features/auth/client';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe('warehousesApi.getAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses the paginated response and returns the data array', async () => {
    mockApiFetch.mockResolvedValueOnce({
      data: [
        { id: 'wh-1', name: 'Main', location: 'Tegucigalpa' },
        { id: 'wh-2', name: 'North' },
      ],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    });

    const result = await warehousesApi.getAll();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'wh-1', name: 'Main', location: 'Tegucigalpa' });
    expect(result[1]).toEqual({ id: 'wh-2', name: 'North' });
  });

  it('calls the warehouses endpoint with a high limit to fetch all in one page', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: [] });

    await warehousesApi.getAll();

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/warehouses'),
    );
    const calledUrl = (mockApiFetch.mock.calls[0][0] as string);
    expect(calledUrl).toMatch(/limit=\d+/);
  });

  it('throws when the response shape is invalid', async () => {
    mockApiFetch.mockResolvedValueOnce({ notData: 'nope' });

    await expect(warehousesApi.getAll()).rejects.toThrow();
  });
});
