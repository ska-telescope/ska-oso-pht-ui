import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import GridTargets from './GridTargets';
import { RA_TYPE_ICRS } from '@/utils/constants';

// This test is kept separate from GridTargets.test.tsx because it needs module-level mocks
// for DataGrid and i18n. In Vitest those mocks are hoisted and would otherwise change what
// the regular GridTargets smoke tests in GridTargets.test.tsx are exercising.
vi.mock('@ska-telescope/ska-gui-components', async importOriginal => {
  const actual = await importOriginal<typeof import('@ska-telescope/ska-gui-components')>();
  return {
    ...actual,
    DataGrid: ({ columns }: { columns: Array<{ field: string; headerName: string }> }) => (
      <div data-testid="grid-targets-columns">
        {columns.map(column => (
          <span key={column.field}>{column.headerName}</span>
        ))}
      </div>
    )
  };
});

vi.mock('@/services/i18n/useScopedTranslation', () => {
  const translations: Record<string, string> = {
    'name.label': 'Name',
    'skyDirection.short.1.0': 'RA',
    'skyDirection.short.2.0': 'Dec',
    'velocity.0.label': 'Velocity',
    'velocity.1.label': 'Redshift',
    'actions.label': 'Actions'
  };

  return {
    useScopedTranslation: () => ({
      t: (key: string) => translations[key] ?? key
    })
  };
});

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<GridTargets /> localization', () => {
  test('does not display localisation IDs in velocity column headers', () => {
    wrapper(
      <GridTargets
        raType={0}
        rows={[
          {
            kind: RA_TYPE_ICRS.value,
            id: 1,
            decStr: '-45:00:00.0',
            name: 'ICRS target',
            raStr: '12:30:00.0',
            redshift: '',
            referenceFrame: RA_TYPE_ICRS.label,
            velType: 0,
            vel: '',
            velUnit: 0
          }
        ]}
      />
    );

    expect(screen.getByText('Velocity')).toBeInTheDocument();
    expect(screen.getByText('Redshift')).toBeInTheDocument();
    expect(screen.queryByText('velocity.0')).not.toBeInTheDocument();
    expect(screen.queryByText('velocity.1')).not.toBeInTheDocument();
    expect(screen.queryByText('velocity.0.label')).not.toBeInTheDocument();
    expect(screen.queryByText('velocity.1.label')).not.toBeInTheDocument();
    expect(screen.queryByText('velocity.0 (en)')).not.toBeInTheDocument();
    expect(screen.queryByText('velocity.1 (en)')).not.toBeInTheDocument();
  });
});
