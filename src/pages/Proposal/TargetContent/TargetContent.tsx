import React from 'react';
import useTheme from '@mui/material/styles/useTheme';
import { Grid, Typography, Card, CardContent, CardActionArea, Tooltip } from '@mui/material';
import TargetListSection from './TargetListSection/targetListSection';
import TargetNoSpecificSection from './TargetNoSpecificSection/targetNoSpecificSection';
import TargetMosaicSection from './TargetMosaicSection/targetMosaicSection';

const TITLE = [
  "No specific Target", "List of Targets", "Target Mosaic"
];

const TOOLTIP = [
  "We are just going to look up",
  "A list of target will be entered and/or imported from file",
  "Using a tool to create a mosaic of targets"
];

export default function TargetContent() {
  const theme = useTheme();

  const [selectedCards, setSelectedCards] = React.useState([
    { index: 0, isSelected: false },
    { index: 1, isSelected: false },
    { index: 2, isSelected: false }
  ]);

  const handleClick = (index: number) => {
    const updatedSelectedCards = selectedCards.map((card) => ({ ...card, isSelected: (card.index === index) }));
    setSelectedCards(updatedSelectedCards);
  };

  const setCardBG = (isSelected: boolean) => isSelected ? theme.palette.secondary.main : theme.palette.primary.main;
  const setCardFG = (isSelected: boolean) => isSelected ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText;

  function targetCard(occ: number) {
    return (
      <Grid item>
        <Card
          style={{
                color: setCardFG(selectedCards[occ].isSelected),
                backgroundColor: setCardBG(selectedCards[occ].isSelected)
              }}
        >
          <CardActionArea onClick={() => handleClick(occ)}>
            <CardContent>                  
              <Tooltip title={TOOLTIP[occ]} arrow>
                <Typography variant="h6" component="div">{TITLE[occ]}</Typography>
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
        {targetCard(0)}
        {targetCard(1)}
        {targetCard(2)}
      </Grid>

      <Grid mt={4} container direction="column" justifyContent="space-between" alignItems="center">
        <Grid item>{selectedCards[0].isSelected && <TargetNoSpecificSection />}</Grid>
        <Grid item sx={{ width: '100%' }}>
          {selectedCards[1].isSelected && <TargetListSection />}
        </Grid>
        <Grid item>{selectedCards[2].isSelected && <TargetMosaicSection />}</Grid>
      </Grid>
    </Grid>
  );
}
