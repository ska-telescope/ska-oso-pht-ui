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
import {
  SEARCH_TYPE_OPTIONS,
  BANNER_PMT_SPACER,
  PANEL_DECISION_STATUS,
  REVIEW_TYPE,
  FEASIBILITY
} from '@utils/constants.ts';
import { validateProposal } from '@utils/proposalValidation.tsx';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import GetProposalReviewList from '../../services/axios/getProposalReviewList/getProposalReviewList';
import GetProposal from '../../services/axios/getProposal/getProposal';
import ScienceIcon from '../../components/icon/scienceIcon/scienceIcon';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Proposal from '../../utils/types/proposal';
import Notification from '../../utils/types/notification';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { PMT } from '@/utils/constants';
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

  const {
    application,
    clearApp,
    updateAppContent1,
    updateAppContent2,
    updateAppContent5
  } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const [reset, setReset] = React.useState(false);
  const [panelData, setPanelData] = React.useState<Panel[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);

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
    const fetchProposalData = async () => {
      const response = await GetProposalList(authClient); // TODO : Temporary implementation to get all proposals
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
      }
    };
    const fetchProposalReviewData = async () => {
      const response = await GetProposalReviewList(authClient); // TODO : add id of the logged in user
      if (typeof response === 'string') {
        NotifyError(response);
      } else {
        setProposalReviews(response);
      }
    };
    fetchProposalData();
    fetchProposalReviewData();
  }, [panelData]);

  const getUser = () => 'DefaultUser'; // TODO

  const getObservatoryData = () => application.content3 as ObservatoryData;

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

  const getReview = (row: any): ProposalReview => {
    return {
      id: row.review_id,
      prslId: row.id,
      reviewType:
        row.reviewType.kind === REVIEW_TYPE.SCIENCE
          ? getScienceReviewType(row)
          : getTechnicalReviewType(row),
      comments: row.comments,
      srcNet: row.srcNet,
      metadata: {
        version: 0,
        created_by: '',
        created_on: '',
        pdm_version: '',
        last_modified_by: '',
        last_modified_on: ''
      },
      panelId: 'ERROR',
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
    const response: string | { error: string } = await PostProposalReview(
      getReview(row),
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
    clearApp();

    const response = await GetProposal(authClient, id);
    if (typeof response === 'string') {
      NotifyError(t('proposal.error'));
      return false;
    } else {
      updateAppContent1(validateProposal(response));
      updateAppContent2(response);
      validateProposal(response);
      return true;
    }
  };

  const theIconClicked = (row: any, route: string) => {
    getTheProposal(row.id).then(success => {
      if (success) {
        navigate(route, { replace: true, state: row });
      }
    });
  };
  const scienceIconClicked = (row: any) => theIconClicked(row, PMT[5]);
  const technicalIconClicked = (row: any) => theIconClicked(row, PMT[7]);

  const submitIconClicked = (row: any) => {
    updateReview(row);
  };

  const canEditScience = (e: { row: { status: string; feasibility: string } }) => {
    return e?.row?.feasibility !== FEASIBILITY[1] && e.row.status !== PANEL_DECISION_STATUS.DECIDED;
  };

  const canEditTechnical = (e: { row: { status: string } }) =>
    e.row.status !== PANEL_DECISION_STATUS.DECIDED;
  const canSubmit = (row: { srcNet: any; comments: any; rank: number; status: string }) =>
    row.status !== PANEL_DECISION_STATUS.DECIDED &&
    row?.rank > 0 &&
    row?.comments?.length &&
    row?.srcNet?.length;

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
      e.row.review_id ? t('reviewStatus.' + e.row.status) : t('reviewStatus.to do')
  };

  const colRank = {
    field: 'rank',
    headerName: t('rank.label'),
    width: 120,
    renderCell: (e: { row: any }) => e.row.rank
  };

  const colFeasibility = {
    field: 'feasibility',
    headerName: t('feasibility.label'),
    width: 120,
    renderCell: (e: { row: any }) => {
      return e.row?.reviewType?.feasibility?.isFeasible.toLowerCase();
    }
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
    renderCell: (e: { row: any }) => (e.row.srcNet ? t('yes') : t('no'))
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
      const panel = panelData.find(
        panel =>
          Array.isArray(panel.proposals) && panel.proposals.some(p => p.proposalId === e.row.id)
      );
      let proposal = null;
      if (panel && panel.proposals && panel.proposals.length > 0) {
        proposal = panel.proposals.find(p => p.proposalId === e.row.id);
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
          disabled={!canEditTechnical(e)}
          toolTip={t(canEditTechnical(e) ? 'reviewProposal.technical' : 'reviewProposal.disabled')}
        />
        <ScienceIcon
          onClick={() => scienceIconClicked(e.row)}
          disabled={!canEditScience(e)}
          toolTip={t(canEditScience(e) ? 'reviewProposal.science' : 'reviewProposal.disabled')}
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
      colReviewStatus,
      colConflict,
      colRank,
      colFeasibility,
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
        const review = reviews.length > 0 ? reviews[reviews.length - 1] : undefined;
        return {
          ...proposal,
          ...(review
            ? {
                panelId: panelData[0].id,
                review_id: review.id,
                rank:
                  review?.reviewType?.kind === REVIEW_TYPE.SCIENCE
                    ? review?.reviewType?.rank?.toString()
                    : '', // rank is only for science review
                feasibility:
                  review?.reviewType?.kind === REVIEW_TYPE.TECHNICAL
                    ? review?.reviewType?.feasibility?.isFeasible
                    : '', // feasibility is only for technical review,
                comments: review.comments,
                srcNet: review.srcNet,
                status: review.status
              }
            : {
                panelId: panelData[0].id,
                rank: 0,
                comments: '',
                srcNet: '',
                status: proposal.status
              })
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
