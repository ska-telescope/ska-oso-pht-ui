import { Dispatch, SetStateAction } from 'react';
import { t } from 'i18next';
import { Box, Tooltip } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { NOT_SPECIFIED } from '@/utils/constants';
import { Reviewer } from '@/utils/types/reviewer';
import { presentDate, presentLatex, presentTime } from '@/utils/present/present';
import Investigator from '@/utils/types/investigator';
import emptyCell from '@/components/fields/emptyCell/emptyCell';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

const getReviewerStatus = (status: any) => {
  return status
    ? t('reviewers.statusCategory.' + status)
    : t('reviewers.statusCategory.' + NOT_SPECIFIED);
};

const getReviewerType = (rec: Reviewer) => {
  if (rec.isScience) return t('reviewerType.science');
  if (rec.isTechnical) return t('reviewerType.technical');
  else return '';
};

const displayProposalType = (proposalType: any) => {
  return proposalType ? proposalType : NOT_SPECIFIED;
};

const element = (inValue: number | string) => (inValue === NOT_SPECIFIED ? emptyCell() : inValue);

const getPIs = (arr: Investigator[]) => {
  if (!arr || arr.length === 0) {
    return element(NOT_SPECIFIED);
  }
  const results: string[] = [];
  arr.forEach(e => {
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

export const getColCycle = () => ({
  field: 'cycle',
  headerName: t('cycle.label'),
  width: 160
});

/*- Proposals -----------------------------------------------------*/

export const getColProposalId = () => ({
  field: 'id',
  headerName: t('proposalId.label'),
  width: 200
});

export const getColProposalType = () => ({
  field: 'proposalType',
  headerName: t('proposalType.label'),
  width: 160,
  renderCell: (e: { row: any }) => {
    const str = t('proposalType.title.' + displayProposalType(e.row.proposalType));
    return (
      <Tooltip title={str}>
        <>{t('proposalType.code.' + displayProposalType(e.row.proposalType))}</>
      </Tooltip>
    );
  }
});

export const getColProposalTitle = () => ({
  field: 'title',
  headerName: t('title.label'),
  flex: 3,
  minWidth: 250,
  renderCell: (e: any) => presentLatex(e.row.title)
});

export const getColProposalPI = () => ({
  field: 'pi',
  headerName: t('pi.short'),
  width: 160,
  renderCell: (e: any) => {
    return getPIs(e.row.investigators);
  }
});

export const getColProposalStatus = () => ({
  field: 'status',
  headerName: t('status.label'),
  width: 160,
  renderCell: (e: { row: any }) => t('proposalStatus.' + e.row.status)
});

export const getColProposalUpdated = () => ({
  field: 'lastUpdated',
  headerName: t('updated.label'),
  width: 240,
  renderCell: (e: { row: any }) =>
    presentDate(e.row.lastUpdated) + ' ' + presentTime(e.row.lastUpdated)
});

// ✅ Safe hook usage inside a component
const CycleCloseCell = () => {
  const { osdCloses } = useOSDAccessors();
  const value = osdCloses(true);
  return <>{value}</>;
};

export const getColCycleClose = () => ({
  field: 'cycleClose',
  headerName: t('cycleCloses.label'),
  width: 240,
  renderCell: () => <CycleCloseCell />
});

/*- Reviewers -----------------------------------------------------*/

export const getColJobTitle = () => ({
  field: 'title',
  headerName: t('reviewers.title'),
  flex: 2,
  renderCell: (e: any) => e.row.jobTitle
});

export const getColDisplayName = () => ({
  field: 'displayName',
  headerName: t('reviewers.displayName'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.displayName
});

export const getColGivenName = () => ({
  field: 'givenName',
  headerName: t('reviewers.givenName'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.givenName
});

export const getColSurname = () => ({
  field: 'surname',
  headerName: t('reviewers.surname'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.surname
});

export const getColReviewerLocation = () => ({
  field: 'officeLocation',
  headerName: t('location.label'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.officeLocation
});

export const getColReviewerType = (
  typeState: 'all' | 'sci' | 'tec',
  setTypeState: Dispatch<SetStateAction<'all' | 'sci' | 'tec'>>
) => ({
  field: 'reviewerType',
  headerName: t('reviewers.reviewerType'),
  filterable: false,
  sortable: false,
  disableColumnMenu: true,
  flex: 2,
  renderHeader: () => (
    <Box sx={{ minWidth: 150 }}>
      <DropDown
        disabledUnderline={true}
        options={[
          { label: t('reviewerType.all'), value: 'all' },
          { label: t('reviewerType.science'), value: 'sci' },
          { label: t('reviewerType.technical'), value: 'tec' }
        ]}
        testId="reviewerType"
        value={typeState}
        setValue={setTypeState}
        label={''}
      />
    </Box>
  ),
  renderCell: (e: { row: any }) => {
    // Use the `reviewType` property if it exists, otherwise fallback to `isScience` and `isTechnical`
    if (e.row.reviewType) {
      return t(`reviewerType.${e.row.reviewType}`);
    }
    return getReviewerType(e.row);
  }
});

export const getColSubExpertise = () => ({
  field: 'subExpertise',
  headerName: t('reviewers.subExpertise'),
  flex: 2,
  renderCell: (e: { row: any }) => t('reviewers.subExpertiseCategory.' + e.row.subExpertise)
});

export const getColStatus = () => ({
  field: 'status',
  headerName: t('reviewers.status'),
  flex: 2,
  renderCell: (e: { row: any }) => getReviewerStatus(e.row.status)
});
