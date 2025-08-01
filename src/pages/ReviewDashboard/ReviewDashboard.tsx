import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid2 from '@mui/material/Grid2';
import useTheme from '@mui/material/styles/useTheme';
import {
  DateEntry,
  DropDown,
  TextEntry,
  SPACER_VERTICAL,
  Spacer
} from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import { Card, Typography } from '@mui/material';
import groupBy from 'lodash/groupBy';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { proposals } from './mocked';
import { BANNER_PMT_SPACER, PATH, PMT } from '@/utils/constants';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import GridReviewPanels from '@/components/grid/reviewPanels/GridReviewPanels';
import CardTitle from '@/components/cards/cardTitle/CardTitle';
import D3PieChart from '@/components/charts/D3PieChart';
import { D3ChartSelector } from '@/components/charts/D3ChartSelector';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import D3BarChartWithToggle from '@/components/charts/D3BarChartWithToggle';
import ResetButton from '@/components/button/Reset/Reset';
import getReviewDashboard from '@/services/axios/getReviewDashboard/getReviewDashboard';
import { ReviewDashboard as ReviewDashboardType } from '@/utils/types/reviewDashboard';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';

const MIN_CARD_WIDTH = 350;
const CARD_HEIGHT = '45vh';
const CONTENT_HEIGHT = `calc(${CARD_HEIGHT} - 140px)`;
const REFRESH_TIME = 5 * 60 * 1000;

function groupByField(
  data: typeof proposals,
  field: keyof typeof proposals[0],
  filters: { telescope: string; country: string },
  search: string
) {
  const filtered = data.filter(d => {
    const searchMatch = Object.values(d).some(v =>
      String(v)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    return (
      (!filters.telescope || d.telescope === filters.telescope) &&
      (!filters.country || d.country === filters.country) &&
      (!search || searchMatch)
    );
  });

  const counts = filtered.reduce((acc, item) => {
    const key = item[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

const ResizablePanel = ({ children, title }: { children: ReactNode; title: string }) => (
  <div
    className="border rounded p-3 bg-white shadow flex flex-col resize overflow-auto mb-6 hover:bg-gray-100 hover:shadow-md transition-all duration-200"
    style={{
      minWidth: '350px',
      minHeight: '300px',
      resize: 'both',
      overflow: 'auto',
      border: '1px solid #ccc',
      borderRadius: '16px'
    }}
  >
    <Typography p={1} variant="h5">
      {title}
    </Typography>

    <div className="flex-1 flex items-center justify-center w-full h-full">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

export default function ReviewDashboard() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const theme = useTheme();
  const [filter, setFilter] = useState({ telescope: '', country: '' });
  const [search, setSearch] = useState('');
  const [currentReport, setCurrentReport] = React.useState([]);
  const [filteredReport, setFilteredReport] = React.useState([]);
  const [axiosError, setAxiosError] = React.useState('');
  const [proposalPieChartData, setProposalPieChartData] = React.useState([]);
  const [reviewPieChartData, setReviewPieChartData] = React.useState([]);
  const [scienceCategoryPieChartData, setScienceCategoryPieChartData] = React.useState([]);
  const [panelTableData, setPanelTableData] = React.useState([]);
  const [panelReviewerTableData, setPanelReviewerTableData] = React.useState([]);
  const [panelScienceCategoryTableData, setPanelScienceCategoryTableData] = React.useState([]);
  const authClient = useAxiosAuthClient();

  const onPanelClick = (thePath: string) => {
    if (thePath?.length > 0) {
      navigate(thePath);
    }
  };

  const panelButton = (title: string, toolTip: string, nav: string) => (
    <Grid2 m={2} data-testid={title} minWidth={MIN_CARD_WIDTH}>
      <Card data-testid={title}>
        <CardTitle
          className={''}
          code={t(title)[0].toUpperCase()}
          colorAvatarBG={theme.palette.primary.contrastText}
          colorAvatarFG={theme.palette.primary.main}
          colorCardBG={theme.palette.primary.main}
          colorCardFG={theme.palette.primary.contrastText}
          id={title}
          onClick={() => onPanelClick(nav)}
          title={t(title)}
          toolTip={t(toolTip)}
        />
      </Card>
    </Grid2>
  );

  const calculateAllStats = report => {
    /**
     * Group by Panel ID then separate node for group by Proposa ID and Reviewer ID
     */

    console.log('calculateAllStats filter');

    const reportGroupByPanal = groupBy(report, 'panelId');
    const reportGroupByPanalWithKeys = Object.entries(reportGroupByPanal).map(([key, value]) => ({
      panelId: key,
      value: value
    }));

    const reportGroupByPanalsThenProposalsReviewers = reportGroupByPanalWithKeys.map(panel => {
      const groupByProposal = Object.entries(groupBy(panel.value, 'prslId')).map(
        ([key, value]) => ({
          prslId: key,
          value: value
        })
      );

      const groupByReviewer = Object.entries(groupBy(panel.value, 'reviewerId')).map(
        ([key, value]) => ({
          reviewerId: key,
          value: value
        })
      );

      return {
        ...panel,
        reviewGroupByPanelProposal: groupByProposal,
        reviewGroupByPanelReviewer: groupByReviewer
      };
    });

    const resultPanelTable = reportGroupByPanalsThenProposalsReviewers.map(panel => {
      return {
        panelId: panel.panelId,
        panelName: panel.value[0].panelName,
        numProposal: panel.reviewGroupByPanelProposal.length,
        numReviewer: panel.reviewGroupByPanelReviewer.length,
        totalReviewedPercentage:
          (panel.value.filter(review => review.reviewStatus === 'Decided').length * 100) /
          panel.value.length,
        pendingReviewedPercentage:
          (panel.value.filter(review => review.reviewStatus === 'In Progress').length * 100) /
          panel.value.length,
        numExcludedReviews:
          (panel.value.filter(review => review.reviewStatus === 'In Progress').length * 100) /
          panel.value.length
      };
    });

    setPanelTableData(resultPanelTable);

    /**
     * Group by Reviewer then Proposal
     */

    const reportGroupByReviewer = groupBy(report, 'reviewerId');
    const reportGroupByReviewerWithKeys = Object.entries(reportGroupByReviewer).map(
      ([key, value]) => ({
        reviewerId: key,
        value: value
      })
    );

    console.log('reportGroupByReviewerWithKeys', reportGroupByReviewerWithKeys);

    const reportGroupByReivewersThenProposals = reportGroupByReviewerWithKeys.map(reviewer => {
      console.log('reviewer item', reviewer);
      const groupByProposal = Object.entries(groupBy(reviewer.value, 'prslId')).map(
        ([key, value]) => ({
          prslId: key,
          value: value
        })
      );

      return {
        ...reviewer,
        reviewGroupByReviewerProposal: groupByProposal
      };
    });

    const resultPanelReviewerTable = reportGroupByReivewersThenProposals.map(reviewer => {
      return {
        panelId: reviewer.value[0].panelId,
        panelName: reviewer.value[0].panelName,
        reviewerId: reviewer.reviewerId,
        numProposal: reviewer.reviewGroupByReviewerProposal.length,
        numReviewed:
          (reviewer.value.filter(review => review.reviewStatus === 'Decided').length * 100) /
          reviewer.value.length, //TODO: pdm has no status called reviewed, use Decided for now
        numPendingReview:
          (reviewer.value.filter(review => review.reviewStatus === 'To Do').length * 100) /
          reviewer.value.length //TODO: do we need in progress?
      };
    });

    setPanelReviewerTableData(resultPanelReviewerTable);

    /**
     * Group by Science Category then Proposal ID
     */

    const reportGroupByScienceCategory = groupBy(report, 'scienceCategory');
    const reportGroupByScienceCategoryWithKeys = Object.entries(reportGroupByScienceCategory).map(
      ([key, value]) => ({
        scienceCategory: key,
        value: value
      })
    );

    const reportGroupByScienceCategoryThenProposals = reportGroupByScienceCategoryWithKeys.map(
      scienceCategory => {
        console.log('reviewer item', scienceCategory);
        const groupByProposal = Object.entries(groupBy(scienceCategory.value, 'prslId')).map(
          ([key, value]) => ({
            prslId: key,
            value: value
          })
        );

        return {
          ...scienceCategory,
          reviewGroupByScienceCategoryProposal: groupByProposal
        };
      }
    );

    console.log(
      'reportGroupByScienceCategoryThenProposals',
      reportGroupByScienceCategoryThenProposals
    );

    const resultScienceCategoryTable = reportGroupByScienceCategoryThenProposals.map(
      scienceCategory => {
        return {
          scienceCategory: scienceCategory.scienceCategory,
          numProposal: scienceCategory.reviewGroupByScienceCategoryProposal.length,
          numReviewed:
            (scienceCategory.value.filter(review => review.reviewStatus === 'Decided').length *
              100) /
            scienceCategory.value.length, //TODO: pdm has no status called reviewed, use Decided for now
          numPendingReview:
            (scienceCategory.value.filter(review => review.reviewStatus === 'To Do').length * 100) /
            scienceCategory.value.length //TODO: do we need in progress?
        };
      }
    );

    console.log('resultScienceCategoryTable', resultScienceCategoryTable);

    setPanelScienceCategoryTableData(resultScienceCategoryTable);

    //Pie chart data
    const resultScienceCategoryPieChart = reportGroupByScienceCategoryThenProposals.map(
      scienceCategory => {
        return {
          name: scienceCategory.scienceCategory,
          value: scienceCategory.reviewGroupByScienceCategoryProposal.length
        };
      }
    );

    console.log('resultScienceCategoryPieChart', resultScienceCategoryPieChart);
    setScienceCategoryPieChartData(resultScienceCategoryPieChart);

    /**
     * Group by assignedProposal then proposal
     */

    const reportGroupByassignedProposal = groupBy(report, 'assignedProposal');
    const reportGroupByassignedProposalWithKeys = Object.entries(reportGroupByassignedProposal).map(
      ([key, value]) => ({
        assignedProposal: key,
        value: value
      })
    );

    console.log('reportGroupByassignedProposalWithKeys', reportGroupByassignedProposalWithKeys);

    const reportGroupByAssignedProposalThenProposals = reportGroupByassignedProposalWithKeys.map(
      assignedProposal => {
        const groupByProposal = Object.entries(groupBy(assignedProposal.value, 'prslId')).map(
          ([key, value]) => ({
            prslId: key,
            value: value
          })
        );

        return {
          ...assignedProposal,
          reviewGroupByAssignedProposalProposal: groupByProposal
        };
      }
    );

    console.log(
      'reportGroupByAssignedProposalThenProposals',
      reportGroupByAssignedProposalThenProposals
    );

    const resultProposalPieChart = reportGroupByAssignedProposalThenProposals.map(
      assignedProposal => {
        return {
          name: assignedProposal.assignedProposal,
          value: assignedProposal.reviewGroupByAssignedProposalProposal.length
        };
      }
    );
    console.log('resultProposalPieChart', resultProposalPieChart);

    setProposalPieChartData(resultProposalPieChart);

    /**
     * Group by reviewStatus
     */

    const reportGroupByReviewStatus = groupBy(report, 'reviewStatus');

    const resultReviewStatusPieChart = Object.entries(reportGroupByReviewStatus).map(
      ([key, value]) => ({
        name: key,
        value: value.length
      })
    );

    console.log('resultReviewStatusPieChart', resultReviewStatusPieChart);

    setReviewPieChartData(resultReviewStatusPieChart);
  };

  const fetchReport = () => {
    const fetchData = async () => {
      setCurrentReport([]);

      const response = await getReviewDashboard(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
      } else {
        setCurrentReport(response);
      }
    };
    fetchData();
  };

  const filterReport = currentReport => {
    if (filter.telescope === '') return currentReport;

    const filteredReport = currentReport.filter(review => {
      if (filter.telescope === 'BOTH') {
        return review.array === 'MID' || review.array === 'LOW';
      } else {
        return review.array === filter.telescope;
      }
    });

    console.log('filteredReport', filteredReport);

    return filteredReport;
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
    //generate data for all chart
    calculateAllStats(filteredReport);
  }, [filteredReport]);

  React.useEffect(() => {
    //currently we are not filtering country / search

    const filteredReport = filterReport(currentReport);

    setFilteredReport(filteredReport);
  }, [filter, currentReport]);

  return (
    <>
      <PageBannerPMT title={t('overview.title')} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      {/* Filters */}
      <Grid2 container spacing={2} px={5} py={2} alignItems="center" justifyContent="space-between">
        <Grid2 size={{ sm: 2 }}>
          <DropDown
            options={[
              { value: '', label: 'All' },
              { value: 'LOW', label: 'LOW' },
              { value: 'MID', label: 'MID' },
              { value: 'BOTH', label: 'BOTH' }
            ]}
            testId={'telescopeTestId'}
            value={filter.telescope}
            setValue={(e: string) => setFilter({ ...filter, telescope: e })}
            label={'Telescope'}
          />
        </Grid2>
        <Grid2 size={{ sm: 2 }}>
          <DropDown
            options={[
              { value: '', label: 'All' },
              { value: 'South Africa', label: 'South Africa' },
              { value: 'United Kingdom', label: 'United Kingdom' },
              { value: 'Namibia', label: 'Namibia' }
            ]}
            testId={'countryTestId'}
            value={filter.country}
            setValue={(e: string) => setFilter({ ...filter, country: e })}
            label={'Country'}
          />
        </Grid2>
        <Grid2 size={{ sm: 2 }}>
          <TextEntry
            label={'Search'}
            setValue={setSearch}
            testId="effectiveResolution"
            value={search}
          />
        </Grid2>
        <Grid2 size={{ sm: 2 }}>
          <ResetButton
            action={() => {
              setSearch('');
              setFilter({ telescope: '', country: '' });
            }}
            disabled={filter.telescope === '' && filter.country === '' && search === ''}
          />
        </Grid2>
      </Grid2>

      {/* Metrics */}
      <Grid2 container spacing={2} px={5} py={3} pb={10}>
        <Grid2>
          <ResizablePanel title="Proposal Assigned">
            <D3PieChart
              // data={proposalStatusData}
              data={proposalPieChartData}
              showTotal={true}
              //centerText={proposalStatusData.reduce((sum, d) => sum + d.value, 0).toString()}
            />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title="Status of Review">
            <D3PieChart
              data={reviewPieChartData}
              showTotal={true}
              // centerText={scienceCategoryData.reduce((sum, d) => sum + d.value, 0).toString()}
            />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title="Science Categories">
            <D3PieChart
              data={scienceCategoryPieChartData}
              showTotal={true}
              // centerText={scienceCategoryData.reduce((sum, d) => sum + d.value, 0).toString()}
            />
          </ResizablePanel>
        </Grid2>
        {/* <Grid2>
          <ResizablePanel title="Reviewer Rank Distribution">
            <D3BarChartWithToggle
              data={proposals}
              groupByOptions={['status', 'category', 'country']}
              allFields={['rank', 'telescope']}
            />
          </ResizablePanel>
        </Grid2> */}
        {/* <Grid2>
          <ResizablePanel title="New Rank Distribution">
            <D3ChartSelector data={proposals} />
          </ResizablePanel>
        </Grid2> */}

        <Grid2>
          <ResizablePanel title={'No Title in ticket'}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Panel ID</TableCell>
                    <TableCell>Panel Name</TableCell>
                    <TableCell align="right">Number of Reviewers</TableCell>
                    <TableCell align="right">Number of Proposals</TableCell>
                    <TableCell align="right">Reviewed (%)</TableCell>
                    <TableCell align="right">Pending Review (%)</TableCell>
                    <TableCell align="right">Number of Excluded Reviews</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {panelTableData.map(row => (
                    <TableRow
                      key={row.panelId}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.panelId}
                      </TableCell>
                      <TableCell align="right">{row.panelName}</TableCell>
                      <TableCell align="right">{row.numReviewer}</TableCell>
                      <TableCell align="right">{row.numProposal}</TableCell>
                      <TableCell align="right">{row.totalReviewedPercentage}</TableCell>
                      <TableCell align="right">{row.pendingReviewedPercentage}</TableCell>
                      <TableCell align="right">{row.numExcludedReviews}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ResizablePanel>
        </Grid2>

        <Grid2>
          <ResizablePanel title={'No Title in ticket 2'}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Panel ID</TableCell>
                    <TableCell>Panel Name</TableCell>
                    <TableCell>Reviewer ID</TableCell>
                    <TableCell align="right">Number of Proposals</TableCell>
                    <TableCell align="right">Reviewed (%)</TableCell>
                    <TableCell align="right">Pending Review (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {panelReviewerTableData.map(row => (
                    <TableRow
                      key={row.reviewerId}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.panelId}
                      </TableCell>
                      <TableCell align="right">{row.panelName}</TableCell>
                      <TableCell align="right">{row.reviewerId}</TableCell>
                      <TableCell align="right">{row.numProposal}</TableCell>
                      <TableCell align="right">{row.numReviewed}</TableCell>
                      <TableCell align="right">{row.numPendingReview}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ResizablePanel>
        </Grid2>

        <Grid2>
          <ResizablePanel title={'No Title in ticket 3'}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Science Category</TableCell>
                    <TableCell>Number of Proposal</TableCell>
                    <TableCell align="right">Reviewed (%)</TableCell>
                    <TableCell align="right">Pending Review (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {panelScienceCategoryTableData.map(row => (
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
        </Grid2>

        <Grid2>
          <ResizablePanel title={t('panels.label')}>
            <GridReviewPanels height={CONTENT_HEIGHT} updatedData={null} listOnly />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={t('reviewProposalList.title')}>
            <GridReviewers height={CONTENT_HEIGHT} />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={t('homeBtn.title')}>
            <GridProposals height={CONTENT_HEIGHT} />
          </ResizablePanel>
        </Grid2>
      </Grid2>
    </>
  );
}
