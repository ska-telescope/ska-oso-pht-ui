import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Typography, Grid, Box } from '@mui/material';
import React from 'react';
import GetReviewerList from '@services/axios/get/getReviewerList/getReviewerList';
import Alert from '../../alerts/standardAlert/StandardAlert';
import {
  getColJobTitle,
  getColDisplayName,
  getColReviewerLocation,
  getColReviewerType,
  getColSubExpertise,
  getColStatus
} from '../gridColumns/GridColumns';
import { SEARCH_TYPE_OPTIONS_REVIEWERS } from '@/utils/constants';
import { Reviewer } from '@/utils/types/reviewer';
import { IdObject } from '@/utils/types/idObject';
import { arraysAreEqual } from '@/utils/helpers';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import TriStateCheckbox from '@/components/fields/triStateCheckbox/TriStateCheckbox';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export function filterReviewers(
  reviewers: Reviewer[],
  searchTerm: string,
  searchTypeExpertise: string,
  searchTypeAffiliation: string
) {
  const fields: (keyof Reviewer)[] = ['givenName', 'surname', 'jobTitle']; // TODO : All given field
  return reviewers.filter(
    item =>
      fields.some(field =>
        (item[field] as string)?.toLowerCase().includes(searchTerm?.toLowerCase())
      ) &&
      (searchTypeExpertise === '' ||
        item.subExpertise?.toLowerCase() === searchTypeExpertise?.toLowerCase()) &&
      (searchTypeAffiliation === '' ||
        item.officeLocation?.toLowerCase() === searchTypeAffiliation?.toLowerCase())
  );
}

interface GridReviewersProps {
  height?: string;
  selectedReviewers?: IdObject[];
  showTitle?: boolean;
  showSearch?: boolean;
  showSelection?: boolean;
  tickBoxClicked?: (reviewer: Reviewer, isReviewerSelected: boolean) => void;
}

export default function GridReviewers({
  height = '50vh',
  selectedReviewers = [],
  showTitle = false,
  showSearch = false,
  showSelection = false,
  tickBoxClicked = () => {}
}: GridReviewersProps) {
  const { t } = useScopedTranslation();

  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchTypeExpertise, setSearchTypeExpertise] = React.useState('');
  const [searchTypeAffiliation, setSearchTypeAffiliation] = React.useState('');
  const [axiosError, setAxiosError] = React.useState('');
  const [fetchList] = React.useState(false);
  const [reviewersCollection, setReviewersCollection] = React.useState<IdObject[]>([]);
  const authClient = useAxiosAuthClient();
  const [checkState, setCheckState] = React.useState<'checked' | 'unchecked' | 'indeterminate'>(
    'indeterminate'
  );
  const [typeState, setTypeState] = React.useState<'all' | 'sci' | 'tec'>('all');

  React.useEffect(() => {
    const filterScienceAndTechnical = (users: any[]) => {
      const result: any[] = [];

      users.forEach(user => {
        if (user.isScience) {
          result.push({
            ...user,
            id: `${user.id}-science`,
            isScience: true,
            isTechnical: false
          });
        }
        if (user.isTechnical) {
          result.push({
            ...user,
            id: `${user.id}-technical`,
            isScience: false,
            isTechnical: true
          });
        }
      });
      return result;
    };

    const fetchData = async () => {
      const response = await GetReviewerList(authClient);

      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setReviewers(filterScienceAndTechnical(response));
      }
    };
    fetchData();
  }, [fetchList]);

  React.useEffect(() => {
    if (selectedReviewers && !arraysAreEqual(selectedReviewers, reviewersCollection)) {
      setReviewersCollection(selectedReviewers);
    }
  }, [selectedReviewers]);

  const isReviewerSelected = (reviewerId: string): boolean => {
    return reviewersCollection?.filter(entry => entry.id === reviewerId).length > 0;
  };

  const isReviewerType = (reviewer: Reviewer): boolean => {
    return (
      (reviewer.isScience && typeState !== 'tec') || (reviewer.isTechnical && typeState !== 'sci')
    );
  };

  const colSelect = {
    field: 'select',
    headerName: 'Select',
    renderHeader: () => (
      <Box
        pl={2}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          margin: 0
        }}
      >
        <TriStateCheckbox state={checkState} setState={setCheckState} />
      </Box>
    ),
    disableClickEventBubbling: true,
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (e: { row: any }) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          margin: 0
        }}
      >
        <TickBox
          label=""
          labelPosition="top"
          testId="linkedTickBox"
          checked={isReviewerSelected(e.row.id)}
          onChange={() => tickBoxClicked(e.row, isReviewerSelected(e.row.id))}
        />
      </Box>
    )
  };

  const stdColumns = [
    ...(showSelection ? [colSelect] : []),
    getColJobTitle(),
    getColDisplayName(),
    getColReviewerLocation(),
    getColReviewerType(typeState, setTypeState),
    getColSubExpertise(),
    getColStatus()
  ];

  const selectedData = reviewers
    ? reviewers.filter(
        e =>
          (isReviewerSelected(e.id) ? checkState !== 'unchecked' : checkState !== 'checked') &&
          isReviewerType(e)
      )
    : [];
  const filteredData = selectedData
    ? filterReviewers(selectedData, searchTerm, searchTypeExpertise, searchTypeAffiliation)
    : [];

  const ReviewersSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('reviewers.label')}
    </Typography>
  );

  const searchDropdownExpertise = () => (
    <Box pt={2}>
      <DropDown
        options={[{ label: t('subjectExpertise.0'), value: '' }, ...SEARCH_TYPE_OPTIONS_REVIEWERS]}
        testId="subExpertise"
        value={searchTypeExpertise}
        setValue={setSearchTypeExpertise}
        label={t('subjectExpertise.0')}
      />
    </Box>
  );

  const getAffiliationOptions = () => {
    const affiliations = reviewers
      .map(reviewer => reviewer.officeLocation)
      .filter((value, index, self) => self.indexOf(value) === index && value !== '');
    return affiliations.map(affiliation => ({
      label: affiliation,
      value: affiliation
    }));
  };

  const searchDropdownAffiliation = () => (
    <Box pt={2}>
      <DropDown
        options={[{ label: t('affiliation.0'), value: '' }, ...getAffiliationOptions()]}
        testId="officeLocation"
        value={searchTypeAffiliation}
        setValue={setSearchTypeAffiliation}
        label={t('affiliation.0')}
      />
    </Box>
  );

  const searchEntryField = (testId: string) => (
    <Box pt={1}>
      <SearchEntry
        label={t('search.label')}
        testId={testId}
        value={searchTerm}
        setValue={setSearchTerm}
      />
    </Box>
  );

  return (
    <>
      {showTitle && (
        <Grid container p={2} size={{ lg: 12 }}>
          {ReviewersSectionTitle()}
        </Grid>
      )}

      {showSearch && (
        <Grid
          pb={2}
          pt={2}
          size={{ sm: 12 }}
          container
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid size={{ sm: 12 }}>
            <Grid
              container
              direction="row"
              spacing={2}
              justifyContent="space-around"
              alignItems="center"
            >
              <Grid size={{ sm: 3 }}>{searchDropdownExpertise()}</Grid>
              <Grid size={{ sm: 3 }}>{searchDropdownAffiliation()}</Grid>
              <Grid size={{ sm: 5 }}>{searchEntryField('searchId')}</Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <Grid size={{ xs: 12 }} pt={1}>
        {!axiosError && (
          <div>
            <DataGrid
              maxHeight={height}
              testId="dataGridReviewers"
              rows={filteredData}
              columns={stdColumns}
              height={height}
            />
          </div>
        )}
        {axiosError && (
          <Alert color={AlertColorTypes.Error} testId="axiosErrorTestId" text={axiosError} />
        )}
      </Grid>
    </>
  );
}
