import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown, LABEL_POSITION } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';

interface ReferenceFrameFieldProps {
  labelBold: boolean;
  labelPosition: LABEL_POSITION;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
}

export default function ReferenceFrameField({
  labelBold,
  labelPosition,
  labelWidth = 5,
  onFocus,
  setValue,
  value
}: ReferenceFrameFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'referenceFrame';

  const OPTIONS = [0, 1];

  const getOptions = () => OPTIONS.map(e => ({ label: t(`${FIELD  }.${  e}`), value: e }));

  return (
    <Box p={1} sx={{ width: '100%' }}>
      <DropDown
        options={getOptions()}
        testId={FIELD}
        value={value}
        setValue={setValue}
        label={t(`${FIELD  }.label`)}
        labelBold={labelBold}
        labelPosition={labelPosition}
        labelWidth={labelWidth}
        onFocus={onFocus}
      />
    </Box>
  );
}
