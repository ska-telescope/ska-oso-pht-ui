import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2, Paper } from '@mui/material';
import { AlertColorTypes, SearchEntry } from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import moment from 'moment';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import { BANNER_PMT_SPACER, PANEL_DECISION_STATUS } from '../../utils/constants';
import Proposal from '../../utils/types/proposal';
import { FOOTER_SPACER } from '../../utils/constants';

import Notification from '../../utils/types/notification';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import TableReviewDecision from '@/components/grid/tableReviewDecision/TableReviewDecision';
import { ProposalReview } from '@/utils/types/proposalReview';
import GetPanelList from '@/services/axios/getPanelList/getPanelList';
import GetProposalReviewList from '@/services/axios/getProposalReviewList/getProposalReviewList';
import { Panel } from '@/utils/types/panel';
import PostPanelDecision from '@/services/axios/postPanelDecision/postPanelDecision';
import getPanelDecisionList from '@/services/axios/getPanelDecisionList/getPanelDecisionList';
import { PanelDecision } from '@/utils/types/panelDecision';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import PostProposalReview from '@/services/axios/postProposalReview.tsx/postProposalReview';

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

export default function ReviewDecisionListPage() {
  const { t } = useTranslation('pht');
  const { application, updateAppContent5 } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');

  const [reset, setReset] = React.useState(false);
  const [panelData, setPanelData] = React.useState<Panel[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);
  const [reviewDecisions, setReviewDecisions] = React.useState<PanelDecision[]>([]);
  const authClient = useAxiosAuthClient();

  /*--------------------------------------------------------------------------*/

  function Notify(str: string, lvl = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str
    };
    updateAppContent5(rec);
  }

  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);

  const getObservatoryData = () => application.content3 as ObservatoryData;
  const getCycleId = () => getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId;

  const calculateRank = (details: Array<any>) => {
    if (!details || details?.length === 0) return 0;
    const average = details.reduce((sum, detail) => sum + detail.rank, 0) / details.length;
    return Math.round(average);
  };

  const getUser = () => 'DefaultUser'; // TODO

  const getDateFormatted = () => moment().format('YYYY-MM-DD');

  const getReviewDecision = (item: { id: any; recommendation: any; reviews: any[] }) => {
    return {
      id:
        'pnld-' +
        getUser() +
        '-' +
        getDateFormatted() +
        '-00001-' +
        Math.floor(Math.random() * 10000000).toString(),
      panelId: '1',
      cycle: 'ERROR',
      proposalId: item.id,
      decidedOn: new Date().toISOString(),
      decidedBy: getUser(),
      recommendation: item.recommendation,
      rank: calculateRank(item.reviews),
      status: PANEL_DECISION_STATUS.DECIDED
    };
  };

  const updateList = (item: any) => {
    setReviewDecisions(prev =>
      prev.map(proposal => (proposal.id === item.id ? { ...proposal, ...item } : proposal))
    );
  };

  const updateReview = async (review: ProposalReview) => {
    const response: string | { error: string } = await PostProposalReview(review, getCycleId());
    if (typeof response === 'object' && response?.error) {
      Notify(response?.error, AlertColorTypes.Error);
    }
  };

  const handleSubmitAction = async (item: {
    [x: string]: any;
    id: number;
    scienceCategory: string;
    title: string;
    details: any[];
    reviewStatus:
      | string
      | number
      | boolean
      | React.ReactPortal
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | null
      | undefined;
    lastUpdated: string;
    rank: number;
    comments: string;
    reviews: any[];
    recommendation: any;
  }) => {
    const response: string | { error: string } = await PostPanelDecision(
      getReviewDecision(item),
      getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
    );
    if (typeof response === 'object' && response?.error) {
      Notify(response?.error, AlertColorTypes.Error);
    } else {
      updateList(item);
      Notify(t('addReview.success'), AlertColorTypes.Success);
    }
  };

  /*--------------------------------------------------------------------------*/

  React.useEffect(() => {
    setReset(!reset);
  }, []);

  React.useEffect(() => {
    const GetReviewPanels = async () => {
      const response = await GetPanelList(authClient); // TODO : Add the user_id as a property to the function
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
    const fetchReviewDecisionData = async () => {
      const response = await getPanelDecisionList(
        getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
      ); // TODO : add id of the logged in user
      if (typeof response === 'string') {
        NotifyError(response);
      } else {
        setReviewDecisions(response);
      }
    };
    fetchProposalData();
    fetchProposalReviewData();
    fetchReviewDecisionData();
  }, [panelData]);

  /*--------------------------------------------------------------------------*/

  function filterProposals() {
    function unionProposalsAndReviews() {
      return proposals.map(proposal => {
        const reviews = proposalReviews.filter(r => r.prslId === proposal.id);
        const decisions = reviewDecisions.filter(d => d.proposalId === proposal.id);
        return {
          ...proposal,
          decisions: decisions,
          reviews: reviews,
          key: proposal.id
        };
      });
    }

    return unionProposalsAndReviews().filter(item => {
      const fieldsToSearch = [item.id, item.title];
      return fieldsToSearch.some(
        field =>
          typeof field === 'string' && field.toLowerCase().includes(searchTerm?.toLowerCase())
      );
    });
  }

  const filteredData = proposals ? filterProposals() : [];

  const searchEntryField = (testId: string) => (
    <SearchEntry
      label={t('search.label')}
      testId={testId}
      value={searchTerm}
      setValue={setSearchTerm}
    />
  );

  function handleExcludeAction(review: any): void {
    const results = proposalReviews?.map(rec => {
      const el: ProposalReview = rec;
      if (el.id === review.id) {
        el.reviewType.excludedFromDecision = el.reviewType.excludedFromDecision ? false : true;
        updateReview(el);
      }
      return el;
    });
    setProposalReviews(results);
  }

  return (
    <>
      <PageBannerPMT title={t('reviewDecisionsList.title')} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Grid2 container direction="row" alignItems="center" justifyContent="space-around">
        <Grid2 mt={-1} size={{ sm: 4, md: 5, lg: 6 }}>
          {searchEntryField('searchId')}
        </Grid2>
      </Grid2>
      <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-between">
        <Grid2 size={{ sm: 12 }}>
          <div>
            {filteredData && (
              <TableReviewDecision
                data={filteredData}
                excludeFunction={handleExcludeAction}
                submitFunction={handleSubmitAction}
              />
            )}
          </div>
        </Grid2>
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      ></Paper>
    </>
  );
}
