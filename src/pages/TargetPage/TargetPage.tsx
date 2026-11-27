import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, Card, CardContent, CardActionArea, Tooltip } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import Shell from '../../components/layout/Shell/Shell';
import { useFormContext, useWatch } from 'react-hook-form';
import { useValidateProposal } from '../../utils/validation/validation';
import { ProposalType } from '@/models/proposals/proposal';
import {
  PAGE_TARGET,
  PAGE_OBSERVATION,
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
  const { application, updateAppContent1 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  // How the targets are given. Only the list of targets is saved, so this is page state.
  const [targetOption, setTargetOption] = React.useState<number>(TARGET_OPTION.LIST_OF_TARGETS);
  const { isSV } = useOSDAccessors();
  const getProposalState = () => application.content1 as number[];
  const validateProposal = useValidateProposal();
  const form = useFormContext<ProposalType>();
  const [targets, targetObservation, observations, dataProducts, calibrationStrategy] = useWatch({
    control: form.control,
    name: ['targets', 'targetObservation', 'observations', 'dataProducts', 'calibrationStrategy']
  });

  // The pages that depend on the target are revalidated with it, so their statuses are updated
  // when the target is added or deleted
  const setTheProposalState = () => {
    // The form has every observation; the store only the valid ones
    const statuses = validateProposal(form.getValues());
    const pages = [
      PAGE_TARGET,
      PAGE_OBSERVATION,
      PAGE_DATA_PRODUCTS,
      PAGE_LINKING,
      PAGE_CALIBRATION
    ];
    updateAppContent1(getProposalState().map((v, i) => (pages.includes(i) ? statuses[i] : v)));
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [targets, targetObservation, observations, dataProducts, calibrationStrategy]);

  React.useEffect(() => {
    setTheProposalState();
  }, [validateToggle]);

  const handleClick = (index: number) => {
    setTargetOption(index);
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
            color: setCardFG(occ === targetOption),
            backgroundColor: setCardBG(occ === targetOption)
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
      <Grid
        container
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'space-evenly'
        }}
      >
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
        container
        sx={{
          flexDirection: 'column',
          mt: 1,
          pl: 3,
          pr: 3,
          pb: 18,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {targetOption === 1 && <TargetListSection />}
        {targetOption === 2 && <TargetMosaicSection />}
        {targetOption === 3 && <TargetNoSpecificSection />}
      </Grid>
    </Shell>
  );
}
