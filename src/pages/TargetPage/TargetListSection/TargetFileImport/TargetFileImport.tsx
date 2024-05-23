import React from 'react';
import { Typography } from '@mui/material';
import BaseButton from '../../../../components/button/Base/Button';

interface TargetFileImportProps {
  raType: number;
}

export default function TargetFileImport({ raType }: TargetFileImportProps) {
  return (
    <>
      <Typography>{raType}</Typography>
    </>
  );
}
