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
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import GetProposalReviewList from '../../services/axios/getProposalReviewList/getProposalReviewList';
import GetProposal from '../../services/axios/getProposal/getProposal';
import { SEARCH_TYPE_OPTIONS, BANNER_PMT_SPACER } from '../../utils/constants';
import ScienceIcon from '../../components/icon/scienceIcon/scienceIcon';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Proposal from '../../utils/types/proposal';
import { validateProposal } from '../../utils/proposalValidation';
import { FOOTER_SPACER } from '../../utils/constants';

import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { PMT } from '@/utils/constants';
import SubmitButton from '@/components/button/Submit/Submit';
import { ProposalReview } from '@/utils/types/proposalReview';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import GetPanelList from '@/services/axios/getPanelList/getPanelList';
import { Panel } from '@/utils/types/panel';
import TechnicalIcon from '@/components/icon/technicalIcon/technicalIcon';

/*
 * Process for retrieving the data for the list
 *
 * 1. Fetch the list of proposals IDs that are in the panel that the user is in
 * 2. For each proposal ID, fetch the details of the proposal
 * 3. Fetch the details of the proposal's review decisions
 * 4. Combine the data into a single array of objects
 *
 * NOTE
 * Step 1 : There is not a endpoint to retrieve all proposals by status, so all are currently retrieved
 *
 * Step 2 is currently inefficient as the appropriate endpoint is not available
 * In the meantime, the list of proposals is being retrieved and being filtered
 */

export default function ReviewListPage() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const { clearApp, updateAppContent1, updateAppContent2 } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const [panelData, setPanelData] = React.useState<Panel[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);
  const [axiosError, setAxiosError] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');

  const DATA_GRID_HEIGHT = '60vh';

  React.useEffect(() => {
    const GetReviewPanels = async () => {
      const response = await GetPanelList(); // TODO : Add the user_id as a property to the function
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setPanelData((response as unknown) as Panel[]);
      }
    };
    GetReviewPanels();
  }, []);

  React.useEffect(() => {
    const fetchProposalData = async () => {
      const response = await GetProposalList(); // TODO : Temporary implementation to get all proposals
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        const panelProposalIds = panelData.flatMap(panel =>
          Array.isArray(panel.proposals) ? panel.proposals.map(proposal => proposal.proposalId) : []
        );
        const filtered = response
          ? response.filter((proposal: Proposal) => panelProposalIds.includes(proposal.id))
          : [];
        setProposals(filtered);
      }
    };
    const fetchProposalReviewData = async () => {
      const response = await GetProposalReviewList(); // TODO : Get reviews for the user
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setProposalReviews(response);
      }
    };
    fetchProposalData();
    fetchProposalReviewData();
  }, [panelData]);

  const getTheProposal = async (id: string) => {
    clearApp();

    const response = await GetProposal(id);
    if (typeof response === 'string') {
      setAxiosViewError(response);
      return false;
    } else {
      updateAppContent1(validateProposal(response));
      updateAppContent2(response);
      validateProposal(response);
      return true;
    }
  };

  const scienceIconClicked = (row: any) => {
    getTheProposal(row.id).then(success => {
      if (success) {
        navigate(PMT[5], { replace: true, state: row });
      } else {
        setAxiosViewError(t('proposal.error'));
      }
    });
  };

  const technicalIconClicked = (row: any) => {
    getTheProposal(row.id).then(success => {
      if (success) {
        navigate(PMT[7], { replace: true, state: row });
      } else {
        setAxiosViewError(t('proposal.error'));
      }
    });
  };

  const submitIconClicked = (_row: any) => {
    // TODO : Implement submit icon functionality
  };

  const canEditScience = (_e: { row: { status: string } }) => true; // TODO
  const canEditTechnical = (_e: { row: { status: string } }) => true; // TODO

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

  const colReviewStatus = {
    field: 'status',
    headerName: t('status.label'),
    width: 120,
    renderCell: (e: { row: any }) =>
      e.row.reviewId ? t('reviewStatus.' + e.row.status) : t('reviewStatus.to do')
  };

  const colRank = {
    field: 'rank',
    headerName: t('rank.label'),
    width: 120,
    renderCell: (e: { row: any }) => e.row.rank
  };

  // TODO : Add the functionality so that clicking on this will show the conflict modal
  const colConflict = {
    field: 'conflict',
    headerName: t('conflict.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.conflict?.has_conflict ? t('yes') : t('no'))
  };

  const colComments = {
    field: 'comments',
    headerName: t('comments.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.comments ? t('yes') : t('no'))
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
    renderCell: (e: { row: any }) => (e.row.src_net ? t('yes') : t('no'))
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
        <ScienceIcon
          onClick={() => scienceIconClicked(e.row)}
          disabled={!canEditScience(e)}
          toolTip={t(canEditScience(e) ? 'reviewProposal.science' : 'reviewProposal.disabled')}
        />
        <TechnicalIcon
          onClick={() => technicalIconClicked(e.row)}
          disabled={!canEditTechnical(e)}
          toolTip={t(canEditTechnical(e) ? 'reviewProposal.technical' : 'reviewProposal.disabled')}
        />
        <SubmitIcon
          onClick={() => submitIconClicked(e.row.id)}
          disabled
          toolTip={t('submitBtn.tooltip')}
        />
      </>
    )
  };

  const stdColumns = [
    ...[
      colId,
      colTitle,
      colScienceCategory,
      colReviewStatus,
      colConflict,
      colRank,
      colComments,
      colSrcNet,
      colDateUpdated,
      colDateAssigned,
      colActions
    ]
  ];

  function filterProposals() {
    function unionProposalsAndReviews() {
      // Merge proposals with their corresponding review (if any)
      return proposals.map(proposal => {
        const review = proposalReviews.find(r => r.prslId === proposal.id);
        return {
          ...proposal,
          ...(review ? review : { rank: 0, comments: '', srcNetComments: '' })
        };
      });
    }

    return unionProposalsAndReviews().filter(item => {
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
    // TODO : Add the functionality so that clicking on this will update all appropriate reviews to submitted
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
      <PageBannerPMT title={t('reviewProposalList.title')} fwdBtn={fwdButton()} />
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
