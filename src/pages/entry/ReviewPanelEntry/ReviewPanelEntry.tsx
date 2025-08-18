/*
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid2, Paper } from '@mui/material';
import { Spacer, SPACER_VERTICAL, DateEntry } from '@ska-telescope/ska-gui-components';
import { FOOTER_SPACER, WRAPPER_HEIGHT, PMT, BANNER_PMT_SPACER } from '@utils/constants.ts';
import moment from 'moment';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import AddButton from '../../../components/button/Add/Add';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import PanelNameField from '@/components/fields/panelName/panelName';
import PostPanel from '@/services/axios/postPanel/postPanel';
import { Panel } from '@/utils/types/panel';
import PageFooterPMT from '@/components/layout/pageFooterPMT/PageFooterPMT';
import ObservatoryData from '@/utils/types/observatoryData';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';
*/

export default function ReviewPanelEntry() {
  /* SUPPRESSED AS NOT CURRENTLY REQUIRED, BUT NEEDS TO BE KEPT
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const locationProperties = useLocation();
  const { notifyError, notifySuccess, notifyWarning } = useNotify();

  const isEdit = () => locationProperties.state !== null;

  const [panelName, setPanelName] = React.useState('');
  const [panelDateCreated, setPanelDateCreated] = React.useState(moment().format('YYYY-MM-DD'));
  const [panelDateExpiry, setPanelDateExpiry] = React.useState(moment().format('yyyy-MM-DD'));
  const { application } = storageObject.useStore();
  const getObservatoryData = () => application.content3 as ObservatoryData;
  const authClient = useAxiosAuthClient();

  // const setPanel = (panel: Panel) => updateAppContent2(panel);

  React.useEffect(() => {
    panelNameEmpty();
  }, [panelName]);

  const panelNameEmpty = () => {
    return panelName === '';
  };

  const addButtonDisabled = () => {
    return isEdit() ? false : panelNameEmpty();
  };

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[0])}
      testId="pmtBackButton"
      title={'page.15.desc'}
      toolTip="page.15.toolTip"
    />
  );

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const panelNameField = () =>
    fieldWrapper(
      <PanelNameField
        label={t('panelName.label')}
        setValue={setPanelName}
        value={panelName}
        testId="panelName"
      />
    );

  const panelDateCreatedField = () =>
    fieldWrapper(
      <DateEntry
        label="Panel Date Created"
        testId="panelDateCreatedTestId"
        value={panelDateCreated}
        setValue={setPanelDateCreated}
      />
    );

  const panelDateExpiryField = () =>
    fieldWrapper(
      <DateEntry
        label="Panel Date Expiry"
        testId="panelDateExpiryTestId"
        value={panelDateExpiry}
        setValue={setPanelDateExpiry}
      />
    );

  const getDateFormatted = () => moment().format('YYYY-MM-DD');

  const getPanelId = () => {
    return isEdit()
      ? locationProperties.state.id
      : 'panel-t0001-' +
          getDateFormatted() +
          '-00001-' +
          Math.floor(Math.random() * 10000000).toString();
  };

  const getPanel = (): Panel => {
    return {
      id: getPanelId(),
      name: panelName,
      // createdOn: panelDateCreated, /// this is automatically generated in the backend
      expiresOn: panelDateExpiry, // note: this doesn't exist in the backend atm
      proposals: [],
      reviewers: []
    };
  };

  const createPanel = async () => {
    notifyWarning(t('addPanel.warning'));
    const response: string | { error: string } = await PostPanel(
      authClient,
      getPanel(),
      getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
    );
    if (typeof response === 'object' && response?.error) {
      notifyError(response?.error);
    } else {
      notifySuccess(t('addPanel.success') + response);
      navigate(PMT[0]);
    }
  };

  const addButton = () => {
    const buttonClicked = () => {
      createPanel();
    };

    return (
      <Paper sx={{ bgcolor: 'transparent' }} elevation={0}>
        <Grid2
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid2 />
          <Grid2 />
          <Grid2>
            <AddButton
              action={buttonClicked}
              disabled={addButtonDisabled()}
              primary
              testId={isEdit() ? 'updatePanelButton' : 'addPanelButton'}
              title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
            />
          </Grid2>
        </Grid2>
      </Paper>
    );
  };
  */

  return <></>;

  /* SUPPRESSED AS NOT CURRENTLY REQUIRED
  return (
    <>
      <PageBannerPMT
        backBtn={backButton()}
        fwdBtn={addButton()}
        title={t('reviewPanelEntry.title')}
      />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Grid2
        pl={4}
        pr={4}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid2 size={{ md: 12, lg: 9 }}>
          <Grid2
            p={0}
            pl={2}
            container
            direction="row"
            alignItems="center"
            spacing={1}
            justifyContent="space-around"
          >
            <Grid2 container alignItems="center" justifyContent="center" size={{ md: 12, lg: 10 }}>
              <Grid2 size={{ md: 12, lg: 10 }} justifyContent="center">
                {panelNameField()}
              </Grid2>
              <Grid2 size={{ md: 12, lg: 10 }} justifyContent="center">
                {panelDateCreatedField()}
              </Grid2>
              <Grid2 size={{ md: 12, lg: 10 }} justifyContent="center">
                {panelDateExpiryField()}
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      <PageFooterPMT />
    </>
  );
  */
}
