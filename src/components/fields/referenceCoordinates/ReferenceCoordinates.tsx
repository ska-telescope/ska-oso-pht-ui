import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown, LABEL_POSITION } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';

interface ReferenceCoordinatesFieldProps {
  labelWidth?: number;
  setValue?: Function;
  value: number;
  valueFocus?: Function;
}

export default function ReferenceCoordinatesField({
  labelWidth = 5,
  setValue,
  value,
  valueFocus
}: ReferenceCoordinatesFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'referenceCoordinates';

  const ReferenceCoordinatesValueField = () => {
    const OPTIONS = [0, 1];

    const getOptions = () => OPTIONS.map(e => ({ label: t(`${FIELD}.${e}`), value: e }));

    return (
      <Box pt={1}>
        <DropDown
          options={getOptions()}
          testId={`${FIELD}Type`}
          value={value}
          setValue={setValue}
          label={t(`${FIELD}.label`)}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={labelWidth}
          onFocus={valueFocus}
          required
        />
      </Box>
    );
  };

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      {ReferenceCoordinatesValueField()}
    </Box>
  );
}
