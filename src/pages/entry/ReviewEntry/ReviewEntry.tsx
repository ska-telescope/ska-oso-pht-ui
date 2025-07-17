import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Divider, Grid2, Paper, Stack, Tab, Tabs } from '@mui/material';
import { Spacer, SPACER_VERTICAL, TextEntry } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import useTheme from '@mui/material/styles/useTheme';
import { BANNER_PMT_SPACER, PMT } from '@utils/constants.ts';
import Typography from '@mui/material/Typography';
import SaveButton from '../../../components/button/Save/Save';
import SubmitButton from '@/components/button/Submit/Submit';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import Proposal from '@/utils/types/proposal';
import { presentLatex } from '@/utils/present/present';
import RankEntryField from '@/components/fields/rankEntryField/RankEntryField';
import PDFViewer from '@/components/layout/PDFViewer/PDFViewer';
import ConflictButton from '@/components/button/Conflict/Conflict';

export const REVIEW_TYPE = {
  SCIENCE: 'science',
  TECHNICAL: 'technical'
};

interface ReviewEntryProps {
  reviewType: string;
}

export default function ReviewEntry({ reviewType }: ReviewEntryProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const navigate = useNavigate();
  const locationProperties = useLocation();

  const { application } = storageObject.useStore();

  const isEdit = () => locationProperties.state !== null;

  const [tabValuePDF, setTabValuePDF] = React.useState(0);
  const [tabValueReview, setTabValueReview] = React.useState(0);
  const [rank, setRank] = React.useState(0);
  const [generalComments, setGeneralComments] = React.useState('');
  const [srcNetComments, setSrcNetComments] = React.useState('');

  const AREA_HEIGHT_NUM = 74;
  const AREA_HEIGHT = AREA_HEIGHT_NUM + 'vh';

  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    if (isEdit()) {
      setGeneralComments(locationProperties.state?.generalComments);
      setSrcNetComments(locationProperties.state?.srcNetComments);
      setRank(locationProperties.state?.rank);
    } else {
      setGeneralComments('');
      setSrcNetComments('');
      setRank(0);
    }
  }, []);

  const submitDisabled = () => {
    return generalComments?.length === 0 || srcNetComments?.length === 0 || rank === 0;
  };

  const conflictButtonClicked = () => {
    // TODO
  };

  const saveButtonClicked = () => {
    // TODO
    //create panel end point
    // navigate(PMT[0]);
  };

  const submitButtonClicked = () => {
    // navigate(PMT[0]);
  };

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[1])}
      testId="pmtBackButton"
      title={'reviewProposalList.title'}
      toolTip="reviewProposalList.toolTip"
    />
  );

  const actionButtons = () => (
    <Grid2 spacing={1} container justifyContent="space-between" direction="row">
      <ConflictButton action={conflictButtonClicked} disabled />
      <SaveButton action={saveButtonClicked} primary toolTip={''} />
      <SubmitButton action={submitButtonClicked} disabled={submitDisabled()} primary toolTip={''} />
    </Grid2>
  );

  /**************************************************************/

  const sciencePDF = () => (
    <Paper
      sx={{
        margin: 1,
        bgcolor: `${theme.palette.primary.main}`,
        width: '90%',
        overflow: 'auto'
      }}
      elevation={0}
    >
      <PDFViewer />
    </Paper>
  );

  const technicalPDF = () => (
    <Paper
      sx={{
        margin: 1,
        bgcolor: `${theme.palette.primary.main}`,
        width: '90%',
        overflow: 'auto'
      }}
      elevation={0}
    >
      <PDFViewer />
    </Paper>
  );

  const pdfArea = () => {
    function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
      };
    }

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
      setTabValuePDF(newValue);
    };

    return (
      <Paper
        sx={{
          borderRadius: '16px'
        }}
        elevation={0}
      >
        <Tabs
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
          value={tabValuePDF}
          onChange={handleTabChange}
          aria-label="basic tabs example"
        >
          <Tab label={t('page.3.title')} {...a11yProps(0)} />
          <Tab label={t('page.6.title')} {...a11yProps(1)} />
        </Tabs>
        {tabValuePDF === 0 && sciencePDF()}
        {tabValuePDF === 1 && technicalPDF()}
      </Paper>
    );
  };

  /**************************************************************/

  const displayArea = () => {
    return (
      <>
        <Stack p={1}>
          <Typography id="title-label" variant={'h6'}>
            {t('title.short')}
          </Typography>
          <Typography pl={2} pr={2} id="title" variant={'h6'}>
            {getProposal()?.title?.length ? presentLatex(getProposal().title) : ''}
          </Typography>
          <Divider />
          <Typography id="abstract-label" variant={'h6'}>
            {t('abstract.label')}
          </Typography>
          <Box
            pl={2}
            pr={2}
            id="abstract"
            sx={{
              maxHeight: `calc(AREA_HEIGHT - 100px)`,
              overflowY: 'auto',
              borderRadius: 1,
              p: 1
            }}
          >
            <Typography variant="body1">
              {getProposal()?.abstract?.length
                ? presentLatex(getProposal()?.abstract as string)
                : ''}
            </Typography>
          </Box>
          <Divider />
          {pdfArea()}
        </Stack>
      </>
    );
  };

  /**************************************************************/

  const rankField = () => {
    return (
      <Box p={2} pl={4} sx={{ width: '95%', height: '65vh', overflow: 'auto' }}>
        <RankEntryField selectedRank={rank} setSelectedRank={setRank} />
      </Box>
    );
  };

  const generalCommentsField = () => (
    <TextEntry
      label={''}
      testId="generalCommentsId"
      rows={((AREA_HEIGHT_NUM / 100) * window.innerHeight) / 27}
      setValue={setGeneralComments}
      value={generalComments}
    />
  );

  const srcNetCommentsField = () => (
    <TextEntry
      label={''}
      testId="srcNetCommentsId"
      rows={((AREA_HEIGHT_NUM / 100) * window.innerHeight) / 27}
      setValue={setSrcNetComments}
      value={srcNetComments}
    />
  );

  const reviewArea = () => {
    function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
      };
    }

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
      setTabValueReview(newValue);
    };

    return (
      <Paper
        sx={{
          position: 'fixed',
          border: `2px solid ${theme.palette.primary.light}`,
          borderRadius: '16px',
          height: AREA_HEIGHT,
          top: '150'
        }}
        elevation={0}
      >
        <Tabs
          variant="fullWidth"
          sx={{ bgcolor: `${theme.palette.primary.main}`, margin: 1 }}
          textColor="secondary"
          indicatorColor="secondary"
          value={tabValueReview}
          onChange={handleTabChange}
          aria-label="basic tabs example"
        >
          <Tab label={t('rank.label')} {...a11yProps(0)} />
          <Tab label={t('generalComments.label')} {...a11yProps(1)} />
          <Tab label={t('srcNetComments.label')} {...a11yProps(2)} />
        </Tabs>
        {tabValueReview === 0 && (
          <Box
            sx={{
              bgcolor: `${theme.palette.primary.main}`,
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
        {tabValueReview === 1 && (
          <Box
            sx={{
              maxHeight: `calc('75vh' - 100px)`,
              overflowY: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'transparent'
            }}
          >
            {generalCommentsField()}
          </Box>
        )}
        {tabValueReview === 2 && (
          <Box
            sx={{
              maxHeight: `calc('75vh' - 100px)`,
              overflowY: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'transparent'
            }}
          >
            {srcNetCommentsField()}
          </Box>
        )}
      </Paper>
    );
  };

  /**************************************************************/

  return (
    <>
      <PageBannerPMT
        backBtn={backButton()}
        fwdBtn={actionButtons()}
        title={t('reviewProposal.title')}
      />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Grid2
        pl={2}
        pr={4}
        container
        spacing={2}
        direction="row"
        justifyContent="space-around"
        sx={{ height: AREA_HEIGHT }}
      >
        <Grid2 size={{ sm: 9 }}>{displayArea()}</Grid2>
        <Grid2 size={{ sm: 3 }}>{reviewArea()}</Grid2>
      </Grid2>
    </>
  );
}
