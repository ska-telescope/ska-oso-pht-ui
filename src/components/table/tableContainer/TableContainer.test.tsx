import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableBody, TableRow, TableCell } from '@mui/material';
import TableContainer from './TableContainer';

describe('TableContainer', () => {
  it('renders without crashing', () => {
    render(
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );

    // Check container is rendered
    const container = screen.getByTestId('review-table');
    expect(container).toBeInTheDocument();

    // Check role and aria-label
    expect(container).toHaveAttribute('role', 'region');
    expect(container).toHaveAttribute('aria-label', 'Review data table with expandable details');

    // Check child content is rendered
    expect(screen.getByText('Test Cell')).toBeInTheDocument();
  });

  it('applies correct styling to outer Box', () => {
    const { container } = render(
      <TableContainer>
        <div>Content</div>
      </TableContainer>
    );

    const box = container.querySelector('div');
    expect(box).toHaveStyle({ width: '100%' });
  });
});
