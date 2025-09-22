import React from 'react';
import { Grid, Paper } from '@mui/material';
import { AlertColorTypes, SearchEntry } from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import GetPanelList from '@services/axios/get/getPanelList/getPanelList';
import GetProposalReviewList from '@services/axios/get/getProposalReviewList/getProposalReviewList';
import PutPanelDecision from '@services/axios/put/putPanelDecision/putPanelDecision';
import getPanelDecisionList from '@services/axios/get/getPanelDecisionList/getPanelDecisionList';
import GetProposalByStatusList from '@services/axios/get/getProposalByStatusList/getProposalByStatusList';
import Proposal from '@/utils/types/proposal';
import { FEASIBLE_NO, FOOTER_SPACER, REVIEW_TYPE } from '@/utils/constants';
import { BANNER_PMT_SPACER } from '@/utils/constants';

import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import TableReviewDecision from '@/components/grid/tableReviewDecision/TableReviewDecision';
import { ProposalReview, ScienceReview } from '@/utils/types/proposalReview';
import { Panel } from '@/utils/types/panel';
import { PanelDecision } from '@/utils/types/panelDecision';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import PostProposalReview from '@/services/axios/post/postProposalReview/postProposalReview';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function ReviewDecisionListPage() {
  const { t } = useScopedTranslation();
  const { application } = storageObject.useStore();
  const { notifyError, notifySuccess } = useNotify();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [reset, setReset] = React.useState(false);
  const [panelData, setPanelData] = React.useState<Panel[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);
  const [reviewDecisions, setReviewDecisions] = React.useState<PanelDecision[]>([]);
  const authClient = useAxiosAuthClient();

  const getObservatoryData = () => application.content3 as ObservatoryData;
  const getCycleId = () => getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId;

  /*--------------------------------------------------------------------------*/

  const handlePanelDecision = async (
    item: any,
    options: {
      useObservatoryCycle?: boolean;
      onSuccess?: () => void;
      updateLocalState?: boolean;
    } = {}
  ) => {
    const updatedDecision = getReviewDecision(item);
    const cycleId = options.useObservatoryCycle
      ? getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
      : getCycleId();

    const response: PanelDecision | { error: string } = await PutPanelDecision(
      authClient,
      updatedDecision,
      cycleId
    );

    const isErrorResponse = (
      response: PanelDecision | { error: string }
    ): response is { error: string } => typeof response === 'object' && 'error' in response;

    if (isErrorResponse(response)) {
      notifyError(response.error, AlertColorTypes.Error);
      return;
    }

    if (options.updateLocalState) {
      setReviewDecisions(prev =>
        prev.some(d => d.proposalId === item.id)
          ? prev.map(d => (d.proposalId === item.id ? { ...d, ...updatedDecision } : d))
          : [...prev, updatedDecision]
      );
    }

    if (options.onSuccess) {
      options.onSuccess();
    }
  };

  const calculateRank = (details: Array<any>) => {
    if (!details || details?.length === 0) return 0;
    const average =
      details.reduce((sum, detail) => sum + detail.reviewType.rank, 0) / details.length;
    if (!average) return 0;
    return Math.round(average);
  };

  const getReviewDecision = (item: any) => {
    const filtered = item.reviews.filter((el: any) => el.reviewType.excludedFromDecision === false);
    const decision = item.decisions[0];
    decision.rank = calculateRank(filtered);
    return decision;
  };

  const updateReview = async (review: ProposalReview) => {
    const response: string | { error: string } = await PostProposalReview(
      authClient,
      review,
      getCycleId()
    );
    if (typeof response === 'object' && response?.error) {
      notifyError(response?.error, AlertColorTypes.Error);
    }
  };

  const fetchReviewDecisionData = async () => {
    const response = await getPanelDecisionList(
      authClient,
      getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
    );
    if (typeof response === 'string') {
      notifyError(response);
    } else {
      setReviewDecisions(response);
    }
  };

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
      }
    };
    const fetchProposalReviewData = async () => {
      const response = await GetProposalReviewList(authClient);
      if (typeof response === 'string') {
        notifyError(response);
      } else {
        setProposalReviews(response);
      }
    };
    fetchProposalData();
    fetchProposalReviewData();
    fetchReviewDecisionData();
  }, [panelData]);

  /*--------------------------------------------------------------------------*/

  function computeGlobalRanks(data: any[]) {
    const rankMap = [...data]
      .map(item => {
        const filtered = item.reviews?.filter(
          (r: any) =>
            r.reviewType.kind === REVIEW_TYPE.SCIENCE && r.reviewType.excludedFromDecision !== true
        );
        const avg = filtered?.length
          ? filtered.reduce((sum: number, r: any) => sum + r.reviewType.rank, 0) / filtered.length
          : 0;
        const abandon =
          item.reviews?.filter(
            (r: any) =>
              r.reviewType.kind === REVIEW_TYPE.TECHNICAL && r.reviewType.isFeasible === FEASIBLE_NO
          )?.length > 0;
        return { id: item.id, avg: abandon ? 0 : avg };
      })
      .sort((a, b) => b.avg - a.avg)
      .map((item, index) => ({ ...item, rank: index + 1 }))
      .reduce((acc, item) => {
        acc[item.id] = item.rank;
        return acc;
      }, {} as Record<number, number>);
    return rankMap;
  }

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

  const filteredData = proposals
    ? (() => {
        const raw = filterProposals();
        const rankMap = computeGlobalRanks(raw);
        return raw.map(item => ({
          ...item,
          rank: rankMap[item.id as any]
        }));
      })()
    : [];

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
        const tmp: ScienceReview = el.reviewType as ScienceReview;
        tmp.excludedFromDecision = tmp.excludedFromDecision ? false : true;
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
      <Grid container direction="row" alignItems="center" justifyContent="space-around">
        <Grid mt={-1} size={{ sm: 4, md: 5, lg: 6 }}>
          {searchEntryField('searchId')}
        </Grid>
      </Grid>
      <Grid container p={5} direction="row" alignItems="center" justifyContent="space-between">
        <Grid size={{ sm: 12 }}>
          <div>
            {filteredData && (
              <TableReviewDecision
                data={filteredData}
                excludeFunction={handleExcludeAction}
                submitFunction={(item: any) =>
                  handlePanelDecision(item, {
                    useObservatoryCycle: true,
                    onSuccess: () => {
                      fetchReviewDecisionData();
                      notifySuccess(t('addReview.success'), AlertColorTypes.Success);
                    }
                  })
                }
                updateFunction={(item: any) =>
                  handlePanelDecision(item, {
                    updateLocalState: true
                  })
                }
              />
            )}
          </div>
        </Grid>
      </Grid>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      ></Paper>
    </>
  );
}
