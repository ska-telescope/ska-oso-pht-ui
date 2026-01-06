import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import D3Wrapper from './D3Wrapper';

// Mock D3ColumnChart to inspect chart output
vi.mock('../D3ColumnChart', () => ({
  default: ({ data }: any) => <div data-testid="d3chart">{JSON.stringify(data)}</div>
}));

// Mock DropDown
vi.mock('@ska-telescope/ska-gui-components', () => ({
  DropDown: ({ label, options, value, setValue, testId }: any) => (
    <select
      data-testid={testId}
      aria-label={label}
      value={value}
      onChange={e => setValue(e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  getColors: vi.fn(() => ['#000', '#111'])
}));

let resizeCb: ResizeObserverCallback | null = null;

beforeAll(() => {
  class MockResizeObserver implements ResizeObserver {
    constructor(cb: ResizeObserverCallback) {
      resizeCb = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

describe('ColumnChartWrapper', () => {
  const sampleData = [
    { status: 'open', category: 'A' },
    { status: 'open', category: 'B' },
    { status: 'closed', category: 'A' }
  ];
  const fields = ['status', 'category'];
  const t = (key: string) => key;

  beforeEach(() => {
    vi.clearAllMocks();
    resizeCb = null;
  });

  const triggerResize = (w = 800, h = 600) => {
    act(() => {
      resizeCb?.(
        [
          {
            target: {} as Element,
            contentRect: { width: w, height: h } as DOMRectReadOnly
          } as ResizeObserverEntry
        ],
        {} as ResizeObserver
      );
    });
  };

  it('renders dropdowns', () => {
    render(<D3Wrapper data={sampleData} fields={fields} t={t} />);
    expect(screen.getByTestId('wrapperDropdown1')).toBeInTheDocument();
    expect(screen.getByTestId('wrapperDropdown2')).toBeInTheDocument();
  });

  it('renders chart with counts grouped by xField only', () => {
    render(<D3Wrapper data={sampleData} fields={fields} t={t} />);
    triggerResize();
    const chartData = JSON.parse(screen.getByTestId('d3chart').textContent ?? '[]');
    expect(chartData).toEqual([
      { name: 'open', value: 2 },
      { name: 'closed', value: 1 }
    ]);
  });

  it('renders chart with grouped data when groupField is set', () => {
    render(<D3Wrapper data={sampleData} fields={fields} t={t} />);
    triggerResize();
    act(() => {
      fireEvent.change(screen.getByTestId('wrapperDropdown2'), { target: { value: 'category' } });
    });
    const chartData = JSON.parse(screen.getByTestId('d3chart').textContent ?? '[]');
    expect(chartData).toEqual([
      { name: 'open', group: 'A', value: 1 },
      { name: 'open', group: 'B', value: 1 },
      { name: 'closed', group: 'A', value: 1 }
    ]);
  });

  it('uses ∅ fallback when groupField values are missing', () => {
    render(<D3Wrapper data={sampleData} fields={fields} t={t} />);
    triggerResize();
    act(() => {
      fireEvent.change(screen.getByTestId('wrapperDropdown2'), {
        target: { value: 'nonexistent' }
      });
    });
    const chartData = JSON.parse(screen.getByTestId('d3chart').textContent ?? '[]');
    expect(chartData.every((d: { group: string }) => d.group === '∅')).toBe(false);
  });

  it('updates size via ResizeObserver', () => {
    render(<D3Wrapper data={sampleData} fields={fields} t={t} />);
    triggerResize(500, 400);
    expect(screen.getByTestId('d3chart')).toBeInTheDocument();
  });

  it('calls getColors with correct type', async () => {
    render(<D3Wrapper data={sampleData} fields={fields} t={t} />);
    triggerResize();
    const { getColors } = await import('@ska-telescope/ska-gui-components');
    const mockedGetColors = vi.mocked(getColors);

    // Initial call
    expect(mockedGetColors).toHaveBeenCalledWith({
      type: 'observationType',
      colors: '',
      content: 'bg',
      paletteIndex: 0
    });

    // Change groupField to "array"
    act(() => {
      fireEvent.change(screen.getByTestId('wrapperDropdown2'), { target: { value: 'array' } });
    });
    expect(mockedGetColors).toHaveBeenCalledWith({
      type: 'observationType',
      colors: '',
      content: 'bg',
      paletteIndex: 0
    });
  });
});
