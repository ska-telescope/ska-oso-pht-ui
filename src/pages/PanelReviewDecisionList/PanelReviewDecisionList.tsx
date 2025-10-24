import React from 'react';
import { Grid } from '@mui/material';
import { AlertColorTypes, SearchEntry } from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import GetProposalReviewList from '@services/axios/get/getProposalReviewList/getProposalReviewList';
import getPanelDecisionList from '@services/axios/get/getPanelDecisionList/getPanelDecisionList';
import GetProposalByStatusList from '@services/axios/get/getProposalByStatusList/getProposalByStatusList';
import Proposal from '@/utils/types/proposal';
import { FEASIBLE_NO, FOOTER_SPACER, REVIEW_TYPE } from '@/utils/constants';
import { BANNER_PMT_SPACER } from '@/utils/constants';

import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import TableReviewDecision from '@/components/grid/tableReviewDecision/TableReviewDecision';
import { ProposalReview, ScienceReview } from '@/utils/types/proposalReview';
import { PanelDecision } from '@/utils/types/panelDecision';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import PostProposalReview from '@/services/axios/post/postProposalReview/postProposalReview';
import { useNotify } from '@/utils/notify/useNotify';
import { getUserId } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import PutPanelDecision from '@/services/axios/put/putPanelDecision/putPanelDecision';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

export default function ReviewDecisionListPage() {
  const { t } = useScopedTranslation();
  const { notifyError, notifySuccess } = useNotify();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [reset, setReset] = React.useState(false);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);
  const [reviewDecisions, setReviewDecisions] = React.useState<PanelDecision[]>([]);
  const authClient = useAxiosAuthClient();
  const { osdCycleId } = useOSDAccessors();
  const userId = getUserId();

  const getReviewDecision = (item: {
    id: any;
    recommendation: any;
    decisions: any;
    reviews: any[];
  }) => {
    return {
      id: item.decisions?.id ?? null,
      panelId: item.decisions?.panelId ?? null,
      cycle: osdCycleId,
      proposalId: item.id,
      decidedOn: new Date().toISOString(),
      decidedBy: userId,
      recommendation: item.decisions?.recommendation ?? null,
      rank: item.decisions?.rank ?? 0,
      status: item.decisions?.status ?? null
    };
  };

  const updateReview = async (review: ProposalReview) => {
    const response = await PostProposalReview(authClient, review, osdCycleId);
    if (typeof response === 'object' && response?.error) {
      notifyError(response.error, AlertColorTypes.Error);
    }
  };

  const updateDecisionAction = async (item: {
    id: any;
    recommendation: any;
    decisions: any;
    reviews: any[];
  }) => {
    const response = await PutPanelDecision(authClient, getReviewDecision(item));
    if ('error' in response) {
      notifyError(response.error, AlertColorTypes.Error);
    } else {
      fetchReviewDecisionData();
      notifySuccess(t('addReview.success'), AlertColorTypes.Success);
    }
  };

  const fetchReviewDecisionData = async () => {
    const response = await getPanelDecisionList(authClient, osdCycleId);
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
    const fetchProposalData = async () => {
      const response = await GetProposalByStatusList(authClient);
      if (typeof response === 'string') {
        notifyError(response);
      } else {
        setProposals(response);
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
  }, [reset]);

  const mergedData = React.useMemo(() => {
    if (
      !Array.isArray(proposals) ||
      proposals.length === 0 ||
      !Array.isArray(proposalReviews) ||
      proposalReviews.length === 0 ||
      !Array.isArray(reviewDecisions) ||
      reviewDecisions.length === 0
    ) {
      return [];
    }

    return proposals.map(proposal => {
      const reviews = proposalReviews.filter(r => r.prslId === proposal.id);
      const decisions = reviewDecisions.find(d => d.proposalId === proposal.id);
      return {
        ...proposal,
        decisions,
        reviews,
        key: proposal.id
      };
    });
  }, [proposals, proposalReviews, reviewDecisions]);

  const rankMap = React.useMemo(() => {
    const rankMap = [...mergedData]
      .map(item => {
        const filtered = item.reviews?.filter(
          r =>
            r.reviewType.kind === REVIEW_TYPE.SCIENCE &&
            (r.reviewType as ScienceReview).excludedFromDecision !== true
        );
        const avg = filtered?.length
          ? filtered.reduce(
              (sum, r) =>
                r.reviewType.kind === REVIEW_TYPE.SCIENCE && 'rank' in r.reviewType
                  ? sum + (r.reviewType as ScienceReview).rank
                  : sum,
              0
            ) / filtered.length
          : 0;
        const abandon = item.reviews?.some(
          r =>
            r.reviewType.kind === REVIEW_TYPE.TECHNICAL &&
            'isFeasible' in r.reviewType &&
            r.reviewType.isFeasible === FEASIBLE_NO
        );
        return { id: item.id, avg: abandon ? 0 : avg };
      })
      .sort((a, b) => b.avg - a.avg)
      .map((item, index) => ({ ...item, rank: index + 1 }))
      .reduce((acc, item) => {
        acc[Number(item.id)] = item.rank;
        return acc;
      }, {} as Record<number, number>);
    return rankMap;
  }, [mergedData]);

  const filteredData = React.useMemo(() => {
    return mergedData
      .filter(item => {
        const fieldsToSearch = [item.id, item.title];
        return fieldsToSearch.some(
          field =>
            typeof field === 'string' && field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .map(item => ({
        ...item,
        rank: rankMap[Number(item.id)]
      }));
  }, [mergedData, rankMap, searchTerm]);

  const searchEntryField = (testId: string) => (
    <SearchEntry
      label={t('search.label')}
      testId={testId}
      value={searchTerm}
      setValue={setSearchTerm}
    />
  );

  function handleExcludeAction(review: any): void {
    const results = proposalReviews.map(rec => {
      const el: ProposalReview = rec;
      if (el.id === review.id) {
        const tmp: ScienceReview = el.reviewType as ScienceReview;
        tmp.excludedFromDecision = !tmp.excludedFromDecision;
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
                updateFunction={updateDecisionAction}
              />
            )}
          </div>
        </Grid>
      </Grid>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL * 2} />
    </>
  );
}
