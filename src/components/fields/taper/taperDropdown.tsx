import { useScopedTranslation } from '@services/i18n/useScopedTranslation.tsx';
import { FREQUENCY_GHZ } from '@utils/constants.ts';
import { Box } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { frequencyConversion } from '@utils/helpers.ts';
import { ValueUnitPair } from '@utils/types/typesSensCalc.tsx';

interface TaperDropdownFieldProps {
  required?: boolean;
  setValue?: Function;
  value: number;
  onFocus?: Function;
  suffix?: any;
  centralFrequency?: ValueUnitPair;
}

export default function TaperDropdownField({
  required = true,
  setValue,
  value,
  onFocus,
  suffix,
  centralFrequency
}: TaperDropdownFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'taper';

  const getOptions = (
    options: { label: string; value: number }[],
    centralFrequency: ValueUnitPair | undefined
  ) => {
    if (!centralFrequency || !centralFrequency.value || !centralFrequency.unit) {
      return options;
    }
    [0.25, 1, 4, 16, 64, 256, 1024].forEach(inValue => {
      const theLabel =
        (
          inValue *
          (1.4 /
            frequencyConversion(
              centralFrequency?.value,
              Number(centralFrequency?.unit),
              FREQUENCY_GHZ
            ))
        ).toFixed(3) + '"';
      options.push({ label: theLabel, value: inValue });
    });
    return options;
  };

  return (
    <Box pt={1}>
      <DropDown
        options={getOptions([{ label: t('tapering.0'), value: 0 }], centralFrequency)}
        testId={FIELD}
        value={value}
        setValue={setValue}
        label={t(FIELD + '.label')}
        onFocus={onFocus}
        required={required}
        suffix={suffix}
      />
    </Box>
  );
}
