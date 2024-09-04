import React from 'react';
import SpectralAveragingLOWField from './low/SpectralAveragingLOW';
import SpectralAveragingMIDField from './mid/SpectralAveragingMID';

interface SpectralAveragingMIDFieldProps {
  isLow?: boolean;
  setValue?: Function;
  value: number;
}

export default function SpectralAveragingField({
  isLow = false,
  setValue,
  value
}: SpectralAveragingMIDFieldProps) {
  return (
    <>
      {isLow && <SpectralAveragingLOWField required value={value} setValue={setValue} />}
      {!isLow && <SpectralAveragingMIDField required value={value} setValue={setValue} />}
    </>
  );
}
