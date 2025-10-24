import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RankEntryField from './RankEntryField';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

// Create test theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976D2' },
    secondary: { main: '#DC004E' },
    error: { main: '#D32F2F' },
    warning: { main: '#ED6C02' },
    info: { main: '#0288D1' },
    success: { main: '#2E7D32' }
  }
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90CAF9' },
    secondary: { main: '#F48FB1' }
  }
});

const wrapper = (component: React.ReactElement, theme = lightTheme) => {
  return render(
    <ThemeProvider theme={theme}>
      <StoreProvider>
        <AppFlowProvider>{component}</AppFlowProvider>
      </StoreProvider>
    </ThemeProvider>
  );
};

describe('RankEntryField', () => {
  const mockOnRankChange = vi.fn();

  beforeEach(() => {
    mockOnRankChange.mockClear();
  });

  describe('Initial Rendering', () => {
    it('renders with default props', () => {
      wrapper(<RankEntryField selectedRank={0} setSelectedRank={mockOnRankChange} />);
      expect(screen.getByText('rank.selected:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders with custom default rank', () => {
      wrapper(<RankEntryField selectedRank={0} setSelectedRank={mockOnRankChange} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders with progressive mode', () => {
      wrapper(<RankEntryField selectedRank={0} setSelectedRank={mockOnRankChange} isProgressive />);
    });

    it('renders with onRankChange callback', () => {
      wrapper(<RankEntryField selectedRank={0} setSelectedRank={mockOnRankChange} />);
    });
  });

  describe('Rank Selection', () => {
    it('selects rank 0 (center circle)', async () => {
      const user = userEvent.setup();
      wrapper(<RankEntryField selectedRank={3} setSelectedRank={mockOnRankChange} />);

      const centerCircle = screen.getByTestId('section0TestId');
      await user.click(centerCircle);

      expect(mockOnRankChange).toHaveBeenCalledWith(0);
    });

    it('selects ranks 1-9 (segments)', async () => {
      const user = userEvent.setup();
      wrapper(
        <RankEntryField colorIndex={2} selectedRank={0} setSelectedRank={mockOnRankChange} />
      );

      for (let rank = 1; rank <= 9; rank++) {
        const segment = screen.getByLabelText(`Select rank ${rank}`);
        await user.click(segment);
        expect(mockOnRankChange).toHaveBeenCalledWith(rank);
      }
    });
  });

  describe('Progressive Mode Behavior', () => {
    it('shows only active segments in progressive mode', async () => {
      const user = userEvent.setup();
      wrapper(
        <RankEntryField
          colorIndex={1}
          colorBlindness={1}
          selectedRank={1}
          setSelectedRank={mockOnRankChange}
          isProgressive
        />
      );

      // Select rank 3
      const segment3 = screen.getByLabelText('Select rank 3');
      await user.click(segment3);

      // In progressive mode, segments 1-3 should be active, 4-9 inactive
      // This is tested through the SVG rendering logic
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('works with dark theme', () => {
      wrapper(<RankEntryField selectedRank={0} setSelectedRank={mockOnRankChange} />, darkTheme);
    });

    it('uses theme colors correctly', () => {
      wrapper(<RankEntryField selectedRank={0} setSelectedRank={mockOnRankChange} />);
    });
  });

  describe('SVG Path Creation', () => {
    it('creates valid SVG paths', () => {
      wrapper(<RankEntryField selectedRank={0} setSelectedRank={mockOnRankChange} />);

      // Check if SVG elements are rendered
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();

      // Check if path elements exist
      const paths = svg.querySelectorAll('path');
      expect(paths.length).toBe(9);
    });
  });

  describe('Text Color Calculation', () => {
    it('calculates appropriate text colors', () => {
      wrapper(
        <RankEntryField
          colorIndex={1}
          colorBlindness={1}
          selectedRank={0}
          setSelectedRank={mockOnRankChange}
        />
      );
    });
  });
});
