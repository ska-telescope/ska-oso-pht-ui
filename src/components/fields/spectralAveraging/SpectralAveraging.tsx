import SpectralAveragingLOWField from './low/SpectralAveragingLOW';
import SpectralAveragingMIDField from './mid/SpectralAveragingMID';

interface SpectralAveragingFieldProps {
  isLow?: boolean;
  widthLabel: number;
  setValue?: Function;
  value: number;
  subarray: number;
  type: number;
}

export default function SpectralAveragingField({
  isLow = false,
  widthLabel,
  setValue,
  value,
  subarray,
  type
}: SpectralAveragingFieldProps) {
  return (
    <>
      {isLow && (
        <SpectralAveragingLOWField
          required
          widthLabel={widthLabel}
          value={value}
          setValue={setValue}
          subarray={subarray}
          type={type}
        />
      )}
      {!isLow && (
        <SpectralAveragingMIDField
          widthLabel={widthLabel}
          required
          value={value}
          setValue={setValue}
        />
      )}
    </>
  );
}
