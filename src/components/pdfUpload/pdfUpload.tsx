import React from 'react';
import { Grid, IconButton, Tooltip } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface pdfUploadProps {
  value: string;
  setValue?: Function;
  setModal?: Function;
}

export default function PDFUpload({ setModal }: pdfUploadProps) {
  return (
    <Grid container direction="row" alignItems="flex-start" justifyContent="space-evenly">
      <Grid item xs={11} />
      <Grid item xs={1}>
        <Tooltip title="Preview PDF" arrow>
          <IconButton
            aria-label="pdfUpload"
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
