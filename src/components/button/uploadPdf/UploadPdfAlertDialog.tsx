import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid, Typography } from '@mui/material';
import { ButtonColorTypes, ButtonVariantTypes, Button } from '@ska-telescope/ska-gui-components';
import { useState } from 'react';

export default function UploadPdfAlertDialog(props) {
  const { open, onClose, onDialogResponse } = props;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'initial' | 'uploading' | 'success' | 'fail'>('initial');

  const handleClose = () => {
    onDialogResponse('close');
    onClose();
  };

  const handleCancel = () => {
    onDialogResponse('cancel');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStatus('initial');
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setStatus('uploading');

      const formData = new FormData();
      formData.append('file', file);

      try {
        await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: formData
        });

        alert('Upload successful');
        setStatus('success');
      } catch (error) {
        alert(error);
        setStatus('fail');
      }
    }
  };

  const Result = ({ status }: { status: string }) => {
    if (status === 'success') {
      return <p> File uploaded successfully!</p>;
    }
    if (status === 'fail') {
      return <p>File upload failed!</p>;
    }
    if (status === 'uploading') {
      return <p>Uploading selected file...</p>;
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-pdf-upload"
    >
      <DialogTitle id="alert-dialog-title">Upload supporting PDF file?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div">
          <Typography variant="body1">
            You are about to upload a PDF document to your proposal.
          </Typography>
        </DialogContentText>
        <div>
          <input id="file" type="file" onChange={handleFileChange} />
        </div>
        {file && (
          <button onClick={handleUpload} className="submit">
            Upload a file
          </button>
        )}
        <Result status={status} />
      </DialogContent>
      <DialogActions sx={{ p: '24px' }}>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <Button
              ariaDescription="Cancel Button"
              color={ButtonColorTypes.Secondary}
              label="Cancel"
              onClick={handleCancel}
              testId="cancelId"
              variant={ButtonVariantTypes.Contained}
            />
          </Grid>
          <Grid item>
            <Button
              ariaDescription="Close Button"
              color={ButtonColorTypes.Secondary}
              label="Close"
              onClick={handleClose}
              testId="closeId"
              variant={ButtonVariantTypes.Contained}
            />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
