import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid2, Paper, Tab, Tabs } from '@mui/material';
import { TextEntry, Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import useTheme from '@mui/material/styles/useTheme';
import { FOOTER_SPACER, PMT } from '@utils/constants.ts';
import Typography from '@mui/material/Typography';
import AddButton from '../../../components/button/Add/Add';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import Proposal from '@/utils/types/proposal';
import { presentLatex } from '@/utils/present/present';
import RankEntryField from '@/components/fields/rankEntryField/RankEntryField';

export default function ReviewEntry() {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const navigate = useNavigate();
  const locationProperties = useLocation();

  const { application } = storageObject.useStore();

  const isEdit = () => locationProperties.state !== null;

  const [tabValue, setTabValue] = React.useState(0);
  const [rank, setRank] = React.useState(0);
  const [generalComments, setGeneralComments] = React.useState('');
  const [srcNetComments, setSrcNetComments] = React.useState('');

  const getProposal = () => application.content2 as Proposal;

  const addButtonDisabled = () => {
    return isEdit() ? false : false;
  };

  const saveButtonClicked = () => {
    //create panel end point
    navigate(PMT[0]);
  };

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[1])}
      testId="pmtBackButton"
      title={'reviewProposalList.title'}
      toolTip="reviewProposalList.toolTip"
    />
  );

  const saveButton = () => (
    <AddButton
      action={saveButtonClicked}
      disabled={addButtonDisabled()}
      primary
      testId={isEdit() ? 'updatePanelButton' : 'addPanelButton'}
      title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
    />
  );

  /**************************************************************/

  const titleField = () => (
    <Typography id="title" variant={'h6'}>
      {t('title.label')} {getProposal()?.title?.length ? presentLatex(getProposal().title) : ''}
    </Typography>
  );

  const abstractField = () => (
    <Typography id="title" variant={'h6'}>
      {t('abstract.label')}{' '}
      {getProposal().abstract?.length ? presentLatex(getProposal().abstract as string) : ''}
    </Typography>
  );

  const rankField = () => {
    return (
      <Box p={2} sx={{ width: '95%', height: '65vh', overflow: 'auto' }}>
        <RankEntryField selectedRank={rank} setSelectedRank={setRank} />
      </Box>
    );
  };

  const generalCommentsField = () => (
    <Box sx={{ width: '95%', height: '65vh', overflow: 'auto' }}>
      <TextEntry
        label={''}
        testId="generalCommentsId"
        rows={50}
        required
        setValue={setGeneralComments}
        value={generalComments}
      />
    </Box>
  );

  const srcNetCommentsField = () => (
    <Box sx={{ width: '95%', height: '65vh', overflow: 'auto' }}>
      <TextEntry
        label={''}
        testId="srcNetCommentsId"
        rows={50}
        required
        setValue={setSrcNetComments}
        value={srcNetComments}
      />
    </Box>
  );

  /**************************************************************/

  const reviewArea = () => {
    function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
      };
    }

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    };

    return (
      <Paper
        sx={{
          bgcolor: `${theme.palette.primary.main}`,
          position: 'fixed',
          height: '75vh',
          top: 170,
          left: '75vw',
          right: '10px',
          border: `2px solid ${theme.palette.primary.contrastText}`,
          borderTopLeftRadius: '16px',
          borderBottomLeftRadius: '16px'
        }}
        elevation={0}
      >
        <Tabs
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
          value={tabValue}
          onChange={handleTabChange}
          aria-label="basic tabs example"
        >
          <Tab label={t('rank.label')} {...a11yProps(0)} />
          <Tab label={t('generalComments.label')} {...a11yProps(1)} />
          <Tab label={t('srcNetComments.label')} {...a11yProps(2)} />
        </Tabs>
        {tabValue === 0 && (
          <Box
            sx={{
              maxHeight: `calc('75vh' - 100px)`,
              overflowY: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {rankField()}
          </Box>
        )}
        {tabValue === 1 && (
          <Box
            sx={{
              maxHeight: `calc('75vh' - 100px)`,
              overflowY: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {generalCommentsField()}
          </Box>
        )}
        {tabValue === 2 && (
          <Box
            sx={{
              maxHeight: `calc('75vh' - 100px)`,
              overflowY: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {srcNetCommentsField()}
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <>
      <PageBannerPMT
        backBtn={backButton()}
        fwdBtn={saveButton()}
        title={t('reviewProposal.title')}
      />
      <Grid2
        pl={4}
        pr={4}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid2 size={{ md: 12, lg: 10 }} justifyContent="center">
          {titleField()}
        </Grid2>
        <Grid2 size={{ md: 12, lg: 10 }} justifyContent="center">
          {abstractField()}
        </Grid2>
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {reviewArea()}
    </>
  );
}
