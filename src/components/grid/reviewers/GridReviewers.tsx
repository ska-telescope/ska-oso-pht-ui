import { useTranslation } from 'react-i18next';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Typography, Grid, Box } from '@mui/material';
import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Proposal from '@/utils/types/proposal';
import {
  FOOTER_SPACER,
  NOT_SPECIFIED,
  REVIEWER_STATUS,
  SEARCH_TYPE_OPTIONS_REVIEWERS
} from '@/utils/constants';
import GetCycleData from '@/services/axios/getCycleData/getCycleData';
import { storeCycleData } from '@/utils/storage/cycleData';
import GetReviewerList from '@/services/axios/getReviewerList/getReviewerList';
import Reviewer from '@/utils/types/reviewer';
import { Panel } from '@/utils/types/panel';
import { PanelReviewer } from '@/utils/types/panelReviewer';

interface GridProposalsProps {
  height?: string;
  listOnly?: boolean;
  currentPanel: Panel;
}

export default function GridProposals({
  height = '50vh',
  listOnly = false,
  currentPanel
}: GridProposalsProps) {
  const { t } = useTranslation('pht');

  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchTypeExpertise, setSearchTypeExpertise] = React.useState('');
  const [searchTypeAffiliation, setSearchTypeAffiliation] = React.useState('');

  const [, setAxiosError] = React.useState('');
  const [axiosViewError] = React.useState('');

  const [localPanel, setLocalPanel] = React.useState<Panel>(currentPanel);
  const [fetchList] = React.useState(false);

  const DATA_GRID_HEIGHT = '65vh';

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetReviewerList();

      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setReviewers(response);
      }
    };
    fetchData();
  }, [fetchList]);

  React.useEffect(() => {
    setLocalPanel(currentPanel);
  }, [currentPanel]);

  const displayStatus = (status: any) => {
    return status
      ? t('reviewers.statusCategory.' + status)
      : t('reviewers.statusCategory.' + NOT_SPECIFIED);
  };

  const setReviewerPanels = (reviewerPanels: PanelReviewer[]) => {
    setLocalPanel({
      ...localPanel,
      reviewers: reviewerPanels
    });
  };

  /*
  const deletePanelReviewer = (reviewer: Reviewer) => {
    function filterRecords(id: string) {
      return localPanel?.reviewers.filter(
        item => !(item.panelId === localPanel.panelId && item.reviewerId === id)
      ) ?? [];
    }
    setReviewerPanels(filterRecords(reviewer.id));
    console.log('/// in deletePanelReviewer:', currentPanel?.reviewers);
  };
  */

  const isReviewerSelected = (reviewerId: string): boolean => {
    console.log('/// selected', localPanel?.reviewers);
    console.log(
      '/// selected',
      localPanel?.reviewers?.find(entry => entry.reviewerId === reviewerId)
    );
    return localPanel?.reviewers?.find(entry => entry.reviewerId === reviewerId) !== undefined;
  };

  const addReviewerPanel = (rec: PanelReviewer) => {
    const reviewers = localPanel.reviewers;
    reviewers.push(rec);
    setReviewerPanels(reviewers);
    console.log('/// in addReviewerPanel:', localPanel?.reviewers);
  };

  const addPanelReviewer = (reviewer: Reviewer) => {
    const rec: PanelReviewer = {
      reviewerId: reviewer.id,
      panelId: localPanel?.panelId ?? '',
      assignedOn: new Date().toISOString(),
      status: REVIEWER_STATUS.ACCEPTED
    };
    addReviewerPanel(rec);
  };

  const reviewerSelectedToggle = (reviewer: Reviewer) => {
    console.log('/// reviewer', reviewer);
    console.log('/// currentPanel', currentPanel);
    if (isReviewerSelected(reviewer.id)) {
      deletePanelReviewer(reviewer);
    } else {
      addPanelReviewer(reviewer);
    }
  };

  const colSelect = {
    field: 'select',
    headerName: '',
    flex: 0.6,
    disableClickEventBubbling: true,
    renderCell: (e: { row: any }) => (
      <Box pr={1}>
        <TickBox
          label=""
          testId="linkedTickBox"
          checked={isReviewerSelected(e.row.reviewerId)}
          onChange={() => reviewerSelectedToggle(e.row)}
        />
      </Box>
    )
  };

  const colTitle = {
    field: 'title',
    headerName: t('reviewers.title'),
    minWidth: 120,
    renderCell: (e: any) => e.row.jobTitle
  };

  const colGivenName = {
    field: 'givenName',
    headerName: t('reviewers.givenName'),
    minWidth: 180,
    renderCell: (e: { row: any }) => e.row.givenName
  };

  const colSurname = {
    field: 'surname',
    headerName: t('reviewers.surname'),
    minWidth: 180,
    renderCell: (e: { row: any }) => e.row.surname
  };

  const colOfficeLocation = {
    field: 'officeLocation',
    headerName: t('reviewers.officeLocation'),
    minWidth: 200,
    renderCell: (e: { row: any }) => e.row.officeLocation
  };

  const colSubExpertise = {
    field: 'subExpertise',
    headerName: t('reviewers.subExpertise'),
    flex: 2,
    minWidth: 200,
    renderCell: (e: { row: any }) => t('reviewers.subExpertiseCategory.' + e.row.subExpertise)
  };

  const colStatus = {
    field: 'status',
    headerName: t('reviewers.status'),
    minWidth: 150,
    renderCell: (e: { row: any }) => displayStatus(e.row.status)
  };

  const stdColumns = [
    ...[
      colSelect,
      colTitle,
      colGivenName,
      colSurname,
      colOfficeLocation,
      colSubExpertise,
      colStatus
    ]
  ];

  function filterReviewers() {
    const fields: (keyof Reviewer)[] = ['givenName', 'surname', 'jobTitle'];
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

  const filteredData = reviewers ? filterReviewers() : [];

  const ReviewersSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('reviewers.label')}
    </Typography>
  );

  const searchDropdownExpertise = () => (
    <DropDown
      options={[{ label: t('subjectExpertise.0'), value: '' }, ...SEARCH_TYPE_OPTIONS_REVIEWERS]}
      testId="subExpertise"
      value={searchTypeExpertise}
      setValue={setSearchTypeExpertise}
      label={t('subjectExpertise.0')}
    />
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
    <DropDown
      options={[{ label: t('affiliation.0'), value: '' }, ...getAffiliationOptions()]}
      testId="officeLocation"
      value={searchTypeAffiliation}
      setValue={setSearchTypeAffiliation}
      label={t('affiliation.0')}
    />
  );

  const searchEntryField = (testId: string) => (
    <SearchEntry
      label={t('search.label')}
      testId={testId}
      value={searchTerm}
      setValue={setSearchTerm}
    />
  );

  return (
    <>
      {!listOnly && (
        <Grid item p={2} lg={12}>
          {ReviewersSectionTitle()}
        </Grid>
      )}

      {!listOnly && (
        <Grid
          item
          p={2}
          sm={12}
          md={8}
          lg={12}
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
        >
          <Grid item p={2} sm={12} md={6} lg={4}>
            {searchDropdownExpertise()}
          </Grid>
          <Grid item p={2} sm={12} md={6} lg={4}>
            {searchDropdownAffiliation()}
          </Grid>
          <Grid item p={2} sm={12} md={12} lg={4} mt={-1}>
            {searchEntryField('searchId')}
          </Grid>
        </Grid>
      )}
      <Grid item xs={12} pt={1}>
        {!axiosViewError && (!filteredData || filteredData.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('reviewers.empty')} testId="helpPanelId" />
        )}
        {!axiosViewError && filteredData.length > 0 && (
          <div>
            <DataGrid
              maxHeight={height}
              testId="dataGridId"
              rows={filteredData}
              columns={stdColumns}
              height={DATA_GRID_HEIGHT}
            />
          </div>
        )}
      </Grid>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
    </>
  );
}
