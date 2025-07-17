import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2, Paper } from '@mui/material';
import { DropDown, SearchEntry } from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import GetProposalList from '../../services/axios/getProposalList/getProposalList';
import { SEARCH_TYPE_OPTIONS, BANNER_PMT_SPACER } from '../../utils/constants';
import Proposal from '../../utils/types/proposal';
import { FOOTER_SPACER } from '../../utils/constants';

import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import SubmitButton from '@/components/button/Submit/Submit';
import TableReviewDecision from '@/components/grid/tableReviewDecision/TableReviewDecision';

export default function ReviewDecisionListPage() {
  const { t } = useTranslation('pht');

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState('');
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [fetchList, setFetchList] = React.useState(false);

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetProposalList();
      if (typeof response !== 'string') {
        setProposals(response);
      }
    };
    fetchData();
  }, [fetchList]);

  function filterProposals() {
    return proposals.filter(item => {
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
