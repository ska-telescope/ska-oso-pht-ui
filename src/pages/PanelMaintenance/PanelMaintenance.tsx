import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { PATH, PMT } from '../../utils/constants';
import AddButton from '../../components/button/Add/Add';
import BackButton from '@/components/button/Back/Back';
import GridProposals from '@/components/grid/proposals/GridProposals';
import GridReviewers from '@/components/grid/reviewers/GridReviewers';
import { Panel } from '@/utils/types/panel';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';

export default function PanelMaintenance() {
  const { t } = useTranslation('pht');

  const navigate = useNavigate();

  const [theValue, setTheValue] = React.useState(0);
  const [panels] = React.useState<Panel[]>([
    { panelId: 'P400', name: 'Stargazers', cycle: '2023-2024', proposals: [], reviewers: [] },
    { panelId: 'P500', name: 'Buttons', cycle: '2023-2024', proposals: [], reviewers: [] },
    { panelId: 'P600', name: 'Nashrakra', cycle: '2023-2024', proposals: [], reviewers: [] }
  ]);
  const [currentPanel, setCurrentPanel] = React.useState<Panel>({} as Panel);

  React.useEffect(() => {
    setCurrentPanel(panels[0]); // Set the first panel as current by default for now
  }, panels);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTheValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const clickFunction = () => {
    navigate(PATH[1]);
  };

  const panelsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh">
      {t('panels.label')}
    </Typography>
  );

  const backButton = () => (
    <BackButton
      action={clickFunction}
      testId="backButtonTestId"
      title={'overview.label'}
      toolTip="overview.toolTip"
    />
  );

  const addPanelButton = () => (
    <AddButton
      action={() => navigate(PMT[3])}
      testId="addPanelButton"
      title={'addPanel.label'}
      toolTip="addPanel.toolTip"
    />
  );

  const getpanelListItems = () => {
    return panels.map(panel => (
      <ListItem key={panel.panelId} sx={{ bgcolor: 'transparent' }}>
        <ListItemButton>
          <ListItemText primary={panel.name} secondary={panel.panelId} />
        </ListItemButton>
      </ListItem>
    ));
  };

  return (
    <>
      <PageBannerPMT title={t('page.15.desc')} backBtn={backButton()} />
      <Grid container p={5} direction="row" alignItems="center" justifyContent="space-around">
        <Grid container p={5} lg={3} direction="row" justifyContent="flex-start">
          <Grid mr={5} pt={1}>
            {addPanelButton()}
          </Grid>
        </Grid>
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
                {panelsSectionTitle()}
              </Card>
              <List>
                {getpanelListItems().length > 0 ? (
                  getpanelListItems()
                ) : (
                  <ListItem>
                    <ListItemText primary={t('panels.empty')} />
                  </ListItem>
                )}
              </List>
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
              {theValue === 0 && <GridReviewers currentPanel={currentPanel} />}
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
