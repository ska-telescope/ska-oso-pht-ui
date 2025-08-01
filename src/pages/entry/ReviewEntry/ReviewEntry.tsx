import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Divider, Grid2, Paper, Stack, Tab, Tabs } from '@mui/material';
import {
  AlertColorTypes,
  DropDown,
  Spacer,
  SPACER_VERTICAL,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import useTheme from '@mui/material/styles/useTheme';
import {
  BANNER_PMT_SPACER,
  PANEL_DECISION_STATUS,
  PMT,
  REVIEW_TYPE,
  TECHNICAL_FEASIBILITY_OPTIONS
} from '@utils/constants.ts';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import SaveButton from '../../../components/button/Save/Save';
import Notification from '../../../utils/types/notification';
import SubmitButton from '@/components/button/Submit/Submit';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import Proposal from '@/utils/types/proposal';
import { presentLatex } from '@/utils/present/present';
import RankEntryField from '@/components/fields/rankEntryField/RankEntryField';
import PDFViewer from '@/components/layout/PDFViewer/PDFViewer';
import ConflictButton from '@/components/button/Conflict/Conflict';
import GetPresignedDownloadUrl from '@/services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import PostProposalReview from '@/services/axios/postProposalReview.tsx/postProposalReview';
import { ProposalReview, ScienceReview, TechnicalReview } from '@/utils/types/proposalReview';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import ObservatoryData from '@/utils/types/observatoryData';

interface ReviewEntryProps {
  reviewType: string;
}

export default function ReviewEntry({ reviewType }: ReviewEntryProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const navigate = useNavigate();
  const locationProperties = useLocation();

  const { application, updateAppContent5 } = storageObject.useStore();

  const isView = () => (locationProperties.state?.reviews ? true : false);
  const [tabValuePDF, setTabValuePDF] = React.useState(0);
  const [tabValueReview, setTabValueReview] = React.useState(0);
  const [reviewId, setReviewId] = React.useState('');
  const [rank, setRank] = React.useState(0);
  const [generalComments, setGeneralComments] = React.useState('');
  const [feasibility, setFeasibility] = React.useState('');
  const [srcNetComments, setSrcNetComments] = React.useState('');
  const [currentPDF, setCurrentPDF] = React.useState<string | null | undefined>(null);
  const [isEdit, setIsEdit] = React.useState(!!locationProperties.state?.review_id);

  const AREA_HEIGHT_NUM = 74;
  const AREA_HEIGHT = AREA_HEIGHT_NUM + 'vh';

  const getProposal = () => application.content2 as Proposal;

  const getUser = () => 'DefaultUser'; // TODO
  const isTechnical = (reviewType: string) => reviewType === REVIEW_TYPE.TECHNICAL;

  const getObservatoryData = () => application.content3 as ObservatoryData;
  const getCycleId = () => getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId;

  const getDateFormatted = () => moment().format('YYYY-MM-DD');

  const getReviewId = () => {
    return isEdit
      ? locationProperties.state.review_id
      : 'rvw-' +
          getUser() +
          '-' +
          getDateFormatted() +
          '-00001-' +
          Math.floor(Math.random() * 10000000).toString();
  };

  function getTechnicalReview(): TechnicalReview {
    return {
      kind: REVIEW_TYPE.TECHNICAL,
      feasibility: {
        isFeasible: feasibility,
        comments: generalComments
      }
    };
  }

  function getScienceReview(): ScienceReview {
    return {
      kind: REVIEW_TYPE.SCIENCE,
      rank: rank,
      conflict: {
        hasConflict: false,
        reason: ''
      },
      excludedFromDecision: false
    };
  }

  const getReview = (submitted = false): ProposalReview => {
    return {
      id: reviewId,
      prslId: getProposal().id,
      reviewType: reviewType === REVIEW_TYPE.SCIENCE ? getScienceReview() : getTechnicalReview(),
      comments: generalComments,
      srcNet: srcNetComments,
      metadata: {
        version: 0,
        created_by: '',
        created_on: '',
        pdm_version: '',
        last_modified_by: '',
        last_modified_on: ''
      },
      panelId: locationProperties.state.panelId,
      cycle: '',
      reviewerId: getUser(),
      submittedOn: submitted ? new Date().toISOString() : null,
      submittedBy: submitted ? 'DefaultUser' : null,
      status: submitted ? PANEL_DECISION_STATUS.DECIDED : PANEL_DECISION_STATUS.IN_PROGRESS
    };
  };

  /*---------------------------------------------------------------------------*/

  function Notify(str: string, lvl = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str
    };
    updateAppContent5(rec);
  }

  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);

  const createReview = async (submitted = false) => {
    //TODO: Remove hard-coded cycleId
    const response: string | { error: string } = await PostProposalReview(
      getReview(submitted),
      'SKAO_2027_1'
    );
    if (typeof response === 'object' && response?.error) {
      NotifyError(response?.error);
    } else {
      NotifyOK(t('addReview.success'));
      setIsEdit(true);
    }
  };

  const updateReview = async (submitted = false) => {
    const response: string | { error: string } = await PostProposalReview(
      getReview(submitted),
      'SKAO_2027_1'
    );
    if (typeof response === 'object' && response?.error) {
      NotifyError(response?.error);
    } else {
      NotifyOK(t('addReview.success'));
    }
  };

  /*---------------------------------------------------------------------------*/

  React.useEffect(() => {
    setReviewId(getReviewId());
    if (locationProperties.state?.id) {
      setGeneralComments(locationProperties.state?.comments);
      setSrcNetComments(locationProperties.state?.srcNet);
      setRank(locationProperties.state?.rank);
      setFeasibility(locationProperties.state?.isFeasible);
      setIsEdit(false);
    } else {
      setGeneralComments('');
      setSrcNetComments('');
      setRank(0);
      setFeasibility('');
      setIsEdit(true);
    }
  }, []);

  const submitDisabled = () => {
    return generalComments?.length === 0 || rank === 0;
  };

  const conflictButtonClicked = () => {
    // TODO
  };

  const saveButtonAction = (submit: boolean) => {
    isEdit ? updateReview(submit) : createReview(submit);
  };
  const saveButtonClicked = () => saveButtonAction(false);
  const submitButtonClicked = () => saveButtonAction(true);

  const backButton = () => (
    <BackButton
      action={() => (isView() ? navigate(PMT[4]) : navigate(PMT[1]))}
      testId="pmtBackButton"
      title={isView() ? 'reviewDecisionsList.title' : 'reviewProposalList.title'}
      toolTip={isView() ? 'reviewDecisionsList.toolTip' : 'reviewProposalList.toolTip'}
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

  const previewSignedUrl = async (tabValuePDF: number) => {
    const pdfLabel = tabValuePDF === 0 ? 'science' : 'technical';

    try {
      const proposal = getProposal();

      const selectedFile =
        `${proposal.id}-` + t(`pdfDownload.${pdfLabel}.label`) + t('fileType.pdf');

      const signedUrl = await GetPresignedDownloadUrl(selectedFile);

      if (
        signedUrl === t('pdfDownload.sampleData') ||
        proposal.technicalPDF != null ||
        proposal.sciencePDF != null
      ) {
        setCurrentPDF(signedUrl);
      }
    } catch (e) {
      new Error(t('pdfDownload.error'));
    }
  };

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
      {getProposal().sciencePDF !== null && currentPDF !== null ? (
        <PDFViewer url={currentPDF ?? ''} />
      ) : (
        <>{t('pdfPreview.science.notUploaded')}</>
      )}
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
      {getProposal().technicalPDF !== null && currentPDF !== null ? (
        <PDFViewer url={currentPDF ?? ''} />
      ) : (
        <> {t('pdfPreview.technical.notUploaded')}</>
      )}
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
        {!isView() && <RankEntryField selectedRank={rank} setSelectedRank={setRank} />}
        {isView() && (
          <Typography id="title-label" variant={'h6'}>
            {locationProperties.state.reviews[0].rank}
          </Typography>
        )}
      </Box>
    );
  };

  const generalCommentsField = () => (
    <>
      {!isView() && (
        <TextEntry
          label={''}
          testId="generalCommentsId"
          rows={((AREA_HEIGHT_NUM / 100) * window.innerHeight) / 27}
          setValue={setGeneralComments}
          value={generalComments}
        />
      )}
      {isView() && (
        <Box
          p={2}
          sx={{
            width: '100%',
            height: '65vh',
            overflow: 'auto',
            backgroundColor: theme.palette.primary.main
          }}
        >
          <Typography id="title-label" variant={'h6'}>
            {locationProperties.state.reviews[0].comments}
          </Typography>
        </Box>
      )}
    </>
  );

  const feasibilityField = () => {
    return (
      <>
        {!isView() && (
          <DropDown
            options={TECHNICAL_FEASIBILITY_OPTIONS}
            testId={'feasibilityId'}
            value={feasibility ?? ''}
            setValue={setFeasibility}
            label={'Feasibility'}
          />
        )}
        {isView() && (
          <Box
            p={2}
            sx={{
              width: '100%',
              height: '65vh',
              overflow: 'auto',
              backgroundColor: theme.palette.primary.main
            }}
          >
            <Typography id="title-label" variant={'h6'}>
              {locationProperties.state.reviews[0].reviewType.feasibility.isFeasible}
              {locationProperties.state.reviews[0].reviewType.feasibility.comments}
              {/*{locationProperties.state.feasibility.isFeasible}*/}
              {/*{locationProperties.state.feasibility.comments}*/}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  const technicalCommentsField = () => (
    <>
      {!isView() && (
        <TextEntry
          label={''}
          testId="technicalCommentsId"
          rows={((AREA_HEIGHT_NUM / 100) * window.innerHeight) / 27}
          setValue={setGeneralComments}
          value={generalComments}
        />
      )}
      {isView() && (
        <Box
          p={2}
          sx={{
            width: '100%',
            height: '65vh',
            overflow: 'auto',
            backgroundColor: theme.palette.primary.main
          }}
        >
          <Typography id="title-label" variant={'h6'}>
            {locationProperties.state.reviews[0].comments}
          </Typography>
        </Box>
      )}
    </>
  );

  const srcNetCommentsField = () => (
    <>
      {!isView() && (
        <TextEntry
          label={''}
          testId="srcNetCommentsId"
          rows={((AREA_HEIGHT_NUM / 100) * window.innerHeight) / 27}
          setValue={setSrcNetComments}
          value={srcNetComments}
        />
      )}
      {isView() && (
        <Box
          p={2}
          sx={{
            width: '100%',
            height: '65vh',
            overflow: 'auto',
            backgroundColor: theme.palette.primary.main
          }}
        >
          <Typography id="title-label" variant={'h6'}>
            {locationProperties.state.reviews[0].srcNet}
          </Typography>
        </Box>
      )}
    </>
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
          {isTechnical(reviewType) ? (
            <Tab label={t('feasibility.label')} {...a11yProps(0)} />
          ) : (
            <Tab label={t('rank.label')} {...a11yProps(0)} />
          )}
          {isTechnical(reviewType) ? (
            <Tab label={t('technicalComments.label')} {...a11yProps(1)} />
          ) : (
            <Tab label={t('generalComments.label')} {...a11yProps(1)} />
          )}
          {!isTechnical(reviewType) && <Tab label={t('srcNetComments.label')} {...a11yProps(2)} />}
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
            {isTechnical(reviewType) ? feasibilityField() : rankField()}
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
            {isTechnical(reviewType) ? technicalCommentsField() : generalCommentsField()}
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

  React.useEffect(() => {
    previewSignedUrl(tabValuePDF);
  }, [tabValuePDF]);

  /**************************************************************/

  return (
    <>
      <PageBannerPMT
        backBtn={backButton()}
        fwdBtn={isView() ? <></> : actionButtons()}
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
      <PageFooterPMT />
    </>
  );
}
