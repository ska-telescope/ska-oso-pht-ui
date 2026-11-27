import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AutoSaveService } from './AutoSaveService';
import { AUTO_SAVE_INTERVAL, NAV, PAGE_DETAILS, PAGE_TEAM, PATH } from '@/utils/constants';

const mockSaveDraft = vi.hoisted(() => vi.fn());
// The callback the hook returns; the real hook returns a new one on every render
const mockHook = vi.hoisted(() => ({ saveDraft: vi.fn() }));
const mockIsSavePage = vi.hoisted(() => vi.fn());
const mockLocation = vi.hoisted(() => ({ pathname: '/' }));
// The latest save, as the context gives it
const mockLastSaved = vi.hoisted(() => ({ lastSave: null as object | null }));

vi.mock('./useSaveDraft', () => ({
  useSaveDraft: () => ({ saveDraft: mockHook.saveDraft, isSavePage: mockIsSavePage })
}));

vi.mock('react-router', () => ({
  useLocation: () => mockLocation
}));

vi.mock('./LastSavedContext', () => ({
  useLastSaved: () => ({ lastSave: mockLastSaved.lastSave })
}));

const INTERVAL_MS = AUTO_SAVE_INTERVAL * 1000;

const navigate = (from: string, to: string) => {
  mockLocation.pathname = from;
  const { rerender } = render(<AutoSaveService />);
  mockLocation.pathname = to;
  rerender(<AutoSaveService />);
};

describe('<AutoSaveService />', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockHook.saveDraft = mockSaveDraft;
    mockLastSaved.lastSave = null;
    mockIsSavePage.mockImplementation((pageNo: number) => pageNo === PAGE_TEAM);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('on a timer', () => {
    test('saves every interval on a page that offers saving', () => {
      mockLocation.pathname = NAV[PAGE_TEAM];
      render(<AutoSaveService />);

      vi.advanceTimersByTime(INTERVAL_MS - 1);
      expect(mockSaveDraft).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(mockSaveDraft).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(INTERVAL_MS);
      expect(mockSaveDraft).toHaveBeenCalledTimes(2);
    });

    test('does not save on other routes', () => {
      mockLocation.pathname = PATH[0];
      render(<AutoSaveService />);

      vi.advanceTimersByTime(INTERVAL_MS * 2);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    test('stops when it leaves a page that offers saving', () => {
      navigate(NAV[PAGE_TEAM], PATH[0]);
      vi.advanceTimersByTime(INTERVAL_MS * 2);
      // Only the save for leaving the page
      expect(mockSaveDraft).toHaveBeenCalledOnce();
    });

    test('keeps running across a re-render and calls the latest save', () => {
      mockLocation.pathname = NAV[PAGE_TEAM];
      const { rerender } = render(<AutoSaveService />);

      vi.advanceTimersByTime(INTERVAL_MS / 2);
      const replacementSaveDraft = vi.fn();
      mockHook.saveDraft = replacementSaveDraft;
      rerender(<AutoSaveService />);

      // At the original deadline: a restarted timer would not have fired yet
      vi.advanceTimersByTime(INTERVAL_MS / 2);
      expect(replacementSaveDraft).toHaveBeenCalledOnce();
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    test('starts the wait again after a save from elsewhere', () => {
      mockLocation.pathname = NAV[PAGE_TEAM];
      const { rerender } = render(<AutoSaveService />);

      vi.advanceTimersByTime(INTERVAL_MS - 1000);
      // e.g. the Save button, just before the timer was due
      mockLastSaved.lastSave = { proposalId: 'prsl-1', savedOn: '2026-11-25T14:00:29Z' };
      rerender(<AutoSaveService />);

      vi.advanceTimersByTime(INTERVAL_MS - 1);
      expect(mockSaveDraft).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(mockSaveDraft).toHaveBeenCalledOnce();
    });
  });

  describe('on navigation', () => {
    test.each([
      ['another proposal page', NAV[PAGE_DETAILS]],
      ['home', PATH[0]]
    ])('saves when leaving a page that offers saving for %s', (_, destination) => {
      navigate(NAV[PAGE_TEAM], destination);
      expect(mockSaveDraft).toHaveBeenCalledOnce();
    });

    test('does not save when leaving a page that does not offer saving', () => {
      navigate(NAV[PAGE_DETAILS], NAV[PAGE_TEAM]);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    test('does not save when leaving for a route outside the proposal', () => {
      navigate(NAV[PAGE_TEAM], '/review');
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    test('does not save on a re-render without a page change', () => {
      navigate(NAV[PAGE_TEAM], NAV[PAGE_TEAM]);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });
  });
});
