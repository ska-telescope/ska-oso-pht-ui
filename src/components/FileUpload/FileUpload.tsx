import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Grid, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  AlertColorTypes,
  Button,
  ButtonSizeTypes,
  ButtonColorTypes,
  ButtonVariantTypes,
  IconButton,
  StatusIcon,
  Status
} from '@ska-telescope/ska-gui-components';

export enum FileUploadStatus {
  OK = 0,
  ERROR = 1,
  PENDING = 3,
  INITIAL = 9
}

interface FileUploadProps {
  dragPromptActive?: string;
  dragPromptInactive?: string;
  //
  buttonSize?: ButtonSizeTypes;
  chooseColor?: ButtonColorTypes;
  chooseDisabled?: boolean;
  chooseFileTypes?: string;
  chooseLabel?: string;
  chooseToolTip?: string;
  chooseVariant?: ButtonVariantTypes;
  direction?: 'row' | 'column';
  file?: File;
  isMinimal?: boolean;
  //
  hideFileName?: boolean;
  maxFileWidth?: number;
  testId?: string;
  //
  clearLabel?: string;
  clearDisabled?: boolean;
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
  //
  suffix?: JSX.Element | null;
}

export function FileUpload({
  dragPromptActive = 'Drop the files here ...',
  dragPromptInactive = "Drag 'n' drop a file here, or click to select file",
  //
  buttonSize = ButtonSizeTypes.Medium,
  chooseColor = ButtonColorTypes.Secondary,
  chooseDisabled = false,
  chooseFileTypes = '',
  chooseLabel = 'Choose file',
  chooseToolTip = 'Select to choose a file for upload',
  direction = 'row',
  isMinimal = false,
  chooseVariant = isMinimal ? ButtonVariantTypes.Text : ButtonVariantTypes.Contained,
  //
  file,
  hideFileName = false,
  maxFileWidth = 20,
  setFile,
  setStatus,
  status,
  testId = 'fileUpload',
  //
  clearDisabled = false,
  clearLabel = 'Upload',
  clearToolTip = 'Clear the selected file',
  clearVariant = ButtonVariantTypes.Contained,
  uploadColor = ButtonColorTypes.Secondary,
  uploadDisabled = false,
  uploadFunction,
  uploadLabel = 'Upload',
  uploadToolTip = 'Upload the selected file',
  uploadURL = 'https://httpbin.org/post',
  uploadVariant = ButtonVariantTypes.Contained,
  //
  suffix = null
}: FileUploadProps) {
  const [theFile, setTheFile] = React.useState<File | null>(null);
  const [name, setName] = React.useState('');
  const [state, setState] = React.useState(FileUploadStatus.INITIAL);

  const onDrop = React.useCallback(acceptedFiles => {
    console.log('TREVOR GETS TO onDrop', acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  React.useEffect(() => {
    if (file) {
      setTheFile(file);
      setName(file.name);
    }
  }, []);

  const setTheStatus = (e: FileUploadStatus) => {
    if (setStatus) {
      setStatus(e);
    } else {
      setState(e);
    }
  };

  const handleFileChange = (e: any) => {
    if (e.target.files) {
      setTheFile(e.target.files[0]);
      setName(e.target.files[0].name);
      setTheStatus(FileUploadStatus.INITIAL);
      if (setFile) {
        setFile(e.target.files[0].name);
      }
    }
    e.target.value = null;
  };

  const handleClear = () => {
    setTheFile(null);
    setName('');
    setTheStatus(FileUploadStatus.INITIAL);
    if (setFile) {
      setFile('');
    }
  };

  const handleUpload = () => {
    if (uploadFunction) {
      uploadFunction(theFile);
    } else {
      handleUploadFunction(theFile);
    }
  };

  const handleUploadFunction = async (inFile: string | Blob | null) => {
    if (inFile) {
      const formData = new FormData();
      formData.append('file', inFile);
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

  const displayName = () =>
    name?.length > maxFileWidth ? name.substring(0, maxFileWidth) + '...' : name;

  const getClearIcon = () => {
    return <ClearIcon />;
  };

  const getStatusLevel = status => {
    const result = status ? status : state;
    const checked = result === 9 ? 0 : result;
    return checked;
  };

  const statusDisplay = () => (
    <StatusIcon testId="statusId" icon level={getStatusLevel(status)} size={isMinimal ? 20 : 14} />
  );

  const getUploadIcon = () => {
    const val = status ? status : state;
    return val === FileUploadStatus.INITIAL ? <UploadFileIcon /> : statusDisplay();
  };

  const getAlertColor = () => {
    const val = getStatusLevel(status);
    switch (val) {
      case FileUploadStatus.PENDING:
        return AlertColorTypes.Warning;
      case FileUploadStatus.OK:
        return AlertColorTypes.Success;
      default:
        return AlertColorTypes.Error;
    }
  };

  const ChooseButton = () => (
    <label htmlFor="uploadFile">
      <input
        style={{ display: 'none' }}
        id="uploadFile"
        name="chooseFileInput"
        type="file"
        accept={chooseFileTypes}
        onChange={handleFileChange}
        onDrop={handleFileChange}
      />
      <Button
        ariaDescription={chooseToolTip}
        color={isMinimal ? ButtonColorTypes.Inherit : name ? ButtonColorTypes.Inherit : chooseColor}
        component="span"
        disabled={chooseDisabled}
        icon={<SearchIcon />}
        label={isMinimal ? '' : chooseLabel}
        size={buttonSize}
        testId={isMinimal ? testId + 'ChooseIcon' : testId + 'ChooseButton'}
        toolTip={chooseToolTip}
        variant={chooseVariant}
      />
    </label>
  );

  const showFileName = () => (
    <Typography pt={1} data-testid={testId + 'Filename'} variant="body1">
      {name?.length ? displayName() : ''}
    </Typography>
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

  const ClearButton = () => (
    <>
      {isMinimal && (
        <IconButton
          ariaDescription={clearToolTip}
          icon={getClearIcon()}
          onClick={handleClear}
          testId={testId + 'ClearIcon'}
          toolTip={chooseToolTip}
        />
      )}
      {!isMinimal && (
        <Button
          ariaDescription={clearToolTip}
          color={ButtonColorTypes.Inherit}
          component="span"
          disabled={clearDisabled}
          icon={getClearIcon()}
          label={isMinimal ? '' : clearLabel}
          onClick={handleClear}
          size={buttonSize}
          testId={testId + 'ClearButton'}
          toolTip={clearToolTip}
          variant={clearVariant}
        />
      )}
    </>
  );

  return (
    <>
      {isMinimal && (
        <Alert color={getAlertColor()} testId="testId">
          <Grid
            p={0}
            container
            direction={direction}
            alignItems="baseline"
            justifyContent={'center'}
          >
            <Grid pt={1} item>
              {statusDisplay()}
            </Grid>
            <Grid item>{ChooseButton()}</Grid>
            <Grid item>{showFileName()}</Grid>
            {theFile && <Grid item>{ClearButton()}</Grid>}
            {suffix && <Grid item>{suffix}</Grid>}
            <Grid item xs={12}>
              {isDragActive ? dragPromptActive : dragPromptInactive}
            </Grid>
          </Grid>
        </Alert>
      )}
      {!isMinimal && (
        <>
          <Grid p={0} container direction={direction} justifyContent="space-evenly" spacing={1}>
            <Grid item>{statusDisplay()}</Grid>
            <Grid item>{ChooseButton()}</Grid>
            {!hideFileName && <Grid item>{showFileName()}</Grid>}
            {theFile && <Grid item>{ClearButton()}</Grid>}
            {theFile && <Grid item>{UploadButton()}</Grid>}
            {suffix && <Grid item>{suffix}</Grid>}
          </Grid>
          <Grid container direction="row" alignItems="centre" justifyContent="space-around">
            <Grid item>
              <Typography pt={1} data-testid={testId + 'Filename'} variant="body1">
                {isDragActive ? dragPromptActive : dragPromptInactive}
              </Typography>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

export default FileUpload;
