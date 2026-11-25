import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AutoSaveTimerService } from './AutoSaveTimerService';
import { AUTO_SAVE_INTERVAL, NAV, PAGE_TEAM, PATH } from '@/utils/constants';

const mockSaveDraft = vi.hoisted(() => vi.fn());
// The callback the hook returns; the real hook returns a new one on every render
const mockHook = vi.hoisted(() => ({ saveDraft: vi.fn() }));
const mockIsSavePage = vi.hoisted(() => vi.fn());
const mockLocation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('./useSaveDraft', () => ({
  useSaveDraft: () => ({ saveDraft: mockHook.saveDraft, isSavePage: mockIsSavePage })
}));

vi.mock('react-router', () => ({
  useLocation: () => mockLocation
}));

const INTERVAL_MS = AUTO_SAVE_INTERVAL * 1000;

describe('<AutoSaveTimerService />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockHook.saveDraft = mockSaveDraft;
    mockIsSavePage.mockImplementation((pageNo: number) => pageNo === PAGE_TEAM);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('saves every interval on a page that offers saving', () => {
    mockLocation.pathname = NAV[PAGE_TEAM];
    render(<AutoSaveTimerService />);

    vi.advanceTimersByTime(INTERVAL_MS - 1);
    expect(mockSaveDraft).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(mockSaveDraft).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(INTERVAL_MS);
    expect(mockSaveDraft).toHaveBeenCalledTimes(2);
  });

  test('does not save on other routes', () => {
    mockLocation.pathname = PATH[0];
    render(<AutoSaveTimerService />);

    vi.advanceTimersByTime(INTERVAL_MS * 2);
    expect(mockSaveDraft).not.toHaveBeenCalled();
  });

  test('stops saving when it leaves a page that offers saving', () => {
    mockLocation.pathname = NAV[PAGE_TEAM];
    const { rerender } = render(<AutoSaveTimerService />);

    mockLocation.pathname = PATH[0];
    rerender(<AutoSaveTimerService />);
    vi.advanceTimersByTime(INTERVAL_MS * 2);
    expect(mockSaveDraft).not.toHaveBeenCalled();
  });

  test('keeps the timer running across a re-render and calls the latest save', () => {
    mockLocation.pathname = NAV[PAGE_TEAM];
    const { rerender } = render(<AutoSaveTimerService />);

    vi.advanceTimersByTime(INTERVAL_MS / 2);
    const replacementSaveDraft = vi.fn();
    mockHook.saveDraft = replacementSaveDraft;
    rerender(<AutoSaveTimerService />);

    // At the original deadline: a restarted timer would not have fired yet
    vi.advanceTimersByTime(INTERVAL_MS / 2);
    expect(replacementSaveDraft).toHaveBeenCalledOnce();
    expect(mockSaveDraft).not.toHaveBeenCalled();
  });
});
