import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../../src/hooks/useToggle';

describe('useToggle Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[1](); // toggle function
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[1](); // toggle again
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('sets specific value', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[2](true); // setToggle function
    });
    
    expect(result.current[0]).toBe(true);
  });
});