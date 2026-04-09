import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../use-debounce';

type DebounceProps<T> = { value: T; delay: number };

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('does not update value before the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: DebounceProps<string>) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } },
    );

    rerender({ value: 'second', delay: 300 });
    act(() => { jest.advanceTimersByTime(200); });

    expect(result.current).toBe('first');
  });

  it('updates to the new value after the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: DebounceProps<string>) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } },
    );

    rerender({ value: 'second', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second');
  });

  it('resets the timer on rapid successive updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: DebounceProps<string>) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'b', delay: 300 });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'c', delay: 300 });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'd', delay: 300 });

    // Not yet elapsed after the last update
    act(() => { jest.advanceTimersByTime(200); });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('d');
  });

  it('works with number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: DebounceProps<number>) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 500 } },
    );

    rerender({ value: 42, delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe(42);
  });
});
