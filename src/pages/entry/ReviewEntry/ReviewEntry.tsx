import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Divider, Grid, Paper, Stack, Tab, Tabs } from '@mui/material';
import {
  BorderedSection,
  Spacer,
  SPACER_VERTICAL,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import { useTheme } from '@mui/material/styles';
import {
  BANNER_PMT_SPACER_MIN,
  FEASIBLE_MAYBE,
  FEASIBLE_NO,
  FEASIBLE_YES,
  PANEL_DECISION_STATUS,
  PMT,
  REVIEW_TYPE
} from '@utils/constants.ts';
import Typography from '@mui/material/Typography';
import GetPresignedDownloadUrl from '@services/axios/get/getPresignedDownloadUrl/getPresignedDownloadUrl';
import SaveButton from '../../../components/button/Save/Save';
import SubmitButton from '@/components/button/Submit/Submit';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import { presentLatex } from '@/utils/present/present';
import RankEntryField from '@/components/fields/rankEntryField/RankEntryField';
import PDFViewer from '@/components/layout/PDFViewer/PDFViewer';
import { ProposalReview, ScienceReview, TechnicalReview } from '@/utils/types/proposalReview';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import PutProposalReview from '@/services/axios/put/putProposalReview/putProposalReview';
import { getUserId } from '@/utils/aaa/aaaUtils';
import { useNotify } from '@/utils/notify/useNotify';
import { ChoiceCards } from '@/components/fields/choiceCards/choiceCards';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ReviewEntryProps {
  reviewType: string;
}

export default function ReviewEntry({ reviewType }: ReviewEntryProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const locationProperties = useLocation();
  const { notifyError, notifySuccess } = useNotify();

  const isView = () => (locationProperties?.state?.reviews ? true : false);
  const [tabValuePDF, setTabValuePDF] = React.useState(0);
  const [tabValueReview, setTabValueReview] = React.useState(0);
  const [review, setReview] = React.useState<ProposalReview>();
  const [rank, setRank] = React.useState(0);
  const [comments, setComments] = React.useState('');
  const [feasibility, setFeasibility] = React.useState('');
  const [srcNetComments, setSrcNetComments] = React.useState('');
  const [sciPDF, setSciPDF] = React.useState<string | undefined>(undefined);
  const [tecPDF, setTecPDF] = React.useState<string | undefined>(undefined);

  const ROW_HEIGHT_PX = 28.5; /* approximate height of one row in pixels */

  const authClient = useAxiosAuthClient();
  const userId = getUserId();

  const isTechnical = () => reviewType === REVIEW_TYPE.TECHNICAL;

  const tecRows = () => {
    const totalOffset = 700;
    const availableHeight = window.innerHeight - totalOffset;
    return Math.floor(availableHeight / ROW_HEIGHT_PX);
  };

  const srcRows = () => {
    const totalOffset = 450;
    const availableHeight = window.innerHeight - totalOffset;
    return Math.floor(availableHeight / ROW_HEIGHT_PX);
  };

  function getTechnicalReview(): TechnicalReview {
    return {
      kind: REVIEW_TYPE.TECHNICAL,
      isFeasible: feasibility
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
      id: review?.id ?? '',
      cycle: review?.cycle ?? '',
      panelId: review?.panelId ?? '',
      prslId: locationProperties.state.id,
      reviewType: reviewType === REVIEW_TYPE.SCIENCE ? getScienceReview() : getTechnicalReview(),
      comments: comments,
      srcNet: reviewType === REVIEW_TYPE.SCIENCE ? srcNetComments : '',
      metadata: {
        version: 0,
        created_by: userId,
        created_on: '',
        pdm_version: '',
        last_modified_by: '',
        last_modified_on: ''
      },
      reviewerId: userId,
      submittedOn: submitted ? new Date().toISOString() : null,
      submittedBy: submitted ? userId : null,
      status: submitted ? PANEL_DECISION_STATUS.REVIEWED : PANEL_DECISION_STATUS.IN_PROGRESS
    };
  };

  /*---------------------------------------------------------------------------*/

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
      setReview(locationProperties?.state?.tecReview);
      setFeasibility(locationProperties?.state?.tecReview.reviewType?.isFeasible);
      setComments(locationProperties?.state?.tecReview.comments);
    } else {
      setReview(locationProperties?.state?.sciReview);
      setRank(locationProperties?.state?.sciReview.reviewType.rank ?? 0);
      setComments(locationProperties?.state?.sciReview?.comments);
      setSrcNetComments(locationProperties?.state?.sciReview?.srcNet);
    }
    previewSignedUrl(locationProperties.state.id, 'pdfDownload.science.label');
    previewSignedUrl(locationProperties.state.id, 'pdfDownload.technical.label');
  }, []);

  const submitDisabled = () => {
    if (isTechnical()) {
      return !hasFeasibility() || !hasTechnicalComments();
    } else {
      return !hasComments() || rank === 0;
    }
  };

  const hasComments = () => comments?.length > 0;
  const hasTechnicalComments = () => (feasibleYes() ? true : comments?.length > 0);

  const feasibleYes = () => feasibility === FEASIBLE_YES;

  const hasFeasibility = () => {
    return (
      feasibility === FEASIBLE_YES || feasibility === FEASIBLE_MAYBE || feasibility === FEASIBLE_NO
    );
  };

  const saveButtonAction = (submit: boolean) => {
    updateReview(submit);
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
    <Grid spacing={1} container justifyContent="space-between" direction="row">
      <SaveButton action={saveButtonClicked} primary toolTip={''} />
      <SubmitButton action={submitButtonClicked} disabled={submitDisabled()} primary toolTip={''} />
    </Grid>
  );

  /**************************************************************/

  const sciencePDF = () => <PDFViewer url={sciPDF} width="100%" />;

  const technicalPDF = () => <PDFViewer url={tecPDF} width="100%" />;

  const showLabel = (id: string, label: string) => {
    return (
      <Box
        id={id}
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          boxSizing: 'border-box'
        }}
      >
        <Typography id={id} fontWeight="bold" variant={'h6'}>
          {label?.length ? t(label) : ''}
        </Typography>
      </Box>
    );
  };

  const showLatex = (id: string, label: string) => {
    return (
      <Box
        id={id}
        sx={{
          pl: 1,
          pr: 1,
          width: '100%',
          maxWidth: '100%',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          boxSizing: 'border-box'
        }}
      >
        <Typography variant="h6">{label?.length ? presentLatex(label) : ''}</Typography>
      </Box>
    );
  };

  /**************************************************************/

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
      <>
        <Tabs
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
          value={tabValuePDF}
          onChange={handleTabChange}
          aria-label="basic tabs example"
          sx={{
            '& button': { height: 75, backgroundColor: theme.palette.primary.main },
            '& button.Mui-selected': { backgroundColor: 'transparent' }
          }}
        >
          <Tab label={t('pdfPreview.science.label')} {...a11yProps(0)} />
          <Tab label={t('pdfPreview.technical.label')} {...a11yProps(1)} />
        </Tabs>
        {tabValuePDF === 0 && sciencePDF()}
        {tabValuePDF === 1 && technicalPDF()}
      </>
    );
  };

  /**************************************************************/

  const displayArea = () => {
    return (
      <BorderedSection>
        <Stack
          sx={{
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {showLabel('title-label', 'title.short')}
          {showLatex('title', locationProperties?.state?.proposal?.title)}
          <Divider />
          {showLabel('abstract-label', 'abstract.label')}
          {showLatex('abstract', locationProperties?.state?.proposal?.abstract)}
        </Stack>
      </BorderedSection>
    );
  };

  /**************************************************************/

  const rankField = () => {
    return (
      <Box p={2} pl={4} sx={{ height: '65vh', overflow: 'auto' }}>
        {!isView() && <RankEntryField selectedRank={rank} setSelectedRank={setRank} />}
        {isView() && showLabel('rank', locationProperties?.state?.reviews[0].rank)}
      </Box>
    );
  };

  const generalCommentsField = () => (
    <>
      {!isView() && (
        <TextEntry
          label={''}
          testId="generalCommentsId"
          rows={srcRows()}
          setValue={setComments}
          value={comments}
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
          {showLatex('comments', locationProperties?.state?.reviews[0]?.comments)}
        </Box>
      )}
    </>
  );

  const technicalCommentsField = () => (
    <>
      {!isView() && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showLabel('technicalComments', 'technicalComments.label')}
          </Box>
          <Paper>
            <TextEntry
              disabledUnderline
              label={''}
              testId="technicalCommentsId"
              rows={tecRows()}
              setValue={setComments}
              value={comments}
              variant="standard"
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
          rows={srcRows()}
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
          {showLatex('srcNetComments', locationProperties?.state?.reviews[0]?.srcNet)}
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
      <BorderedSection>
        <Tabs
          variant="fullWidth"
          sx={{ bgcolor: `${theme.palette.primary.main}` }}
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
        {tabValueReview === 0 && <>{rankField()}</>}
        {tabValueReview === 1 && <>{generalCommentsField()}</>}
        {tabValueReview === 2 && <>{srcNetCommentsField()}</>}
      </BorderedSection>
    );
  };

  const reviewAreaTec = () => {
    return (
      <BorderedSection>
        <Stack sx={{ gap: 4 }}>
          <ChoiceCards value={feasibility} onChange={setFeasibility} />
          {technicalCommentsField()}
        </Stack>
      </BorderedSection>
    );
  };

  /**************************************************************/

  return (
    <Box>
      {/* Sticky Banner */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
        <PageBannerPMT
          backBtn={backButton()}
          fwdBtn={isView() ? <></> : actionButtons()}
          title={t('reviewProposal.title')}
        />
      </Box>

      <Spacer size={BANNER_PMT_SPACER_MIN} axis={SPACER_VERTICAL} />

      {/* Main Grid */}
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="space-between"
        pl={2}
        pr={6}
        sx={{ backgroundColor: 'background.default' }}
      >
        {/* Left Column: scrollable content */}
        <Grid size={{ sm: 9 }}>
          {displayArea()}
          {/* pdfArea scrolls normally */}
          {pdfArea()}
        </Grid>

        {/* Right Column: sticky review area */}
        <Grid size={{ sm: 3 }}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            {isTechnical() ? reviewAreaTec() : reviewAreaSci()}
          </Box>
        </Grid>
      </Grid>

      {/* Sticky Footer */}
      <Box sx={{ position: 'sticky', bottom: 0, zIndex: 1100 }}>
        <PageFooterPMT />
      </Box>
    </Box>
  );
}
