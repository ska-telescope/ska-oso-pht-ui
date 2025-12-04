// TargetFileImport.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as papaModule from 'papaparse';
import TargetFileImport from './TargetFileImport';
import { RA_TYPE_ICRS, RA_TYPE_GALACTIC } from '@/utils/constants';

// Helper to get the exposed mock

// --- Mock dependencies ---
vi.mock('@ska-telescope/ska-gui-components', async importOriginal => {
  const actual = await importOriginal<typeof import('@ska-telescope/ska-gui-components')>();
  return {
    ...actual,
    FileUpload: ({ testId, uploadFunction }: any) => (
      <button data-testid={testId} onClick={() => uploadFunction('fakeFile')}>
        Upload
      </button>
    ),
    FileUploadStatus: { PENDING: 'PENDING', OK: 'OK', ERROR: 'ERROR' }
  };
});

const notifyErrorMock = vi.fn();
const notifySuccessMock = vi.fn();

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({ notifyError: notifyErrorMock, notifySuccess: notifySuccessMock })
}));

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({ setHelp: vi.fn() })
}));

const updateAppContent2Mock = vi.fn();
vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: { content2: { targets: [] } },
      updateAppContent2: updateAppContent2Mock
    })
  }
}));

// ✅ Define parseMock inside the factory and expose it
vi.mock('papaparse', () => {
  const parseMock = vi.fn();
  return {
    default: { parse: parseMock },
    __parseMock: parseMock // expose for tests
  };
});
const getParseMock = () => (papaModule as any).__parseMock as ReturnType<typeof vi.fn>;

describe('TargetFileImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ICRS success path', () => {
    getParseMock().mockImplementation((_file, opts: any) => {
      opts.complete({
        meta: { fields: ['name', 'ra', 'dec'] },
        data: [{ name: 'Target1', ra: '12:00:00', dec: '-45:00:00' }]
      });
    });

    render(<TargetFileImport raType={RA_TYPE_ICRS.value} />);
    screen.getByTestId('csvUpload').click();

    expect(notifySuccessMock).toHaveBeenCalled();
    expect(updateAppContent2Mock).toHaveBeenCalled();
  });

  it('Galactic success path', () => {
    getParseMock().mockImplementation((_file, opts: any) => {
      opts.complete({
        meta: { fields: ['name', 'longitude', 'latitude'] },
        data: [{ name: 'TargetGal', longitude: '20', latitude: '10' }]
      });
    });

    render(<TargetFileImport raType={RA_TYPE_GALACTIC.value} />);
    screen.getByTestId('csvUpload').click();

    expect(notifySuccessMock).toHaveBeenCalled();
    expect(updateAppContent2Mock).toHaveBeenCalled();
  });

  it('ICRS invalid header', () => {
    getParseMock().mockImplementation((_file, opts: any) => {
      opts.complete({ meta: { fields: ['wrong', 'header'] }, data: [] });
    });

    render(<TargetFileImport raType={RA_TYPE_ICRS.value} />);
    screen.getByTestId('csvUpload').click();

    expect(notifyErrorMock).toHaveBeenCalled();
  });

  it('Galactic invalid header', () => {
    getParseMock().mockImplementation((_file, opts: any) => {
      opts.complete({ meta: { fields: ['bad', 'header'] }, data: [] });
    });

    render(<TargetFileImport raType={RA_TYPE_GALACTIC.value} />);
    screen.getByTestId('csvUpload').click();

    expect(notifyErrorMock).toHaveBeenCalled();
  });

  it('Partial row error', () => {
    getParseMock().mockImplementation((_file, opts: any) => {
      opts.complete({
        meta: { fields: ['name', 'ra', 'dec'] },
        data: [{ name: 'BadRow', ra: '', dec: '' }]
      });
    });

    render(<TargetFileImport raType={RA_TYPE_ICRS.value} />);
    screen.getByTestId('csvUpload').click();

    expect(notifyErrorMock).toHaveBeenCalled();
  });

  it('Parser error callback', () => {
    getParseMock().mockImplementation((_file, opts: any) => {
      opts.error('Parser failed');
    });

    render(<TargetFileImport raType={RA_TYPE_ICRS.value} />);
    screen.getByTestId('csvUpload').click();

    expect(notifyErrorMock).toHaveBeenCalled();
  });
});
