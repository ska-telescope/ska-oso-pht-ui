import React from 'react';
import useTheme from '@mui/material/styles/useTheme';
import { Grid, Typography, Card, CardContent, CardActionArea, Tooltip } from '@mui/material';
import TargetListSection from './TargetListSection/targetListSection';
import TargetNoSpecificSection from './TargetNoSpecificSection/targetNoSpecificSection';
import TargetMosaicSection from './TargetMosaicSection/targetMosaicSection';
import { STATUS_ERROR, STATUS_PARTIAL, STATUS_OK } from '../../../utils/constants';
import { Help } from '../../../services/types/help';
import { Proposal } from '../../../services/types/proposal';

const TITLE = ['', 'No specific Target', 'List of Targets', 'Target Mosaic'];

const TOOLTIP = [
  '',
  'Current functionality is not yet available',
  'A list of target will be entered and/or imported from file',
  'Current functionality is not yet available'
];

interface GeneralContentProps {
  help: Help;
  page: number;
  proposal: Proposal;
  setHelp: Function;
  setProposal: Function;
  setStatus: Function;
}

export default function TargetContent({
  help,
  page,
  proposal,
  setHelp,
  setProposal,
  setStatus
}: GeneralContentProps) {
  const theme = useTheme();

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = 0;
    switch (proposal.targetOption) {
      case 1: {
        count = 2;
        setStatus([page, result[count]]);
        return;
      }
      case 2: {
        count = 1;
        count += proposal.targets.length ? 1 : 0;
        setStatus([page, result[count]]);
        return;
      }
      case 3: {
        count = 2;
        setStatus([page, result[count]]);
        return;
      }
      default:
        setStatus([page, result[count]]);
    }
  }, [proposal]);

  const handleClick = (index: number) => {
    setProposal({ ...proposal, targetOption: index });
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
            color: setCardFG(occ === proposal.targetOption),
            backgroundColor: setCardBG(occ === proposal.targetOption)
          }}
        >
          <CardActionArea onClick={() => handleClick(occ)}>
            <CardContent>
              <Tooltip title={TOOLTIP[occ]} arrow>
                <Typography variant="h6" component="div">
                  {TITLE[occ]}
                </Typography>
              </Tooltip>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  }

  return (
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

      <Grid mt={4} container direction="column" justifyContent="space-between" alignItems="center">
        <Grid item>{proposal.targetOption === 1 && <TargetNoSpecificSection />}</Grid>
        <Grid item sx={{ width: '100%' }}>
          {proposal.targetOption === 2 && (
            <TargetListSection
              help={help}
              proposal={proposal}
              setHelp={setHelp}
              setProposal={setProposal}
            />
          )}
        </Grid>
        <Grid item>{proposal.targetOption === 3 && <TargetMosaicSection />}</Grid>
      </Grid>
    </Grid>
  );
}
