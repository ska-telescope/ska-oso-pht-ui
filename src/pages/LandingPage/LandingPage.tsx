import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid2, Paper, Tooltip, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import TeamMember from '@utils/types/teamMember';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { presentDate, presentLatex, presentTime } from '@utils/present/present';
import GetObservatoryData from '@services/axios/getObservatoryData/getObservatoryData.tsx';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import GetProposal from '../../services/axios/getProposal/getProposal';
import {
  NAV,
  SEARCH_TYPE_OPTIONS,
  PROPOSAL_STATUS,
  PATH,
  NOT_SPECIFIED,
  FOOTER_HEIGHT_PHT
} from '../../utils/constants';
import AddButton from '../../components/button/Add/Add';
import CloneIcon from '../../components/icon/cloneIcon/cloneIcon';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import ProposalDisplay from '../../components/alerts/proposalDisplay/ProposalDisplay';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Proposal from '../../utils/types/proposal';
import { validateProposal } from '../../utils/proposalValidation';
import emptyCell from '../../components/fields/emptyCell/emptyCell';
import PutProposal from '../../services/axios/putProposal/putProposal';
import { storeProposalCopy } from '../../utils/storage/proposalData';
import { FOOTER_SPACER } from '../../utils/constants';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';

export default function LandingPage() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2,
    updateAppContent3,
    updateAppContent5
  } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');
  const [openCloneDialog, setOpenCloneDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openViewDialog, setOpenViewDialog] = React.useState(false);

  const [observatoryData, setObservatoryData] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);
  const loggedIn = isLoggedIn();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const authClient = useAxiosAuthClient();

  const DATA_GRID_HEIGHT = '60vh';

  React.useEffect(() => {
    updateAppContent2({});
    setFetchList(!fetchList);
    setObservatoryData(!observatoryData);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      setProposals([]);
      if (!loggedIn) return;

      const response = await GetProposalList(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposals(response);
      }
    };
    fetchData();
  }, [fetchList, loggedIn]);

  // React.useEffect(() => {
  //   const fetchObservatoryData = async () => {
  //     const response = await GetObservatoryData(authClient, 1);
  //     if (response.error || typeof response === 'string') {
  //       setAxiosError(response.toString());
  //     } else {
  //       // store osd data into storage 3
  //       updateAppContent3(response as ObservatoryData);
  //     }
  //   };
  //
  //   fetchObservatoryData();
  // }, []);

  const getTheProposal = async (id: string) => {
    helpComponent({});
    updateAppContent5({});

    const response = await GetProposal(authClient, id);
    if (typeof response === 'string') {
      updateAppContent1({});
      updateAppContent2({});
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

  const goToTitlePage = () => {
    navigate(NAV[0]);
  };

  const viewIconClicked = async (id: string) => {
    if (await getTheProposal(id)) {
      setOpenViewDialog(true);
    } else {
      alert(t('error.iconClicked'));
    }
  };

  const editIconClicked = async (id: string) => {
    if (await getTheProposal(id)) {
      goToTitlePage();
    } else {
      alert(t('error.iconClicked'));
    }
  };

  const cloneIconClicked = async (id: string) => {
    if (await getTheProposal(id)) {
      setOpenCloneDialog(true);
    } else {
      alert(t('error.iconClicked'));
    }
  };

  const cloneConfirmed = () => {
    setOpenCloneDialog(false);
    setProposal({
      ...getProposal(),
      id: null,
      title: getProposal().title + ' ' + t('cloneProposal.suffix')
    });
    goToTitlePage();
  };

  const deleteIconClicked = (id: string) => {
    if (getTheProposal(id)) {
      setTimeout(() => {
        setOpenDeleteDialog(true);
      }, 1000);
    }
  };

  const deleteConfirmed = async () => {
    const response = await PutProposal(authClient, getProposal(), PROPOSAL_STATUS.WITHDRAWN);
    if (response && !response.error) {
      setOpenDeleteDialog(false);
      setFetchList(!fetchList);
    } else {
      setOpenDeleteDialog(false);
    }
  };

  const canEdit = (e: { row: { status: string } }) => e.row.status === PROPOSAL_STATUS.DRAFT;
  const canClone = () => true;
  // TODO const canDelete = (e: { row: { status: string } }) =>
  // TODO  e.row.status === PROPOSAL_STATUS.DRAFT || e.row.status === PROPOSAL_STATUS.WITHDRAWN;

  const displayProposalType = (proposalType: any) => {
    return proposalType ? proposalType : NOT_SPECIFIED;
  };

  const element = (inValue: number | string) => (inValue === NOT_SPECIFIED ? emptyCell() : inValue);

  const getPIs = (arr: TeamMember[]) => {
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

  const colId = {
    field: 'id',
    headerName: t('proposalId.label'),
    width: 200
  };

  const colType = {
    field: 'proposalType',
    headerName: t('proposalType.label'),
    width: 110,
    renderCell: (e: { row: any }) => (
      <Tooltip title={t('proposalType.title.' + displayProposalType(e.row.proposalType))}>
        <>{t('proposalType.code.' + displayProposalType(e.row.proposalType))}</>
      </Tooltip>
    )
  };
  const colCycle = { field: 'cycle', headerName: t('cycle.label'), width: 140 };

  const colTitle = {
    field: 'title',
    headerName: t('title.label'),
    flex: 3,
    minWidth: 250,
    renderCell: (e: any) => presentLatex(e.row.title)
  };
  const colPI = {
    field: 'pi',
    headerName: t('pi.short'),
    width: 100,
    renderCell: (e: any) => {
      return getPIs(e.row.team);
    }
  };

  const colStatus = {
    field: 'status',
    headerName: t('status.label'),
    width: 120,
    renderCell: (e: { row: any }) => t('proposalStatus.' + e.row.status)
  };

  const colUpdated = {
    field: 'lastUpdated',
    headerName: t('updated.label'),
    width: 180,
    renderCell: (e: { row: any }) =>
      presentDate(e.row.lastUpdated) + ' ' + presentTime(e.row.lastUpdated)
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
          toolTip={t(canEdit(e) ? 'editProposal.toolTip' : 'editProposal.disabled')}
        />
        <ViewIcon onClick={() => viewIconClicked(e.row.id)} toolTip={t('viewProposal.toolTip')} />
        <CloneIcon
          onClick={() => cloneIconClicked(e.row.id)}
          disabled={!canClone()}
          toolTip={t('cloneProposal.toolTip')}
        />
        <TrashIcon
          onClick={() => deleteIconClicked(e.row.id)}
          disabled // TO BE re-introduced once API is completed  ={!canDelete(e)}
          toolTip={t('deleteProposal.disabled')} // canDelete(e) ? 'deleteProposal.toolTip' : 'deleteProposal.disabled')}
        />
      </>
    )
  };

  const stdColumns = [
    ...[colId, colType, colCycle, colTitle, colPI, colStatus, colUpdated, colActions]
  ];

  function filterProposals() {
    return proposals.filter(
      item =>
        ['id', 'title', 'cycle', 'pi'].some(field =>
          item[field]?.toLowerCase().includes(searchTerm?.toLowerCase())
        ) &&
        (searchType === '' || item.status?.toLowerCase() === searchType?.toLowerCase())
    );
  }

  const filteredData = proposals ? filterProposals() : [];

  const clickFunction = () => {
    navigate(PATH[1]);
  };

  const pageDescription = () => (
    <Typography align="center" variant="h6" minHeight="5vh">
      {t('page.11.desc')}
    </Typography>
  );

  const addProposalButton = () => (
    <AddButton
      action={clickFunction}
      testId="addProposalButton"
      title={'addProposal.label'}
      toolTip="addProposal.toolTip"
    />
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

  const deleteClicked = () => (
    <ProposalDisplay
      proposal={getProposal()}
      open={openDeleteDialog}
      onClose={() => setOpenDeleteDialog(false)}
      onConfirm={deleteConfirmed}
      onConfirmLabel="deleteProposal.confirm"
    />
  );

  const cloneClicked = () => (
    <ProposalDisplay
      proposal={getProposal()}
      open={openCloneDialog}
      onClose={() => setOpenCloneDialog(false)}
      onConfirm={cloneConfirmed}
      onConfirmLabel="cloneProposal.confirm"
    />
  );

  const viewClicked = () => (
    <ProposalDisplay
      proposal={getProposal()}
      open={openViewDialog}
      onClose={() => setOpenViewDialog(false)}
      onConfirm={deleteConfirmed}
      onConfirmLabel=""
    />
  );

  return (
    <>
      <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-around">
        <Grid2 size={{ xs: 12 }}>{pageDescription()}</Grid2>
        <Grid2 size={{ sm: 4, md: 3, lg: 2 }} p={2}>
          {addProposalButton()}
        </Grid2>
        <Grid2 size={{ sm: 4 }} p={2}>
          {searchDropdown()}
        </Grid2>
        <Grid2 size={{ sm: 4, md: 6, lg: 6 }} p={2} mt={-1}>
          {searchEntryField('searchId')}
        </Grid2>
        <Grid2 size={{ xs: 12 }} pt={1}>
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
      {openDeleteDialog && deleteClicked()}
      {openCloneDialog && cloneClicked()}
      {openViewDialog && viewClicked()}
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom: FOOTER_HEIGHT_PHT,
          left: 0,
          right: 0
        }}
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
