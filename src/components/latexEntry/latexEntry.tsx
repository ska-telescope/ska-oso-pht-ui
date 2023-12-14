import React from 'react';
import { Grid, IconButton, Tooltip } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface LatexEntryProps {
  value: string;
  setValue?: Function;
  setModal?: Function;
}

export default function LatexEntry({ value, setValue, setModal }: LatexEntryProps) {
  return (
    <Grid container direction="row" alignItems="flex-start" justifyContent="space-evenly">
      <Grid item xs={11}>
        <TextEntry label="" testId="latexId" rows={15} value={value} setValue={setValue} />
      </Grid>
      <Grid item xs={1}>
        <Tooltip title="Preview PDF" arrow>
          <IconButton
            aria-label="DUMMY"
            sx={{ '&:hover': { backgroundColor: 'primary.dark' }, ml: 1 }}
            onClick={() => (setModal ? setModal() : null)}
            color="inherit"
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
