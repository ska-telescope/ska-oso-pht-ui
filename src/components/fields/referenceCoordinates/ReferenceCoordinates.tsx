import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box, Tooltip } from '@mui/material';
import { LAB_POSITION } from '../../../utils/constants';

// TODO : DISABLED AT THIS TIME UNTIL GALACTIC IS IMPLEMENTED FULLY

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
    const OPTIONS = [0]; // TODO , 1];

    const getOptions = () => {
      return OPTIONS.map(e => ({ label: t(FIELD + '.' + e), value: e }));
    };

    return (
      <Tooltip title={t(FIELD + '.tooltip')}>
        <Box pt={1}>
          <DropDown
            disabled // TODO : Need to implement Galactic
            options={getOptions()}
            testId={FIELD + 'Type'}
            value={value}
            setValue={setValue}
            label={t(FIELD + '.label')}
            labelBold
            labelPosition={LAB_POSITION}
            labelWidth={labelWidth}
            onFocus={valueFocus}
            required
          />
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      {ReferenceCoordinatesValueField()}
    </Box>
  );
}
