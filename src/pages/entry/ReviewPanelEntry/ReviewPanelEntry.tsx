import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid2, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Spacer, SPACER_VERTICAL, DateEntry } from '@ska-telescope/ska-gui-components';
import { FOOTER_SPACER, WRAPPER_HEIGHT, PMT } from '@utils/constants.ts';
import { Metadata } from '@utils/types/metadata.tsx';
import { PanelProposal } from '@utils/types/panelProposal.tsx';
import { PanelReviewer } from '@utils/types/panelReviewer.tsx';
import moment from 'moment';
import AddButton from '../../../components/button/Add/Add';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import PanelNameField from '@/components/fields/panelName/panelName';
import { Panel } from '@/utils/types/panel';

export default function ReviewPageEntry() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const locationProperties = useLocation();

  const isEdit = () => locationProperties.state !== null;

  const [panelName, setPanelName] = React.useState('');

  const [panelDateCreated, setPanelDateCreated] = React.useState(moment().format('YYYY-MM-DD'));
  const [panelDateExpiry, setPanelDateExpiry] = React.useState(moment().format('yyyy-MM-DD'));

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
  /******************************************************/

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

  /**************************************************************/

  const pageFooter = () => {
    const buttonClicked = () => {
      //create panel end point
      //edit - call endpoint

      // isEdit() ? updatePanelOnProposal() : addPanelToProposal();
      navigate(PMT[0]);
    };

    return (
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      >
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
              testId={isEdit() ? 'updateObservationButton' : 'addObservationButton'}
              title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
            />
          </Grid2>
        </Grid2>
      </Paper>
    );
  };

  return (
    <>
      <PageBannerPMT backBtn={backButton()} title={t('reviewPanelEntry.title')} />
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
              <Grid2 item size={{ md: 12, lg: 10 }} justifyContent="center">{panelNameField()}</Grid2>
              <Grid2 item size={{ md: 12, lg: 10 }} justifyContent="center">{panelDateCreatedField()}</Grid2>
              <Grid2 item size={{ md: 12, lg: 10 }} justifyContent="center">{panelDateExpiryField()}</Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {pageFooter()}
    </>
  );
}
