import SpectralAveragingLOWField from './low/SpectralAveragingLOW';
import SpectralAveragingMIDField from './mid/SpectralAveragingMID';

interface SpectralAveragingFieldProps {
  isLow?: boolean;
  labelWidth: number;
  setValue?: Function;
  value: number;
  subarray: number;
  type: number;
}

export default function SpectralAveragingField({
  isLow = false,
  labelWidth,
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
          widthLabel={labelWidth}
          value={value}
          setValue={setValue}
          subarray={subarray}
          type={type}
        />
      )}
      {!isLow && (
        <SpectralAveragingMIDField
          widthLabel={labelWidth}
          required
          value={value}
          setValue={setValue}
        />
      )}
    </>
  );
}
