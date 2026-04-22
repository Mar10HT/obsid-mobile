import { inventoryApi } from '../api';

jest.mock('@features/auth/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@features/auth/client';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const VALID_ITEM_DETAIL = {
  id: 'item-1',
  name: 'Hammer',
  description: 'Steel hammer',
  sku: 'H-001',
  barcode: '1234567890',
  quantity: 10,
  minQuantity: 2,
  price: 15.5,
  currency: 'HNL',
  warehouseId: 'wh-1',
  warehouse: { id: 'wh-1', name: 'Main' },
  categoryId: 'c-1',
  category: { id: 'c-1', name: 'Tools' },
  supplierId: 's-1',
  supplier: { id: 's-1', name: 'Acme' },
  itemType: 'BULK',
  status: 'AVAILABLE',
  expirationDate: null,
};

describe('inventoryApi CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('fetches a single item and parses the detail response', async () => {
      mockApiFetch.mockResolvedValueOnce(VALID_ITEM_DETAIL);

      const result = await inventoryApi.getById('item-1');

      expect(mockApiFetch).toHaveBeenCalledWith('/api/inventory/item-1');
      expect(result.id).toBe('item-1');
      expect(result.name).toBe('Hammer');
      expect(result.quantity).toBe(10);
    });

    it('throws when the response is missing required fields', async () => {
      mockApiFetch.mockResolvedValueOnce({ id: 'x' });

      await expect(inventoryApi.getById('x')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('posts to /api/inventory and returns the created item', async () => {
      mockApiFetch.mockResolvedValueOnce({ ...VALID_ITEM_DETAIL, id: 'item-new' });

      const input = {
        name: 'Screwdriver',
        quantity: 5,
        category: 'Tools',
        warehouseId: 'wh-1',
      };

      const result = await inventoryApi.create(input);

      expect(result.id).toBe('item-new');
      const [url, options] = mockApiFetch.mock.calls[0];
      expect(url).toBe('/api/inventory');
      expect((options as RequestInit).method).toBe('POST');
      expect(JSON.parse((options as RequestInit).body as string)).toMatchObject({
        name: 'Screwdriver',
        quantity: 5,
        category: 'Tools',
        warehouseId: 'wh-1',
      });
    });

    it('rejects input with name shorter than 3 chars', async () => {
      const input = { name: 'AB', quantity: 1, category: 'x', warehouseId: 'wh-1' };

      await expect(inventoryApi.create(input)).rejects.toThrow();
      expect(mockApiFetch).not.toHaveBeenCalled();
    });

    it('rejects input with negative quantity', async () => {
      const input = { name: 'Valid Name', quantity: -1, category: 'x', warehouseId: 'wh-1' };

      await expect(inventoryApi.create(input)).rejects.toThrow();
      expect(mockApiFetch).not.toHaveBeenCalled();
    });

    it('rejects input without warehouseId', async () => {
      const input = { name: 'Valid Name', quantity: 1, category: 'x' } as unknown as Parameters<typeof inventoryApi.create>[0];

      await expect(inventoryApi.create(input)).rejects.toThrow();
      expect(mockApiFetch).not.toHaveBeenCalled();
    });

    it('rejects input without category', async () => {
      const input = { name: 'Valid Name', quantity: 1, warehouseId: 'wh-1' } as unknown as Parameters<typeof inventoryApi.create>[0];

      await expect(inventoryApi.create(input)).rejects.toThrow();
      expect(mockApiFetch).not.toHaveBeenCalled();
    });

    it('sends optional fields when provided', async () => {
      mockApiFetch.mockResolvedValueOnce({ ...VALID_ITEM_DETAIL });

      await inventoryApi.create({
        name: 'Full Item',
        quantity: 3,
        category: 'Tools',
        warehouseId: 'wh-1',
        description: 'Full desc',
        sku: 'SKU-1',
        barcode: 'BC-1',
        supplierId: 's-1',
        minQuantity: 1,
        price: 25.0,
        expirationDate: '2026-12-31',
      });

      const body = JSON.parse((mockApiFetch.mock.calls[0][1] as RequestInit).body as string);
      expect(body.sku).toBe('SKU-1');
      expect(body.supplierId).toBe('s-1');
      expect(body.minQuantity).toBe(1);
      expect(body.price).toBe(25.0);
    });
  });

  describe('update', () => {
    it('patches the inventory item at /:id with partial input', async () => {
      mockApiFetch.mockResolvedValueOnce({ ...VALID_ITEM_DETAIL, name: 'Updated' });

      const result = await inventoryApi.update('item-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
      const [url, options] = mockApiFetch.mock.calls[0];
      expect(url).toBe('/api/inventory/item-1');
      expect((options as RequestInit).method).toBe('PATCH');
      expect(JSON.parse((options as RequestInit).body as string)).toEqual({ name: 'Updated' });
    });

    it('rejects update with invalid name length', async () => {
      await expect(inventoryApi.update('item-1', { name: 'AB' })).rejects.toThrow();
      expect(mockApiFetch).not.toHaveBeenCalled();
    });

    it('accepts update with only one field changed', async () => {
      mockApiFetch.mockResolvedValueOnce({ ...VALID_ITEM_DETAIL, quantity: 99 });

      const result = await inventoryApi.update('item-1', { quantity: 99 });

      expect(result.quantity).toBe(99);
    });
  });

  describe('remove', () => {
    it('sends DELETE to /:id and resolves to void', async () => {
      mockApiFetch.mockResolvedValueOnce(undefined);

      await expect(inventoryApi.remove('item-1')).resolves.toBeUndefined();

      const [url, options] = mockApiFetch.mock.calls[0];
      expect(url).toBe('/api/inventory/item-1');
      expect((options as RequestInit).method).toBe('DELETE');
    });
  });
});
