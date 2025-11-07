import { Dispatch, SetStateAction } from 'react';
import { Box } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { NOT_SPECIFIED } from '@/utils/constants';
import { Reviewer } from '@/utils/types/reviewer';

const getReviewerStatus = (t: any, status: any) => {
  return status
    ? t('reviewers.statusCategory.' + status)
    : t('reviewers.statusCategory.' + NOT_SPECIFIED);
};

const getReviewerType = (t: any, rec: Reviewer) => {
  if (rec.isScience && rec.isTechnical) return t('reviewerType.both');
  else if (rec.isScience) return t('reviewerType.science');
  else if (rec.isTechnical) return t('reviewerType.technical');
  else return '';
};

export const getColJobTitle = (t: any) => ({
  field: 'title',
  headerName: t('reviewers.title'),
  flex: 2,
  renderCell: (e: any) => e.row.jobTitle
});

export const getColDisplayName = (t: any) => ({
  field: 'displayName',
  headerName: t('reviewers.displayName'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.displayName
});

export const getColGivenName = (t: any) => ({
  field: 'givenName',
  headerName: t('reviewers.givenName'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.givenName
});

export const getColSurname = (t: any) => ({
  field: 'surname',
  headerName: t('reviewers.surname'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.surname
});

export const getColReviewerLocation = (t: any) => ({
  field: 'officeLocation',
  headerName: t('location.label'),
  flex: 2,
  renderCell: (e: { row: any }) => e.row.officeLocation
});

export const getColReviewerType = (
  t: any,
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
        testId="subExpertise"
        value={typeState}
        setValue={setTypeState}
        label={''}
      />
    </Box>
  ),
  renderCell: (e: { row: any }) => getReviewerType(t, e.row)
});

export const getColSubExpertise = (t: any) => ({
  field: 'subExpertise',
  headerName: t('reviewers.subExpertise'),
  flex: 2,
  renderCell: (e: { row: any }) => t('reviewers.subExpertiseCategory.' + e.row.subExpertise)
});

export const getColStatus = (t: any) => ({
  field: 'status',
  headerName: t('reviewers.status'),
  flex: 2,
  renderCell: (e: { row: any }) => getReviewerStatus(t, e.row.status)
});
