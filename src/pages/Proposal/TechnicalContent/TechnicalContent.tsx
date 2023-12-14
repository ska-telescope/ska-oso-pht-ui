import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Modal,
  Typography
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UploadPdfButton from '../../../components/button/uploadPdf/UploadPdfButton';
import LatexEntry from '../../../components/latexEntry/latexEntry';

import { TECHNICAL } from '../../../utils/constants';

export default function TechnicalContent() {
  const [latex, setLatex] = React.useState(TECHNICAL);
  const [isOpen, setIsOpen] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState('');

  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }

  const latexModal = () => (
    <Modal open={isOpen}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Card variant="outlined" sx={{ height: '90vh', width: '90vw' }}>
          <CardHeader
            action={(
              <IconButton
                aria-label="DUMMY"
                sx={{ '&:hover': { backgroundColor: 'primary.dark' }, ml: 1 }}
                onClick={() => closeModal()}
                color="inherit"
              >
                <HighlightOffIcon />
              </IconButton>
            )}
            title={<Typography variant="h6">PDF Preview</Typography>}
          />
          <CardContent sx={{ height: '90vh', width: '90vw' }}>
            <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
              <p>Syntax error or PDF not available </p>
            </object>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );

  const updatePreview = (isOpenModal: boolean) => {
    const tex = [latex].join('\n');

    setPdfUrl(`https://latexonline.cc/compile?text=${encodeURIComponent(tex)}`);
    if (isOpenModal) openModal();
  };

  const setTheLatex = (e: string) => {
    setLatex(e);
    updatePreview(false);
  };

  return (
    <>
      {latexModal()}
      <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
        <Grid item>
          <Grid container p={5} spacing={5} direction="row" justifyContent="space-evenly">
            <Grid item xs={6}>
              <Grid container direction="column" alignItems="left">
                <Typography variant="h5">LaTeX Input</Typography>
                <LatexEntry
                  value={latex}
                  setValue={(e: string) => {
                    setTheLatex(e);
                  }}
                  // eslint-disable-next-line react/jsx-no-bind
                  setModal={openModal}
                />
                <Grid container direction="row" justifyContent="space-between">
                  {/* <PreviewPdfButton onClick={()=>updatePreview(true)} /> */}
                  <UploadPdfButton />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Box m={1}>
                <Typography variant="h5">LaTeX Preview</Typography>
                {/* TODO : Need React version of this <Latex>{latex}</Latex>  */}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
