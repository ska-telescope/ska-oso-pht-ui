import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Card, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import { PMT } from '../../utils/constants';
import AddButton from '../../components/button/Add/Add';
import BackButton from '@/components/button/Back/Back';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import { Panel } from '@/utils/types/panel';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import GridReviewPanels from '@/components/grid/reviewPanels/GridReviewPanels';
import { PanelReviewer } from '@/utils/types/panelReviewer';

const CARD_HEIGHT = '37vh';
const CONTENT_HEIGHT = `calc(${CARD_HEIGHT} - 140px)`;

export default function PanelMaintenance() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const [theValue, setTheValue] = React.useState(0);
  const [currentPanel, setCurrentPanel] = React.useState<Panel>({} as Panel);

  const handlePanelChange = (row: Panel) => {
    setCurrentPanel(row);
  };

  const handleReviewersChange = (reviewersList: PanelReviewer[]) => {
    // Update the current panel's reviewers with the new list
    setCurrentPanel(prevPanel => ({
      ...prevPanel,
      reviewers: reviewersList
    }));
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTheValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const panelsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh">
      {t('panels.label')}
    </Typography>
  );

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[2])}
      testId="overviewButtonTestId"
      title={'overview.label'}
      toolTip="overview.toolTip"
    />
  );

  const addPanelButton = () => (
    <AddButton
      action={() => navigate(PMT[3])}
      testId="addPanelButton"
      title=""
      toolTip="addPanel.toolTip"
    />
  );

  return (
    <>
      <PageBannerPMT title={t('page.15.desc')} backBtn={backButton()} />
      <Grid container p={5} direction="row" alignItems="center" justifyContent="space-around">
        <Grid container p={5} direction="row" justifyContent="space-around" alignItems="flex-start">
          <Grid item p={2} sm={12} md={5} lg={3}>
            <Box
              sx={{
                width: '100%',
                border: '1px solid grey',
                borderRadius: '16px',
                borderTop: 'none'
              }}
              minHeight="50vh"
            >
              <Card
                variant="outlined"
                sx={{
                  padding: '12px',
                  border: '1px solid grey',
                  width: '101%',
                  marginLeft: '-2px'
                }}
              >
                <Grid container direction="row" justifyContent="space-around" alignItems="center">
                  <Grid mr={20} pt={1}>
                    {panelsSectionTitle()}
                  </Grid>
                  <Grid>{addPanelButton()}</Grid>
                </Grid>
              </Card>
              <GridReviewPanels
                height={CONTENT_HEIGHT}
                listOnly
                onRowClick={row => handlePanelChange(row)}
                updatedData={currentPanel}
              />
            </Box>
          </Grid>

          <Grid
            item
            p={2}
            sm={12}
            md={7}
            lg={9}
            container
            direction="row"
            justifyContent="space-around"
            alignItems="flex-start"
          >
            <Box sx={{ width: '100%', border: '1px solid grey' }}>
              <Box>
                <Tabs
                  variant="fullWidth"
                  textColor="secondary"
                  indicatorColor="secondary"
                  value={theValue}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab
                    label={t('reviewers.label')}
                    {...a11yProps(0)}
                    sx={{ border: '1px solid grey' }}
                  />
                  <Tab
                    label={t('proposals.label')}
                    {...a11yProps(1)}
                    sx={{ border: '1px solid grey' }}
                  />
                </Tabs>
              </Box>
              {theValue === 0 && (
                <GridReviewers
                  currentPanel={currentPanel}
                  onReviewersChange={item => handleReviewersChange(item)}
                />
              )}
              {theValue === 1 && <GridProposals />}
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      >
        <Grid container direction="column" alignItems="center" justifyContent="space-evenly"></Grid>
      </Paper>
    </>
  );
}
