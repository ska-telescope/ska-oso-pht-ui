import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid2 } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { presentDate, presentLatex, presentTime } from '@utils/present/present';
import GetProposalReviewList from '@services/axios/getProposalReviewList/getProposalReviewList.tsx';
import {
  SEARCH_TYPE_OPTIONS,
  BANNER_PMT_SPACER,
  PANEL_DECISION_STATUS,
  REVIEW_TYPE,
  FEASIBLE_NO
} from '@utils/constants.ts';
import ScienceIcon from '../../components/icon/scienceIcon/scienceIcon';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Proposal from '../../utils/types/proposal';
import Notification from '../../utils/types/notification';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { PMT, PROPOSAL_STATUS } from '@/utils/constants';
import SubmitButton from '@/components/button/Submit/Submit';
import { ProposalReview, ScienceReview, TechnicalReview } from '@/utils/types/proposalReview';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import GetPanelList from '@/services/axios/getPanelList/getPanelList';
import { Panel } from '@/utils/types/panel';
import TechnicalIcon from '@/components/icon/technicalIcon/technicalIcon';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import PostProposalReview from '@/services/axios/postProposalReview.tsx/postProposalReview';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import GetProposalByStatusList from '@/services/axios/getProposalByStatusList/getProposalByStatusList';
import GetProposal from '@services/axios/getProposal/getProposal.tsx';

/*
 * Process for retrieving the data for the list
 *
 * 1. Fetch the list of proposals IDs that are in the panel that the user is in
 * 2. For each proposal ID, fetch the details of the proposal
 * 3. Fetch the details of the proposal's review decisions
 * 4. Combine the data into a single array of objects
 *
 * NOTE
 * Step 2 is currently inefficient as the appropriate endpoint is not available
 * In the meantime, the list of proposals is being retrieved and being filtered
 */

export default function ReviewListPage() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const { application,updateAppContent2, updateAppContent5 } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const [reset, setReset] = React.useState(false);
  const [panelData, setPanelData] = React.useState<Panel[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);
  const getObservatoryData = () => application.content3 as ObservatoryData;
  const getCycleId = () => getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId;

  const authClient = useAxiosAuthClient();

  const DATA_GRID_HEIGHT = '60vh';

  React.useEffect(() => {
    setReset(!reset);
  }, []);

  React.useEffect(() => {
    const GetReviewPanels = async () => {
      const response = await GetPanelList(); // TODO : Add the user_id as a property to the function
      if (typeof response === 'string') {
        NotifyError(response);
      } else {
        setPanelData((response as unknown) as Panel[]);
      }
    };
    GetReviewPanels();
  }, [reset]);

  React.useEffect(() => {
    const fetchProposalReviewData = async (proposalId: string) => {
      const response = await GetProposalReviewList(authClient, proposalId); // TODO : add id of the logged in user
      if (typeof response === 'string') {
        NotifyError(response);
      } else {
        setProposalReviews(proposalReviews => [...proposalReviews, ...response]);
      }
    };

    const loopProposals = (filtered: Proposal[]) => {
      filtered.map(el => {
        fetchProposalReviewData(el.id);
        return el.id;
      });
    };

    const fetchProposalData = async () => {
      const response = await GetProposalByStatusList(authClient, PROPOSAL_STATUS.SUBMITTED); // TODO : Temporary implementation to get all submitted proposals
      if (typeof response === 'string') {
        NotifyError(response);
      } else {
        const panelProposalIds = panelData.flatMap(panel =>
          Array.isArray(panel.proposals) ? panel.proposals.map(proposal => proposal.proposalId) : []
        );
        const filtered = response
          ? response.filter((proposal: Proposal) => panelProposalIds.includes(proposal.id))
          : [];
        setProposals(filtered);
        loopProposals(filtered);
      }
    };
    fetchProposalData();
  }, [panelData]);

  const getUser = () => 'DefaultUser'; // TODO

  const getScienceReviewType = (row: any): ScienceReview => {
    return {
      kind: row.reviewType.kind,
      excludedFromDecision: false,
      rank: row.reviewType.rank,
      conflict: {
        hasConflict: false,
        reason: ''
      }
    };
  };

  const getTechnicalReviewType = (row: any): TechnicalReview => {
    return {
      kind: row.reviewType.kind,
      feasibility: {
        isFeasible: row.reviewType.feasibility.isFeasible,
        comments: row.reviewType.feasibility.comments
      }
    };
  };

  const getReview = (row: any): ProposalReview | null => {
    const review = proposalReviews.find(p => p.id === row.reviewId);
    if (!review) return null;
    return {
      id: review.id,
      prslId: row.id,
      reviewType:
        review.reviewType.kind === REVIEW_TYPE.SCIENCE
          ? getScienceReviewType(review)
          : getTechnicalReviewType(review),
      comments: review.comments,
      srcNet: review.srcNet,
      metadata: {
        version: 0,
        created_by: '',
        created_on: '',
        pdm_version: '',
        last_modified_by: '',
        last_modified_on: ''
      },
      panelId: getCycleId(),
      cycle: '',
      reviewerId: getUser(),
      submittedOn: '',
      submittedBy: '',
      status: PANEL_DECISION_STATUS.DECIDED
    };
  };

  /*---------------------------------------------------------------------------*/

  function Notify(str: string, lvl = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str
    };
    updateAppContent5(rec);
  }

  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);

  const updateReview = async (row: any) => {
    const rec = getReview(row);
    if (!rec) {
      NotifyError('Unable to find review'); // TODO : Should check this and add to json
    }
    const response: string | { error: string } = await PostProposalReview(
      rec as ProposalReview,
      getObservatoryData().observatoryPolicy?.cycleInformation?.cycleId
    );
    if (typeof response === 'object' && response?.error) {
      NotifyError(response?.error);
    } else {
      NotifyOK(t('addReview.success'));
    }
  };

  /*---------------------------------------------------------------------------*/
  const getTheProposal = async (id: string) => {
    const response = await GetProposal(authClient, id);
    if (typeof response === 'string') {
      updateAppContent2({});
      return false;
    } else {
      updateAppContent2(response);
      return true;
    }
  };
  const theIconClicked = (row: any, route: string) => {
    getTheProposal(row.id);
    navigate(route, { replace: true, state: row });
  }
  const scienceIconClicked = (row: any) => theIconClicked(row, PMT[5]);
  const technicalIconClicked = (row: any) => theIconClicked(row, PMT[6]);

  const submitIconClicked = (row: any) => {
    updateReview(row);
  };

  const isFeasible = (row: { tecReview: any; sciReview?: { status: string } }) =>
    row.tecReview.reviewType.feasibility.isFeasible
      ? row.tecReview.reviewType.feasibility.isFeasible !== FEASIBLE_NO
      : true;
  const canEditScience = (row: {
    tecReview: { reviewType: { feasibility: { isFeasible: string } } };
    sciReview: { status: string };
  }) => {
    return isFeasible(row) && row?.sciReview.status !== PANEL_DECISION_STATUS.DECIDED;
  };

  const canEditTechnical = (tecReview: { status: string }) =>
    tecReview.status !== PANEL_DECISION_STATUS.DECIDED;
  const canSubmit = (row: { srcNet: any; comments: any; rank: number; status: string }) =>
    row.status !== PANEL_DECISION_STATUS.DECIDED && row?.rank > 0 && row?.comments?.length;

  const colId = {
    field: 'prslId',
    headerName: t('proposalId.label'),
    width: 200,
    renderCell: (e: any) => e.row.proposal?.id
  };

  const colTitle = {
    field: 'title',
    headerName: t('title.label'),
    flex: 3,
    minWidth: 250,
    renderCell: (e: any) => presentLatex(e.row.proposal?.title)
  };

  const colScienceCategory = {
    field: 'scienceCategory',
    headerName: t('scienceCategory.label'),
    width: 120,
    renderCell: (e: { row: any }) =>
      e.row.proposal.scienceCategory ? t('scienceCategory.' + e.row.proposal?.scienceCategory) : ''
  };

  const colSciReviewStatus = {
    field: 'sciStatus',
    headerName: t('status.sci'),
    width: 120,
    renderCell: (e: { row: any }) =>
      e.row.sciReview.status ? t('reviewStatus.' + e.row.sciReview.status) : t('reviewStatus.to do')
  };

  const colTecReviewStatus = {
    field: 'tecStatus',
    headerName: t('status.tec'),
    width: 120,
    renderCell: (e: { row: any }) =>
      e.row.tecReview.status ? t('reviewStatus.' + e.row.tecReview.status) : t('reviewStatus.to do')
  };

  const colFeasibility = {
    field: 'feasibility',
    headerName: t('feasibility.label'),
    width: 120,
    renderCell: (e: { row: any }) => {
      return e?.row?.tecReview?.reviewType?.feasibility?.isFeasible; // TODO use i18n
    }
  };

  // TODO : Add the functionality so that clicking on this will show the conflict modal
  const colConflict = {
    field: 'conflict',
    headerName: t('conflict.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.sciReview.conflict?.has_conflict ? t('yes') : t('no'))
  };

  const colRank = {
    field: 'rank',
    headerName: t('rank.label'),
    width: 120,
    renderCell: (e: { row: any }) => e.row.sciReview.reviewType.rank
  };

  const colComments = {
    field: 'comments',
    headerName: t('comments.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.sciReview.comments ? t('yes') : t('no'))
  };

  const colSrcNet = {
    field: 'srcNet',
    headerName: t('srcNet.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.sciReview.srcNet ? t('yes') : t('no'))
  };

  const colDateUpdated = {
    field: 'lastUpdated',
    headerName: t('updated.label'),
    width: 180,
    renderCell: (e: { row: any }) => {
      return (
        presentDate(e.row.proposal?.lastUpdated) + ' ' + presentTime(e.row.proposal?.lastUpdated)
      );
    }
  };

  const colDateAssigned = {
    field: 'dateAssigned',
    headerName: t('dateAssigned.label'),
    width: 180,
    renderCell: (e: { row: any }) => {
      const panel = panelData.find(
        panel =>
          Array.isArray(panel.proposals) &&
          panel.proposals.some(p => p.proposalId === e.row.proposal?.id)
      );
      let proposal = null;
      if (panel && panel.proposals && panel.proposals.length > 0) {
        proposal = panel.proposals.find(p => p.proposalId === e.row.proposal?.id);
      }
      // TODO : Add the functionality to get the reviewer from the panel
      // if (panel && panel.reviewers && panel.reviewers.length > 0) {
      //   const reviewer = panel.reviewers.find(r => r.userId === getUser());
      // }
      return proposal && proposal.assignedOn
        ? presentDate(proposal.assignedOn) + ' ' + presentTime(proposal.assignedOn)
        : '';
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
        <TechnicalIcon
          onClick={() => technicalIconClicked(e.row)}
          disabled={!canEditTechnical(e.row.tecReview)}
          toolTip={t(
            canEditTechnical(e.row.tecReview)
              ? 'reviewProposal.technical'
              : 'reviewProposal.disabled'
          )}
        />
        <ScienceIcon
          onClick={() => scienceIconClicked(e.row)}
          disabled={!canEditScience(e.row)}
          toolTip={t(canEditScience(e.row) ? 'reviewProposal.science' : 'reviewProposal.disabled')}
        />
        <SubmitIcon
          onClick={() => submitIconClicked(e.row)}
          disabled={!canSubmit(e.row)}
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
      colConflict,
      colTecReviewStatus,
      colFeasibility,
      colSciReviewStatus,
      colRank,
      colComments,
      colSrcNet,
      colDateUpdated,
      colDateAssigned,
      colActions
    ]
  ];

  const blankReviewSci = (panelId: string, status: any) => {
    return {
      panelId: panelId,
      reviewType: {
        rank: 0
      },
      comments: '',
      srcNet: '',
      status: status
    };
  };

  const blankReviewTec = (panelId: string, status: any) => {
    return {
      panelId: panelId,
      reviewType: {
        feasibility: {
          isFeasible: '',
          comments: ''
        }
      },
      comments: '',
      srcNet: '',
      status: status
    };
  };

  function filterProposals() {
    function unionProposalsAndReviews() {
      return proposals.map(proposal => {
        const reviews = proposalReviews.filter(r => r.prslId === proposal.id);
        const technicalReviews = reviews.filter(r => r.reviewType?.kind === REVIEW_TYPE.TECHNICAL);
        const technicalReview =
          technicalReviews.length > 0
            ? technicalReviews[technicalReviews.length - 1]
            : blankReviewTec(panelData[0].id, 'To Do');
        const scienceReviews = reviews.filter(r => r.reviewType?.kind === REVIEW_TYPE.SCIENCE);
        const scienceReview =
          scienceReviews.length > 0
            ? scienceReviews[scienceReviews.length - 1]
            : blankReviewSci(panelData[0].id, 'To Do');
        return {
          id: proposal.id,
          proposal: proposal,
          sciReview: scienceReview,
          tecReview: technicalReview
        };
      });
    }

    return unionProposalsAndReviews().filter(item => {
      const fieldsToSearch = [item.proposal.id, item.proposal.title];
      return (
        fieldsToSearch.some(
          field =>
            typeof field === 'string' && field.toLowerCase().includes(searchTerm?.toLowerCase())
        ) &&
        (searchType === '' || item.sciReview?.status?.toLowerCase() === searchType?.toLowerCase())
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

  const submitAllDisabled = () => {
    let disabled = true;
    filteredData.forEach(row => {
      if (canSubmit(row)) {
        disabled = false;
      }
    });
    return disabled;
  };

  const submitAllClicked = async () => {
    for (const row of filteredData) {
      if (canSubmit(row)) {
        await updateReview(row);
      }
    }
    setReset(!reset); // Reset the state to refresh the data
  };

  const fwdButton = () => (
    <SubmitButton
      action={submitAllClicked}
      disabled={submitAllDisabled()}
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
          {(!filteredData || filteredData.length === 0) && (
            <Alert color={AlertColorTypes.Info} text={t('proposals.empty')} testId="helpPanelId" />
          )}
          {filteredData.length > 0 && (
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
      <PageFooterPMT />
    </>
  );
}
