import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import {
  FLOW_THROUGH_VALUE,
  FREQUENCY_HZ,
  FREQUENCY_UNITS,
  NOT_SPECIFIED,
  SENSITIVITY_STATE,
  SUPPLIED_TYPE_INTEGRATION,
  TIME_HOURS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST
} from '@utils/constants.ts';
import {
  frequencyConversion,
  getBandwidthOrFrequencyUnitsLabel,
  getBandwidthZoom,
  timeConversion
} from '@utils/helpers';
import { presentUnits, presentValue } from '@utils/present/present';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Observation from '../../../utils/types/observation';
import Proposal from '../../../utils/types/proposal';
import emptyCell from '../../../components/fields/emptyCell/emptyCell';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import ObservingType from '@/components/display/observingType/observingType';

interface GridObservationSummaryProps {
  height?: number;
  proposal: Proposal | null;
  rowClick?: Function;
  // Only one observation is possible, so its ID, paging and sorting add nothing
  isScienceVerification?: boolean;
}

const CONTINUUM_TYPES: string[] = [
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST
];
const NO_VALUE = '-';
const DP_IMAGES = 1;
const DP_VISIBILITIES = 2;

export default function GridObservationSummary({
  height = 171,
  proposal,
  rowClick,
  isScienceVerification = false
}: GridObservationSummaryProps) {
  const loggedIn = isLoggedIn();
  const { t } = useScopedTranslation();

  const headerDisplay = (inValue: string, inValue2?: string) => (
    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
      {t(inValue)}
      {inValue2 ? '/' + t(inValue2) : ''}
    </Typography>
  );

  const display = (
    inValue:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | null
      | undefined
  ) => (
    <Box
      sx={{
        pt: 1
      }}
    >
      {inValue}
    </Box>
  );

  const element = (inValue: number | string) =>
    inValue === NOT_SPECIFIED ? emptyCell() : display(inValue);

  const elementArray = (inArr: Array<string>) => {
    return (
      <>
        {!inArr || (inArr?.length === 0 && emptyCell())}
        {inArr && inArr?.length > 0 && (
          <Grid
            container
            sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'left' }}
          >
            {inArr.map((el) => {
              return (
                <Grid key={el} size={{ xs: 12 }}>
                  {element(el)}
                </Grid>
              );
            })}
          </Grid>
        )}
      </>
    );
  };

  const integrationTimeHours = (rec: {
    supplied?: { type?: number; value?: number; units?: number };
  }) =>
    rec.supplied?.type !== SUPPLIED_TYPE_INTEGRATION || rec.supplied?.value == null
      ? null
      : timeConversion(rec.supplied.value, rec.supplied.units ?? TIME_HOURS, TIME_HOURS);

  const integrationTime = (rec: {
    supplied?: { type?: number; value?: number; units?: number };
  }) => {
    const hours = integrationTimeHours(rec);
    return hours == null ? NO_VALUE : `${hours} h`;
  };

  const valueWithUnits = (value?: string | number | null, units?: string) =>
    value == null ? NO_VALUE : `${presentValue(value)} ${units ? presentUnits(units) : ''}`.trim();

  const centralFrequency = (rec: { centralFrequency?: number; centralFrequencyUnits?: number }) => {
    if (rec.centralFrequency == null) return NO_VALUE;
    const units = getBandwidthOrFrequencyUnitsLabel(rec.centralFrequencyUnits as number);
    return `${rec.centralFrequency} ${units ? presentUnits(units) : ''}`.trim();
  };

  const bandwidthValue = (rec: Observation) => {
    if (CONTINUUM_TYPES.includes(rec.type)) {
      return {
        value: rec.continuumBandwidth,
        unit: FREQUENCY_UNITS[(rec.continuumBandwidthUnits ?? 0) - 1]?.label
      };
    }
    return getBandwidthZoom(rec);
  };

  const bandwidthHz = (rec: Observation) => {
    const { value, unit } = bandwidthValue(rec);
    const frequencyUnit = FREQUENCY_UNITS.find((entry) => entry.label === unit);
    return value != null && frequencyUnit
      ? frequencyConversion(value, frequencyUnit.value, FREQUENCY_HZ)
      : value;
  };

  const bandwidth = (rec: Observation) => {
    const { value, unit } = bandwidthValue(rec);
    return valueWithUnits(value, unit);
  };

  // The weighted sensitivities of the observation's links, as the Data Products page shows them
  const getSensitivities = (rec: Observation): string[] => {
    if (rec.type === TYPE_PST) return [];
    const parts: Array<'continuum' | 'spectral'> =
      rec.type === TYPE_CONTINUUM
        ? ['continuum']
        : [TYPE_CONTINUUM_SPECTRAL, TYPE_CONTINUUM_SPECTRAL_LONG].includes(rec.type)
          ? ['continuum', 'spectral']
          : ['spectral'];
    return (proposal?.targetObservation ?? []).flatMap((link) => {
      const results = link.observationId === rec.id ? link.sensitivity : undefined;
      if (results?.state !== SENSITIVITY_STATE.DONE) return [];
      const targetName = proposal?.targets?.find((target) => target.id === link.targetId)?.name;
      return parts.flatMap((part) => {
        const values = results[part];
        if (!values) return [];
        const label = t(`observationType.${part}`);
        return [
          `${targetName || link.targetId}: ${label}: ${valueWithUnits(values.weightedSensitivity.value, values.weightedSensitivity.unit)}`
        ];
      });
    });
  };

  const getObservationTargets = (rec: { type?: number; id?: any }) => {
    const array =
      proposal &&
      proposal.targetObservation &&
      proposal.targetObservation.filter((e) => e.observationId === rec.id);
    if (!array || array?.length === 0) {
      return [];
    } else {
      const output: string[] = [];
      array.forEach((el) => {
        const target = proposal.targets?.find((e) => e.id === el.targetId);
        output.push(target?.name ?? '');
      });
      return output;
    }
  };

  // Non-PST observations always have images and visibilities; PST shows its mode
  const getDataProducts = (rec: Observation): string[] =>
    rec.type === TYPE_PST
      ? [t('pstMode.options.' + (rec.pstMode ?? FLOW_THROUGH_VALUE))]
      : [
          t('observatoryDataProduct.options.' + DP_IMAGES),
          t('observatoryDataProduct.options.' + DP_VISIBILITIES)
        ];

  const colObservationId = {
    field: 'id',
    renderHeader: () => headerDisplay('observations.id'),
    disableClickEventBubbling: true,
    renderCell: (e: { row: { id: string | number } }) => element(e.row.id)
  };

  const colElevation = {
    field: 'elevation',
    renderHeader: () => headerDisplay('page.4.label'),
    flex: 0.75,
    disableClickEventBubbling: true,
    renderCell: (e: { row: { type: number } }) => elementArray(getObservationTargets(e.row))
  };

  const colObservingType = {
    field: 'type',
    renderHeader: () => headerDisplay('observationType.short'),
    flex: 1,
    disableClickEventBubbling: true,
    renderCell: (e: { row: { type: number } }) => <ObservingType type={String(e.row.type)} />
  };

  const colCentralFrequency = {
    field: 'centralFrequency',
    type: 'number',
    renderHeader: () => headerDisplay('centralFrequency.label'),
    flex: 1,
    disableClickEventBubbling: true,
    valueGetter: (_value: unknown, row: Observation) =>
      row.centralFrequency != null &&
      FREQUENCY_UNITS.some((unit) => unit.value === row.centralFrequencyUnits)
        ? frequencyConversion(row.centralFrequency, row.centralFrequencyUnits, FREQUENCY_HZ)
        : row.centralFrequency,
    renderCell: (e: { row: Observation }) => element(centralFrequency(e.row))
  };

  const colBandwidth = {
    field: 'bandwidth',
    type: 'number',
    renderHeader: () => headerDisplay('bandwidth.label'),
    flex: 1,
    disableClickEventBubbling: true,
    valueGetter: (_value: unknown, row: Observation) => bandwidthHz(row),
    renderCell: (e: { row: Observation }) => element(bandwidth(e.row))
  };

  const colIntegrationTime = {
    field: 'integrationTime',
    type: 'number',
    renderHeader: () => headerDisplay('sensitivityCalculatorResults.integrationTime'),
    flex: 1,
    disableClickEventBubbling: true,
    valueGetter: (_value: unknown, row: Observation) => integrationTimeHours(row),
    renderCell: (e: { row: Observation }) => element(integrationTime(e.row))
  };

  const colSensitivity = {
    field: 'sensitivity',
    renderHeader: () => headerDisplay('sensitivityCalculatorResults.sensitivity'),
    flex: 1.5,
    disableClickEventBubbling: true,
    renderCell: (e: { row: Observation }) => {
      const sensitivities = getSensitivities(e.row);
      return sensitivities.length ? elementArray(sensitivities) : element(NO_VALUE);
    }
  };

  const colDataProducts = {
    field: 'dataProducts',
    renderHeader: () => headerDisplay('page.7.plural'),
    flex: 1.5,
    disableClickEventBubbling: true,
    renderCell: (e: { row: Observation }) => elementArray(getDataProducts(e.row))
  };

  const basicColumns = [
    ...(isScienceVerification ? [] : [colObservationId]),
    colElevation,
    colObservingType,
    colCentralFrequency,
    colBandwidth,
    colIntegrationTime,
    colSensitivity,
    colDataProducts
  ];

  const getColumns = () =>
    basicColumns.map((col) =>
      isScienceVerification ? { ...col, sortable: false, disableColumnMenu: true } : col
    );

  return (
    <>
      {proposal && proposal.observations && proposal?.observations?.length > 0 && (
        <DataGrid
          rows={proposal.observations}
          columns={getColumns()}
          getRowHeight={() => 'auto'}
          height={height}
          hideFooter={isScienceVerification}
          onRowClick={rowClick}
          testId="investigatorsTableId"
        />
      )}
      {!proposal?.observations ||
        (proposal?.observations?.length === 0 && (
          <Alert
            color={AlertColorTypes.Error}
            text={loggedIn ? t('error.noObservations') : t('error.noObservationsLoggedOut')}
            testId="noObservationsNotification"
          />
        ))}
    </>
  );
}
