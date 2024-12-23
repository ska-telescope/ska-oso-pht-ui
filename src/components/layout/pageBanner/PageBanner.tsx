import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import HomeButton from '../../button/Home/Home';
import SaveButton from '../../button/Save/Save';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/Submit';
import ValidateButton from '../../button/Validate/Validate';
import {
  LAST_PAGE,
  NAV,
  PAGE_SRC_NET,
  PATH,
  PROPOSAL_STATUS,
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_PARTIAL
} from '../../../utils/constants';
import ProposalDisplay from '../../alerts/proposalDisplay/ProposalDisplay';
import ValidationResults from '../../alerts/validationResults/ValidationResults';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import Notification from '../../../utils/types/notification';
import { Proposal } from '../../../utils/types/proposal';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PostProposalValidate from '../../../services/axios/postProposalValidate/postProposalValidate';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/material/styles/useTheme';

interface PageBannerProps {
  pageNo: number;
  backPage?: number;
}

const widthWrapStatusArray = '1500px';

export default function PageBanner({ pageNo, backPage }: PageBannerProps) {
  const LG = useMediaQuery(useTheme().breakpoints.down('lg'));
  const wrapStatusArray = useMediaQuery(`(max-width:${widthWrapStatusArray})`); // revisit to implement override breakpoint
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, updateAppContent5 } = storageObject.useStore();
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [openProposalDisplay, setOpenProposalDisplay] = React.useState(false);
  const [openValidationResults, setOpenValidationResults] = React.useState(false);
  const [validationResults, setValidationResults] = React.useState(null);

  const getProposal = () => application.content2 as Proposal;

  function Notify(str: string, lvl: AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: t(str),
      okRequired: false
    };
    updateAppContent5(rec);
  }
  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);

  const validateTooltip = () => {
    return 'validationBtn.tooltip';
  };

  const validateClicked = () => {
    const ValidateTheProposal = async () => {
      setValidationResults(null);
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
      const response = await PostProposalValidate(getProposal());
      if (response.valid && !response.error && results.length === 0) {
        NotifyOK(`validationBtn.${response.valid}`);
        setCanSubmit(true);
      } else {
        setValidationResults(response.error ? results.concat(response.error) : results);
        setOpenValidationResults(true);
        setCanSubmit(false);
      }
    };
    ValidateTheProposal();
  };

  const prevPageNav = () => {
    navigate(NAV[backPage]);
  };

  const updateProposalResponse = response => {
    if (response && !response.error) {
      NotifyOK('saveBtn.success');
    } else {
      NotifyError(response.error);
    }
  };

  const updateProposal = async () => {
    const response = await PutProposal(getProposal(), PROPOSAL_STATUS.DRAFT);
    updateProposalResponse(response);
  };

  const submitClicked = () => {
    setOpenProposalDisplay(true);
  };

  const submitConfirmed = async () => {
    const response = await PutProposal(getProposal(), PROPOSAL_STATUS.SUBMITTED);
    if (response && !response.error) {
      NotifyOK(response.valid);
      setOpenProposalDisplay(false);
      navigate(PATH[0]);
    } else {
      NotifyError(response.error);
      setOpenProposalDisplay(false);
    }
  };

  const pageTitle = () => (
    <Typography id="pageTitle" variant="h6" m={2}>
      {LG ? t(`page.${pageNo}.titleShort`).toUpperCase() : t(`page.${pageNo}.title`).toUpperCase()}
    </Typography>
  );

  const pageDesc = () => (
    <Typography id="pageDesc" variant="body1" m={2}>
      {t(`page.${pageNo}.desc`)}
    </Typography>
  );

  const buttonsLeft = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pl={2}
    >
      <Grid item>
        {backPage > 0 && <PreviousPageButton title="button.cancel" action={prevPageNav} />}
        {!backPage && <HomeButton />}
      </Grid>
      <Grid item>
        {pageNo < LAST_PAGE && <SaveButton action={() => updateProposal()} primary />}
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
      <Grid item>
        {pageNo < LAST_PAGE && (
          <ValidateButton action={validateClicked} toolTip={validateTooltip()} />
        )}
      </Grid>
      <Grid item>
        {pageNo < LAST_PAGE && <SubmitButton action={submitClicked} disabled={!canSubmit} />}
      </Grid>
    </Grid>
  );

  const row1 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item>{buttonsLeft()}</Grid>
      {wrapStatusArray ? (
        <Grid item xs={7} display={'none'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid>
      ) : (
        <Grid item xs={7} display={'block'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid>
      )}

      {wrapStatusArray ? (
        <Grid item display={'block'}>
          {pageTitle()}
        </Grid>
      ) : (
        <Grid item display={'none'}>
          {pageTitle()}
        </Grid>
      )}

      <Grid item>{buttonsRight()}</Grid>
    </Grid>
  );

  const row2 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      {wrapStatusArray ? (
        <Grid item xs={12} display={'block'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid>
      ) : (
        <Grid item xs={12} display={'none'}>
          {pageNo < LAST_PAGE && <StatusArray />}
        </Grid>
      )}
    </Grid>
  );

  const row3 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      {wrapStatusArray && (
        <Grid container justifyContent="center" lg={12}>
          {pageDesc()}
        </Grid>
      )}

      {!wrapStatusArray && (
        <Grid item lg={4}>
          {pageTitle()}
        </Grid>
      )}

      {!wrapStatusArray && (
        <Grid item lg={8}>
          {pageDesc()}
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box p={2}>
      {row1()}
      {row2()}
      {row3()}

      {/* TODO: revisit to implement override breakpoint and use grid */}
      {/* <Grid container spacing={1} alignItems="center">
        <Grid item xs={6} md={6} lg={2}>
          {buttonsLeft()}
        </Grid>
        <Grid item xs={12} md={12} lg={8} order={{ lg: 2, md: 3 }}>
          <Grid item justifyContent="space-evenly">
            {pageNo < LAST_PAGE && <StatusArray />}
          </Grid>
        </Grid>
        <Grid item xs={6} md={6} lg={2} order={{ lg: 3, md: 2 }}>
          {buttonsRight()}
        </Grid>
      </Grid> */}

      {openProposalDisplay && (
        <ProposalDisplay
          proposal={getProposal()}
          open={openProposalDisplay}
          onClose={() => setOpenProposalDisplay(false)}
          onConfirm={submitConfirmed}
          onConfirmLabel={t('button.confirmSubmit')}
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
