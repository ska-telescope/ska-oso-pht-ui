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

    // The container is a named region
    const container = screen.getByRole('region', {
      name: 'Review data table with expandable details'
    });
    expect(container).toBeInTheDocument();

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
