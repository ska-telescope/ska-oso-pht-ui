import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AutoSaveNavigationService } from './AutoSaveNavigationService';
import { NAV, PAGE_DETAILS, PAGE_TEAM, PATH } from '@/utils/constants';

const mockSaveDraft = vi.hoisted(() => vi.fn());
const mockIsSavePage = vi.hoisted(() => vi.fn());
const mockLocation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('./useSaveDraft', () => ({
  useSaveDraft: () => ({ saveDraft: mockSaveDraft, isSavePage: mockIsSavePage })
}));

vi.mock('react-router', () => ({
  useLocation: () => mockLocation
}));

const navigate = (from: string, to: string) => {
  mockLocation.pathname = from;
  const { rerender } = render(<AutoSaveNavigationService />);
  mockLocation.pathname = to;
  rerender(<AutoSaveNavigationService />);
};

describe('<AutoSaveNavigationService />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSavePage.mockImplementation((pageNo: number) => pageNo === PAGE_TEAM);
  });

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
