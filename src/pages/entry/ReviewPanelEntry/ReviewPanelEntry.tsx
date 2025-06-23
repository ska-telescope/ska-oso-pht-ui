import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid2, Paper } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { FOOTER_SPACER, WRAPPER_HEIGHT, PMT } from '../../../utils/constants';
import AddButton from '../../../components/button/Add/Add';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import PanelNameField from '@/components/fields/panelName/panelName';
import { Panel } from '@/utils/types/panel';

const TOP_LABEL_WIDTH = 6;

export default function ReviewPageEntry() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const locationProperties = useLocation();

  const isEdit = () => locationProperties.state !== null;

  const { application, updateAppContent2 } = storageObject.useStore();

  const getPanel = () => application.content2 as Panel;
  const setPanel = (panel: Panel) => updateAppContent2(panel);

  const [panelName, setPanelName] = React.useState('');

  React.useEffect(() => {
    if (isEdit()) {
      panelIn(locationProperties.state);
    }
  }, []);

  const panelIn = (panel: Panel) => {
    setPanelName(panel.name);
  };

  const panelOut = () => {
    const newPanel: Panel = {
      id: '',
      name: panelName,
      proposals: [],
      reviewers: []
    };
    return newPanel;
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
        widthLabel={TOP_LABEL_WIDTH}
        setValue={setPanelName}
        testId="panelName"
        value={panelName}
      />
    );

  /**************************************************************/

  const pageFooter = () => {
    const addPanelToProposal = () => {
      const newPanel: Panel = panelOut();
      setPanel({
        ...getPanel(),
        panels: [...getPanel().name, newPanel]
      });
    };

    const updatePanelOnProposal = () => {
      const newPanel: Panel = panelOut();

      const oldPanels = getPanel().name;
      const newPanels: Panel[] = [];
      if (oldPanels && oldPanels?.length > 0) {
        oldPanels.forEach(inValue => {
          newPanels.push(inValue.id === newPanel.id ? newPanel : inValue);
        });
      } else {
        newPanels.push(newPanel);
      }

      setPanel({
        ...getPanel(),
        panels: newPanels
      });

      /*
      getAffected(newObservation.id).map(rec => {
        const target = getProposal().targets.find(t => t.id === rec.targetId);
        getSensCalcData(newObservation, target);
      });
      */
    };

    const buttonClicked = () => {
      isEdit() ? updatePanelOnProposal() : addPanelToProposal();
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
            <Grid2 size={{ lg: 5 }}></Grid2>
            <Grid2 size={{ md: 12, lg: 5 }}>{panelNameField()}</Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {pageFooter()}
    </>
  );
}
