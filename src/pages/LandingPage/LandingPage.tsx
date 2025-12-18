import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  AlertColorTypes,
  DataGrid,
  DropDown,
  SearchEntry,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
import moment from 'moment';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import GetProposal from '@services/axios/get/getProposal/getProposal';
import AddButton from '@/components/button/Add/Add';
import CloneIcon from '@/components/icon/cloneIcon/cloneIcon';
import EditIcon from '@/components/icon/editIcon/editIcon';
// import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import ProposalDisplay from '@/components/alerts/proposalDisplay/ProposalDisplay';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import GetProposalList from '@/services/axios/get/getProposalList/getProposalList';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import GetProposalAccessForUser from '@/services/axios/get/getProposalAccess/user/getProposalAccessForUser';
import Proposal from '@/utils/types/proposal';
import { storeProposalCopy } from '@/utils/storage/proposalData';
import { validateProposal } from '@/utils/validation/validation';
import {
  cypressToken,
  DUMMY_PROPOSAL_ID,
  FOOTER_HEIGHT_PHT,
  FOOTER_SPACER,
  isCypress,
  TYPE_CONTINUUM,
  NAV,
  PAGE_LANDING,
  PATH,
  PROPOSAL_STATUS,
  PROPOSAL_STATUS_OPTIONS
} from '@/utils/constants';
import ProposalAccess from '@/utils/types/proposalAccess';
import { accessUpdate, PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import CycleSelection from '@/components/alerts/cycleSelection/CycleSelection';
import PostProposal from '@/services/axios/post/postProposal/postProposal';
import { useNotify } from '@/utils/notify/useNotify';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import {
  getColProposalId,
  getColCycle,
  getColProposalTitle,
  getColProposalPI,
  getColProposalStatus,
  getColProposalUpdated,
  getColCycleClose,
  getColProposalType
} from '@/components/grid/proposals/columns/Columns';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAPI } from '@/services/axios/use/useOSDAPI/useOSDAPI';
import TableSubmissions from '@/components/table/tabelSubmissions/TableSubmissions';

export default function LandingPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { notifyError, notifySuccess, notifyWarning } = useNotify();
  const { autoLink, isSV, osdCycleId, osdCloses, setSelectedPolicyByCycleId } = useOSDAccessors();

  const {
    application,
    updateAppContent1,
    updateAppContent2,
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
  const [openCycleDialog, setOpenCycleDialog] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);
  const loggedIn = isLoggedIn();
  const getAccess = () => application.content4 as ProposalAccess[];
  const setAccess = (access: ProposalAccess[]) => updateAppContent4(access);
  const getProposal = () => application.content2 as Proposal;
  const { setHelp } = useHelp();
  useOSDAPI(setAxiosError);

  const mock = ({
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
    scienceCategory: isSV ? TYPE_CONTINUUM : undefined,
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
  } as unknown) as Proposal;

  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const authClient = useAxiosAuthClient();

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
    if (loggedIn || cypressToken) {
      updateAppContent2({});
      setFetchList(!fetchList);
    }
  }, []);

  const getTheProposal = async (id: string) => {
    setHelp('');
    updateAppContent5({});

    const response = await GetProposal(authClient, id);
    if (typeof response === 'string') {
      updateAppContent1({});
      updateAppContent2({});
      storeProposalCopy({} as Proposal);
      setAxiosViewError(response);
      return false;
    } else {
      setSelectedPolicyByCycleId((response as Proposal).cycle ?? '');
      updateAppContent1(validateProposal(response, autoLink));
      updateAppContent2(response);
      storeProposalCopy(response);
      validateProposal(response, autoLink);
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

  const createProposal = async () => {
    notifyWarning(t('addProposal.warning'));
    const originalProposal = getProposal();
    const response = await PostProposal(
      authClient,
      {
        ...originalProposal,
        id: '',
        title: originalProposal.title + ' ' + t('cloneProposal.suffix'),
        cycle: osdCycleId ?? ''
      },
      isSV ? true : false,
      PROPOSAL_STATUS.DRAFT
    );

    if (response && !('error' in response)) {
      notifySuccess(t('addProposal.success') + response.id);
      setProposal({
        ...(response as Proposal)
      });
      // Create a new access entry for the PI.  Saves doing the endpoint
      const newAcc: Partial<ProposalAccess> = {
        prslId: response.id,
        role: PROPOSAL_ROLE_PI,
        permissions: PROPOSAL_ACCESS_PERMISSIONS
      };

      const acc = Array.isArray(application.content4)
        ? (application.content4 as ProposalAccess[])
        : [];

      updateAppContent4([...acc, newAcc]);
      goToTitlePage();
    } else {
      notifyError((response as { error: string }).error);
    }
  };

  const cloneConfirmed = () => {
    setOpenCloneDialog(false);
    createProposal();
  };

  // const deleteIconClicked = async (id: string) => {
  //   const isValid = await getTheProposal(id);
  //   if (isValid) {
  //     setTimeout(() => {
  //       setOpenDeleteDialog(true);
  //     }, 1000);
  //   }
  // };

  const deleteConfirmed = async () => {
    const response = await PutProposal(authClient, getProposal(), isSV, PROPOSAL_STATUS.WITHDRAWN);
    if (response && !('error' in response)) {
      setOpenDeleteDialog(false);
      setFetchList(!fetchList);
    } else {
      setOpenDeleteDialog(false);
    }
  };

  const osdOpen = () => {
    // TODO : We need to extend to also check the open date of the OSD record
    if (osdCloses) {
      const closes = osdCloses();
      const formattedTimestamp = closes.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T');
      // Use strict ISO parsing
      const closeMoment = moment.utc(formattedTimestamp, moment.ISO_8601, true);
      return closeMoment.isValid() ? closeMoment.isAfter(moment.utc()) : true;
    } else {
      return true;
    }
  };

  const canEdit = (e: { row: { id: string; status: string } }) => {
    return (
      e.row.status === PROPOSAL_STATUS.DRAFT && osdOpen() && accessUpdate(getAccess(), e.row.id)
    );
  };

  const canClone = (e: { row: any }) => {
    const update = accessUpdate(getAccess(), e.row.id);
    return update;
  };

  // TODO const canDelete = (e: { row: { status: string } }) =>
  // TODO  e.row.status === PROPOSAL_STATUS.DRAFT || e.row.status === PROPOSAL_STATUS.WITHDRAWN;

  const colActions = {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    sortable: false,
    width: 200,
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
          disabled={!canClone(e)}
          toolTip={t('cloneProposal.toolTip')}
        />
        {/* <TrashIcon
          onClick={() => deleteIconClicked(e.row.id)}
          disabled // TO BE re-introduced once API is completed  ={!canDelete(e)}
          toolTip={t('deleteProposal.disabled')} // canDelete(e) ? 'deleteProposal.toolTip' : 'deleteProposal.disabled')}
        /> */}
      </>
    )
  };

  const stdColumns = isSV
    ? [
        ...[
          colActions,
          getColProposalId(t),
          getColCycle(t),
          getColProposalTitle(t),
          getColProposalPI(t),
          getColProposalStatus(t),
          getColProposalUpdated(t),
          getColCycleClose(t)
        ]
      ]
    : [
        ...[
          colActions,
          getColProposalId(t),
          getColProposalType(t),
          getColCycle(t),
          getColProposalTitle(t),
          getColProposalPI(t),
          getColProposalStatus(t),
          getColProposalUpdated(t),
          getColCycleClose(t)
        ]
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

  /*--------------------------------------------------------------------*/

  const addSubmissionButton = () => (
    <AddButton
      action={() => {
        if (!loggedIn && !cypressToken) {
          updateAppContent2(mock);
        }
        setOpenCycleDialog(true);
      }}
      testId={'addSubmissionButton'}
      title={loggedIn || cypressToken ? 'addProposal.label' : 'addMockProposal.label'}
      toolTip={loggedIn || cypressToken ? 'addProposal.toolTip' : 'addMockProposal.toolTip'}
    />
  );

  const cycleConfirmed = async () => {
    if (loggedIn || cypressToken) {
      navigate(PATH[1]);
    } else {
      setProposal(getProposal());
      navigate(NAV[4]);
    }
  };

  const cycleClicked = () => (
    <CycleSelection
      open={openCycleDialog}
      onClose={() => setOpenCycleDialog(false)}
      onConfirm={cycleConfirmed}
    />
  );

  /*--------------------------------------------------------------------*/

  const displayField = () => {
    return !!(loggedIn || cypressToken);
  };

  const pageDescription = () => (
    <Typography align="center" variant="h6" minHeight="5vh">
      {t('page.' + PAGE_LANDING + '.desc')}
    </Typography>
  );

  const searchDropdown = () => (
    <DropDown
      options={[{ label: t('status.0'), value: '' }, ...PROPOSAL_STATUS_OPTIONS]}
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
          {addSubmissionButton()}
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
                height={'25vh'}
              />
              <TableSubmissions
                data={filteredData}
                editFunction={editIconClicked}
                viewFunction={viewIconClicked}
                cloneFunction={cloneIconClicked}
              />
            </div>
          )}
        </Grid>
      </Grid>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {openDeleteDialog && deleteClicked()}
      {openCloneDialog && cloneClicked()}
      {openViewDialog && viewClicked()}
      {openCycleDialog && cycleClicked()}
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
