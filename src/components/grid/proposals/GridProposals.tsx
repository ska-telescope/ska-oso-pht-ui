import React from 'react';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Tooltip, Typography, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { validateProposal } from '@utils/validation/validation';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import GetProposal from '@services/axios/get/getProposal/getProposal';
import GetProposalByStatusList from '@services/axios/get/getProposalByStatusList/getProposalByStatusList';
import EditIcon from '../../icon/editIcon/editIcon';
import TrashIcon from '../../icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Proposal from '@/utils/types/proposal';
import {
  NOT_SPECIFIED,
  PROPOSAL_STATUS,
  NAV,
  GENERAL,
  PROJECTS,
  SEARCH_PROPOSAL_TYPE_OPTIONS
} from '@/utils/constants';
import emptyCell from '@/components/fields/emptyCell/emptyCell';
import Investigator from '@/utils/types/investigator';
import { presentLatex } from '@/utils/present/present';
import CloneIcon from '@/components/icon/cloneIcon/cloneIcon';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import { storeProposalCopy } from '@/utils/storage/proposalData';
import ProposalDisplay from '@/components/alerts/proposalDisplay/ProposalDisplay';
import { IdObject } from '@/utils/types/idObject';
import { arraysAreEqual } from '@/utils/helpers';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import TriStateCheckbox from '@/components/fields/triStateCheckbox/TriStateCheckbox';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

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
  selectedProposals?: IdObject[];
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
  const { t } = useScopedTranslation();
  const { isSV } = useAppFlow();
  const navigate = useNavigate();

  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchScienceCategory, setSearchScienceCategory] = React.useState<number | null>(null);
  const [searchProposalType, setSearchProposalType] = React.useState('');

  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2,
    updateAppContent5
  } = storageObject.useStore();

  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');
  const [openCloneDialog, setOpenCloneDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openViewDialog, setOpenViewDialog] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);
  const [proposalsCollection, setProposalsCollection] = React.useState<IdObject[]>([]);
  const [checkState, setCheckState] = React.useState<'checked' | 'unchecked' | 'indeterminate'>(
    'indeterminate'
  );

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const authClient = useAxiosAuthClient();

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
  }, []);

  React.useEffect(() => {
    const fetchData = async (status: string) => {
      const response = await GetProposalByStatusList(authClient);
      const prevProposals = status === PROPOSAL_STATUS.UNDER_REVIEW ? [] : proposals;

      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposals([...prevProposals, ...response]);
      }
    };
    setProposals([]);
    fetchData(PROPOSAL_STATUS.UNDER_REVIEW);
    fetchData(PROPOSAL_STATUS.SUBMITTED);
  }, [fetchList]);

  React.useEffect(() => {
    if (selectedProposals && !arraysAreEqual(selectedProposals, proposalsCollection)) {
      setProposalsCollection(selectedProposals);
    }
  }, [selectedProposals]);

  const canEdit = (e: { row: { status: string } }) => e.row.status === PROPOSAL_STATUS.DRAFT;
  const canClone = () => true;
  // TODO const canDelete = (e: { row: { status: string } }) =>
  // TODO  e.row.status === PROPOSAL_STATUS.DRAFT || e.row.status === PROPOSAL_STATUS.WITHDRAWN;

  const isProposalSelected = (proposalId: string): boolean => {
    return proposalsCollection?.filter(entry => entry.id === proposalId)?.length > 0;
  };

  const displayProposalType = (proposalType: any) => {
    return proposalType ? proposalType : NOT_SPECIFIED;
  };

  const element = (inValue: number | string) => (inValue === NOT_SPECIFIED ? emptyCell() : inValue);

  const getAuthors = (arr: Investigator[]) => {
    if (!arr || arr.length === 0) {
      return element(NOT_SPECIFIED);
    }
    const results: any[] = [];
    arr.forEach(e => {
      results.push(e.lastName + ', ' + e.firstName);
    });
    return element(results.length > 1 ? results[0] + ' + ' + (results.length - 1) : results[0]);
  };

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

  const colPI = {
    field: 'pi',
    headerName: t('pi.short'),
    flex: 2,
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
      return getAuthors(e.row.investigators);
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
    colStatus,
    colScienceCategory,
    colType,
    colPI,
    ...(showActions ? [colActions] : [])
  ];

  const reviewColumns = [...[colType, colTitle, colAuthors, colScienceCategory]];

  const selectedData = proposals
    ? proposals.filter(e =>
        isProposalSelected(e.id) ? checkState !== 'unchecked' : checkState !== 'checked'
      )
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
    const response = await PutProposal(
      authClient,
      getProposal(),
      isSV(),
      PROPOSAL_STATUS.WITHDRAWN
    );
    if (response && !('error' in response)) {
      setOpenDeleteDialog(false);
      setFetchList(!fetchList);
    } else {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <>
      {showTitle && (
        <Grid p={2} size={{ lg: 12 }}>
          {ProposalsSectionTitle()}
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
              <Grid size={{ sm: 3 }}>{proposalTypeDropdown()}</Grid>
              <Grid size={{ sm: 3 }}>{scienceCategoryDropdown()}</Grid>
              <Grid size={{ sm: 5 }}>{searchEntryField('searchId')}</Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <Grid size={{ xs: 12 }} pt={1}>
        {!axiosViewError && (
          <div>
            <DataGrid
              maxHeight={height}
              testId="dataGridProposals"
              rows={filteredData}
              columns={forReview ? reviewColumns : proposalColumns}
              height={height}
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
      </Grid>
      {openDeleteDialog && deleteClicked()}
      {openCloneDialog && cloneClicked()}
      {openViewDialog && viewClicked()}
    </>
  );
}
