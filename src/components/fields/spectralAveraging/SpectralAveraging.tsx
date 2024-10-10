import React from 'react';
import SpectralAveragingLOWField from './low/SpectralAveragingLOW';
import SpectralAveragingMIDField from './mid/SpectralAveragingMID';

interface SpectralAveragingFieldProps {
  isLow?: boolean;
  setValue?: Function;
  value: number;
  subarray?: number;
}

export default function SpectralAveragingField({
  isLow = false,
  setValue,
  value,
  subarray
}: SpectralAveragingFieldProps) {
  return (
    <>
      {isLow && (
        <SpectralAveragingLOWField required value={value} setValue={setValue} subarray={subarray} />
      )}
      {!isLow && <SpectralAveragingMIDField required value={value} setValue={setValue} />}
    </>
  );
}
