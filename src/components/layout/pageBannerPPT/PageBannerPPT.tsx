import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  AUTO_SAVE_INTERVAL,
  NAV,
  PATH,
  PROPOSAL_STATUS,
  STATUS_ARRAY_PAGES_PROPOSAL,
  STATUS_ARRAY_PAGES_SV,
  STATUS_OK
} from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import type { ApiResult } from '@/services/axios/apiResult/apiResult';
import PostProposalValidate from '@services/axios/post/postProposalValidate/postProposalValidate';
import HomeButton from '../../button/Home/Home';
import SaveButton from '../../button/Save/Save';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/Submit';
import ProposalDisplay from '../../alerts/proposalDisplay/ProposalDisplay';
import ValidationResults from '../../alerts/validationResults/ValidationResults';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useValidateProposal } from '@/utils/validation/validation';
import { countWords } from '@utils/helpers.ts';
import { useProposalOda } from '@/models/proposals/useProposalOda';
import phtTranslations from '@/locales/en/pht.json';

interface PageBannerPPTProps {
  pageNo: number;
  backPage?: number;
  isNewProposal?: boolean;
}

const widthWrapStatusArray = '1500px';

export default function PageBannerPPT({
  pageNo,
  backPage,
  isNewProposal = false
}: PageBannerPPTProps) {
  const theme = useTheme();
  const { isSV } = useOSDAccessors();
  const validateProposal = useValidateProposal();
  const form = useFormContext<ProposalType>();
  // The open proposal, for the Save/Submit checks and the dialogs
  const proposal = useWatch({ control: form.control }) as ProposalType;
  const LG = useMediaQuery(theme.breakpoints.down('lg'), {
    defaultMatches: false,
    noSsr: true
  });
  const wrapStatusArray = useMediaQuery(`(max-width:${widthWrapStatusArray})`); // revisit to implement override breakpoint
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { updateAppContent1 } = storageObject.useStore();
  const [openProposalDisplay, setOpenProposalDisplay] = React.useState(false);
  const [openValidationResults, setOpenValidationResults] = React.useState(false);
  const [validationResults, setValidationResults] = React.useState<string[]>([]);

  const pages = React.useMemo(
    () => (isSV ? STATUS_ARRAY_PAGES_SV : STATUS_ARRAY_PAGES_PROPOSAL),
    [isSV]
  );

  const { saveToOda } = useProposalOda();
  const { notifyError, notifySuccess } = useNotify();

  const loggedIn = isLoggedIn();

  const isDisableEndpoints = () => {
    const maxTitleWords = Number(phtTranslations.title.maxWord);
    const maxAbstractWords = Number(phtTranslations.abstract.maxWord);
    if (
      loggedIn &&
      (isNewProposal ||
        proposal.title?.trim()?.length === 0 ||
        countWords(proposal.title ?? '') > maxTitleWords ||
        countWords(proposal.abstract ?? '') > maxAbstractWords)
    ) {
      return true;
    } else if (!loggedIn) {
      return true;
    }
  };

  // TODO(T9): Full cleanup needed once everything is migrated to the form
  const validateTheProposal = async (): Promise<boolean> => {
    let result = false;
    setValidationResults([]);
    const results: string[] = [];

    // The form has every observation; the store only the valid ones
    const statuses = validateProposal(form.getValues());
    updateAppContent1(statuses);

    statuses.forEach((status, key) => {
      if (pages.includes(key) && status !== STATUS_OK) {
        results.push(t('page.' + key + '.pageError'));
      }
    });
    const response = await PostProposalValidate(form.getValues());

    if (response.valid && !response.error && results.length === 0) {
      notifySuccess(t('validation.success'));
      result = true;
    } else {
      setValidationResults(response.error ? results.concat(response.error) : results);
      setOpenValidationResults(true);
    }

    return result;
  };

  const prevPageNav = () => {
    if (backPage) {
      navigate(NAV[backPage]);
    }
  };

  const updateProposalResponse = (response: ApiResult<ProposalBackend>) => {
    if (!response.error) {
      // Not needed as the save is not automatic : notifySuccess(t('saveBtn.success'));
    } else {
      notifyError(response.error);
    }
  };

  const updateProposal = async () => {
    if (!isDisableEndpoints()) {
      const response = await saveToOda(PROPOSAL_STATUS.DRAFT);
      updateProposalResponse(response);
    }
  };

  const submitClicked = async () => {
    const isValid = await validateTheProposal();
    if (isValid && loggedIn) setOpenProposalDisplay(true);
  };

  const submitConfirmed = async () => {
    const response = await saveToOda(PROPOSAL_STATUS.SUBMITTED);
    if (!response.error) {
      notifySuccess(t('submitBtn.success'));
      setOpenProposalDisplay(false);
      navigate(PATH[0]);
    } else {
      notifyError(response.error);
      setOpenProposalDisplay(false);
    }
  };

  const pageTitle = () => (
    <Typography
      id="pageTitle"
      variant="h6"
      sx={{
        m: 2
      }}
    >
      {LG
        ? t(`page.${pageNo}.titleShort`)?.toUpperCase()
        : t(`page.${pageNo}.title`)?.toUpperCase()}
    </Typography>
  );

  const pageDesc = () => (
    <Typography
      id="pageDesc"
      variant="body1"
      sx={{
        m: 2
      }}
    >
      {t(`page.${pageNo}.desc`)}
    </Typography>
  );

  const handleSave = () => {
    void updateProposal();
  };

  const buttonsLeft = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        pl: 2
      }}
    >
      <Grid>
        {backPage && backPage > 0 && (
          <PreviousPageButton title="cancelBtn.label" action={prevPageNav} />
        )}
        {!backPage && <HomeButton />}
      </Grid>
      <Grid>
        {loggedIn && !isNewProposal && pages.includes(pageNo) && (
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
      wrap="nowrap"
      sx={{
        alignItems: 'center',
        justifyContent: 'flex-end',
        pr: 2
      }}
    >
      <Grid>
        {!isNewProposal && pages.includes(pageNo) && (
          <SubmitButton
            action={submitClicked}
            title="submitProposalBtn.label"
            toolTip="submitProposalBtn.tooltip"
          />
        )}
      </Grid>
    </Grid>
  );

  const row1 = () => (
    <Grid
      container
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Grid>{buttonsLeft()}</Grid>
      {wrapStatusArray ? (
        <Grid
          size={{ xs: 7 }}
          sx={{
            display: 'none'
          }}
        >
          {pageNo > -1 && pages.includes(pageNo) && <StatusArray />}
        </Grid>
      ) : (
        <Grid
          size={{ xs: 7 }}
          sx={{
            display: 'block'
          }}
        >
          {pages.includes(pageNo) && <StatusArray />}
        </Grid>
      )}

      {wrapStatusArray ? (
        <Grid
          sx={{
            display: 'block'
          }}
        >
          {pageTitle()}
        </Grid>
      ) : (
        <Grid
          sx={{
            display: 'none'
          }}
        >
          {pageTitle()}
        </Grid>
      )}

      <Grid>{buttonsRight()}</Grid>
    </Grid>
  );

  const row1buttonsLeft = () => (
    <Grid
      container
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Grid>{buttonsLeft()}</Grid>
    </Grid>
  );

  const row2 = () => (
    <Grid
      container
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {wrapStatusArray ? (
        <Grid
          size={{ xs: 12 }}
          sx={{
            display: 'block'
          }}
        >
          {pages.includes(pageNo) && <StatusArray />}
        </Grid>
      ) : (
        <Grid
          size={{ xs: 12 }}
          sx={{
            display: 'none'
          }}
        >
          {pages.includes(pageNo) && <StatusArray />}
        </Grid>
      )}
    </Grid>
  );

  const row3 = () => (
    <Grid
      container
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {wrapStatusArray && (
        <Grid
          container
          sx={{
            justifyContent: 'center'
          }}
        >
          <Grid size={{ sm: 11 }}>{pageDesc()}</Grid>
        </Grid>
      )}

      {!wrapStatusArray && <Grid size={{ sm: 3 }}>{pageTitle()}</Grid>}
      {!wrapStatusArray && <Grid size={{ sm: 6 }}>{pageDesc()}</Grid>}
      {!wrapStatusArray && <Grid size={{ sm: 3 }}></Grid>}
    </Grid>
  );

  return (
    <Box
      sx={{
        p: 2
      }}
    >
      {loggedIn ? row1() : row1buttonsLeft()}
      {/* I'm assuming intention is to display row2() when loggedIn is true?
      if someone understands better than I do please feel free to
      remove in favour of whatever is supposed to happen here. */}
      {loggedIn && row2()}
      {row3()}

      {openProposalDisplay && (
        <ProposalDisplay
          proposal={proposal}
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
          proposal={proposal}
          results={validationResults}
        />
      )}
    </Box>
  );
}
