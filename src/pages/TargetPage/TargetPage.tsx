import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, Card, CardContent, CardActionArea, Tooltip } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import Shell from '../../components/layout/Shell/Shell';
import { useValidateProposal } from '../../utils/validation/validation';
import { Proposal } from '../../utils/types/proposal';
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
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const { isSV } = useOSDAccessors();
  const getProposalState = () => application.content1 as number[];
  const validateProposal = useValidateProposal();

  // The pages that depend on the target are revalidated with it, so their statuses are updated
  // when the target is added or deleted
  const setTheProposalState = () => {
    const statuses = validateProposal(getProposal());
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
