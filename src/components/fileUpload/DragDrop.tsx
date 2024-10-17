import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Grid } from '@mui/material';
import {
  Button,
  ButtonColorTypes,
  ButtonSizeTypes,
  ButtonVariantTypes,
  FileUploadStatus,
  StatusIcon
} from '@ska-telescope/ska-gui-components';
import { FileUploader } from './FileUploader';

const fileTypes = ['PDF'];

interface DragDropProps {
  buttonSize?: ButtonSizeTypes;
  direction?: 'row' | 'column';
  file?: File;
  //
  hideFileName?: boolean;
  maxFileWidth?: number;
  testId?: string;
  //
  clearLabel?: string;
  clearToolTip?: string;
  clearVariant?: ButtonVariantTypes;
  setFile?: Function | null;
  setStatus?: Function | null;
  status?: FileUploadStatus;
  uploadColor?: ButtonColorTypes;
  uploadDisabled?: boolean;
  uploadFunction?: Function | null;
  uploadLabel?: string;
  uploadToolTip?: string;
  uploadURL?: string;
  uploadVariant?: ButtonVariantTypes;
}

export function DragDrop({
  buttonSize = ButtonSizeTypes.Medium,
  direction = 'row',
  //
  file,
  hideFileName = false,
  maxFileWidth = 20,
  setFile,
  setStatus,
  status,
  testId = 'fileUpload',
  //
  clearLabel = 'Upload',
  clearToolTip = 'Clear the selected file',
  clearVariant = ButtonVariantTypes.Contained,
  uploadColor = ButtonColorTypes.Secondary,
  uploadDisabled = false,
  uploadFunction,
  uploadLabel = 'Upload',
  uploadToolTip = 'Upload the selected file',
  uploadURL = 'https://httpbin.org/post',
  uploadVariant = ButtonVariantTypes.Contained
}: DragDropProps) {
  const [theFile, setTheFile] = React.useState<File | null>(null);
  // const [setName] = React.useState('');
  const [state, setState] = React.useState(FileUploadStatus.INITIAL);

  React.useEffect(() => {
    if (file) {
      setTheFile(file);
      // setName(file.name);
    }
  }, []);

  const setTheStatus = (e: FileUploadStatus) => {
    if (setStatus) {
      setStatus(e);
    } else {
      setState(e);
    }
  };

  // const displayName = () =>
  //   name?.length > maxFileWidth ? name.substring(0, maxFileWidth) + '...' : name;

  const getClearIcon = () => {
    return <ClearIcon />;
  };

  // const showFileName = () => (
  //   <Typography pt={1} data-testid={testId + 'Filename'} variant="body1">
  //     {name?.length ? displayName() : ''}
  //   </Typography>
  // );

  const getUploadIcon = () => {
    const val = status ? status : state;
    return val === FileUploadStatus.INITIAL ? (
      <UploadFileIcon />
    ) : (
      <StatusIcon testId="statusId" icon level={status ? status : state} size={14} />
    );
  };

  const handleFileChange = (e: any) => {
    if (e) {
      setTheFile(e);
      // setName(e.name);
      setTheStatus(FileUploadStatus.INITIAL);
      if (setFile) {
        setFile(e.name);
      }
    }
    e = null;
  };

  const handleClear = () => {
    setTheFile(null);
    // setName('');
    setTheStatus(FileUploadStatus.INITIAL);
    if (setFile) {
      setFile('');
    }
  };

  const handleUpload = () => {
    if (uploadFunction) {
      uploadFunction(theFile);
    } else {
      handleUploadFunction();
    }
  };

  const handleUploadFunction = async () => {
    if (theFile) {
      const formData = new FormData();
      formData.append('file', theFile);
      setTheStatus(FileUploadStatus.PENDING);

      try {
        await fetch(uploadURL, {
          method: 'POST',
          body: formData
        });
        setTheStatus(FileUploadStatus.OK);
      } catch (error) {
        setTheStatus(FileUploadStatus.ERROR);
      }
    }
  };

  const ClearButton = () => (
    <Button
      ariaDescription={clearToolTip}
      color={ButtonColorTypes.Inherit}
      component="span"
      disabled={uploadDisabled || uploadURL.length === 0}
      icon={getClearIcon()}
      label={clearLabel}
      onClick={handleClear}
      size={buttonSize}
      testId={testId + 'ClearButton'}
      toolTip={clearToolTip}
      variant={clearVariant}
    />
  );

  const UploadButton = () => (
    <Button
      ariaDescription={uploadToolTip}
      color={state === FileUploadStatus.INITIAL ? uploadColor : ButtonColorTypes.Inherit}
      component="span"
      disabled={uploadDisabled || uploadURL.length === 0}
      icon={getUploadIcon()}
      label={uploadLabel}
      onClick={handleUpload}
      size={buttonSize}
      testId={testId + 'UploadButton'}
      toolTip={uploadToolTip}
      variant={uploadVariant}
    />
  );

  return (
    <div className="App">
      <FileUploader
        multiple={false}
        handleChange={handleFileChange}
        name="file"
        types={fileTypes}
      />
      <Grid p={0} container direction={direction} justifyContent="space-evenly" spacing={1}>
        {/*{!hideFileName && <Grid item>{showFileName()}</Grid>}*/}
        {theFile && <Grid item>{ClearButton()}</Grid>}
        {theFile && <Grid item>{UploadButton()}</Grid>}
      </Grid>
    </div>
  );
}

export default DragDrop;
