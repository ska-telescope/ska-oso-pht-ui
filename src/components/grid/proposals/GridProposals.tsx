import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Tooltip, Typography, Box, Grid2 } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Spacer, SPACER_VERTICAL, LABEL_POSITION } from '@ska-telescope/ska-gui-components';
import EditIcon from '../../icon/editIcon/editIcon';
import TrashIcon from '../../icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { validateProposal } from '../../../utils/proposalValidation';
import Proposal from '@/utils/types/proposal';
import {
  FOOTER_SPACER,
  NOT_SPECIFIED,
  PROPOSAL_STATUS,
  NAV,
  GENERAL,
  PROJECTS,
  SEARCH_PROPOSAL_TYPE_OPTIONS
} from '@/utils/constants';
import emptyCell from '@/components/fields/emptyCell/emptyCell';
import TeamMember from '@/utils/types/teamMember';
import { presentLatex } from '@/utils/present/present';
import CloneIcon from '@/components/icon/cloneIcon/cloneIcon';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import PutProposal from '@/services/axios/putProposal/putProposal';
import GetCycleData from '@/services/axios/getCycleData/getCycleData';
import GetProposalList from '@/services/axios/getProposalList/getProposalList';
import GetProposal from '@/services/axios/getProposal/getProposal';
import { storeCycleData, storeProposalCopy } from '@/utils/storage/cycleData';
import ProposalDisplay from '@/components/alerts/proposalDisplay/ProposalDisplay';

type ProposalId = {
  id: string;
};

export function getProposalType(value: number): string {
  const type = PROJECTS.find(item => item.id === value)?.mapping;
  return type ? type : '';
}

export function filterProposals(
  proposals: Proposal[],
  searchTerm: string,
  searchScienceCategory: number | null,
  searchProposalType: string
): Proposal[] {
  const fields: (keyof Proposal)[] = ['title'];
  return proposals.filter(
    item =>
      fields.some(field =>
        (item[field] as string)?.toLowerCase().includes(searchTerm?.toLowerCase())
      ) &&
      (searchScienceCategory === null || item?.scienceCategory === searchScienceCategory) &&
      (searchProposalType === '' || getProposalType(item?.proposalType) === searchProposalType)
  );
}

interface GridProposalsProps {
  height?: string;
  selectedProposals?: ProposalId[];
  forReview?: boolean;
  showSearch?: boolean;
  showTitle?: boolean;
  showSelection?: boolean;
  showActions?: boolean;
  tickBoxClicked?: (proposal: Proposal, isProposalSelected: boolean) => void;
}

export default function GridProposals({
  height = '50vh',
  selectedProposals = [],
  showSearch = false,
  showTitle = false,
  forReview = false,
  showSelection = false,
  showActions = false,
  tickBoxClicked = () => {}
}: GridProposalsProps) {
  const { t } = useTranslation('pht');

  const navigate = useNavigate();

  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchScienceCategory, setSearchScienceCategory] = React.useState<number | null>(null);
  const [searchProposalType, setSearchProposalType] = React.useState('');

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
  const [proposalsCollection, setProposalsCollection] = React.useState<ProposalId[]>([]);
  const [selected, setSelected] = React.useState(true);
  const [notSelected, setNotSelected] = React.useState(true);

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
                affiliation: 'University of Cambridge',
                status: 'reviewed'
              },
              {
                firstName: 'Joshua',
                lastName: 'Smith',
                pi: false,
                phdThesis: true,
                id: '124',
                email: 'joshua.smith@example.com',
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
    setProposalsCollection(selectedProposals);
  }, [selectedProposals]);

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

  const isProposalSelected = (proposalId: string): boolean => {
    return proposalsCollection.filter(entry => entry.id === proposalId).length > 0;
  };

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

  const colPI = {
    field: 'pi',
    headerName: t('pi.short'),
    flex: 2,
    renderCell: (e: any) => {
      return getPIs(e.row.team);
    }
  };

  const colType = {
    field: 'proposalType',
    headerName: t('proposalType.label'),
    flex: 2,
    renderCell: (e: { row: any }) => (
      <Tooltip title={t('proposalType.title.' + displayProposalType(e.row.proposalType))}>
        <>{t('proposalType.code.' + displayProposalType(e.row.proposalType))}</>
      </Tooltip>
    )
  };

  const colTitle = {
    field: 'title',
    headerName: t('title.label'),
    flex: 3,
    minWidth: 300,
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
          checked={isProposalSelected(e.row.id)}
          onChange={() => tickBoxClicked?.(e.row, isProposalSelected(e.row.id))}
        />
      </Box>
    )
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

  const proposalColumns = [
    ...(showSelection ? [colSelect] : []),
    colTitle,
    colScienceCategory,
    colType,
    colPI,
    ...(showActions ? [colActions] : [])
  ];

  const reviewColumns = [...[colType, colTitle, colAuthors, colScienceCategory]];

  const selectedData = proposals
    ? proposals.filter(e => (isProposalSelected(e.id) ? selected : notSelected))
    : [];
  const filteredData = selectedData
    ? filterProposals(selectedData, searchTerm, searchScienceCategory, searchProposalType)
    : [];

  const ProposalsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('proposals.label')}
    </Typography>
  );

  const scienceCategoryDropdown = () => (
    <DropDown
      options={[{ label: t('scienceCategory.all'), value: null }, ...GENERAL.ScienceCategory]}
      testId="proposalScienceCategory"
      value={searchScienceCategory}
      setValue={setSearchScienceCategory}
      label={t('scienceCategory.all')}
    />
  );

  const proposalTypeDropdown = () => (
    <DropDown
      options={[{ label: t('proposalType.all'), value: '' }, ...SEARCH_PROPOSAL_TYPE_OPTIONS]}
      testId="proposalType"
      value={searchProposalType}
      setValue={setSearchProposalType}
      label={t('proposalType.all')}
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
    helpComponent({});
    clearApp();

    const response = await GetProposal(id);
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
      {showTitle && (
        <Grid2 p={2} size={{ lg: 12 }}>
          {ProposalsSectionTitle()}
        </Grid2>
      )}

      {showSearch && (
        <Grid2
          p={2}
          size={{ sm: 12, md: 8, lg: 12 }}
          container
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid2 size={{ sm: 12, lg: 8 }}>
            <Grid2 container direction="row" spacing={2}>
              <Grid2 size={{ sm: 6 }}>{proposalTypeDropdown()}</Grid2>
              <Grid2 size={{ sm: 6 }}>{scienceCategoryDropdown()}</Grid2>
            </Grid2>
            <Grid2 container direction="row" spacing={2}>
              <Grid2 size={{ sm: 6 }}>{searchEntryField('searchId')}</Grid2>
              <Grid2 size={{ sm: 6 }} mt={3}>
                <Grid2
                  container
                  flexDirection={'row'}
                  flexWrap={'wrap'}
                  justifyContent={'space-evenly'}
                >
                  <Grid2>
                    <TickBox
                      disabled={!proposalsCollection}
                      label={t('selected.label')}
                      labelPosition={LABEL_POSITION.END}
                      testId="selectedTickBox"
                      checked={selected}
                      onChange={() => setSelected(!selected)}
                    />
                  </Grid2>
                  <Grid2>
                    <TickBox
                      disabled={!proposalsCollection}
                      label={t('notSelected.label')}
                      labelPosition={LABEL_POSITION.END}
                      testId="notSelectedTickBox"
                      checked={notSelected}
                      onChange={() => setNotSelected(!notSelected)}
                    />
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      )}
      <Grid2 size={{ xs: 12 }} pt={1}>
        {!axiosViewError && (!filteredData || filteredData.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('proposals.empty')} testId="helpPanelId" />
        )}
        {!axiosViewError && filteredData.length > 0 && (
          <div>
            <DataGrid
              maxHeight={height}
              testId="dataGridId"
              rows={filteredData}
              columns={forReview ? reviewColumns : proposalColumns}
              height={DATA_GRID_HEIGHT}
            />
          </div>
        )}
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
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {openDeleteDialog && deleteClicked()}
      {openCloneDialog && cloneClicked()}
      {openViewDialog && viewClicked()}
    </>
  );
}
