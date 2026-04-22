import { render, fireEvent } from '@testing-library/react-native';
import { SelectField } from '../SelectField';

const OPTIONS = [
  { id: '1', label: 'Tools' },
  { id: '2', label: 'Electronics' },
  { id: '3', label: 'Furniture' },
];

describe('SelectField', () => {
  it('renders the label and placeholder when no value is selected', () => {
    const { getByText } = render(
      <SelectField
        label="Category"
        placeholder="Select category"
        value={null}
        options={OPTIONS}
        onChange={jest.fn()}
      />,
    );

    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Select category')).toBeTruthy();
  });

  it('renders the selected option label', () => {
    const { getByText } = render(
      <SelectField
        label="Category"
        placeholder="Select"
        value="2"
        options={OPTIONS}
        onChange={jest.fn()}
      />,
    );

    expect(getByText('Electronics')).toBeTruthy();
  });

  it('opens the modal when the field is tapped', () => {
    const { getByTestId, queryByText } = render(
      <SelectField
        label="Category"
        placeholder="Select"
        value={null}
        options={OPTIONS}
        onChange={jest.fn()}
      />,
    );

    expect(queryByText('Tools')).toBeNull();

    fireEvent.press(getByTestId('select-field-trigger'));

    expect(queryByText('Tools')).toBeTruthy();
    expect(queryByText('Electronics')).toBeTruthy();
  });

  it('calls onChange with the selected option id and closes the modal', () => {
    const onChange = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <SelectField
        label="Category"
        placeholder="Select"
        value={null}
        options={OPTIONS}
        onChange={onChange}
      />,
    );

    fireEvent.press(getByTestId('select-field-trigger'));
    fireEvent.press(getByText('Electronics'));

    expect(onChange).toHaveBeenCalledWith('2');
    expect(queryByText('Tools')).toBeNull();
  });

  it('filters options when searchable and text is typed', () => {
    const { getByTestId, queryByText } = render(
      <SelectField
        label="Category"
        placeholder="Select"
        value={null}
        options={OPTIONS}
        onChange={jest.fn()}
        searchable
      />,
    );

    fireEvent.press(getByTestId('select-field-trigger'));
    fireEvent.changeText(getByTestId('select-field-search'), 'elec');

    expect(queryByText('Electronics')).toBeTruthy();
    expect(queryByText('Tools')).toBeNull();
    expect(queryByText('Furniture')).toBeNull();
  });

  it('renders the error message when provided', () => {
    const { getByText } = render(
      <SelectField
        label="Category"
        placeholder="Select"
        value={null}
        options={OPTIONS}
        onChange={jest.fn()}
        error="Category is required"
      />,
    );

    expect(getByText('Category is required')).toBeTruthy();
  });

  it('shows empty state when no options match the search', () => {
    const { getByTestId, getByText } = render(
      <SelectField
        label="Category"
        placeholder="Select"
        value={null}
        options={OPTIONS}
        onChange={jest.fn()}
        searchable
        emptyLabel="No results"
      />,
    );

    fireEvent.press(getByTestId('select-field-trigger'));
    fireEvent.changeText(getByTestId('select-field-search'), 'zzz');

    expect(getByText('No results')).toBeTruthy();
  });
});
