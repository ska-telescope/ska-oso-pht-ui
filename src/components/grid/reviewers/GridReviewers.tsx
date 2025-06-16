import { useTranslation } from 'react-i18next';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import { Typography, Grid, Box } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { validateProposal } from '../../../utils/proposalValidation';
import Proposal from '@/utils/types/proposal';
import {
  FOOTER_SPACER,
  NOT_SPECIFIED,
  PROPOSAL_STATUS,
  SEARCH_TYPE_OPTIONS,
  NAV
} from '@/utils/constants';
import PutProposal from '@/services/axios/putProposal/putProposal';
import GetCycleData from '@/services/axios/getCycleData/getCycleData';
import GetProposal from '@/services/axios/getProposal/getProposal';
import { storeCycleData, storeProposalCopy } from '@/utils/storage/cycleData';
import GetReviewerList from '@/services/axios/getReviewerList/getReviewerList';
import Reviewer from '@/utils/types/reviewer';

interface GridProposalsProps {
  listOnly?: boolean;
}

export default function GridProposals({ listOnly = false }: GridProposalsProps) {
  const { t } = useTranslation('pht');

  const navigate = useNavigate();

  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const {
    application,
    clearApp,
    helpComponent,
    updateAppContent1,
    updateAppContent2
  } = storageObject.useStore();

  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');
  const [openCloneDialog, setOpenCloneDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openViewDialog, setOpenViewDialog] = React.useState(false);

  const [cycleData, setCycleData] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);

  const DATA_GRID_HEIGHT = '65vh';

  React.useEffect(() => {
    updateAppContent2((null as unknown) as Proposal);
    setFetchList(!fetchList);
    setCycleData(!cycleData);
  }, []);

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
    const cycleData = async () => {
      const response = await GetCycleData();
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        storeCycleData(response);
      }
    };
    cycleData();
  }, [cycleData]);

  const displayStatus = (status: any) => {
    return status
      ? t('reviewers.statusCategory.' + status)
      : t('reviewers.statusCategory.' + NOT_SPECIFIED);
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
    ...[colTitle, colGivenName, colSurname, colOfficeLocation, colSubExpertise, colStatus]
  ];

  function filterReviewers() {
    const fields: (keyof Reviewer)[] = ['officeLocation'];
    return reviewers.filter(
      item =>
        fields.some(field =>
          (item[field] as string)?.toLowerCase().includes(searchTerm?.toLowerCase())
        ) &&
        (searchType === '' || item.officeLocation?.toLowerCase() === searchType?.toLowerCase())
    );
  }

  const filteredData = reviewers ? filterReviewers() : [];

  const ReviewersSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('reviewers.label')}
    </Typography>
  );

  const searchDropdown = () => (
    <DropDown
      options={[{ label: t('status.0'), value: '' }, ...SEARCH_TYPE_OPTIONS]}
      testId="proposalType"
      value={searchType}
      setValue={setSearchType}
      label={t('status.0')}
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

  const getTheProposal = async (id: string) => {
    helpComponent('');
    clearApp();

    const response = await GetProposal(id);
    if (typeof response === 'string') {
      updateAppContent1(null);
      updateAppContent2(null);
      storeProposalCopy(null);
      setAxiosViewError(response);
      return false;
    } else {
      updateAppContent1(validateProposal(response));
      updateAppContent2(response);
      storeProposalCopy(response);
      validateProposal(response);
      return true;
    }
  };

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
            {searchDropdown()}
          </Grid>
          <Grid item p={2} sm={12} md={6} lg={4} mt={-1}>
            {searchEntryField('searchId')}
          </Grid>
          <Grid item p={2} sm={12} md={12} lg={4} mt={-1}>
            <Box sx={{ width: '100%', border: '1px solid grey' }}>selection bar</Box>
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
