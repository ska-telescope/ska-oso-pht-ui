import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Tooltip, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  AlertColorTypes,
  DataGrid,
  DropDown,
  SearchEntry,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
//
import { presentDate, presentLatex, presentTime } from '@utils/present/present';
import Investigator from '@utils/types/investigator.tsx';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import GetProposal from '@services/axios/get/getProposal/getProposal';
import { OBSERVATION } from '@utils/observationConstantData.ts';
import GetObservatoryData from '@/services/axios/get/getObservatoryData/getObservatoryData';
import AddButton from '@/components/button/Add/Add';
import CloneIcon from '@/components/icon/cloneIcon/cloneIcon';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import ProposalDisplay from '@/components/alerts/proposalDisplay/ProposalDisplay';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import emptyCell from '@/components/fields/emptyCell/emptyCell';
import GetProposalList from '@/services/axios/get/getProposalList/getProposalList';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import GetProposalAccessForUser from '@/services/axios/get/getProposalAccess/user/getProposalAccessForUser';
import Proposal from '@/utils/types/proposal';
import { storeProposalCopy } from '@/utils/storage/proposalData';
import { validateProposal } from '@/utils/proposalValidation';
import ObservatoryData from '@/utils/types/observatoryData';
import {
  cypressToken,
  DUMMY_PROPOSAL_ID,
  FOOTER_HEIGHT_PHT,
  FOOTER_SPACER,
  isCypress,
  NAV,
  NOT_SPECIFIED,
  PATH,
  PROPOSAL_STATUS,
  SEARCH_TYPE_OPTIONS
} from '@/utils/constants';
import ProposalAccess from '@/utils/types/proposalAccess';
import { accessUpdate } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function LandingPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();

  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2,
    updateAppContent3,
    updateAppContent4,
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
  const getAccess = () => application.content4 as ProposalAccess[];
  const setAccess = (access: ProposalAccess[]) => updateAppContent4(access);
  const getProposal = () => application.content2 as Proposal;

  const mock = {
    abstract: '',
    createdBy: '',
    createdOn: '',
    cycle: 'SKAO_2027_1',
    dataProductSDP: [],
    dataProductSRC: [],
    groupObservations: [],
    id: DUMMY_PROPOSAL_ID,
    investigators: [],
    lastUpdated: '',
    lastUpdatedBy: '',
    metadata: undefined,
    observations: [],
    pipeline: '',
    proposalSubType: [],
    proposalType: 0,
    scienceCategory: undefined,
    scienceLoadStatus: 0,
    sciencePDF: undefined,
    scienceSubCategory: [],
    status: '',
    targetObservation: [],
    targetOption: 1,
    targets: [],
    technicalLoadStatus: 0,
    technicalPDF: undefined,
    title: '',
    version: 0
  } as Proposal;

  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const authClient = useAxiosAuthClient();

  const DATA_GRID_HEIGHT = '60vh';

  React.useEffect(() => {
    const fetchData = async () => {
      setProposals([]);

      /* c8 ignore start */
      const noLoginTest = window.localStorage.getItem('proposal:noLogin') === 'true';
      if (noLoginTest) {
        return;
      }
      /* c8 ignore end */
      if (!isCypress && !loggedIn) return;

      const response = await GetProposalList(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposals(response);
      }
    };
    const fetchAccess = async () => {
      setProposals([]);
      if (!loggedIn) return;

      const response = await GetProposalAccessForUser(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setAccess(response);
      }
    };
    fetchData();
    fetchAccess();
  }, [fetchList, loggedIn]);

  React.useEffect(() => {
    const fetchObservatoryData = async () => {
      const response = await GetObservatoryData(authClient, 1);
      if (typeof response === 'string' || (response && (response as any).error)) {
        setAxiosError(response.toString());
      } else {
        console.log('osd api response ', response);
        const combined = [...OBSERVATION.array, ...response];
        updateAppContent3(combined);
        // updateAppContent3(response as ObservatoryData);
      }
    };
    if (!loggedIn && !cypressToken) {
      updateAppContent2(mock);
    } else {
      updateAppContent2({});
      setFetchList(!fetchList);
      setObservatoryData(!observatoryData);
    }
    const content = application?.content3;
    const isEmpty = !content || (Array.isArray(content) && content.length === 0);
    if (isEmpty) {
      fetchObservatoryData();
    }
  }, []);

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
    if (!isCypress && !loggedIn) return;

    const response = await getTheProposal(id);
    if (typeof response === 'string') {
      alert(t('error.iconClicked'));
    } else {
      goToTitlePage();
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
      id: '',
      title: getProposal().title + ' ' + t('cloneProposal.suffix')
    });
    goToTitlePage();
  };

  const deleteIconClicked = async (id: string) => {
    const isValid = await getTheProposal(id);
    if (isValid) {
      setTimeout(() => {
        setOpenDeleteDialog(true);
      }, 1000);
    }
  };

  const deleteConfirmed = async () => {
    const response = await PutProposal(authClient, getProposal(), PROPOSAL_STATUS.WITHDRAWN);
    if (response && !('error' in response)) {
      setOpenDeleteDialog(false);
      setFetchList(!fetchList);
    } else {
      setOpenDeleteDialog(false);
    }
  };

  const CanEdit = (e: { row: { id: string; status: string } }) => {
    return e.row.status === PROPOSAL_STATUS.DRAFT && accessUpdate(getAccess(), e.row.id);
  };
  const CanClone = (e: { row: any }) => {
    const update = accessUpdate(getAccess(), e.row.id);
    return update;
  };

  // TODO const canDelete = (e: { row: { status: string } }) =>
  // TODO  e.row.status === PROPOSAL_STATUS.DRAFT || e.row.status === PROPOSAL_STATUS.WITHDRAWN;

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

  const colId = {
    field: 'id',
    headerName: t('proposalId.label'),
    width: 200
  };

  const colType = {
    field: 'proposalType',
    headerName: t('proposalType.label'),
    width: 160,
    renderCell: (e: { row: any }) => (
      <Tooltip title={t('proposalType.title.' + displayProposalType(e.row.proposalType))}>
        <>{t('proposalType.code.' + displayProposalType(e.row.proposalType))}</>
      </Tooltip>
    )
  };
  const colCycle = { field: 'cycle', headerName: t('cycle.label'), width: 160 };

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
    width: 160,
    renderCell: (e: any) => {
      return getPIs(e.row.investigators);
    }
  };

  const colStatus = {
    field: 'status',
    headerName: t('status.label'),
    width: 160,
    renderCell: (e: { row: any }) => t('proposalStatus.' + e.row.status)
  };

  const colUpdated = {
    field: 'lastUpdated',
    headerName: t('updated.label'),
    width: 240,
    renderCell: (e: { row: any }) =>
      presentDate(e.row.lastUpdated) + ' ' + presentTime(e.row.lastUpdated)
  };

  const colActions = {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    sortable: false,
    width: 160,
    disableClickEventBubbling: true,
    renderCell: (e: { row: any }) => (
      <>
        <EditIcon
          onClick={() => editIconClicked(e.row.id)}
          disabled={!CanEdit(e)}
          toolTip={t(CanEdit(e) ? 'editProposal.toolTip' : 'editProposal.disabled')}
        />
        <ViewIcon onClick={() => viewIconClicked(e.row.id)} toolTip={t('viewProposal.toolTip')} />
        <CloneIcon
          onClick={() => cloneIconClicked(e.row.id)}
          disabled={!CanClone(e)}
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

  const searchableFields: (keyof Proposal)[] = ['id', 'title', 'cycle', 'investigators'];

  function filterProposals() {
    return proposals.filter(
      item =>
        searchableFields.some(field =>
          String(item[field])
            ?.toLowerCase()
            .includes(searchTerm?.toLowerCase() || '')
        ) &&
        (searchType === '' || item.status?.toLowerCase() === searchType?.toLowerCase())
    );
  }

  const filteredData = proposals ? filterProposals() : [];

  const createMock = async () => {
    setProposal(getProposal());
    navigate(NAV[4]);
  };

  const clickFunction = () => {
    if (!loggedIn && !cypressToken) {
      createMock();
    } else {
      navigate(PATH[1]);
    }
  };

  const displayField = () => {
    return !!(loggedIn || cypressToken);
  };

  const pageDescription = () => (
    <Typography align="center" variant="h6" minHeight="5vh">
      {t('page.11.desc')}
    </Typography>
  );

  const addProposalButton = () => (
    <AddButton
      action={clickFunction}
      testId={'addProposalButton'}
      title={'addProposal.label'}
      toolTip={'addProposal.toolTip'}
    />
  );

  const addMockButton = () => (
    <AddButton
      action={clickFunction}
      testId={'addMockButton'}
      title={'addMockProposal.label'}
      toolTip={'addMockProposal.toolTip'}
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
      <Grid container p={5} direction="row" alignItems="center" justifyContent="space-around">
        <Grid size={{ xs: 12 }}>{loggedIn && pageDescription()}</Grid>
        <Grid size={{ sm: 4, md: 3, lg: 2 }} p={2}>
          {loggedIn || cypressToken ? addProposalButton() : addMockButton()}
        </Grid>
        <Grid size={{ sm: 4 }} p={2}>
          {displayField() && searchDropdown()}
        </Grid>
        <Grid size={{ sm: 4, md: 6, lg: 6 }} p={2} mt={-1}>
          {displayField() && searchEntryField('searchId')}
        </Grid>
        <Grid size={{ xs: 12 }} pt={1}>
          {!axiosViewError && (!filteredData || filteredData.length === 0) && (
            <Alert
              color={AlertColorTypes.Info}
              text={loggedIn || cypressToken ? t('proposals.empty') : t('proposals.loggedOut')}
              testId="helpPanelId"
            />
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
      </Grid>
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
        <Grid container direction="column" alignItems="center" justifyContent="space-evenly">
          <Grid>
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
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
