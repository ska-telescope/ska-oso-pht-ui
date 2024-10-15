import React, { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import ClearIcon from '@mui/icons-material/Clear';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import { Grid, Typography } from '@mui/material';
import {
  ButtonColorTypes,
  ButtonSizeTypes,
  ButtonVariantTypes,
  FileUploadStatus
} from '@ska-telescope/ska-gui-components';

const fileTypes = ['PDF'];

interface DragDropProps {
  buttonSize?: ButtonSizeTypes;
  chooseColor?: ButtonColorTypes;
  chooseDisabled?: boolean;
  chooseFileTypes?: string;
  chooseLabel?: string;
  chooseToolTip?: string;
  chooseVariant?: ButtonVariantTypes;
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
  chooseColor = ButtonColorTypes.Secondary,
  chooseDisabled = false,
  chooseFileTypes = '',
  chooseLabel = 'Choose file',
  chooseToolTip = 'Select to choose a file for upload',
  chooseVariant = ButtonVariantTypes.Contained,
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
  const [name, setName] = React.useState('');
  const [state, setState] = React.useState(FileUploadStatus.INITIAL);
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

  return (
    <div className="App">
      <FileUploader
        multiple={false}
        handleChange={handleFileChange}
        name="file"
        types={fileTypes}
      />
      <p>{file ? `File name: ${file.name}` : 'no files uploaded yet'}</p>
    </div>
  );
}

export default DragDrop;
