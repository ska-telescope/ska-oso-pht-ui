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
import D3CategoryBarChart from '@/components/charts/bar/D3CategoryBarChart';
import ResizablePanel from '@/components/layout/resizablePanel/ResizablePanel';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const REFRESH_TIME = 5 * 60 * 1000;
const TABLE_WIDTH = '95vw';
const TABLE_CONTAINER_WIDTH = '97vw';

type DashboardView = 'proposal' | 'review' | 'decision';

/** ResizeObserver hook */
function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ width: cr.width, height: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

/** Responsive wrapper for the Category Bar Chart */
function ResponsiveCategoryBarChart(props: {
  data: any[];
  fields: string[];
  title: string;
  initialXField?: string;
  initialGroupField?: string;
  innerPad?: number;
  minWidth?: number;
  minHeight?: number;
  targetAspect?: number;
}) {
  const {
    data, fields, title, initialXField, initialGroupField,
    innerPad = 20, minWidth = 560, minHeight = 420, targetAspect = 0.52,
  } = props;

  const { ref, size } = useContainerSize<HTMLDivElement>();
  const innerW = Math.max(minWidth, Math.max(0, size.width - innerPad * 2));
  const derivedH = Math.round(innerW * targetAspect);
  const innerH = Math.max(
    minHeight,
    size.height > 0 ? Math.max(0, size.height - innerPad * 2) : derivedH
  );

  return (
      <D3CategoryBarChart
        data={data}
        fields={fields}
        title={title}
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
  const [proposalPieChartData, setProposalPieChartData] = React.useState<any[]>([]);
  const [reviewPieChartData, setReviewPieChartData] = React.useState<any[]>([]);
  const [scienceCategoryPieChartData, setScienceCategoryPieChartData] = React.useState<any[]>([]);
  const [decisionPieChartData, setDecisionPieChartData] = React.useState<any[]>([]); // NEW
  const [panelTableData, setPanelTableData] = React.useState<any[]>([]);
  const [panelReviewerTableData, setPanelReviewerTableData] = React.useState<any[]>([]);
  const [panelScienceCategoryTableData, setPanelScienceCategoryTableData] = React.useState<any[]>([]);
  const authClient = useAxiosAuthClient();

  // KEEP ONLY ONE activeView
  const [activeView, setActiveView] = useState<DashboardView>('proposal');

  const calculateAllStats = (report: any[]) => {
    // Panel stats
    const reportGroupByPanel = groupBy(report, 'panelId');
    const reportGroupByPanelWithKeys = Object.entries(reportGroupByPanel).map(([key, value]) => ({ panelId: key, value }));
    const reportGroupByPanelsThenProposalsReviewers = reportGroupByPanelWithKeys.map(panel => {
      const groupByProposal = Object.entries(groupBy(panel.value, 'prslId')).map(([key, value]) => ({ prslId: key, value }));
      const groupByReviewer = Object.entries(groupBy(panel.value, 'reviewerId'))
        .filter(([key]) => key !== 'undefined' && key !== undefined)
        .map(([key, value]) => ({ reviewerId: key, value }));
      return { ...panel, reviewGroupByPanelProposal: groupByProposal, reviewGroupByPanelReviewer: groupByReviewer };
    });
    const resultPanelTable = reportGroupByPanelsThenProposalsReviewers.map(panel => ({
      panelId: panel.panelId,
      panelName: panel.value[0].panelName,
      numProposal: panel.reviewGroupByPanelProposal.length,
      numReviewer: panel.reviewGroupByPanelReviewer.length,
      totalReviewedPercentage:
        (panel.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.REVIEWED).length * 100) / panel.value.length,
      pendingReviewedPercentage:
        (panel.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.TO_DO).length * 100) / panel.value.length,
      numInProgressReviews:
        (panel.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.IN_PROGRESS).length * 100) / panel.value.length
    }));
    setPanelTableData(resultPanelTable);

    // Reviewer stats
    const reportGroupByReviewer = groupBy(report, 'reviewerId');
    const reportGroupByReviewerWithKeys = Object.entries(reportGroupByReviewer).map(([key, value]) => ({ reviewerId: key, value }));
    const reportGroupByReviewersThenProposals = reportGroupByReviewerWithKeys.map(reviewer => {
      const groupByProposal = Object.entries(groupBy(reviewer.value, 'prslId')).map(([key, value]) => ({ prslId: key, value }));
      return { ...reviewer, reviewGroupByReviewerProposal: groupByProposal };
    });
    const resultPanelReviewerTable = reportGroupByReviewersThenProposals.map(reviewer => ({
      panelId: reviewer.value[0].panelId,
      panelName: reviewer.value[0].panelName,
      reviewerId: reviewer.reviewerId,
      numProposal: reviewer.reviewGroupByReviewerProposal.length,
      numReviewed:
        (reviewer.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.REVIEWED).length * 100) / reviewer.value.length,
      numPendingReview:
        (reviewer.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.TO_DO).length * 100) / reviewer.value.length
    }));
    setPanelReviewerTableData(resultPanelReviewerTable);

    // Science category stats
    const reportGroupByScienceCategory = groupBy(report, 'scienceCategory');
    const reportGroupByScienceCategoryWithKeys = Object.entries(reportGroupByScienceCategory).map(([key, value]) => ({
      scienceCategory: key, value
    }));
    const reportGroupByScienceCategoryThenProposals = reportGroupByScienceCategoryWithKeys.map(sc => {
      const groupByProposal = Object.entries(groupBy(sc.value, 'prslId')).map(([key, value]) => ({ prslId: key, value }));
      return { ...sc, reviewGroupByScienceCategoryProposal: groupByProposal };
    });
    setPanelScienceCategoryTableData(reportGroupByScienceCategoryThenProposals.map(sc => ({
      scienceCategory: sc.scienceCategory,
      numProposal: sc.reviewGroupByScienceCategoryProposal.length,
      numReviewed: (sc.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.REVIEWED).length * 100) / sc.value.length,
      numPendingReview: (sc.value.filter(r => r.reviewStatus === PANEL_DECISION_STATUS.TO_DO).length * 100) / sc.value.length
    })));

    // Pies
    setScienceCategoryPieChartData(
      reportGroupByScienceCategoryThenProposals.map(sc => ({ name: sc.scienceCategory, value: sc.reviewGroupByScienceCategoryProposal.length }))
    );

    const reportGroupByAssignedProposal = groupBy(report, 'assignedProposal');
    const reportGroupByAssignedProposalWithKeys = Object.entries(reportGroupByAssignedProposal).map(([key, value]) => ({
      assignedProposal: key, value
    }));
    const reportGroupByAssignedProposalThenProposals = reportGroupByAssignedProposalWithKeys.map(ap => {
      const groupByProposal = Object.entries(groupBy(ap.value, 'prslId')).map(([key, value]) => ({ prslId: key, value }));
      return { ...ap, reviewGroupByAssignedProposalProposal: groupByProposal };
    });
    setProposalPieChartData(
      reportGroupByAssignedProposalThenProposals.map(ap => ({ name: ap.assignedProposal, value: ap.reviewGroupByAssignedProposalProposal.length }))
    );

    const reportGroupByReviewStatus = groupBy(report, 'reviewStatus');
    setReviewPieChartData(
      Object.entries(reportGroupByReviewStatus).map(([key, value]) => ({
        name: key === 'undefined' ? 'Unassigned' : key, value: value.length
      }))
    );

    // Decision pie (if field exists)
    const hasDecision = Array.isArray(report) && report.some(r => 'decisionStatus' in r);
    setDecisionPieChartData(
      hasDecision
        ? Object.entries(groupBy(report, 'decisionStatus')).map(([key, value]) => ({
            name: key === 'undefined' ? 'Undecided' : key,
            value: value.length
          }))
        : []
    );
  };

  const fetchReport = () => {
    const fetchData = async () => {
      setCurrentReport([]);
      setAxiosError('');
      const response = await getReviewDashboard(authClient);
      if (typeof response === 'string') { setAxiosError(response); return; }
      if (response && response.error) { setAxiosError(response.error); return; }
      setCurrentReport(response);
    };
    fetchData();
  };

  const filterReport = (report: any[]) => {
    if (!report || report.length === 0) return [];
    const filterReportBySearch = report.filter(review => {
      if (search === '') return true;
      return Object.values(review).some(value => String(value).toLowerCase().includes(search.toLowerCase()));
    });
    return filter.telescope === ''
      ? filterReportBySearch
      : filterReportBySearch.filter(review => review.array === filter.telescope);
  };

  React.useEffect(() => {
    const fetchData = () => { fetchReport(); };
    fetchData();
    const interval = setInterval(fetchData, REFRESH_TIME);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => { calculateAllStats(filteredReport); }, [filteredReport]);

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
            <SearchEntry label="" testId="effectiveResolution" value={search} setValue={setSearch} />
          </Grid>
          <Grid pr={5}>
            <ResetButton
              action={() => { setSearch(''); setFilter({ telescope: '', country: '' }); }}
              disabled={filter.telescope === '' && filter.country === '' && search === ''}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );

  const pieChart = (label: string, data: any[]) => (
    <ResizablePanel title={t(label)}>
      <D3PieChart data={data} showTotal={true} />
    </ResizablePanel>
  );

  const panel1 = () => pieChart('reviewOverview.panel1.title', proposalPieChartData);
  const panel2 = () => pieChart('reviewOverview.panel2.title', reviewPieChartData);
  const panel3 = () => pieChart('reviewOverview.panel3.title', scienceCategoryPieChartData);

  const panel4 = () => (
    <ResizablePanel title={t('reviewOverview.panel4.title')} width={TABLE_CONTAINER_WIDTH}>
      <TableContainer sx={{ minWidth: TABLE_WIDTH }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Panel Name</TableCell>
              <TableCell align="right">Number of Reviewers</TableCell>
              <TableCell align="right">Number of Proposals</TableCell>
              <TableCell align="right">Reviewed (%)</TableCell>
              <TableCell align="right">Pending Review (%)</TableCell>
              <TableCell align="right">In Progress (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {panelTableData.map((row: any) => (
              <TableRow key={row.panelId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{row.panelName}</TableCell>
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
    <ResizablePanel title={t('reviewOverview.panel5.title')} width={TABLE_CONTAINER_WIDTH}>
      <TableContainer sx={{ minWidth: TABLE_WIDTH }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Panel Name</TableCell>
              <TableCell>Reviewer ID</TableCell>
              <TableCell align="right">Number of Proposals</TableCell>
              <TableCell align="right">Reviewed (%)</TableCell>
              <TableCell align="right">Pending Review (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {panelReviewerTableData.map((row: any) => (
              <TableRow key={row.reviewerId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{row.panelName}</TableCell>
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
    <ResizablePanel title={t('reviewOverview.panel6.title')} width={TABLE_CONTAINER_WIDTH}>
      <TableContainer sx={{ minWidth: TABLE_WIDTH }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Science Category</TableCell>
              <TableCell align="right">Number of Proposals</TableCell>
              <TableCell align="right">Reviewed (%)</TableCell>
              <TableCell align="right">Pending Review (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {panelScienceCategoryTableData.map((row: any) => (
              <TableRow key={row.scienceCategory} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{row.scienceCategory}</TableCell>
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

  const card = (key: DashboardView, title: string, subtitle?: string) => {
    const active = activeView === key;
    return (
      <Grid item xs={12} sm={4}>
        <Card
          onClick={() => setActiveView(key)}
          sx={{
            cursor: 'pointer',
            p: 2.5,
            border: active ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.12)',
            boxShadow: active ? 4 : 1,
            transition: 'all .2s ease',
            '&:hover': { boxShadow: 6 }
          }}
        >
          <Typography variant="h6" sx={{ mb: 0.5 }}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', overflowY: 'auto' }}>
      <PageBannerPMT title={t('overview.title')} />
      <Spacer size={BANNER_PMT_SPACER - 20} axis={SPACER_VERTICAL} />

      <Grid p={5} pt={0} container spacing={3} alignItems="stretch">
        {card('proposal', 'Proposal', 'Proposal Statistics')}
        {card('review', 'Review', 'Review Statistics')}
        {card('decision', 'Decision', 'Decision Statistics')}
      </Grid>

      {filters()}

      {activeView === 'proposal' && (
        <>
          <Grid p={5} spacing={5} container alignItems="center" justifyContent="space-between">
            {panel1()}
            {panel2()}
            {panel3()}
          </Grid>
          <Grid p={5} pt={0} pb={10} spacing={5} container alignItems="center" justifyContent="space-between">
            {panel4()}
            {panel5()}
            {panel6()}
          </Grid>
        </>
      )}

      {activeView === 'review' && (
        <Grid p={5} pt={3} container spacing={3}>
          <Grid item xs={12} md={4}>
            <ResizablePanel title="Review Status Breakdown">
                <D3PieChart data={reviewPieChartData} showTotal={true} />
            </ResizablePanel>
          </Grid>

          <Grid item xs={12} md={8}>
            <ResizablePanel title="Review Distribution (Grouped / Single)">
              <Box sx={{ width: '100%', height: '50vh', minHeight: 360 }}>
                <ResponsiveCategoryBarChart
                  data={filteredReport}
                  fields={['scienceCategory', 'reviewStatus', 'assignedProposal', 'array']}
                  title="Review Dashboard — Category Counts"
                  initialXField="scienceCategory"
                  initialGroupField=""   // or "reviewStatus"
                />
              </Box>
            </ResizablePanel>
          </Grid>
        </Grid>
      )}

      {activeView === 'decision' && (
        <Grid p={5} pt={3} container spacing={3}>
          <Grid item xs={12} md={6}>
            <ResizablePanel title="Decision Breakdown">
                <D3PieChart data={decisionPieChartData} showTotal={true} />
            </ResizablePanel>
          </Grid>

          <Grid item xs={12} md={6}>
            <ResizablePanel title="Notes">
              <Box p={2}>
                <Typography variant="body2" color="text.secondary">
                  Add decision tables or timelines here.
                </Typography>
              </Box>
            </ResizablePanel>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
