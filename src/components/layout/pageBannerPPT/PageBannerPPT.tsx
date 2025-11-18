import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  AUTO_SAVE_INTERVAL,
  cypressProposal,
  cypressToken,
  LAST_PAGE,
  NAV,
  PAGE_LINKING,
  PAGE_SRC_NET,
  PAGE_TECHNICAL,
  PATH,
  PROPOSAL_STATUS,
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_PARTIAL
} from '@utils/constants.ts';
import { Proposal, ProposalBackend } from '@utils/types/proposal.tsx';
import PutProposal from '@services/axios/put/putProposal/putProposal';
import PostProposalValidate from '@services/axios/post/postProposalValidate/postProposalValidate';
import HomeButton from '../../button/Home/Home';
import SaveButton from '../../button/Save/Save';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/Submit';
import ValidateButton from '../../button/Validate/Validate';
import ProposalDisplay from '../../alerts/proposalDisplay/ProposalDisplay';
import ValidationResults from '../../alerts/validationResults/ValidationResults';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import { accessSubmit } from '@/utils/aaa/aaaUtils';
import ProposalAccess from '@/utils/types/proposalAccess';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

interface PageBannerPPTProps {
  pageNo: number;
  backPage?: number;
}

const widthWrapStatusArray = '1500px';

export default function PageBannerPPT({ pageNo, backPage }: PageBannerPPTProps) {
  const theme = useTheme();
  const { isSV } = useAppFlow();
  const LG = useMediaQuery(theme.breakpoints.down('lg'), {
    defaultMatches: false,
    noSsr: true
  });
  const wrapStatusArray = useMediaQuery(`(max-width:${widthWrapStatusArray})`); // revisit to implement override breakpoint
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { application } = storageObject.useStore();
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [openProposalDisplay, setOpenProposalDisplay] = React.useState(false);
  const [openValidationResults, setOpenValidationResults] = React.useState(false);
  const [validationResults, setValidationResults] = React.useState<string[]>([]);

  const authClient = useAxiosAuthClient();
  const { notifyError, notifySuccess } = useNotify();

  const loggedIn = isLoggedIn();

  const getAccess = () => application.content4 as ProposalAccess[];
  const getProposal = () => application.content2 as Proposal;

  const accessCanSubmit = accessSubmit(getAccess(), (application.content2 as Proposal).id);

  const isDisableEndpoints = () => {
    if (
      cypressProposal ||
      (loggedIn && (getProposal().id == null || getProposal()?.title?.trim()?.length === 0))
    ) {
      return true;
    } else if (!loggedIn) {
      return !cypressToken;
    }
  };

  const validateTooltip = () => {
    return 'validationBtn.tooltip';
  };

  const validateTheProposal = async (): Promise<boolean> => {
    let result = false;
    setValidationResults([]);
    let results = [];

    for (let key in application.content1) {
      const obj: { [key: string]: any } = application.content1;

      if (
        obj[key] === STATUS_ERROR ||
        obj[key] === STATUS_PARTIAL ||
        (obj[key] === STATUS_INITIAL && key !== PAGE_SRC_NET.toString())
      ) {
        if ((key !== PAGE_TECHNICAL.toString() && key !== PAGE_LINKING.toString()) || !isSV()) {
          results.push(t('page.' + key + '.pageError'));
        }
      }
    }
    const response = await PostProposalValidate(
      authClient,
      application.content2 as Proposal,
      isSV()
    );

    if (response.valid && !response.error && results.length === 0) {
      notifySuccess(t(`validationBtn.${response.valid}`));
      result = true;
    } else {
      setValidationResults(response.error ? results.concat(response.error) : results);
      setOpenValidationResults(true);
    }

    return result;
  };

  const validateClicked = async (): Promise<boolean> => {
    return validateTheProposal();
  };

  const prevPageNav = () => {
    if (backPage) {
      navigate(NAV[backPage]);
    }
  };

  const updateProposalResponse = (response: ProposalBackend | { error: string }) => {
    if (response && !('error' in response)) {
      // Not needed as the save is not automatic : notifySuccess(t('saveBtn.success'));
    } else {
      notifyError('error' in response ? response.error : 'An unknown error occurred');
    }
  };

  const updateProposal = async (proposal: Proposal) => {
    if (!isDisableEndpoints()) {
      const response = await PutProposal(authClient, proposal, isSV(), PROPOSAL_STATUS.DRAFT);
      updateProposalResponse(response);
    }
  };

  const submitClicked = async () => {
    const isValid = await validateTheProposal();
    if (!isValid) return;
    if (loggedIn) setOpenProposalDisplay(true);
  };

  const submitConfirmed = async () => {
    const response = await PutProposal(
      authClient,
      application.content2 as Proposal,
      isSV(),
      PROPOSAL_STATUS.SUBMITTED
    );
    if (response && !('error' in response)) {
      notifySuccess(t('submitBtn.success'));
      setOpenProposalDisplay(false);
      navigate(PATH[0]);
    } else {
      notifyError('error' in response ? response.error : 'An unknown error occurred');
      setOpenProposalDisplay(false);
    }
  };

  const pageTitle = () => (
    <Typography id="pageTitle" variant="h6" m={2}>
      {LG
        ? t(`page.${pageNo}.titleShort`)?.toUpperCase()
        : t(`page.${pageNo}.title`)?.toUpperCase()}
    </Typography>
  );

  const pageDesc = () => (
    <Typography id="pageDesc" variant="body1" m={2}>
      {t(`page.${pageNo}.desc`)}
    </Typography>
  );

  const handleSave = React.useCallback(() => {
    updateProposal(application.content2 as Proposal);
  }, [application.content2]);

  const buttonsLeft = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pl={2}
    >
      <Grid>
        {backPage && backPage > 0 && (
          <PreviousPageButton title="cancelBtn.label" action={prevPageNav} />
        )}
        {!backPage && <HomeButton />}
      </Grid>
      <Grid>
        {getProposal().id !== null && pageNo < LAST_PAGE && (
          <SaveButton
            testId={'saveBtn'}
            disabled={isDisableEndpoints()}
            action={handleSave}
            autoSaveInterval={AUTO_SAVE_INTERVAL}
          />
        )}
      </Grid>
    </Grid>
  );

  const buttonsRight = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      wrap="nowrap"
      pr={2}
    >
      <Grid>
        {getProposal().id !== null && pageNo < LAST_PAGE && (
          <ValidateButton
            testId={'validateBtn'}
            disabled={isDisableEndpoints()}
            action={validateClicked}
            toolTip={validateTooltip()}
          />
        )}
      </Grid>
      <Grid>
        {getProposal().id !== null && pageNo < LAST_PAGE && (
          <SubmitButton action={submitClicked} disabled={!canSubmit} />
        )}
      </Grid>
    </Grid>
  );

  const row1 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid>{buttonsLeft()}</Grid>
      {wrapStatusArray ? (
        <Grid size={{ xs: 7 }} display={'none'}>
          {pageNo > -1 && pageNo < LAST_PAGE && (
            <StatusArray updateCanSubmit={setCanSubmit} accessCanSubmit={accessCanSubmit} />
          )}
        </Grid>
      ) : (
        <Grid size={{ xs: 7 }} display={'block'}>
          {getProposal().id !== null && pageNo < LAST_PAGE && (
            <StatusArray updateCanSubmit={setCanSubmit} accessCanSubmit={accessCanSubmit} />
          )}
        </Grid>
      )}

      {wrapStatusArray ? (
        <Grid display={'block'}>{pageTitle()}</Grid>
      ) : (
        <Grid display={'none'}>{pageTitle()}</Grid>
      )}

      <Grid>{buttonsRight()}</Grid>
    </Grid>
  );

  const row2 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      {wrapStatusArray ? (
        <Grid size={{ xs: 12 }} display={'block'}>
          {pageNo < LAST_PAGE && (
            <StatusArray updateCanSubmit={setCanSubmit} accessCanSubmit={accessCanSubmit} />
          )}
        </Grid>
      ) : (
        <Grid size={{ xs: 12 }} display={'none'}>
          {pageNo < LAST_PAGE && (
            <StatusArray updateCanSubmit={setCanSubmit} accessCanSubmit={accessCanSubmit} />
          )}
        </Grid>
      )}
    </Grid>
  );

  const row3 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      {wrapStatusArray && (
        <Grid container justifyContent="center">
          <Grid size={{ sm: 11 }}>{pageDesc()}</Grid>
        </Grid>
      )}

      {!wrapStatusArray && <Grid size={{ sm: 3 }}>{pageTitle()}</Grid>}
      {!wrapStatusArray && <Grid size={{ sm: 6 }}>{pageDesc()}</Grid>}
      {!wrapStatusArray && <Grid size={{ sm: 3 }}></Grid>}
    </Grid>
  );

  return (
    <Box p={2}>
      {row1()}
      {getProposal().id !== null && row2()}
      {row3()}

      {openProposalDisplay && (
        <ProposalDisplay
          proposal={application.content2 as Proposal}
          open={openProposalDisplay}
          onClose={() => setOpenProposalDisplay(false)}
          onConfirm={submitConfirmed}
          onConfirmLabel={'confirmSubmitBtn.label'}
        />
      )}
      {openValidationResults && (
        <ValidationResults
          open={openValidationResults}
          onClose={() => setOpenValidationResults(false)}
          proposal={application.content2 as Proposal}
          results={validationResults}
        />
      )}
    </Box>
  );
}
