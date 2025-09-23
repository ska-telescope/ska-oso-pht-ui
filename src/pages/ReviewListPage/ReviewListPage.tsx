import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Tooltip, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DataGrid,
  DropDown,
  SearchEntry,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { presentDate, presentLatex, presentTime } from '@utils/present/present';
import GetProposalReviewList from '@services/axios/get/getProposalReviewList/getProposalReviewList.tsx';
import {
  SEARCH_TYPE_OPTIONS,
  BANNER_PMT_SPACER,
  PANEL_DECISION_STATUS,
  REVIEW_TYPE,
  FEASIBLE_NO,
  FEASIBLE_YES,
  CONFLICT_REASONS
} from '@utils/constants.ts';
import GetPanelList from '@services/axios/get/getPanelList/getPanelList';
import GetProposalByStatusList from '@services/axios/get/getProposalByStatusList/getProposalByStatusList';
import ScienceIcon from '../../components/icon/scienceIcon/scienceIcon';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Proposal from '../../utils/types/proposal';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { PMT } from '@/utils/constants';
import SubmitButton from '@/components/button/Submit/Submit';
import { ProposalReview, ScienceReview, TechnicalReview } from '@/utils/types/proposalReview';
import SubmitIcon from '@/components/icon/submitIcon/submitIcon';
import { Panel } from '@/utils/types/panel';
import TechnicalIcon from '@/components/icon/technicalIcon/technicalIcon';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import PostProposalReview from '@/services/axios/post/postProposalReview/postProposalReview';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import { getUserId, isReviewerScience, isReviewerTechnical } from '@/utils/aaa/aaaUtils';
import ConflictConfirmation from '@/components/alerts/conflictConfirmation/ConflictConfirmation';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function ReviewListPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotify();

  const { application } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const [conflictConfirm, setConflictConfirm] = React.useState(false);
  const [conflictRow, setConflictRow] = React.useState<{
    proposal: Proposal;
    sciReview: ProposalReview;
    tecReview: ProposalReview | null;
  } | null>(null);
  const [conflictRoute, setConflictRoute] = React.useState('');
  const [filteredData, setFilteredData] = React.useState([]);

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
      const response = await GetProposalReviewList(authClient);
      if (typeof response === 'string') {
        notifyError(response);
      } else {
        setProposalReviews(response);
      }
    };

    const loopProposals = (_filtered: Proposal[]) => {
      fetchProposalReviewData('1');
    };

    const fetchProposalData = async () => {
      const response = await GetProposalByStatusList(authClient);
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

  React.useEffect(() => {
    const data = proposals ? filterProposals() : [];
    setFilteredData(data);
  }, [proposals, proposalReviews]);

  const getScienceReviewType = (row: any): ScienceReview => {
    return {
      kind: REVIEW_TYPE.SCIENCE,
      excludedFromDecision: false,
      rank: row?.reviewType.rank,
      conflict: {
        hasConflict: false,
        reason: ''
      }
    };
  };

  const getTechnicalReviewType = (row: any): TechnicalReview => {
    return {
      kind: row?.reviewType.kind,
      isFeasible: row?.reviewType.isFeasible
    };
  };

  const getReview = (row: any): ProposalReview | null => {
    const review = proposalReviews.find(p => p.id === row.reviewId);
    if (!review) return null;
    return {
      id: review.id,
      prslId: row.id,
      reviewType:
        review?.reviewType.kind === REVIEW_TYPE.SCIENCE
          ? getScienceReviewType(review)
          : getTechnicalReviewType(review),
      comments: review?.comments,
      srcNet: review?.srcNet,
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
      status: PANEL_DECISION_STATUS.REVIEWED
    };
  };

  /*---------------------------------------------------------------------------*/

  const updateReviewRec = async (rec: any) => {
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

  const updateReview = async (row: any) => {
    updateReviewRec(getReview(row));
  };

  /*---------------------------------------------------------------------------*/

  const conflictConfirmation = () =>
    conflictRow ? (
      <ConflictConfirmation
        proposal={conflictRow.proposal}
        open={conflictConfirm}
        onClose={() => {
          return;
        }}
        onConfirm={conflictDeclarationResponse}
        onConfirmLabel={'conflict.button'}
        onConfirmToolTip={'conflict.tooltip'}
      />
    ) : (
      <></>
    );

  const conflictDeclarationResponse = (reason: string) => {
    if (reason === 'cancel') {
      setConflictConfirm(false);
      return;
    } else if (conflictRow) {
      const conflict = {
        hasConflict: reason !== CONFLICT_REASONS[0],
        reason: reason
      };
      const updatedRow = {
        ...conflictRow,
        sciReview: {
          ...conflictRow.sciReview,
          reviewType: {
            ...conflictRow.sciReview.reviewType,
            conflict: conflict
          }
        }
      };
      setConflictRow(updatedRow);
      if (reason === CONFLICT_REASONS[0]) {
        // Do not save, as this should be done as part of the review submission
        setConflictConfirm(false);
        navigate(conflictRoute, { replace: true, state: updatedRow });
      } else {
        let forDB = null;
        const updatedProposalReviews = proposalReviews.map(review => {
          let rec = review;
          if (review.id === conflictRow?.sciReview.id) {
            rec.reviewType.conflict.reason = reason;
            rec.reviewType.conflict.hasConflict = reason !== CONFLICT_REASONS[0];
            rec.status = PANEL_DECISION_STATUS.REVIEWED;
            rec.reviewType.excludedFromDecision = true;
            forDB = rec;
          }
          return rec;
        });
        setProposalReviews(updatedProposalReviews);
        setConflictConfirm(false);
        updateReviewRec(forDB);
      }
    }
  };

  const theIconClicked = (row: any, route: string) => {
    if (route === PMT[5]) {
      setConflictConfirm(true);
      setConflictRow(row);
      setConflictRoute(route);
    } else {
      navigate(route, { replace: true, state: row });
    }
  };
  const scienceIconClicked = (row: any) => theIconClicked(row, PMT[5]);
  const technicalIconClicked = (row: any) => theIconClicked(row, PMT[6]);

  const submitIconClicked = (row: any) => {
    updateReview(row);
  };

  const feasibleYes = (review: any) => review?.reviewType?.isFeasible === FEASIBLE_YES;
  const feasibleNo = (review: any) => review?.reviewType?.isFeasible === FEASIBLE_NO;

  const isFeasible = (row: { tecReview: any; sciReview?: { status: string } }) =>
    row.tecReview?.reviewType.isFeasible ? !feasibleNo(row.tecReview) : true;

  const canEditScience = (row: {
    tecReview: { reviewType: { isFeasible: string } };
    sciReview: { status: string; reviewType: { conflict: { hasConflict: boolean } } };
  }) => {
    console.log(
      'TREVOR',
      isReviewerScience(),
      row?.sciReview,
      isFeasible(row),
      row?.sciReview?.reviewType.conflict.hasConflict !== true,
      row?.sciReview?.status !== PANEL_DECISION_STATUS.REVIEWED
    );
    return (
      isReviewerScience() &&
      row?.sciReview &&
      isFeasible(row) &&
      row?.sciReview?.reviewType.conflict.hasConflict !== true &&
      row?.sciReview?.status !== PANEL_DECISION_STATUS.REVIEWED
    );
  };

  const canEditTechnical = (tecReview: { status: string }) =>
    isReviewerTechnical() && tecReview && tecReview?.status !== PANEL_DECISION_STATUS.REVIEWED;

  const hasTechnicalComments = (review: any) =>
    feasibleYes(review) ? true : review?.comments?.length > 0;

  const canSubmit = (row: any) => {
    const sciRec =
      isReviewerScience() &&
      row?.sciReview?.status !== PANEL_DECISION_STATUS.REVIEWED &&
      row?.sciReview?.comments?.length > 0 &&
      row?.sciReview?.reviewType?.rank > 0;

    const tecRec =
      isReviewerTechnical() &&
      row?.tecReview?.status !== PANEL_DECISION_STATUS.REVIEWED &&
      row?.tecReview?.reviewType?.isFeasible?.length > 0 &&
      hasTechnicalComments(row?.tecReview);

    return sciRec || tecRec;
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
      e.row?.sciReview?.status
        ? t('reviewStatus.' + e.row?.sciReview?.status.toLowerCase())
        : t('reviewStatus.to do')
  };

  const colTecReviewStatus = {
    field: 'tecStatus',
    headerName: t('status.tec'),
    width: 120,
    renderCell: (e: { row: any }) =>
      e.row.tecReview?.status
        ? t('reviewStatus.' + e.row.tecReview?.status.toLowerCase())
        : t('reviewStatus.to do')
  };

  const colFeasibility = {
    field: 'feasibility',
    headerName: t('feasibility.label'),
    width: 120,
    renderCell: (e: { row: any }) => {
      const str = e?.row?.tecReview?.reviewType?.isFeasible;
      return str ? t(str) : '';
    }
  };

  const colConflict = {
    field: 'conflict',
    headerName: t('conflict.column'),
    width: 120,
    renderCell: (e: { row: any }) => {
      const conflict = e.row?.sciReview?.reviewType?.conflict;
      const hasConflict = conflict?.hasConflict;
      const reason = conflict?.reason;
      const label = hasConflict ? t('yes') : t('no');

      return reason ? (
        <Tooltip title={t('conflict.reason.' + reason)}>
          <Typography pt={2} variant="body2">
            {label}
          </Typography>
        </Tooltip>
      ) : (
        <></>
      );
    }
  };

  const colRank = {
    field: 'rank',
    headerName: t('rank.label'),
    width: 120,
    renderCell: (e: { row: any }) => e.row.sciReview?.reviewType.rank
  };

  const colComments = {
    field: 'comments',
    headerName: t('comments.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.sciReview?.comments ? t('yes') : t('no'))
  };

  const colSrcNet = {
    field: 'srcNet',
    headerName: t('srcNet.label'),
    width: 120,
    renderCell: (e: { row: any }) => (e.row.sciReview?.srcNet ? t('yes') : t('no'))
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

  function filterProposals() {
    function unionProposalsAndReviews() {
      return proposals.map(proposal => {
        const reviews = proposalReviews.filter(r => r.prslId === proposal.id);
        const technicalReviews = reviews.filter(r => r?.reviewType?.kind === REVIEW_TYPE.TECHNICAL);
        const technicalReview =
          technicalReviews.length > 0 ? technicalReviews[technicalReviews.length - 1] : null;
        const scienceReviews = reviews.filter(
          r => r?.reviewType?.kind === REVIEW_TYPE.SCIENCE && r.reviewerId === userId
        );
        const scienceReview = scienceReviews.length > 0 ? scienceReviews[0] : null;
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
        (searchType === '' || item?.sciReview?.status?.toLowerCase() === searchType?.toLowerCase())
      );
    });
  }

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
    setReset(!reset);
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
      <Grid container direction="row" alignItems="center" justifyContent="space-around">
        <Grid size={{ sm: 4, md: 4, lg: 4 }}>{searchDropdown()}</Grid>
        <Grid mt={-1} size={{ sm: 4, md: 5, lg: 6 }}>
          {searchEntryField('searchId')}
        </Grid>
      </Grid>
      <Grid container p={5} direction="row" alignItems="center" justifyContent="space-between">
        <Grid size={{ sm: 12 }}>
          {(!filteredData || filteredData.length === 0) && (
            <Alert color={AlertColorTypes.Info} text={t('proposals.empty')} testId="helpPanelId" />
          )}
          {filteredData.length > 0 && (
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
      <PageFooterPMT />
      {conflictConfirm && conflictConfirmation()}
    </>
  );
}
