import React, { useState } from 'react';
import { DropDown, SearchEntry, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { Box, Card, Grid } from '@mui/material';
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
import ResizablePanel from '@/components/layout/resizablePanel/ResizablePanel';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import CardTitle from '@/components/cards/cardTitle/CardTitle';

const REFRESH_TIME = 5 * 60 * 1000;
const TABLE_WIDTH = '95vw';
const TABLE_CONTAINER_WIDTH = '97vw';
export default function ReviewDashboard() {
  const { t } = useScopedTranslation();
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

  const calculateAllStats = (report: any) => {
    /**
     * Group by Panel ID then separate node for group by proposals a ID and Reviewer ID
     */

    const reportGroupByPanel = groupBy(report, 'panelId');
    const reportGroupByPanelWithKeys = Object.entries(reportGroupByPanel).map(([key, value]) => ({
      panelId: key,
      value: value
    }));

    const reportGroupByPanelsThenProposalsReviewers = reportGroupByPanelWithKeys.map(panel => {
      const groupByProposal = Object.entries(groupBy(panel.value, 'prslId')).map(
        ([key, value]) => ({
          prslId: key,
          value: value
        })
      );

      const groupByReviewer = Object.entries(groupBy(panel.value, 'reviewerId'))
        .filter(([key]) => key !== 'undefined' && key !== undefined)
        .map(([key, value]) => ({
          reviewerId: key,
          value: value
        }));

      return {
        ...panel,
        reviewGroupByPanelProposal: groupByProposal,
        reviewGroupByPanelReviewer: groupByReviewer
      };
    });

    const resultPanelTable = reportGroupByPanelsThenProposalsReviewers.map(panel => {
      return {
        panelId: panel.panelId,
        panelName: panel.value[0].panelName,
        numProposal: panel.reviewGroupByPanelProposal.length,
        numReviewer: panel.reviewGroupByPanelReviewer.length,
        totalReviewedPercentage:
          (panel.value.filter(review => review.reviewStatus === PANEL_DECISION_STATUS.REVIEWED)
            .length *
            100) /
          panel.value.length,
        pendingReviewedPercentage:
          (panel.value.filter(review => review.reviewStatus === PANEL_DECISION_STATUS.TO_DO)
            .length *
            100) /
          panel.value.length,
        numInProgressReviews:
          (panel.value.filter(review => review.reviewStatus === PANEL_DECISION_STATUS.IN_PROGRESS)
            .length *
            100) /
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

    const reportGroupByReviewersThenProposals = reportGroupByReviewerWithKeys.map(reviewer => {
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

    const resultPanelReviewerTable = reportGroupByReviewersThenProposals.map(reviewer => {
      return {
        panelId: reviewer.value[0].panelId,
        panelName: reviewer.value[0].panelName,
        reviewerId: reviewer.reviewerId,
        numProposal: reviewer.reviewGroupByReviewerProposal.length,
        numReviewed:
          (reviewer.value.filter(review => review.reviewStatus === PANEL_DECISION_STATUS.REVIEWED)
            .length *
            100) /
          reviewer.value.length,
        numPendingReview:
          (reviewer.value.filter(review => review.reviewStatus === PANEL_DECISION_STATUS.TO_DO)
            .length *
            100) /
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
            (scienceCategory.value.filter(
              review => review.reviewStatus === PANEL_DECISION_STATUS.REVIEWED
            ).length *
              100) /
            scienceCategory.value.length,
          numPendingReview:
            (scienceCategory.value.filter(
              review => review.reviewStatus === PANEL_DECISION_STATUS.TO_DO
            ).length *
              100) /
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

    const reportGroupByAssignedProposal = groupBy(report, 'assignedProposal');
    const reportGroupByAssignedProposalWithKeys = Object.entries(reportGroupByAssignedProposal).map(
      ([key, value]) => ({
        assignedProposal: key,
        value: value
      })
    );

    const reportGroupByAssignedProposalThenProposals = reportGroupByAssignedProposalWithKeys.map(
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
        name: key === 'undefined' ? 'Unassigned' : key,
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
      } else if (response && response.error) {
        setAxiosError(response.error);
        return;
      } else {
        setCurrentReport(response);
      }
    };
    fetchData();
  };

  const filterReport = (currentReport: any[]) => {
    if (!currentReport || currentReport.length === 0) return [];
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

  const filters = () => (
    <Box pl={5} pr={5}>
      <Card>
        {' '}
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
          {/* note: Hide for now as requested */}
          {/* <Grid size={{ sm: 2 }}>
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
        </Grid>
        */}
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

  /*------------------------------------ */

  function clickCard(id: number) {
    // DO SOMETHING HERE
  }

  function DataType(id: number) {
    return (
      <Grid key={id} size={{ md: 4, lg: 3 }}>
        <CardTitle
          code={String(id)}
          id={String(id)}
          onClick={() => clickCard(id)}
          title={'title' + id}
          toolTip={'tooltip' + id}
        />
      </Grid>
    );
  }

  const card1 = () => {
    return DataType(0);
  };
  const card2 = () => {
    return DataType(1);
  };
  const card3 = () => {
    return DataType(2);
  };

  /*------------------------------------ */

  const pieChart = (label: string, data: any[]) => {
    return (
      <ResizablePanel title={t(label)}>
        <D3PieChart data={data} showTotal={true} />
      </ResizablePanel>
    );
  };

  const panel1 = () => pieChart('reviewOverview.panel1.title', proposalPieChartData);
  const panel2 = () => pieChart('reviewOverview.panel2.title', reviewPieChartData);
  const panel3 = () => pieChart('reviewOverview.panel3.title', scienceCategoryPieChartData);

  const panel4 = () => {
    return (
      <ResizablePanel title={t('reviewOverview.panel4.title')} width={TABLE_CONTAINER_WIDTH}>
        {/* TODO: refactor the grid / resizable panel - note: minWidth 560+560+16+16 from pie charts */}
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
  };

  const panel5 = () => {
    return (
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
  };

  const panel6 = () => {
    return (
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
  };

  return (
    <>
      <PageBannerPMT title={t('overview.title')} />
      <Spacer size={BANNER_PMT_SPACER - 20} axis={SPACER_VERTICAL} />

      <Grid p={5} spacing={5} container alignItems="center" justifyContent="space-between">
        {card1()}
        {card2()}
        {card3()}
      </Grid>

      {filters()}

      {/* Metrics */}
      <Grid p={5} spacing={5} container alignItems="center" justifyContent="space-between">
        {panel1()}
        {panel2()}
        {panel3()}
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
}
