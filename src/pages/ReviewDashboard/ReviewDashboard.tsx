import React, { useState, useRef, useEffect } from 'react';
import { DropDown, SearchEntry, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { Box, Card, Grid, Typography } from '@mui/material';
import { groupBy } from 'lodash';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import getReviewDashboard from '@services/axios/get/getReviewDashboard/getReviewDashboard';
import { BANNER_PMT_SPACER, PANEL_DECISION_STATUS } from '@/utils/constants';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import ResetButton from '@/components/button/Reset/Reset';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import D3PieChart from '@/components/charts/pie/D3PieChart';
import D3ColumnChart from '@/components/charts/column/D3ColumnChart';
import D3Slider from '@/components/charts/slider/D3Slider';
import ResizablePanel from '@/components/layout/resizablePanel/ResizablePanel';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const REFRESH_TIME = 5 * 60 * 1000;
const TABLE_WIDTH = '95vw';
const TABLE_CONTAINER_WIDTH = '97vw';

const VIEW_PROPOSAL = 'proposal';
const VIEW_REVIEW = 'review';
const VIEW_DECISION = 'decision';
type DashboardView = string;

/** ResizeObserver hook */
function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      setSize({ width: cr.width, height: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}
function ResponsiveColumnChart(props: {
  data: any[];
  fields: string[];
  title: string;
  yAxisLabel?: string;
  initialXField?: string;
  initialGroupField?: string;
  innerPad?: number;
  minWidth?: number;
  minHeight?: number;
  targetAspect?: number;
}) {
  const {
    data,
    fields,
    title,
    yAxisLabel,
    initialXField,
    initialGroupField,
    innerPad = 20,
    minWidth = 560,
    minHeight = 420,
    targetAspect = 0.52
  } = props;

  const { size } = useContainerSize<HTMLDivElement>();
  const innerW = Math.max(minWidth, Math.max(0, size.width - innerPad * 2));
  const derivedH = Math.round(innerW * targetAspect);
  const innerH = Math.max(
    minHeight,
    size.height > 0 ? Math.max(0, size.height - innerPad * 2) : derivedH
  );

  return (
    <D3ColumnChart
      data={data}
      fields={fields}
      title={title}
      yAxisLabel={yAxisLabel}
      initialXField={initialXField}
      initialGroupField={initialGroupField}
      width={innerW}
      height={innerH}
    />
  );
}

export default function ReviewDashboard() {
  const { t } = useScopedTranslation();
  const [filter, setFilter] = useState({ telescope: '', country: '' });
  const [search, setSearch] = useState('');
  const [currentReport, setCurrentReport] = React.useState<any[]>([]);
  const [filteredReport, setFilteredReport] = React.useState<any[]>([]);
  const [, setAxiosError] = React.useState('');
  const [proposalCategoryData, setProposalCategoryData] = React.useState<any[]>([]);
  const [proposalStatusData, setProposalStatusData] = React.useState<any[]>([]);
  const [reviewAssignmentData, setReviewAssignmentData] = React.useState<any[]>([]);
  const [reviewCategoryData, setReviewCategoryData] = React.useState<any[]>([]);
  const [reviewStatusData, setReviewStatusData] = React.useState<any[]>([]);
  const [proposalDecisionData, setProposalDecisionData] = React.useState<any[]>([]);
  const [proposalLocationData, setProposalLocationData] = React.useState<any[]>([]);
  const [panelTableData, setPanelTableData] = React.useState<any[]>([]);
  const [panelReviewerTableData, setPanelReviewerTableData] = React.useState<any[]>([]);
  const [panelScienceCategoryTableData, setPanelScienceCategoryTableData] = React.useState<any[]>(
    []
  );
  const authClient = useAxiosAuthClient();

  // KEEP ONLY ONE activeView
  const [activeView, setActiveView] = useState<DashboardView>(VIEW_PROPOSAL);

  const calculateProposalData = (
    report: any[],
    field: string,
    setter: (data: { name: string; value: number }[]) => void,
    excludeStatuses: string[] = []
  ) => {
    const fallback = t(
      field === 'decisionStatus' ? 'reviewDashboard.undecided' : 'reviewDashboard.unknown'
    );

    // Step 1: Filter out excluded proposalStatus values
    const filteredReport = report.filter(
      record => !excludeStatuses.includes(record.proposalStatus)
    );

    // Step 2: Deduplicate by prslId
    const uniqueRecords = Object.values(
      filteredReport.reduce((acc, record) => {
        if (record.prslId) {
          acc[record.prslId] = record;
        }
        return acc;
      }, {} as Record<string, any>)
    );

    // Step 3: Group by field
    const counts = Object.entries(
      uniqueRecords.reduce((acc: Record<string, number>, record: any) => {
        const key = record[field] || fallback;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    setter(counts);
  };

  const calculateReviewData = (
    report: any[],
    field: string,
    setter: (data: { name: string; value: number }[]) => void
  ) => {
    const fallback = t(
      field === 'decisionStatus' ? 'reviewDashboard.undecided' : 'reviewDashboard.unknown'
    );
    const filteredReport = report.filter(record => record['proposalStatus'] !== 'draft');
    const counts = Object.entries(
      filteredReport.reduce((acc, record) => {
        const key = record[field] || fallback;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value: value as number }));

    setter(counts);
  };

  const getReviewFieldValues = (report: any[], field: string): string[] => {
    return report
      .filter(record => record.proposalStatus !== 'draft')
      .map(record => record[field] ?? 'Unknown');
  };

  const calculateAllStats = (report: any[]) => {
    // Panel stats
    const reportGroupByPanel = groupBy(report, 'panelId');
    const reportGroupByPanelWithKeys = Object.entries(reportGroupByPanel).map(([key, value]) => ({
      panelId: key,
      value
    }));

    const reportGroupByPanelsThenProposalsReviewers = reportGroupByPanelWithKeys.map(panel => {
      const groupByProposal = Object.entries(
        groupBy(panel.value, 'prslId')
      ).map(([key, value]) => ({ prslId: key, value }));
      const groupByReviewer = Object.entries(groupBy(panel.value, 'reviewerId'))
        .filter(([key]) => key !== 'undefined' && key !== undefined)
        .map(([key, value]) => ({ reviewerId: key, value }));
      return {
        ...panel,
        reviewGroupByPanelProposal: groupByProposal,
        reviewGroupByPanelReviewer: groupByReviewer
      };
    });
    const resultPanelTable = reportGroupByPanelsThenProposalsReviewers.map(panel => ({
      panelId: panel.panelId,
      panelName: panel.value[0].panelName,
      numProposal: panel.reviewGroupByPanelProposal.length,
      numReviewer: panel.reviewGroupByPanelReviewer.length,
      totalReviewedPercentage:
        (panel.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.REVIEWED).length * 100) /
        panel.value.length,
      pendingReviewedPercentage:
        (panel.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.TO_DO).length * 100) /
        panel.value.length,
      numInProgressReviews:
        (panel.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.IN_PROGRESS).length *
          100) /
        panel.value.length
    }));
    setPanelTableData(resultPanelTable);

    // Reviewer stats
    const reportGroupByReviewer = groupBy(report, 'reviewerId');
    const reportGroupByReviewerWithKeys = Object.entries(
      reportGroupByReviewer
    ).map(([key, value]) => ({ reviewerId: key, value }));
    const reportGroupByReviewersThenProposals = reportGroupByReviewerWithKeys.map(reviewer => {
      const groupByProposal = Object.entries(
        groupBy(reviewer.value, 'prslId')
      ).map(([key, value]) => ({ prslId: key, value }));
      return { ...reviewer, reviewGroupByReviewerProposal: groupByProposal };
    });
    const resultPanelReviewerTable = reportGroupByReviewersThenProposals.map(reviewer => ({
      panelId: reviewer.value[0].panelId,
      panelName: reviewer.value[0].panelName,
      reviewerId: reviewer.reviewerId,
      numProposal: reviewer.reviewGroupByReviewerProposal.length,
      numReviewed:
        (reviewer.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.REVIEWED).length *
          100) /
        reviewer.value.length,
      numPendingReview:
        (reviewer.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.TO_DO).length * 100) /
        reviewer.value.length
    }));
    setPanelReviewerTableData(resultPanelReviewerTable);

    // Science category stats
    const reportGroupByScienceCategory = groupBy(report, 'scienceCategory');
    const reportGroupByScienceCategoryWithKeys = Object.entries(reportGroupByScienceCategory).map(
      ([key, value]) => ({
        scienceCategory: key,
        value
      })
    );
    const reportGroupByScienceCategoryThenProposals = reportGroupByScienceCategoryWithKeys.map(
      sc => {
        const groupByProposal = Object.entries(groupBy(sc.value, 'prslId')).map(([key, value]) => ({
          prslId: key,
          value
        }));
        return { ...sc, reviewGroupByScienceCategoryProposal: groupByProposal };
      }
    );
    setPanelScienceCategoryTableData(
      reportGroupByScienceCategoryThenProposals.map(sc => ({
        scienceCategory: sc.scienceCategory,
        numProposal: sc.reviewGroupByScienceCategoryProposal.length,
        numReviewed:
          (sc.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.REVIEWED).length * 100) /
          sc.value.length,
        numPendingReview:
          (sc.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.TO_DO).length * 100) /
          sc.value.length
      }))
    );

    calculateProposalData(filteredReport, 'scienceCategory', setProposalCategoryData);
    calculateProposalData(filteredReport, 'proposalStatus', setProposalStatusData);
    calculateProposalData(filteredReport, 'location', setProposalLocationData);
    calculateProposalData(filteredReport, 'decisionStatus', setProposalDecisionData, ['draft']);
    //
    calculateProposalData(filteredReport, 'assignedProposal', setReviewAssignmentData, ['draft']);
    calculateReviewData(filteredReport, 'reviewStatus', setReviewStatusData);
    calculateProposalData(filteredReport, 'scienceCategory', setReviewCategoryData, ['draft']);
  };

  const fetchReport = () => {
    const fetchData = async () => {
      setCurrentReport([]);
      setAxiosError('');
      const response = await getReviewDashboard(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
        return;
      }
      if (response && typeof response === 'object' && 'error' in response) {
        setAxiosError((response as { error: string }).error);
        return;
      }
      setCurrentReport(response);
    };
    fetchData();
  };

  const filterReport = (report: any[]) => {
    if (!report || report.length === 0) return [];
    const filterReportBySearch = report.filter(review => {
      if (search === '') return true;
      return Object.values(review).some(value =>
        String(value)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
    return filter.telescope === ''
      ? filterReportBySearch
      : filterReportBySearch.filter(review => review.array === filter.telescope);
  };

  React.useEffect(() => {
    const fetchData = () => {
      fetchReport();
    };
    fetchData();
    const interval = setInterval(fetchData, REFRESH_TIME);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    calculateAllStats(filteredReport);
  }, [filteredReport]);

  React.useEffect(() => {
    const fr = filterReport(currentReport);
    setFilteredReport(fr);
  }, [filter, currentReport, search]);

  // UI bits
  const filters = () => (
    <Box pl={5} pr={5}>
      <Card>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid pl={5} size={{ sm: 2 }}>
            <DropDown
              options={[
                { value: '', label: 'All' },
                { value: 'LOW', label: 'LOW' },
                { value: 'MID', label: 'MID' }
              ]}
              testId={'telescopeTestId'}
              value={filter.telescope}
              setValue={(e: string) => setFilter({ ...filter, telescope: e })}
              label={'Telescope'}
            />
          </Grid>
          <Grid size={{ sm: 6 }}>
            <SearchEntry
              label=""
              testId="effectiveResolution"
              value={search}
              setValue={setSearch}
            />
          </Grid>
          <Grid pr={5}>
            <ResetButton
              action={() => {
                setSearch('');
                setFilter({ telescope: '', country: '' });
              }}
              disabled={filter.telescope === '' && filter.country === '' && search === ''}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );

  const pieChart = (label: string, data: any[]) => (
    <ResizablePanel title={t(label)} errorColor={!data || data.length === 0}>
      {(!data || data.length === 0) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6">{t('reviewDashboard.noData')}</Typography>
        </Box>
      )}
      {data && <D3PieChart data={data} showTotal={true} />}
    </ResizablePanel>
  );

  const columnChart = (label: string, data: any[], xFields: string[], xInit: string) => (
    <ResizablePanel title={label ? t(label) : ''}>
      <ResponsiveColumnChart
        data={data}
        fields={xFields}
        title=""
        yAxisLabel="Count"
        initialXField={xInit}
        initialGroupField="" // or "reviewStatus"
      />
    </ResizablePanel>
  );

  const sliderChart = (label: string, data: any[]) => (
    <ResizablePanel title={t(label)}>
      <D3Slider values={data} />
    </ResizablePanel>
  );

  const panel4 = () => (
    <ResizablePanel title={t('reviewDashboard.panel.title4')} width={TABLE_CONTAINER_WIDTH}>
      <TableContainer sx={{ minWidth: TABLE_WIDTH }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('reviewDashboard.cell.title1')}</TableCell>
              <TableCell align="right">{t('reviewDashboard.cell.title2')}</TableCell>
              <TableCell align="right">{t('reviewDashboard.cell.title3')}</TableCell>
              <TableCell align="right">{t('reviewDashboard.cell.title4')}</TableCell>
              <TableCell align="right">{t('reviewDashboard.cell.title5')}</TableCell>
              <TableCell align="right">{t('reviewDashboard.cell.title6')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {panelTableData.map((row: any) => (
              <TableRow
                key={row.panelId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.panelName}
                </TableCell>
                <TableCell align="right">{row.numReviewer}</TableCell>
                <TableCell align="right">{row.numProposal}</TableCell>
                <TableCell align="right">{row.totalReviewedPercentage}</TableCell>
                <TableCell align="right">{row.pendingReviewedPercentage}</TableCell>
                <TableCell align="right">{row.numInProgressReviews}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ResizablePanel>
  );

  const panel5 = () => (
    <ResizablePanel title={t('reviewDashboard.panel.title5')} width={TABLE_CONTAINER_WIDTH}>
      <TableContainer sx={{ minWidth: TABLE_WIDTH }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('reviewDashboard.cell.title1')}</TableCell>
              <TableCell>{t('reviewDashboard.cell.title7')}</TableCell>
              <TableCell>{t('reviewDashboard.cell.title3')}</TableCell>
              <TableCell>{t('reviewDashboard.cell.title4')}</TableCell>
              <TableCell>{t('reviewDashboard.cell.title5')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {panelReviewerTableData.map((row: any) => (
              <TableRow
                key={row.reviewerId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.panelName}
                </TableCell>
                <TableCell>{row.reviewerId}</TableCell>
                <TableCell align="right">{row.numProposal}</TableCell>
                <TableCell align="right">{row.numReviewed}</TableCell>
                <TableCell align="right">{row.numPendingReview}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ResizablePanel>
  );

  const panel6 = () => (
    <ResizablePanel title={t('reviewDashboard.panel.title6')} width={TABLE_CONTAINER_WIDTH}>
      <TableContainer sx={{ minWidth: TABLE_WIDTH }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('reviewDashboard.cell.title8')}</TableCell>
              <TableCell>{t('reviewDashboard.cell.title3')}</TableCell>
              <TableCell align="right">{t('reviewDashboard.cell.title4')}</TableCell>
              <TableCell align="right">{t('reviewDashboard.cell.title5')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {panelScienceCategoryTableData.map((row: any) => (
              <TableRow
                key={row.scienceCategory}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.scienceCategory}
                </TableCell>
                <TableCell align="right">{row.numProposal}</TableCell>
                <TableCell align="right">{row.numReviewed}</TableCell>
                <TableCell align="right">{row.numPendingReview}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ResizablePanel>
  );

  const card = (key: DashboardView) => {
    const active = activeView === key;
    return (
      <Grid size={{ xs: 12, sm: 4 }}>
        <Card
          onClick={() => setActiveView(key)}
          sx={theme => ({
            cursor: 'pointer',
            p: 2.5,
            border: `2px solid ${
              active ? theme.palette.secondary.main : theme.palette.primary.main
            }`,
            boxShadow: active ? 4 : 1,
            transition: 'all .2s ease',
            '&:hover': {
              boxShadow: 6
            }
          })}
        >
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t('reviewDashboard.' + key + '.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('reviewDashboard.' + key + '.subtitle')}
          </Typography>
        </Card>
      </Grid>
    );
  };

  const proposalCards = () => {
    return (
      <>
        <Grid p={5} spacing={5} container alignItems="center" justifyContent="space-between">
          {pieChart('reviewDashboard.panel.title9', proposalLocationData)}
          {pieChart('reviewDashboard.panel.title2', proposalStatusData)}
          {pieChart('reviewDashboard.panel.title3', proposalCategoryData)}
        </Grid>
      </>
    );
  };

  const reviewCards = () => {
    return (
      <>
        <Grid p={5} spacing={5} container alignItems="center" justifyContent="space-between">
          {pieChart('reviewDashboard.panel.title1', reviewAssignmentData)}
          {pieChart('reviewDashboard.panel.title12', reviewStatusData)}
          {pieChart('reviewDashboard.panel.title3', reviewCategoryData)}
          {columnChart(
            'reviewDashboard.panel.title8',
            filteredReport.filter(record => !['draft'].includes(record.proposalStatus)),
            ['scienceCategory', 'reviewStatus', 'assignedProposal', 'array'],
            'scienceCategory'
          )}
        </Grid>
        <Grid
          p={5}
          pt={0}
          pb={10}
          spacing={5}
          container
          alignItems="center"
          justifyContent="space-between"
        >
          {panel4()}
          {panel5()}
          {panel6()}
        </Grid>
      </>
    );
  };

  const decisionCards = () => {
    return (
      <Grid p={5} pt={3} container spacing={3}>
        {pieChart('reviewDashboard.panel.title7', proposalDecisionData)}
        {sliderChart(
          'reviewDashboard.panel.title10',
          getReviewFieldValues(filteredReport, 'panelScore')
        )}
        {sliderChart(
          'reviewDashboard.panel.title11',
          getReviewFieldValues(filteredReport, 'reviewRank')
        )}
      </Grid>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', overflowY: 'auto' }}>
      <PageBannerPMT title={t('reviewDashboard.title')} />
      <Spacer size={BANNER_PMT_SPACER - 20} axis={SPACER_VERTICAL} />

      <Grid p={5} pt={0} container spacing={3} alignItems="stretch">
        {card(VIEW_PROPOSAL)}
        {card(VIEW_REVIEW)}
        {card(VIEW_DECISION)}
      </Grid>

      {filters()}

      {activeView === VIEW_PROPOSAL && proposalCards()}
      {activeView === VIEW_REVIEW && reviewCards()}
      {activeView === VIEW_DECISION && decisionCards()}
    </Box>
  );
}
