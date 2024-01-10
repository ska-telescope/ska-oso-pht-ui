import React, {useState} from 'react';
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

import {STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import PDFUpload from "../../../components/pdfUpload/pdfUpload";

interface ScienceContentProps {
  page: number;
}

export default function ScienceContent({ page}: ScienceContentProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [pdfUrl] = React.useState('');

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
      "initial" | "uploading" | "success" | "fail"
  >("initial");

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    const count = 0;

    // TODO : Increment the count for every passing element of the page.
    // This is then used to take the status from the result array
    // In the default provided, the count must be 2 for the page to pass.

    // See titleContent page for working example

    setStatus([page, result[count]]);
  }, [setStatus]);

  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStatus("initial");
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const result = await fetch("https://httpbin.org/post", {
          method: "POST",
          body: formData,
        });

        const data = await result.json();

        console.log(data);
        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("fail");
      }
    }
  };

  const Result = ({ status }: { status: string }) => {
    if (status === "success") {
      return <p> File uploaded successfully!</p>;
    } else if (status === "fail") {
      return <p>File upload failed!</p>;
    } else if (status === "uploading") {
      return <p>Uploading selected file...</p>;
    } else {
      return null;
    }
  };

  const pdfUploadModal = () => (
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

  // return (
  //   <>
  //     {pdfUploadModal()}
  //     <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
  //       <Grid item>
  //         <Grid container p={5} spacing={5} direction="row" justifyContent="space-evenly">
  //           <Grid item xs={6}>
  //             <Grid container direction="column" alignItems="left">
  //               <Typography variant="h5">Upload PDF</Typography>
  //               <PDFUpload
  //                 // eslint-disable-next-line react/jsx-no-bind
  //                 setModal={openModal}
  //               />
  //               <Grid container direction="row" justifyContent="space-between">
  //                 <UploadPdfButton />
  //               </Grid>
  //             </Grid>
  //           </Grid>
  //           <Grid item xs={6}>
  //             <Box m={1}>
  //               <Typography variant="h5">Uploaded PDF Preview</Typography>
  //             </Box>
  //           </Grid>
  //         </Grid>
  //       </Grid>
  //     </Grid>
  //   </>
  // );

  return (
      <>
        <div className="input-group">
          <input id="file" type="file" onChange={handleFileChange} />
          <UploadPdfButton/>
        </div>
        {file && (
            <button onClick={handleUpload} className="submit">
              Upload a file
            </button>
        )}
        <Result status={status} />
      </>
  );
}
