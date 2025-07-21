import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2, Paper } from '@mui/material';
import { AlertColorTypes, DropDown, SearchEntry } from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import { SEARCH_TYPE_OPTIONS, BANNER_PMT_SPACER } from '../../utils/constants';
import Proposal from '../../utils/types/proposal';
import { FOOTER_SPACER } from '../../utils/constants';

import Notification from '../../utils/types/notification';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import SubmitButton from '@/components/button/Submit/Submit';
import TableReviewDecision from '@/components/grid/tableReviewDecision/TableReviewDecision';
import { ProposalReview } from '@/utils/types/proposalReview';
import GetPanelList from '@/services/axios/getPanelList/getPanelList';
import GetProposalReviewList from '@/services/axios/getProposalReviewList/getProposalReviewList';
import { Panel } from '@/utils/types/panel';

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
  const { updateAppContent5 } = storageObject.useStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');

  const [reset, setReset] = React.useState(false);
  const [panelData, setPanelData] = React.useState<Panel[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [proposalReviews, setProposalReviews] = React.useState<ProposalReview[]>([]);

  /*--------------------------------------------------------------------------*/

  function Notify(str: string, lvl = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str
    };
    updateAppContent5(rec);
  }

  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  // const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);

  /*--------------------------------------------------------------------------*/

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
      const response = await GetProposalList(); // TODO : Temporary implementation to get all proposals
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
      const response = await GetProposalReviewList(); // TODO : add id of the logged in user
      if (typeof response === 'string') {
        NotifyError(response);
      } else {
        setProposalReviews(response);
      }
    };
    fetchProposalData();
    fetchProposalReviewData();
  }, [panelData]);

  // const getUser = () => 'DefaultUser'; // TODO

  /*--------------------------------------------------------------------------*/

  function filterProposals() {
    function unionProposalsAndReviews() {
      return proposals.map(proposal => {
        const reviews = proposalReviews.filter(r => r.prslId === proposal.id);
        return {
          ...proposal,
          reviews: reviews
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
    /* TODO */
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
      <PageBannerPMT title={t('reviewDecisionsList.title')} fwdBtn={fwdButton()} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Grid2 container direction="row" alignItems="center" justifyContent="space-around">
        <Grid2 size={{ sm: 4, md: 4, lg: 4 }}>{searchDropdown()}</Grid2>
        <Grid2 mt={-1} size={{ sm: 4, md: 5, lg: 6 }}>
          {searchEntryField('searchId')}
        </Grid2>
      </Grid2>
      <Grid2 container p={5} direction="row" alignItems="center" justifyContent="space-between">
        <Grid2 size={{ sm: 12 }}>
          <div>{filteredData && <TableReviewDecision data={filteredData} />}</div>
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
