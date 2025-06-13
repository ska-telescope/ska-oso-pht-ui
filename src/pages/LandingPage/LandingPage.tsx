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
import { PATH } from '../../utils/constants';
import AddButton from '../../components/button/Add/Add';
import OverviewButton from '@/components/button/Overview/Overview';
import GetButton from '@/components/button/Get/Get';
import AssignButton from '@/components/button/Assign/Assign';
import GridProposals from '@/components/grid/proposals/GridProposals';

export default function LandingPage() {
  const { t } = useTranslation('pht');

  const navigate = useNavigate();

  const [theValue, setTheValue] = React.useState(0);

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

  const pageDescription = () => (
    <Typography align="center" minHeight="5vh">
      {t('page.15.desc')}
    </Typography>
  );

  const panelsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh">
      {t('panels.label')}
    </Typography>
  );

  const overviewButton = () => (
    <OverviewButton
      action={clickFunction}
      testId="overviewButton"
      title={'overview.label'}
      toolTip="overview.toolTip"
    />
  );

  const addPanelButton = () => (
    <AddButton
      action={clickFunction}
      testId="addPanelButton"
      title={'addPanel.label'}
      toolTip="addPanel.toolTip"
    />
  );

  const getReviewersButton = () => (
    <GetButton
      action={clickFunction}
      testId="getReviewersButton"
      title={'getReviewers.label'}
      toolTip="getReviewers.toolTip"
    />
  );

  const assignProposalsButton = () => (
    <AssignButton
      action={clickFunction}
      testId="assignProposalsButton"
      title={'assignProposals.label'}
      toolTip="assignProposals.toolTip"
    />
  );

  const getPanels = () => {
    return [
      { id: 'P400', name: 'Stargazers' },
      { id: 'P500', name: 'Buttons' },
      { id: 'P600', name: 'Nakshatra' }
    ];
  };

  const getpanelListItems = () => {
    const panels = getPanels();
    return panels.map(panel => (
      <ListItem key={panel.id} sx={{ bgcolor: 'transparent' }}>
        <ListItemButton>
          <ListItemText primary={panel.name} secondary={panel.id} />
        </ListItemButton>
      </ListItem>
    ));
  };

  return (
    <>
      <Grid container p={5} direction="row" alignItems="center" justifyContent="space-around">
        <Grid item xs={12}>
          {pageDescription()}
        </Grid>
        <Grid container p={5} lg={3} direction="row" justifyContent="flex-start">
          <Grid mr={5} pt={1}>
            {overviewButton()}
          </Grid>
        </Grid>
        <Grid container p={5} lg={9} direction="row" justifyContent="flex-end">
          <Grid mr={5} pt={1}>
            {addPanelButton()}
          </Grid>
          <Grid mr={5} pt={1}>
            {getReviewersButton()}
          </Grid>
          <Grid mr={5} pt={1}>
            {assignProposalsButton()}
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
              {theValue === 0 && <div>There are no reviewers to be displayed</div>}
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
