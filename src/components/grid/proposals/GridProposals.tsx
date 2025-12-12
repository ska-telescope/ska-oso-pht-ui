import React from 'react';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Typography, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { validateProposal } from '@utils/validation/validation';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import GetProposal from '@services/axios/get/getProposal/getProposal';
import EditIcon from '../../icon/editIcon/editIcon';
import TrashIcon from '../../icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import {
  getColAuthors,
  getColProposalPI,
  getColProposalSC,
  getColProposalStatus,
  getColProposalTitle,
  getColProposalType
} from './columns/Columns';
import GetProposalsReviewable from '@/services/axios/get/getProposalsReviewable/getProposalsReviewable';
import Proposal from '@/utils/types/proposal';
import {
  PROPOSAL_STATUS,
  NAV,
  DETAILS,
  PROJECTS,
  SEARCH_PROPOSAL_TYPE_OPTIONS
} from '@/utils/constants';
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
import { useHelp } from '@/utils/help/useHelp';

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
  selectedProposals?: IdObject[];
  forReview?: boolean;
  showSearch?: boolean;
  showTitle?: boolean;
  showSelection?: boolean;
  showActions?: boolean;
  tickBoxClicked?: (proposal: Proposal, isProposalSelected: boolean) => void;
}

export default function GridProposals({
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
  const { setHelp } = useHelp();

  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchScienceCategory, setSearchScienceCategory] = React.useState<number | null>(null);
  const [searchProposalType, setSearchProposalType] = React.useState('');

  const {
    application,
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
      const response = await GetProposalsReviewable(authClient);
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

  const proposalColumns = isSV()
    ? [
        ...(showSelection ? [colSelect] : []),
        ...(showActions ? [colActions] : []),
        getColProposalTitle(t),
        getColProposalStatus(t),
        getColProposalSC(t),
        getColProposalPI(t)
      ]
    : [
        ...(showSelection ? [colSelect] : []),
        ...(showActions ? [colActions] : []),
        getColProposalTitle(t),
        getColProposalStatus(t),
        getColProposalSC(t),
        getColProposalType(t),
        getColProposalPI(t)
      ];

  const reviewColumns = isSV()
    ? [...[getColProposalTitle(t), getColAuthors(t), getColProposalSC(t)]]
    : [...[getColProposalType(t), getColProposalTitle(t), getColAuthors(t), getColProposalSC(t)]];

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
    <Box pt={1}>
      <DropDown
        options={[{ label: t('scienceCategory.all'), value: null }, ...DETAILS.ScienceCategory]}
        testId="proposalScienceCategory"
        value={searchScienceCategory}
        setValue={setSearchScienceCategory}
        label={t('scienceCategory.all')}
      />
    </Box>
  );

  const proposalTypeDropdown = () => (
    <Box pt={1}>
      <DropDown
        options={[{ label: t('proposalType.all'), value: '' }, ...SEARCH_PROPOSAL_TYPE_OPTIONS]}
        testId="proposalType"
        value={searchProposalType}
        setValue={setSearchProposalType}
        label={t('proposalType.all')}
      />
    </Box>
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
    setHelp('');
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

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  React.useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const TITLE_HEIGHT = 120;
  const SEARCH_HEIGHT = 120;
  const interimHeight = showTitle ? containerHeight - TITLE_HEIGHT : containerHeight;
  const finalHeight = showSearch ? `${interimHeight - SEARCH_HEIGHT}px` : `${interimHeight}px`;

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {showTitle && (
        <Grid container size={{ lg: 12 }}>
          {ProposalsSectionTitle()}
        </Grid>
      )}

      {showSearch && (
        <Grid
          pb={2}
          size={{ sm: 12 }}
          container
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid size={{ sm: 3 }}>{proposalTypeDropdown()}</Grid>
          <Grid size={{ sm: 3 }}>{scienceCategoryDropdown()}</Grid>
          <Grid size={{ sm: 5 }}>{searchEntryField('searchId')}</Grid>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        {!axiosViewError && (
          <div>
            <DataGrid
              maxHeight={finalHeight}
              testId="dataGridProposals"
              rows={filteredData}
              columns={forReview ? reviewColumns : proposalColumns}
              height={finalHeight}
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
    </Box>
  );
}
