import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Divider, Grid2, Paper, Stack, Tab, Tabs } from '@mui/material';
import { Spacer, SPACER_VERTICAL, TextEntry } from '@ska-telescope/ska-gui-components';
import useTheme from '@mui/material/styles/useTheme';
import {
  BANNER_PMT_SPACER,
  FEASIBILITY,
  PANEL_DECISION_STATUS,
  PMT,
  REVIEW_TYPE
} from '@utils/constants.ts';
import Typography from '@mui/material/Typography';
import PutProposalReview from '@services/axios/putProposalReview/putProposalReview';
import SaveButton from '../../../components/button/Save/Save';
import SubmitButton from '@/components/button/Submit/Submit';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import { presentLatex } from '@/utils/present/present';
import RankEntryField from '@/components/fields/rankEntryField/RankEntryField';
import PDFViewer from '@/components/layout/PDFViewer/PDFViewer';
import ConflictButton from '@/components/button/Conflict/Conflict';
import GetPresignedDownloadUrl from '@/services/axios/getPresignedDownloadUrl/getPresignedDownloadUrl';
import { ProposalReview, ScienceReview, TechnicalReview } from '@/utils/types/proposalReview';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import PostProposalReview from '@/services/axios/post/postProposalReview/postProposalReview';
import { generateId } from '@/utils/helpers';
import { getUserId } from '@/utils/aaa/aaaUtils';
import { useNotify } from '@/utils/notify/useNotify';
import { ChoiceCards } from '@/components/fields/choiceCards/choiceCards';

interface ReviewEntryProps {
  reviewType: string;
}

export default function ReviewEntry({ reviewType }: ReviewEntryProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const navigate = useNavigate();
  const locationProperties = useLocation();
  const { notifyError, notifySuccess } = useNotify();

  const isView = () => (locationProperties?.state?.reviews ? true : false);
  const [tabValuePDF, setTabValuePDF] = React.useState(0);
  const [tabValueReview, setTabValueReview] = React.useState(0);
  const [reviewId, setReviewId] = React.useState('');
  const [rank, setRank] = React.useState(0);
  const [generalComments, setGeneralComments] = React.useState('');
  const [technicalComments, setTechnicalComments] = React.useState('');
  const [feasibility, setFeasibility] = React.useState('');
  const [srcNetComments, setSrcNetComments] = React.useState('');
  const [sciPDF, setSciPDF] = React.useState<string | undefined>(undefined);
  const [tecPDF, setTecPDF] = React.useState<string | undefined>(undefined);
  const [isEdit, setIsEdit] = React.useState(false);

  const TEC_HEIGHT_NUM = 55;

  const AREA_HEIGHT_NUM = 73;
  const AREA_HEIGHT = AREA_HEIGHT_NUM + 'vh';

  const authClient = useAxiosAuthClient();
  const userId = getUserId();

  const isTechnical = () => reviewType === REVIEW_TYPE.TECHNICAL;

  function getTechnicalReview(): TechnicalReview {
    return {
      kind: REVIEW_TYPE.TECHNICAL,
      feasibility: {
        isFeasible: feasibility,
        comments: technicalComments
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
      prslId: locationProperties.state.id,
      reviewType: reviewType === REVIEW_TYPE.SCIENCE ? getScienceReview() : getTechnicalReview(),
      comments: generalComments,
      srcNet: srcNetComments,
      metadata: {
        version: 0,
        created_by: userId,
        created_on: '',
        pdm_version: '',
        last_modified_by: '',
        last_modified_on: ''
      },
      panelId: locationProperties?.state?.panelId,
      cycle: '',
      reviewerId: userId,
      submittedOn: submitted ? new Date().toISOString() : null,
      submittedBy: submitted ? userId : null,
      status: submitted ? PANEL_DECISION_STATUS.DECIDED : PANEL_DECISION_STATUS.IN_PROGRESS
    };
  };

  /*---------------------------------------------------------------------------*/

  const createReview = async (submitted = false) => {
    const response: string | { error: string } = await PostProposalReview(
      authClient,
      getReview(submitted),
      locationProperties?.state?.proposal?.cycle
    );
    if (typeof response === 'object' && response?.error) {
      notifyError(response?.error);
    } else {
      notifySuccess(t('addReview.success'));
    }
  };

  const updateReview = async (submitted = false) => {
    const response: ProposalReview | string | { error: string } = await PutProposalReview(
      authClient,
      getReview(submitted)
    );
    if (typeof response === 'object' && (response as { error: string })?.error) {
      notifyError((response as { error: string })?.error);
    } else {
      notifySuccess(t('addReview.success'));
    }
  };

  /*---------------------------------------------------------------------------*/

  const previewSignedUrl = async (id: string, label: string) => {
    try {
      const selectedFile = `${id}-` + t(label) + t('fileType.pdf');
      const signedUrl = await GetPresignedDownloadUrl(authClient, selectedFile);

      if (label === 'pdfDownload.science.label') {
        setSciPDF(signedUrl);
      } else {
        setTecPDF(signedUrl);
      }
    } catch (e) {
      return null;
    }
  };

  React.useEffect(() => {
    if (!locationProperties) return;

    if (isTechnical()) {
      if (locationProperties?.state?.tecReview?.id) {
        setReviewId(locationProperties?.state?.tecReview.id);
        setIsEdit(true);
      } else {
        setReviewId(generateId('rvw-tec-'));
        setIsEdit(false);
      }
      setFeasibility(locationProperties?.state?.tecReview.reviewType?.feasibility?.isFeasible);
      setTechnicalComments(locationProperties?.state?.tecReview.reviewType?.feasibility?.comments);
    } else {
      if (locationProperties?.state?.sciReview?.id) {
        setReviewId(locationProperties?.state?.sciReview.id);
        setIsEdit(true);
      } else {
        setReviewId(generateId('rvw-sci-'));
        setIsEdit(false);
      }
      setRank(locationProperties?.state?.sciReview.reviewType.rank);
      setGeneralComments(locationProperties?.state?.sciReview?.comments);
      setSrcNetComments(locationProperties?.state?.sciReview?.srcNet);
    }
    previewSignedUrl(locationProperties.state.id, 'pdfDownload.science.label');
    previewSignedUrl(locationProperties.state.id, 'pdfDownload.technical.label');
  }, []);

  const submitDisabled = () => {
    if (isTechnical()) {
      //TODO: comments not required for technical? only if a maybe / no?
      return !hasFeasibility();
    } else {
      return !hasGeneralComments() || rank === 0;
    }
  };

  const hasGeneralComments = () => generalComments?.length > 0;

  const hasFeasibility = () => {
    return (
      feasibility === FEASIBILITY[0] ||
      feasibility === FEASIBILITY[1] ||
      feasibility === FEASIBILITY[2]
    );
  };

  const conflictButtonClicked = () => {
    // TODO
  };

  const saveButtonAction = (submit: boolean) => {
    isEdit ? updateReview(submit) : createReview(submit);
    if (submit) {
      navigate(PMT[1]);
    }
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
      <PDFViewer url={sciPDF} />
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
      <PDFViewer url={tecPDF} />
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
            {locationProperties.state.proposal.title?.length
              ? presentLatex(locationProperties.state.proposal.title)
              : ''}
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
              {locationProperties.state.proposal.abstract?.length
                ? presentLatex(locationProperties.state.proposal.abstract as string)
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
            {locationProperties?.state?.reviews[0].rank}
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
            {locationProperties?.state?.reviews[0].comments}
          </Typography>
        </Box>
      )}
    </>
  );

  const technicalCommentsField = () => (
    <>
      {!isView() && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
              {t('technicalComments.label')}
            </Typography>
          </Box>
          <Paper>
            <TextEntry
              label={''}
              testId="technicalCommentsId"
              rows={((TEC_HEIGHT_NUM / 100) * window.innerHeight) / 27}
              setValue={setTechnicalComments}
              value={technicalComments}
            />
          </Paper>
        </>
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
            {locationProperties?.state?.reviews[0].srcNet}
          </Typography>
        </Box>
      )}
    </>
  );

  const reviewAreaSci = () => {
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

  const reviewAreaTec = () => {
    return (
      <Paper
        sx={{
          position: 'fixed',
          border: `2px solid ${theme.palette.primary.light}`,
          borderRadius: '16px',
          height: AREA_HEIGHT,
          top: '150',
          padding: 3,
          backgroundColor: theme.palette.primary.main
        }}
        elevation={0}
      >
        <Stack sx={{ gap: 1 }}>
          <ChoiceCards value={feasibility} onChange={setFeasibility} />
          {technicalCommentsField()}
        </Stack>
      </Paper>
    );
  };

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
        <Grid2 size={{ sm: 3 }}>{isTechnical() ? reviewAreaTec() : reviewAreaSci()}</Grid2>
      </Grid2>
      <PageFooterPMT />
    </>
  );
}
