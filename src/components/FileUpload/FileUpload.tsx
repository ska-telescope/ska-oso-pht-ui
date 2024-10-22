import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Grid, Typography } from '@mui/material';
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
import { resourceLimits } from 'worker_threads';

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
  chooseVariant = isMinimal ? ButtonVariantTypes.Outlined : ButtonVariantTypes.Contained,
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
    <Box p={0} pt={5}>
      <StatusIcon
        testId="statusId"
        icon
        level={getStatusLevel(status)}
        size={isMinimal ? 20 : 14}
      />
    </Box>
  );

  const getUploadIcon = () => {
    const val = status ? status : state;
    return val === FileUploadStatus.INITIAL ? <UploadFileIcon /> : statusDisplay();
  };

  const getButtonColor = () => {
    const val = getStatusLevel(status);
    switch (val) {
      case FileUploadStatus.PENDING:
        return ButtonColorTypes.Warning;
      case FileUploadStatus.OK:
        return ButtonColorTypes.Success;
      default:
        return ButtonColorTypes.Error;
    }
  };

  const ChooseButton = () => (
    <label htmlFor={testId}>
      <input
        style={{ display: 'none' }}
        id={testId}
        name="chooseFileInput"
        type="file"
        accept={chooseFileTypes}
        onChange={handleFileChange}
        onDrop={handleFileChange}
      />
      <Button
        ariaDescription={chooseToolTip}
        color={getButtonColor()}
        component="span"
        disabled={chooseDisabled}
        icon={<SearchIcon />}
        label={isMinimal ? displayName() : chooseLabel}
        size={buttonSize}
        testId={isMinimal ? testId + 'ChooseIcon' : testId + 'ChooseButton'}
        toolTip={chooseToolTip}
        variant={chooseVariant}
      />
      {theFile && <Grid item>{ClearButton()}</Grid>}
      {suffix && <Grid item>{suffix}</Grid>}
    </label>
  );

  const showFileName = () => (
    <Typography pt={1} data-testid={testId + 'Filename'} sx={{ width: '350px' }} variant="body1">
      {name?.length ? displayName() : ''}
    </Typography>
  );

  const UploadButton = () => (
    <Button
      ariaDescription={uploadToolTip}
      color={getButtonColor()}
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
          toolTip={clearToolTip}
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
        <Alert testId="testId" action={handleFileChange}>
          <>
            <Grid container direction="row" alignItems="baseline" justifyContent="space-around">
              <Grid item>
                <label htmlFor={testId}>
                  <input
                    style={{ display: 'none' }}
                    id={testId}
                    name="chooseFileInput"
                    type="file"
                    accept={chooseFileTypes}
                    onChange={handleFileChange}
                    onDrop={handleFileChange}
                  />
                  <Button
                    ariaDescription={chooseToolTip}
                    color={getButtonColor()}
                    component="span"
                    disabled={chooseDisabled}
                    icon={<SearchIcon />}
                    label={isMinimal ? displayName() : chooseLabel}
                    size={buttonSize}
                    testId={isMinimal ? testId + 'ChooseIcon' : testId + 'ChooseButton'}
                    toolTip={chooseToolTip}
                    variant={chooseVariant}
                  />
                  <Grid
                    container
                    direction="row"
                    alignItems="baseline"
                    justifyContent="space-around"
                  >
                    {theFile && <Grid item>{ClearButton()}</Grid>}
                    {suffix && <Grid item>{suffix}</Grid>}
                  </Grid>
                </label>
              </Grid>
            </Grid>
            <Grid container direction="row" alignItems="baseline" justifyContent="space-around">
              <Grid item>
                <Typography data-testid={testId + 'Filename'} variant="body1">
                  {isDragActive ? dragPromptActive : dragPromptInactive}
                </Typography>
              </Grid>
            </Grid>
          </>
        </Alert>
      )}
      {!isMinimal && (
        <>
          <Grid p={0} container direction={direction} justifyContent="space-evenly" spacing={1}>
            <Grid item>{ChooseButton()}</Grid>
            {false && !hideFileName && <Grid item>{showFileName()}</Grid>}
            {false && theFile && <Grid item>{ClearButton()}</Grid>}
            {false && theFile && <Grid item>{UploadButton()}</Grid>}
            {false && suffix && <Grid item>{suffix}</Grid>}
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
