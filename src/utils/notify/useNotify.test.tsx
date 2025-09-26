import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { useNotify } from './useNotify';

// Spy for updateAppContent5
const mockUpdateAppContent5 = vi.fn();

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      updateAppContent5: mockUpdateAppContent5
    })
  }
}));

describe('useNotify hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls notifyInfo with correct payload', () => {
    const { result } = renderHook(() => useNotify());
    result.current.notifyInfo('Info message');
    expect(mockUpdateAppContent5).toHaveBeenCalledWith({
      level: AlertColorTypes.Info,
      message: 'Info message'
    });
  });

  it('calls notifyError with correct payload', () => {
    const { result } = renderHook(() => useNotify());
    result.current.notifyError('Error message');
    expect(mockUpdateAppContent5).toHaveBeenCalledWith({
      level: AlertColorTypes.Error,
      message: 'Error message'
    });
  });

  it('calls notifySuccess with correct payload', () => {
    const { result } = renderHook(() => useNotify());
    result.current.notifySuccess('Success message');
    expect(mockUpdateAppContent5).toHaveBeenCalledWith({
      delay: 2,
      level: AlertColorTypes.Success,
      message: 'Success message'
    });
  });

  it('calls notifyWarning with correct payload', () => {
    const { result } = renderHook(() => useNotify());
    result.current.notifyWarning('Warning message');
    expect(mockUpdateAppContent5).toHaveBeenCalledWith({
      level: AlertColorTypes.Warning,
      message: 'Warning message'
    });
  });

  it('calls notifyClear', () => {
    const { result } = renderHook(() => useNotify());
    result.current.notifyClear();
    expect(mockUpdateAppContent5).toHaveBeenCalledWith({
      level: AlertColorTypes.Info,
      message: ''
    });
  });
});
