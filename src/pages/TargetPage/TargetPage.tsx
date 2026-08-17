import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, Card, CardContent, CardActionArea, Tooltip } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import Shell from '../../components/layout/Shell/Shell';
import {
  validateTargetPage,
  validateObservationPage,
  validateSDPPage,
  validateLinkingPage,
  validateCalibrationPage
} from '../../utils/validation/validation';
import { Proposal } from '../../utils/types/proposal';
import {
  PAGE_TARGET,
  PAGE_OBSERVATION,
  STATUS_OK,
  TARGET_OPTION,
  PAGE_DATA_PRODUCTS,
  PAGE_LINKING,
  PAGE_CALIBRATION
} from '../../utils/constants';
import TargetMosaicSection from './TargetMosaicSection/targetMosaicSection';
import TargetNoSpecificSection from './TargetNoSpecificSection/targetNoSpecificSection';
import TargetListSection from './TargetListSection/targetListSection';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const TITLE = ['', 'listOfTargets', 'targetMosaic', 'noSpecificTarget'];

const PAGE = PAGE_TARGET;

export default function TargetPage() {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const { isSV, autoLink } = useOSDAccessors();
  const getProposalState = () => application.content1 as number[];

  const setTheProposalState = () => {
    const proposal = getProposal();
    const currentState = getProposalState();
    const targetStatus = validateTargetPage(proposal);

    const observationStatus =
      targetStatus === STATUS_OK
        ? validateObservationPage(proposal, autoLink)
        : currentState[PAGE_OBSERVATION];

    const sdpStatus =
      targetStatus === STATUS_OK ? validateSDPPage(proposal) : currentState[PAGE_DATA_PRODUCTS];

    const linkingStatus =
      targetStatus === STATUS_OK ? validateLinkingPage(proposal) : currentState[PAGE_LINKING];

    const calibrationStatus =
      targetStatus === STATUS_OK
        ? validateCalibrationPage(proposal)
        : currentState[PAGE_CALIBRATION];

    const nextState = currentState.map((v, i) => {
      switch (i) {
        case PAGE_TARGET:
          return targetStatus;
        case PAGE_OBSERVATION:
          return observationStatus;
        case PAGE_DATA_PRODUCTS:
          return sdpStatus;
        case PAGE_LINKING:
          return linkingStatus;
        case PAGE_CALIBRATION:
          return calibrationStatus;
        default:
          return v;
      }
    });

    updateAppContent1(nextState);
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState();
  }, [validateToggle]);

  const handleClick = (index: number) => {
    setProposal({ ...getProposal(), targetOption: index });
  };

  const setCardBG = (isSelected: boolean) =>
    isSelected ? theme.palette.secondary.main : theme.palette.primary.main;
  const setCardFG = (isSelected: boolean) =>
    isSelected ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;

  function targetCard(occ: number) {
    return (
      <Grid>
        <Card
          style={{
            color: setCardFG(occ === getProposal().targetOption),
            backgroundColor: setCardBG(occ === getProposal().targetOption)
          }}
        >
          <CardActionArea onClick={() => handleClick(occ)}>
            <CardContent>
              <Tooltip title={t(`${TITLE[occ]}.toolTip`)} arrow>
                <Typography variant="h6" component="div" id={TITLE[occ]}>
                  {t(`${TITLE[occ]}.label`)}
                </Typography>
              </Tooltip>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  const cardOptions = () => {
    return !isSV ? (
      <Grid container direction="row" justifyContent="space-evenly" spacing={2}>
        {targetCard(TARGET_OPTION.LIST_OF_TARGETS)}
        {targetCard(TARGET_OPTION.TARGET_MOSAIC)}
        {targetCard(TARGET_OPTION.NO_SPECIFIC_TARGET)}
      </Grid>
    ) : (
      <></>
    );
  };

  return (
    <Shell page={PAGE}>
      {cardOptions()}
      <Grid
        mt={1}
        pl={3}
        pr={3}
        pb={18}
        container
        direction="column"
        justifyContent="space-between"
        alignItems="center"
      >
        {getProposal().targetOption === 1 && <TargetListSection />}
        {getProposal().targetOption === 2 && <TargetMosaicSection />}
        {getProposal().targetOption === 3 && <TargetNoSpecificSection />}
      </Grid>
    </Shell>
  );
}
