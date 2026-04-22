import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ItemForm } from '../ItemForm';

const CATEGORIES = [
  { id: 'Tools', label: 'Tools' },
  { id: 'Electronics', label: 'Electronics' },
];

const WAREHOUSES = [
  { id: 'wh-1', label: 'Main' },
  { id: 'wh-2', label: 'North' },
];

const SUPPLIERS = [
  { id: 's-1', label: 'Acme' },
];

describe('ItemForm', () => {
  const baseProps = {
    mode: 'create' as const,
    categories: CATEGORIES,
    warehouses: WAREHOUSES,
    suppliers: SUPPLIERS,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders required fields with placeholders', () => {
    const { getByTestId } = render(<ItemForm {...baseProps} />);

    expect(getByTestId('item-form-name')).toBeTruthy();
    expect(getByTestId('item-form-quantity')).toBeTruthy();
    expect(getByTestId('item-form-submit')).toBeTruthy();
    expect(getByTestId('item-form-cancel')).toBeTruthy();
  });

  it('prefills values in edit mode', () => {
    const { getByTestId } = render(
      <ItemForm
        {...baseProps}
        mode="edit"
        initialValues={{
          name: 'Existing Item',
          quantity: 7,
          category: 'Tools',
          warehouseId: 'wh-1',
          sku: 'SKU-42',
        }}
      />,
    );

    expect(getByTestId('item-form-name').props.value).toBe('Existing Item');
    expect(getByTestId('item-form-quantity').props.value).toBe('7');
    expect(getByTestId('item-form-sku').props.value).toBe('SKU-42');
  });

  it('shows validation error and does not call onSubmit when name is too short', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, queryByText } = render(
      <ItemForm {...baseProps} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId('item-form-name'), 'AB');
    fireEvent.changeText(getByTestId('item-form-quantity'), '5');
    fireEvent.press(getByTestId('item-form-submit'));

    await waitFor(() => {
      expect(queryByText(/name/i)).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when quantity is negative', async () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(<ItemForm {...baseProps} onSubmit={onSubmit} />);

    fireEvent.changeText(getByTestId('item-form-name'), 'Valid Name');
    fireEvent.changeText(getByTestId('item-form-quantity'), '-3');
    fireEvent.press(getByTestId('item-form-submit'));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('calls onSubmit with normalized payload on valid input', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = render(
      <ItemForm {...baseProps} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId('item-form-name'), 'New Item');
    fireEvent.changeText(getByTestId('item-form-quantity'), '10');

    fireEvent.press(getByTestId('item-form-category-trigger'));
    fireEvent.press(getByText('Tools'));

    fireEvent.press(getByTestId('item-form-warehouse-trigger'));
    fireEvent.press(getByText('Main'));

    fireEvent.press(getByTestId('item-form-submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Item',
          quantity: 10,
          category: 'Tools',
          warehouseId: 'wh-1',
        }),
      );
    });
  });

  it('omits empty optional fields from the submitted payload', async () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = render(
      <ItemForm {...baseProps} onSubmit={onSubmit} />,
    );

    fireEvent.changeText(getByTestId('item-form-name'), 'Basic Item');
    fireEvent.changeText(getByTestId('item-form-quantity'), '1');
    fireEvent.press(getByTestId('item-form-category-trigger'));
    fireEvent.press(getByText('Electronics'));
    fireEvent.press(getByTestId('item-form-warehouse-trigger'));
    fireEvent.press(getByText('North'));
    fireEvent.press(getByTestId('item-form-submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const payload = onSubmit.mock.calls[0][0];
    expect(payload.sku).toBeUndefined();
    expect(payload.description).toBeUndefined();
    expect(payload.price).toBeUndefined();
  });

  it('calls onCancel when the cancel button is tapped', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(<ItemForm {...baseProps} onCancel={onCancel} />);

    fireEvent.press(getByTestId('item-form-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables submit while submitting prop is true', () => {
    const { getByTestId } = render(<ItemForm {...baseProps} submitting />);

    const submitBtn = getByTestId('item-form-submit');
    expect(submitBtn.props.accessibilityState?.disabled).toBe(true);
  });
});
