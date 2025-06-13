import { useTranslation } from 'react-i18next';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import { Tooltip, Typography, Grid, Box } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import EditIcon from '../../icon/editIcon/editIcon';
import TrashIcon from '../../icon/trashIcon/trashIcon';
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
import emptyCell from '@/components/fields/emptyCell/emptyCell';
import TeamMember from '@/utils/types/teamMember';
import { presentLatex } from '@/utils/present';
import CloneIcon from '@/components/icon/cloneIcon/cloneIcon';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import PutProposal from '@/services/axios/putProposal/putProposal';
import GetCycleData from '@/services/axios/getCycleData/getCycleData';
import GetProposalList from '@/services/axios/getProposalList/getProposalList';
import GetProposal from '@/services/axios/getProposal/getProposal';
import { storeCycleData, storeProposalCopy } from '@/utils/storage/cycleData';
import ProposalDisplay from '@/components/alerts/proposalDisplay/ProposalDisplay';

export default function GridProposals({}) {
  const { t } = useTranslation('pht');

  const navigate = useNavigate();

  const [proposals, setProposals] = React.useState<Proposal[]>([]);
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

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const DATA_GRID_HEIGHT = '65vh';

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

  React.useEffect(() => {
    updateAppContent2((null as unknown) as Proposal);
    setFetchList(!fetchList);
    setCycleData(!cycleData);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetProposalList();
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposals(response);

        // TODO : remove this once email invitation is working
        // temporary hack to get team members into the proposals as the functionality is not working at the moment
        response.forEach((proposal: Proposal) => {
          if (proposal.team && proposal.team.length === 0) {
            proposal.team = [
              {
                firstName: 'Alice',
                lastName: 'Spears',
                pi: true,
                phdThesis: true,
                id: '123',
                email: 'alice.spears@example.com',
                country: 'United Kingdom',
                affiliation: 'University of Cambridge',
                status: 'accepted'
              },
              {
                firstName: 'Joshua',
                lastName: 'Smith',
                pi: false,
                phdThesis: true,
                id: '124',
                email: 'joshua.smith@example.com',
                country: 'United Kingdom',
                affiliation: 'University of Cambridge',
                status: 'accepted'
              },
              {
                firstName: 'Sophie',
                lastName: 'Dupont',
                pi: false,
                phdThesis: true,
                id: '125',
                email: 'sophie.dupont@example.com',
                country: 'France',
                affiliation: 'University Paris Sorbonne',
                status: 'accepted'
              }
            ];
          }
        });
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

  const canEdit = (e: { row: { status: string } }) => e.row.status === PROPOSAL_STATUS.DRAFT;
  const canClone = () => true;
  // TODO const canDelete = (e: { row: { status: string } }) =>
  // TODO  e.row.status === PROPOSAL_STATUS.DRAFT || e.row.status === PROPOSAL_STATUS.WITHDRAWN;

  const displayProposalType = (proposalType: any) => {
    return proposalType ? proposalType : NOT_SPECIFIED;
  };

  const element = (inValue: number | string) => (inValue === NOT_SPECIFIED ? emptyCell() : inValue);

  const getAuthors = (arr: TeamMember[]) => {
    if (!arr || arr.length === 0) {
      return element(NOT_SPECIFIED);
    }
    const results: any[] = [];
    arr.forEach(e => {
      results.push(e.lastName + ', ' + e.firstName);
    });
    return element(results.length > 1 ? results[0] + ' + ' + (results.length - 1) : results[0]);
  };

  const colType = {
    field: 'proposalType',
    headerName: t('proposalType.label'),
    flex: 1,
    width: 110,
    renderCell: (e: { row: any }) => (
      <Tooltip title={t('proposalType.title.' + displayProposalType(e.row.proposalType))}>
        <>{t('proposalType.code.' + displayProposalType(e.row.proposalType))}</>
      </Tooltip>
    )
  };

  const colTitle = {
    field: 'title',
    headerName: t('title.label'),
    flex: 2,
    minWidth: 250,
    renderCell: (e: any) => presentLatex(e.row.title)
  };

  const colAuthors = {
    field: 'authors',
    headerName: t('authors.label'),
    flex: 2,
    minWidth: 300,
    renderCell: (e: any) => {
      return getAuthors(e.row.team);
    }
  };

  const colScienceCategory = {
    field: 'scienceCategory',
    headerName: t('scienceCategory.label'),
    flex: 2,
    minWidth: 250,
    renderCell: (e: { row: any }) => t('scienceCategory.' + e.row.scienceCategory)
  };

  const colStatus = {
    field: 'status',
    headerName: t('status.label'),
    width: 120,
    renderCell: (e: { row: any }) => t('proposalStatus.' + e.row.status)
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
    ...[colType, colTitle, colAuthors, colScienceCategory, colStatus, colActions]
  ];

  function filterProposals() {
    const fields: (keyof Proposal)[] = ['title'];
    return proposals.filter(
      item =>
        fields.some(field =>
          (item[field] as string)?.toLowerCase().includes(searchTerm?.toLowerCase())
        ) &&
        (searchType === '' || item.status?.toLowerCase() === searchType?.toLowerCase())
    );
  }

  const filteredData = proposals ? filterProposals() : [];

  const ProposalsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('proposals.label')}
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
      id: '',
      title: getProposal().title + ' ' + t('cloneProposal.suffix')
    });
    goToTitlePage();
  };

  const deleteIconClicked = async (id: string) => {
    if (await getTheProposal(id)) {
      setTimeout(() => {
        setOpenDeleteDialog(true);
      }, 1000);
    }
  };

  const deleteConfirmed = async () => {
    const response = await PutProposal(getProposal(), PROPOSAL_STATUS.WITHDRAWN);
    if (response && !response.error) {
      setOpenDeleteDialog(false);
      setFetchList(!fetchList);
    } else {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <>
      <Grid item p={2} lg={12}>
        {ProposalsSectionTitle()}
      </Grid>

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
      <Grid item xs={12} pt={1}>
        {!axiosViewError && (!filteredData || filteredData.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('proposals.empty')} testId="helpPanelId" />
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
      {openDeleteDialog && deleteClicked()}
      {openCloneDialog && cloneClicked()}
      {openViewDialog && viewClicked()}
    </>
  );
}
