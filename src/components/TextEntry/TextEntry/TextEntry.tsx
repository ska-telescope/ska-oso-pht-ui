import React from 'react';
import { TextField } from '@mui/material';
import { MAX_TITLE_LENGTH, TITLE_HELPER_TEXT } from '../../../utils/constants';

interface TextEntryProps {
  id: string;
  label: string;
}

export default function TextEntry({ id, label }: TextEntryProps) {

  const [theTitle, setTheTitle] = React.useState('default');
  const [helperText, sethelperText] = React.useState('');
  const [error, setError] = React.useState(false);

  const validateTheTitle = (e) => {
    const title = e.target.value
    // specify the pattern for allowed characters
    const pattern = /^[a-zA-Z0-9\s\-_.,!"'/$]+$/;
    // check if the input matches the pattern
    if (pattern.test(title)) {
      // if it does, update the title
      setTheTitle(title.substring(0, MAX_TITLE_LENGTH));
      setError(false);
      sethelperText("");
    } else if (title.trim() === "") {
      // if input is empty, clear the error message
      setError(false);
      sethelperText("");
    } else {
      // if input doesn't match the pattern, show an error message
      setError(true);
      sethelperText(TITLE_HELPER_TEXT);
    }
  };

  return (
    <TextField
      id={id}
      label={label}
      variant="standard"
      fullWidth
      onChange={validateTheTitle}
      error={error}
      helperText={helperText}
    />
  );
}
