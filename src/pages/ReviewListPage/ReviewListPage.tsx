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
  FEASIBLE_NO,
  DEFAULT_USER,
  FEASIBLE_YES
} from '@utils/constants.ts';
import ScienceIcon from '../../components/icon/scienceIcon/scienceIcon';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Proposal from '../../utils/types/proposal';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { PMT, PROPOSAL_STATUS } from '@/utils/constants';
import SubmitButton from '@/components/button/Submit/Submit';
import { ProposalReview, ScienceReview, TechnicalReview } from '@/utils/types/proposalReview';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import GetPanelList from '@/services/axios/getPanelList/getPanelList';
import { Panel } from '@/utils/types/panel';
import TechnicalIcon from '@/components/icon/technicalIcon/technicalIcon';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import PostProposalReview from '@/services/axios/post/postProposalReview/postProposalReview';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import GetProposalByStatusList from '@/services/axios/getProposalByStatusList/getProposalByStatusList';
import { useNotify } from '@/utils/notify/useNotify';
import { getUserId } from '@/utils/aaa/aaaUtils';

export default function ReviewListPage() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotify();

  const { application } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const [reset, setReset] = React.useState(false);
  const [panelData, setPanelData] = React.useState<Panel[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);
  const getObservatoryData = () => application.content3 as ObservatoryData;
  const getCycleId = () => getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId;

  const authClient = useAxiosAuthClient();
  const userId = getUserId();

  const DATA_GRID_HEIGHT = '60vh';

  React.useEffect(() => {
    setReset(!reset);
  }, []);

  React.useEffect(() => {
    const GetReviewPanels = async () => {
      const response = await GetPanelList(authClient);
      if (typeof response === 'string') {
        notifyError(response);
      } else {
        setPanelData((response as unknown) as Panel[]);
      }
    };
    GetReviewPanels();
  }, [reset]);

  React.useEffect(() => {
    const fetchProposalReviewData = async (_proposalId: string) => {
      const response = await GetProposalReviewList(authClient, DEFAULT_USER);
      if (typeof response === 'string') {
        notifyError(response);
      } else {
        setProposalReviews(proposalReviews => [...proposalReviews, ...response]);
      }
    };

    const loopProposals = (_filtered: Proposal[]) => {
      // filtered.map(el => {
      // TODO : Need to sort this out
      fetchProposalReviewData('1');
      //   return el.id;
      //  });
    };

    const fetchProposalData = async () => {
      const response = await GetProposalByStatusList(authClient, PROPOSAL_STATUS.SUBMITTED); // TODO : Temporary implementation to get all submitted proposals
      if (typeof response === 'string') {
        notifyError(response);
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

  const getScienceReviewType = (row: any): ScienceReview => {
    return {
      kind: REVIEW_TYPE.SCIENCE,
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
      reviewerId: userId,
      submittedOn: '',
      submittedBy: '',
      status: PANEL_DECISION_STATUS.DECIDED
    };
  };

  /*---------------------------------------------------------------------------*/

  const updateReview = async (row: any) => {
    const rec = getReview(row);
    if (!rec) {
      notifyError('Unable to find review'); // TODO : Should check this and add to json
    }
    const response: string | { error: string } = await PostProposalReview(
      authClient,
      rec as ProposalReview,
      getObservatoryData().observatoryPolicy?.cycleInformation?.cycleId
    );
    if (typeof response === 'object' && response?.error) {
      notifyError(response?.error);
    } else {
      notifySuccess(t('addReview.success'));
    }
  };

  /*---------------------------------------------------------------------------*/

  const theIconClicked = (row: any, route: string) =>
    navigate(route, { replace: true, state: row });
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

  const hasTechnicalComments = (review: any) =>
    feasibleYes(review) ? true : review?.reviewType?.feasibility?.comments?.length > 0;
  const feasibleYes = (review: any) => review?.reviewType?.feasibility?.isFeasible === FEASIBLE_YES;

  const canSubmit = (row: any) => {
    const sciRec =
      row?.sciReview.status !== PANEL_DECISION_STATUS.DECIDED &&
      row?.sciReview?.comments?.length > 0 &&
      row?.sciReview?.reviewType?.rank > 0;

    const tecRec =
      row?.tecReview.status !== PANEL_DECISION_STATUS.DECIDED &&
      row?.tecReview?.reviewType?.feasibility?.isFeasible?.length > 0 &&
      hasTechnicalComments(row?.tecReview);

    return sciRec || tecRec;
  };
  // row.status !== PANEL_DECISION_STATUS.DECIDED && row?.rank > 0 && row?.comments?.length;

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
        const scienceReviews = reviews.filter(
          r => r.reviewType?.kind === REVIEW_TYPE.SCIENCE && r.reviewerId === userId
        );
        const scienceReview =
          scienceReviews.length > 0 ? scienceReviews[0] : blankReviewSci(panelData[0].id, 'To Do');
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
