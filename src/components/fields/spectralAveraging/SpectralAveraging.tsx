import SpectralAveragingLOWField from './low/SpectralAveragingLOW';
import SpectralAveragingMIDField from './mid/SpectralAveragingMID';

interface SpectralAveragingFieldProps {
  isLow?: boolean;
  setValue?: Function;
  value: number;
  subarray: string;
  observationType: string;
}

export default function SpectralAveragingField({
  isLow = false,
  setValue,
  value,
  subarray,
  observationType
}: SpectralAveragingFieldProps) {
  return (
    <>
      {isLow && (
        <SpectralAveragingLOWField
          required
          value={value}
          setValue={setValue}
          subarray={subarray}
          observationType={observationType}
        />
      )}
      {!isLow && <SpectralAveragingMIDField required value={value} setValue={setValue} />}
    </>
  );
}
