import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid2, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { presentDate, presentLatex, presentTime } from '@utils/present/present';
import GetCycleData from '../../services/axios/getCycleData/getCycleData';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import GetProposal from '../../services/axios/getProposal/getProposal';
import { SEARCH_TYPE_OPTIONS, PROPOSAL_STATUS, BANNER_PMT_SPACER } from '../../utils/constants';
import EditIcon from '../../components/icon/editIcon/editIcon';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Proposal from '../../utils/types/proposal';
import { validateProposal } from '../../utils/proposalValidation';
import { storeCycleData, storeProposalCopy } from '../../utils/storage/cycleData';
import { FOOTER_SPACER } from '../../utils/constants';

import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { PMT } from '@/utils/constants';
import SubmitButton from '@/components/button/Submit/Submit';

export default function ReviewDecisionListPage() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const { clearApp, updateAppContent1, updateAppContent2 } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');

  const [cycleData, setCycleData] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);

  const DATA_GRID_HEIGHT = '60vh';

  React.useEffect(() => {
    setFetchList(!fetchList);
    setCycleData(!cycleData);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetProposalList();
      /* TODO: fetch also review data when endpoint is ready and merge into proposal data */
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposals(response);
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

  const getTheProposal = async (id: string) => {
    clearApp();

    const response = await GetProposal(id);
    if (typeof response === 'string') {
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

  const editIconClicked = async (id: string) => {
    if (await getTheProposal(id)) {
      navigate(PMT[6]);
    } else {
      alert(t('error.iconClicked'));
    }
  };

  const canEdit = (e: { row: { status: string } }) => e.row.status === PROPOSAL_STATUS.DRAFT;

  const colId = {
    field: 'id',
    headerName: t('proposalId.label'),
    width: 200
  };

  const colTitle = {
    field: 'title',
    headerName: t('title.label'),
    flex: 3,
    minWidth: 250,
    renderCell: (e: any) => presentLatex(e.row.title)
  };

  const colStatus = {
    field: 'status',
    headerName: t('status.label'),
    width: 120,
    renderCell: (e: { row: any }) => t('proposalStatus.' + e.row.status)
  };

  const colRank = {
    field: 'rank',
    headerName: t('rank.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.rank ? e.row.rank : '')
  };

  const colConflict = {
    field: 'conflict',
    headerName: t('conflict.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.conflict ? e.row.conflict : '')
  };

  const colComments = {
    field: 'comments',
    headerName: t('comments.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.comments ? e.row.comments : '')
  };

  const colScienceCategory = {
    field: 'scienceCategory',
    headerName: t('scienceCategory.label'),
    width: 120,
    renderCell: (e: { row: any }) =>
      e.row.scienceCategory ? t('scienceCategory.' + e.row.scienceCategory) : ''
  };

  const colSrcNet = {
    field: 'srcNet',
    headerName: t('srcNet.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.srcNet ? e.row.srcNet : '')
  };

  const colDateUpdated = {
    field: 'lastUpdated',
    headerName: t('updated.label'),
    width: 180,
    renderCell: (e: { row: any }) => {
      return presentDate(e.row.lastUpdated) + ' ' + presentTime(e.row.lastUpdated);
    }
  };

  const colDateAssigned = {
    field: 'dateAssigned',
    headerName: t('dateAssigned.label'),
    width: 180,
    renderCell: (e: { row: any }) => {
      return e.row.dateAssigned ? presentDate(e.row.dateAssigned) : '';
    }
  };

  const colActions = {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    sortable: false,
    width: 150,
    disableClickEventBubbling: true,
    renderCell: (e: { row: any }) => (
      <>
        <EditIcon
          onClick={() => editIconClicked(e.row.id)}
          disabled={!canEdit(e)}
          toolTip={t(canEdit(e) ? 'reviewProposal.toolTip' : 'reviewProposal.disabled')}
        />
        {/* TODO - Add a submit icon here */}
      </>
    )
  };

  /* TODO: add review related columns when endpoint is ready */
  const stdColumns = [
    ...[
      colId,
      colTitle,
      colStatus,
      colRank,
      colComments,
      colConflict,
      colScienceCategory,
      colSrcNet,
      colDateUpdated,
      colDateAssigned,
      colActions
    ]
  ];

  function filterProposals() {
    return proposals.filter(item => {
      const fieldsToSearch = [item.id, item.title];
      return (
        fieldsToSearch.some(
          field =>
            typeof field === 'string' && field.toLowerCase().includes(searchTerm?.toLowerCase())
        ) &&
        (searchType === '' || item.status?.toLowerCase() === searchType?.toLowerCase())
      );
    });
  }

  const filteredData = proposals ? filterProposals() : [];

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

  const submitAllClicked = () => {
    /* TODO */
  };

  const fwdButton = () => (
    <SubmitButton
      action={submitAllClicked}
      disabled
      title={'submitAllBtn.label'}
      toolTip={'submitAllBtn.tooltip'}
    />
  );

  return (
    <>
      <PageBannerPMT title={t('reviewDecisionsList.title')} fwdBtn={fwdButton()} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Grid2 container direction="row" alignItems="center" justifyContent="space-around">
        <Grid2 size={{ sm: 4, md: 4, lg: 4 }}>{searchDropdown()}</Grid2>
        <Grid2 mt={-1} size={{ sm: 4, md: 5, lg: 6 }}>
          {searchEntryField('searchId')}
        </Grid2>
      </Grid2>
      <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-between">
        <Grid2 size={{ sm: 12 }}>
          {!axiosViewError && (!filteredData || filteredData.length === 0) && (
            <Alert color={AlertColorTypes.Info} text={t('proposals.empty')} testId="helpPanelId" />
          )}
          {!axiosViewError && filteredData.length > 0 && (
            <div>
              <DataGrid
                testId="dataGrid2Id"
                rows={filteredData}
                columns={stdColumns}
                height={DATA_GRID_HEIGHT}
              />
            </div>
          )}
        </Grid2>
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      >
        <Grid2 container direction="column" alignItems="center" justifyContent="space-evenly">
          <Grid2>
            {axiosViewError && (
              <Alert
                color={AlertColorTypes.Error}
                testId="axiosViewErrorTestId"
                text={axiosViewError}
              />
            )}
            {axiosError && (
              <Alert color={AlertColorTypes.Error} testId="axiosErrorTestId" text={axiosError} />
            )}
          </Grid2>
        </Grid2>
      </Paper>
    </>
  );
}
