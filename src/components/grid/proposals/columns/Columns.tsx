import { Tooltip } from '@mui/material';
import { NOT_SPECIFIED } from '@/utils/constants';
import { presentDate, presentLatex, presentTime } from '@/utils/present/present';
import Investigator from '@/utils/types/investigator';
import emptyCell from '@/components/fields/emptyCell/emptyCell';
import ObservingType from '@/components/display/observingType/observingType';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

/*-----------------------------------------------------------------*/

const element = (inValue: number | string) => (inValue === NOT_SPECIFIED ? emptyCell() : inValue);

const getAuthors = (arr: Investigator[]) => {
  if (!arr || arr.length === 0) {
    return element(NOT_SPECIFIED);
  }
  const results: string[] = [];
  arr.forEach((e) => {
    if (e.pi) {
      results.push(e.lastName + ', ' + e.firstName);
    }
  });
  if (results.length === 0) {
    return element(NOT_SPECIFIED);
  }
  return element(results.length > 1 ? results[0] + ' + ' + (results.length - 1) : results[0]);
};

/*-----------------------------------------------------------------*/

export const getColCycle = (t: any) => ({
  field: 'cycle',
  headerName: t('cycle.label'),
  width: 160
});

// ✅ Safe hook usage inside a component
const CycleCloseCell = () => {
  const { osdCloses } = useOSDAccessors();
  const value = osdCloses(true);
  return <>{value}</>;
};

export const getColCycleClose = (t: any) => ({
  field: 'cycleClose',
  headerName: t('cycleCloses.label'),
  width: 240,
  renderCell: () => <CycleCloseCell />
});

/*-----------------------------------------------------------------*/

export const getColProposalId = (t: any) => ({
  field: 'id',
  headerName: t('proposalId.label'),
  width: 200
});

export const getColProposalType = (t: any) => ({
  field: 'proposalType',
  headerName: t('proposalType.label'),
  width: 160,
  renderCell: (e: { row: any }) => {
    const str = t('proposalType.title.' + (e.row.proposalType ?? NOT_SPECIFIED));
    return (
      <Tooltip title={str}>
        <span>{t('proposalType.code.' + (e.row.proposalType ?? NOT_SPECIFIED))}</span>
      </Tooltip>
    );
  }
});

export const getColProposalTypeCycle = (t: any, policies: any) => ({
  field: 'proposalType',
  headerName: t('proposalType.label'),
  minWidth: 200,
  renderCell: (e: { row: any }) => {
    const cycle = policies.find((c: any) => c?.cycleInformation?.cycleId === e.row?.cycle);
    return (
      <Tooltip title={cycle?.cycleDescription ?? '????'}>
        <span>{cycle ? cycle?.type : '????'}</span>
      </Tooltip>
    );
  }
});

export const getColProposalTitle = (t: any) => ({
  field: 'title',
  headerName: t('title.label'),
  flex: 3,
  minWidth: 250,
  renderCell: (e: any) => presentLatex(e.row.title)
});

export const getColAuthors = (t: any) => ({
  field: 'authors',
  headerName: t('authors.label'),
  flex: 2,
  minWidth: 300,
  renderCell: (e: any) => {
    return getAuthors(e.row.investigators);
  }
});

export const getColProposalPI = (t: any) => ({
  field: 'pi',
  headerName: t('pi.short'),
  width: 160,
  renderCell: (e: any) => {
    return getAuthors(e.row.investigators);
  }
});

export const getColProposalSC = (t: any) => ({
  field: 'scienceCategory',
  headerName: t('scienceCategory.label'),
  flex: 2,
  minWidth: 250,
  renderCell: (e: { row: any }) =>
    e.row.scienceCategory
      ? t('scienceCategory.' + e.row.scienceCategory)
      : t('scienceCategory.notSpecified')
});

export const getColProposalStatus = (t: any) => ({
  field: 'status',
  headerName: t('status.label'),
  width: 160,
  renderCell: (e: { row: any }) => t('proposalStatus.' + e.row.status)
});

export const getColProposalObservingMode = (t: any) => ({
  field: 'observingMode',
  headerName: t('observingMode.label'),
  flex: 2,
  minWidth: 250,
  renderCell: (e: { row: any }) => {
    if (e.row.scienceCategory) {
      return '';
    }
    const type = e.row.observations?.[0]?.type;
    return type ? <ObservingType type={type} /> : t('observingMode.notSpecified');
  }
});

export const getColProposalUpdated = (t: any) => ({
  field: 'lastUpdated',
  headerName: t('updated.label'),
  width: 240,
  renderCell: (e: { row: any }) =>
    presentDate(e.row.lastUpdated) + ' ' + presentTime(e.row.lastUpdated)
});
