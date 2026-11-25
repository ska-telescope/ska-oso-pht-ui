import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router';
import { Grid, Paper } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import {
  NAV,
  PROPOSAL_STATUS,
  PROPOSAL_TYPE,
  PAGE_TITLE_ADD,
  PAGE_TARGET,
  PAGE_OBSERVATION,
  STATUS_ARRAY_PAGES_PROPOSAL,
  STATUS_ARRAY_PAGES_SV
} from '@utils/constants.ts';
import PostProposal from '@services/axios/post/postProposal/postProposal';
import NextPageButton from '../../button/NextPage/NextPage';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import Proposal from '../../../utils/types/proposal';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
import ProposalAccess from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_PERMISSIONS, PROPOSAL_ROLE_PI } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { getProposalSchema, ProposalType } from '@/models/proposals/proposal';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';
import { legacyObservationsFromForm } from '@/models/proposals/legacyObservations';
import { getTeamValues } from '@/models/proposals/team';
import { newDataProductsForMode } from '@/utils/autoLinking/AutoLinking';

const createProposalSchema = getProposalSchema().pick({ title: true, proposalType: true });

interface PageFooterPPTProps {
  pageNo: number;
  buttonDisabled?: boolean;
}

export default function PageFooterPPT({ pageNo, buttonDisabled = false }: PageFooterPPTProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { application, updateAppContent2, updateAppContent4 } = storageObject.useStore();
  const { axiosClient: authClient, refreshAuthToken } = useAxiosAuthClient();
  const { notifyError, notifySuccess, notifyWarning } = useNotify();
  const loggedIn = isLoggedIn();
  const { isSV, osdLOW } = useOSDAccessors();
  const { trigger, getValues, setValue } = useFormContext<ProposalType>();
  const [title, proposalType] = useWatch<ProposalType, ['title', 'proposalType']>({
    name: ['title', 'proposalType']
  });
  const canCreate = createProposalSchema.safeParse({ title, proposalType }).success;

  const proposal = application.content2 as Proposal;

  const pages = React.useMemo(
    () => (isSV ? STATUS_ARRAY_PAGES_SV : STATUS_ARRAY_PAGES_PROPOSAL),
    [isSV]
  );

  React.useEffect(() => {
    if (pageNo === -1) {
      void trigger(['title', 'proposalType']);
    }
  }, [pageNo, trigger]);

  const { prevPageNo, nextPageNo } = React.useMemo(() => {
    const idx = pages.findIndex((p) => p === pageNo);
    return {
      prevPageNo: idx > 0 ? pages[idx - 1] : -2,
      nextPageNo: idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : -2
    };
  }, [pageNo, pages]);

  const createProposal = React.useCallback(async () => {
    notifyWarning(t('addProposal.warning'));

    // Only the slices a new proposal takes from the form; the rest come from the legacy defaults
    const { prslId, cycle, title, proposalType, abstract, scienceCategory, investigators } =
      getValues();
    // An SV proposal starts with an observation in the default observing mode, which the user can
    // change on the Details page, and its data products
    const observations =
      proposalType.type === PROPOSAL_TYPE.SCIENCE_VERIFICATION
        ? [
            newSvObservation(
              OBSERVING_MODE.CONTINUUM,
              osdLOW?.basicCapabilities?.minElevationDeg ?? null
            )
          ]
        : [];
    const dataProducts = observations.flatMap(newDataProductsForMode);
    const response = await PostProposal(
      authClient,
      refreshAuthToken,
      {
        ...proposal,
        id: prslId,
        title,
        abstract,
        scienceCategory,
        investigators,
        ...legacyObservationsFromForm(observations),
        dataProducts,
        proposalType: proposalType.type ?? undefined,
        proposalSubType: proposalType.subTypes,
        cycle
      },
      PROPOSAL_STATUS.DRAFT
    );

    if (response && !('error' in response)) {
      notifySuccess(t('addProposal.success') + response.id);
      // The store keeps the same ID, so it doesn't re-seed the form with them
      setValue('observations', observations);
      setValue('dataProducts', dataProducts);
      // The backend adds the creator as PI
      setValue('investigators', getTeamValues(response as Proposal).investigators);
      updateAppContent2(response as Proposal);

      const newAcc: Partial<ProposalAccess> = {
        prslId: response.id,
        role: PROPOSAL_ROLE_PI,
        permissions: PROPOSAL_ACCESS_PERMISSIONS
      };

      const acc = Array.isArray(application.content4)
        ? (application.content4 as ProposalAccess[])
        : [];

      updateAppContent4([...acc, newAcc]);
      navigate(NAV[1]);
    } else {
      notifyError((response as { error: string }).error);
    }
  }, [
    proposal,
    getValues,
    setValue,
    authClient,
    refreshAuthToken,
    notifyWarning,
    notifySuccess,
    notifyError,
    updateAppContent2,
    updateAppContent4,
    application.content4,
    navigate,
    t
  ]);

  const showPrevNav = () => {
    if (loggedIn && pageNo > 0) {
      return true;
    }
    return !loggedIn && pageNo !== PAGE_TARGET;
  };

  const showNextNav = () => {
    return (
      (!loggedIn && pageNo === PAGE_TARGET) || (loggedIn && (pageNo === -1 || nextPageNo !== -2))
    );
  };

  const nextLabel = React.useCallback(() => {
    if (pageNo === -2) return 'addBtn.label';
    if (pageNo === -1) return 'createBtn.label';
    return `page.${nextPageNo}.title`;
  }, [pageNo, nextPageNo]);

  const prevLabel = React.useCallback(() => {
    if (!loggedIn && pageNo === 4) {
      return `page.${PAGE_TITLE_ADD}.title`;
    }
    return `page.${prevPageNo}.title`;
  }, [pageNo, prevPageNo, loggedIn]);

  const prevPageNav = React.useCallback(() => {
    if (!loggedIn && pageNo === PAGE_TARGET) {
      navigate(NAV[0]);
    } else if (prevPageNo > -1) {
      navigate(NAV[prevPageNo]);
    }
  }, [pageNo, prevPageNo, loggedIn, navigate]);

  const nextPageNav = React.useCallback(() => {
    if (!loggedIn && pageNo === PAGE_OBSERVATION) return;
    if (!loggedIn && pageNo === 0) {
      navigate(NAV[PAGE_TARGET]);
      return;
    }

    if (nextPageNo < NAV.length) {
      navigate(NAV[nextPageNo]);
    }
  }, [pageNo, nextPageNo, loggedIn, navigate]);

  const nextPageClicked = () => {
    if (pageNo === -1) createProposal();
    else nextPageNav();
  };

  return (
    <Paper
      sx={{
        backgroundColor: 'transparent',
        position: 'fixed',
        bottom: 40,
        left: 0,
        right: 0,
        // even though nothing is visibly there this component can still absorb clicks.
        // Re-enabled per-child below.
        pointerEvents: 'none'
      }}
      elevation={0}
    >
      <Grid
        container
        direction="row"
        sx={{
          p: 4,
          pt: 0,
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}
      >
        <Grid sx={{ pointerEvents: 'auto' }}>
          {showPrevNav() && (
            <PreviousPageButton
              action={prevPageNav}
              testId="prevButtonTestId"
              title={prevLabel()}
            />
          )}
        </Grid>

        <Grid sx={{ pointerEvents: 'auto' }}>
          {showNextNav() && (
            <NextPageButton
              disabled={buttonDisabled || (pageNo === -1 && !canCreate)}
              testId="nextButtonTestId"
              title={nextLabel()}
              page={pageNo}
              primary
              action={nextPageClicked}
            />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
