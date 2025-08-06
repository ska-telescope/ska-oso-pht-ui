import React, { useState } from 'react';
import Grid2 from '@mui/material/Grid2';
import { DropDown, TextEntry, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import { Typography } from '@mui/material';
import groupBy from 'lodash/groupBy';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { BANNER_PMT_SPACER } from '@/utils/constants';
import D3PieChart from '@/components/charts/D3PieChart';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import ResetButton from '@/components/button/Reset/Reset';
import getReviewDashboard from '@/services/axios/getReviewDashboard/getReviewDashboard';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';

const REFRESH_TIME = 5 * 60 * 1000;

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
  const [filter, setFilter] = useState({ telescope: '', country: '' });
  const [search, setSearch] = useState('');
  const [currentReport, setCurrentReport] = React.useState([]);
  const [filteredReport, setFilteredReport] = React.useState([]);
  const [, setAxiosError] = React.useState(''); // TODO: update to display axiosError
  const [proposalPieChartData, setProposalPieChartData] = React.useState([]);
  const [reviewPieChartData, setReviewPieChartData] = React.useState([]);
  const [scienceCategoryPieChartData, setScienceCategoryPieChartData] = React.useState([]);
  const [panelTableData, setPanelTableData] = React.useState([]);
  const [panelReviewerTableData, setPanelReviewerTableData] = React.useState([]);
  const [panelScienceCategoryTableData, setPanelScienceCategoryTableData] = React.useState([]);
  const authClient = useAxiosAuthClient();

  const calculateAllStats = report => {
    /**
     * Group by Panel ID then separate node for group by Proposa ID and Reviewer ID
     */

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
          (panel.value.filter(review => review.reviewStatus === 'To Do').length * 100) /
          panel.value.length,
        numInProgressReviews:
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

    const reportGroupByReivewersThenProposals = reportGroupByReviewerWithKeys.map(reviewer => {
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
          reviewer.value.length,
        numPendingReview:
          (reviewer.value.filter(review => review.reviewStatus === 'To Do').length * 100) /
          reviewer.value.length
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

    const resultScienceCategoryTable = reportGroupByScienceCategoryThenProposals.map(
      scienceCategory => {
        return {
          scienceCategory: scienceCategory.scienceCategory,
          numProposal: scienceCategory.reviewGroupByScienceCategoryProposal.length,
          numReviewed:
            (scienceCategory.value.filter(review => review.reviewStatus === 'Decided').length *
              100) /
            scienceCategory.value.length,
          numPendingReview:
            (scienceCategory.value.filter(review => review.reviewStatus === 'To Do').length * 100) /
            scienceCategory.value.length
        };
      }
    );

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

    const resultProposalPieChart = reportGroupByAssignedProposalThenProposals.map(
      assignedProposal => {
        return {
          name: assignedProposal.assignedProposal,
          value: assignedProposal.reviewGroupByAssignedProposalProposal.length
        };
      }
    );

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

    setReviewPieChartData(resultReviewStatusPieChart);
  };

  const fetchReport = () => {
    const fetchData = async () => {
      setCurrentReport([]);
      setAxiosError('');

      const response = await getReviewDashboard(authClient);
      if (typeof response === 'string') {
        setAxiosError(response);
        return;
      } else {
        setCurrentReport(response);
      }
    };
    fetchData();
  };

  const filterReport = currentReport => {
    const filterReportBySearch = currentReport.filter(review => {
      if (search === '') {
        return true;
      } else {
        return Object.values(review).some(value =>
          String(value)
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }
    });

    const filteredReport = filterReportBySearch.filter(review => {
      if (filter.telescope === '') {
        return true;
      } else {
        return review.array === filter.telescope;
      }
    });

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
    calculateAllStats(filteredReport);
  }, [filteredReport]);

  React.useEffect(() => {
    // note: currently we are not filtering country

    const filteredReport = filterReport(currentReport);

    setFilteredReport(filteredReport);
  }, [filter, currentReport, search]);

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
        {/* note: Hide for now as requested */}
        {/* <Grid2 size={{ sm: 2 }}>
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
        */}
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
            <D3PieChart data={proposalPieChartData} showTotal={true} />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title="Status of Review">
            <D3PieChart data={reviewPieChartData} showTotal={true} />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title="Science Categories">
            <D3PieChart data={scienceCategoryPieChartData} showTotal={true} />
          </ResizablePanel>
        </Grid2>
        <Grid2>
          <ResizablePanel title={'Review Distribution across Panels'}>
            <TableContainer component={Paper}>
              {/* TODO: refactor the grid / resizable panel - note: minWidth 560+560+16+16 from pie charts */}
              <Table sx={{ minWidth: 1712 }}>
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
                  {panelTableData.map(row => (
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
        </Grid2>

        <Grid2>
          <ResizablePanel title={'Review Distribution across Reviewers'}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 1712 }}>
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
                  {panelReviewerTableData.map(row => (
                    <TableRow
                      key={row.panelId}
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
        </Grid2>

        <Grid2>
          <ResizablePanel title={'Review Distribution across Science Category'}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 1712 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Science Category</TableCell>
                    <TableCell align="right">Number of Proposal</TableCell>
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
      </Grid2>
    </>
  );
}
