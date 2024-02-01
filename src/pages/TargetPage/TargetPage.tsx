import React from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import { Grid, Typography, Card, CardContent, CardActionArea, Tooltip } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import TargetListSection from './TargetListSection/targetListSection';
import TargetNoSpecificSection from './TargetNoSpecificSection/targetNoSpecificSection';
import TargetMosaicSection from './TargetMosaicSection/targetMosaicSection';
import Shell from '../../components/layout/Shell/Shell';
import { STATUS_ERROR, STATUS_PARTIAL, STATUS_OK } from '../../utils/constants';
import { Proposal } from '../../services/types/proposal';

const TITLE = ['', 'listOfTargets', 'targetMosaic', 'noSpecificTarget'];

const PAGE = 4;

export default function TargetPage() {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    switch (getProposal().targetOption) {
      case 1: {
        count = 1;
        count += getProposal().targets.length ? 1 : 0;
        setTheProposalState(result[count]);
        return;
      }
      case 2: {
        count = 2;
        setTheProposalState(result[count]);
        return;
      }
      case 3: {
        count = 2;
        setTheProposalState(result[count]);
        return;
      }
      default:
        setTheProposalState(result[count]);
    }
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
      <Grid item>
        <Card
          style={{
            color: setCardFG(occ === getProposal().targetOption),
            backgroundColor: setCardBG(occ === getProposal().targetOption)
          }}
        >
          <CardActionArea onClick={() => handleClick(occ)}>
            <CardContent>
              <Tooltip title={t(`tooltip.${  TITLE[occ]}`)} arrow>
                <Typography variant="h6" component="div" data-testid={TITLE[occ]}>
                  {t(`label.${  TITLE[occ]}`)}
                </Typography>
              </Tooltip>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  return (
    <Shell page={PAGE}>
      <Grid container direction="column" justifyContent="space-around">
        <Grid
          p={2}
          container
          direction="row"
          justifyContent="space-evenly"
          alignItems="baseline"
          spacing={2}
        >
          {targetCard(1)}
          {targetCard(2)}
          {targetCard(3)}
        </Grid>

        <Grid
          mt={4}
          container
          direction="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item sx={{ width: '100%' }}>
            {getProposal().targetOption === 1 && <TargetListSection />}
          </Grid>
          <Grid item>{getProposal().targetOption === 2 && <TargetMosaicSection />}</Grid>
          <Grid item>{getProposal().targetOption === 3 && <TargetNoSpecificSection />}</Grid>
        </Grid>
      </Grid>
    </Shell>
  );
}
