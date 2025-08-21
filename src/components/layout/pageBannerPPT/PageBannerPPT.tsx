import React from 'react';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Grid2, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/material/styles/useTheme';
import {
  LAST_PAGE,
  NAV,
  PAGE_SRC_NET,
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

interface PageBannerPPTProps {
  pageNo: number;
  backPage?: number;
}

const widthWrapStatusArray = '1500px';

export default function PageBannerPPT({ pageNo, backPage }: PageBannerPPTProps) {
  const LG = useMediaQuery(useTheme().breakpoints.down('lg'));
  const wrapStatusArray = useMediaQuery(`(max-width:${widthWrapStatusArray})`); // revisit to implement override breakpoint
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application } = storageObject.useStore();
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [openProposalDisplay, setOpenProposalDisplay] = React.useState(false);
  const [openValidationResults, setOpenValidationResults] = React.useState(false);
  const [validationResults, setValidationResults] = React.useState<string[]>([]);

  const authClient = useAxiosAuthClient();
  const { notifyError, notifySuccess } = useNotify();

  const loggedIn = isLoggedIn();

  const isDisableEndpoints = () => {
    const testDefaultUser = window.localStorage.getItem('cypress:defaultUserLoggedIn') === 'true';
    if (testDefaultUser) {
      return false;
    } else {
      return !loggedIn;
    }
  };
  const getAccess = () => application.content4 as ProposalAccess[];
  const getProposal = () => application.content2 as Proposal;

  const validateTooltip = () => {
    return 'validationBtn.tooltip';
  };

  const validateClicked = () => {
    const ValidateTheProposal = async () => {
      setValidationResults([]);
      let results = [];

      for (let key in application.content1) {
        if (
          application.content1[key] === STATUS_ERROR ||
          application.content1[key] === STATUS_PARTIAL ||
          (application.content1[key] === STATUS_INITIAL && key !== PAGE_SRC_NET.toString())
        ) {
          results.push(t('page.' + key + '.pageError'));
        }
      }
      const response = await PostProposalValidate(authClient, getProposal());
      const submit = accessSubmit(getAccess(), getProposal().id);
      if (response.valid && !response.error && results.length === 0) {
        notifySuccess(t(`validationBtn.${response.valid}`));
        setCanSubmit(submit);
      } else {
        setValidationResults(response.error ? results.concat(response.error) : results);
        setOpenValidationResults(true);
        setCanSubmit(false);
      }
    };
    ValidateTheProposal();
  };

  const prevPageNav = () => {
    if (backPage) {
      navigate(NAV[backPage]);
    }
  };

  const updateProposalResponse = (response: ProposalBackend | { error: string }) => {
    if (response && !('error' in response)) {
      notifySuccess(t('saveBtn.success'));
    } else {
      notifyError('error' in response ? response.error : 'An unknown error occurred');
    }
  };

  const updateProposal = async () => {
    if (isDisableEndpoints()) return;
    const response = await PutProposal(authClient, getProposal(), PROPOSAL_STATUS.DRAFT);
    updateProposalResponse(response);
  };

  const submitClicked = () => {
    if (loggedIn) setOpenProposalDisplay(true);
  };

  const submitConfirmed = async () => {
    const response = await PutProposal(authClient, getProposal(), PROPOSAL_STATUS.SUBMITTED);
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

  const buttonsLeft = () => (
    <Grid2
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pl={2}
    >
      <Grid2>
        {backPage && backPage > 0 && (
          <PreviousPageButton title="cancelBtn.label" action={prevPageNav} />
        )}
        {!backPage && <HomeButton />}
      </Grid2>
      <Grid2>
        {pageNo < LAST_PAGE && (
          <SaveButton
            primary
            testId={'saveBtn'}
            disabled={isDisableEndpoints()}
            action={() => updateProposal()}
          />
        )}
      </Grid2>
    </Grid2>
  );

  const buttonsRight = () => (
    <Grid2
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      wrap="nowrap"
      pr={2}
    >
      <Grid2>
        {pageNo < LAST_PAGE && (
          <ValidateButton
            testId={'validateBtn'}
            disabled={isDisableEndpoints()}
            action={validateClicked}
            toolTip={validateTooltip()}
          />
        )}
      </Grid2>
      <Grid2>
        {pageNo < LAST_PAGE && <SubmitButton action={submitClicked} disabled={!canSubmit} />}
      </Grid2>
    </Grid2>
  );

  const row1 = () => (
    <Grid2 container direction="row" alignItems="center" justifyContent="space-between">
      <Grid2>{buttonsLeft()}</Grid2>
      {wrapStatusArray ? (
        <Grid2 size={{ xs: 7 }} display={'none'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid2>
      ) : (
        <Grid2 size={{ xs: 7 }} display={'block'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid2>
      )}

      {wrapStatusArray ? (
        <Grid2 display={'block'}>{pageTitle()}</Grid2>
      ) : (
        <Grid2 display={'none'}>{pageTitle()}</Grid2>
      )}

      <Grid2>{buttonsRight()}</Grid2>
    </Grid2>
  );

  const row2 = () => (
    <Grid2 container direction="row" alignItems="center" justifyContent="space-between">
      {wrapStatusArray ? (
        <Grid2 size={{ xs: 12 }} display={'block'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid2>
      ) : (
        <Grid2 size={{ xs: 12 }} display={'none'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid2>
      )}
    </Grid2>
  );

  const row3 = () => (
    <Grid2 container direction="row" alignItems="center" justifyContent="space-between">
      {wrapStatusArray && (
        <Grid2 container justifyContent="center">
          <Grid2 size={{ lg: 12 }}>{pageDesc()}</Grid2>
        </Grid2>
      )}

      {!wrapStatusArray && <Grid2 size={{ lg: 4 }}>{pageTitle()}</Grid2>}

      {!wrapStatusArray && <Grid2 size={{ lg: 8 }}>{pageDesc()}</Grid2>}
    </Grid2>
  );

  return (
    <Box p={2}>
      {row1()}
      {row2()}
      {row3()}

      {/* TODO: revisit to implement override breakpoint and use grid */}
      {/* <Grid2 container spacing={1} alignItems="center">
        <Grid2 size={{ xs: 6, md: 6, lg: 2 }}>
          {buttonsLeft()}
        </Grid2>
        <Grid2 xs={12} md={12} lg={8} order={{ lg: 2, md: 3 }}>
          <Grid2 justifyContent="space-evenly">
            {pageNo < LAST_PAGE && <StatusArray />}
          </Grid2>
        </Grid2>
        <Grid2 xs={6} md={6} lg={2} order={{ lg: 3, md: 2 }}>
          {buttonsRight()}
        </Grid2>
      </Grid2> */}

      {openProposalDisplay && (
        <ProposalDisplay
          proposal={getProposal()}
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
          proposal={getProposal()}
          results={validationResults}
        />
      )}
    </Box>
  );
}
