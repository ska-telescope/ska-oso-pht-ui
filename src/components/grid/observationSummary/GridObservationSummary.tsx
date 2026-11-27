import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { NOT_SPECIFIED } from '@utils/constants.ts';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { ProposalType } from '@/models/proposals/proposal';
import {
  OBSERVING_MODE_TRANSLATION_KEY,
  TELESCOPE_NUMBER,
  type ObservationInput
} from '@/models/proposals/observations';
import emptyCell from '../../../components/fields/emptyCell/emptyCell';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import ObservingBand from '@/components/display/observingBand/observingBand';
import ObservingType from '@/components/display/observingType/observingType';

interface GridObservationSummaryProps {
  height?: number;
  proposal: ProposalType | null;
  rowClick?: Function;
}

export default function GridObservationSummary({
  height = 171,
  proposal,
  rowClick
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

  // The integration time with its unit, or NOT_SPECIFIED while it's missing
  const integrationTime = ({ integrationTime }: ObservationInput) =>
    integrationTime.value === null
      ? NOT_SPECIFIED
      : `${integrationTime.value} ${integrationTime.unit ?? ''}`;

  const getObservationTargets = (rec: { id: string }) => {
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

  // Each data product of the observation, by the title of its kind
  const getDataProducts = (rec: { id: string }): string[] =>
    (proposal?.dataProducts ?? [])
      .filter((dp) => dp.observationId === rec.id)
      .map((dp) => t('page.7.group.' + dp.kind));

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
    renderCell: (e: { row: ObservationInput }) => elementArray(getObservationTargets(e.row))
  };

  const colObservingBand = {
    field: 'telescope',
    renderHeader: () => headerDisplay('observingBand.label'),
    flex: 1,
    disableClickEventBubbling: true,
    // An observation loaded with a band the form doesn't know has none, shown as an empty cell
    renderCell: (e: { row: ObservationInput }) =>
      e.row.observingBand ? (
        <ObservingBand telescope={TELESCOPE_NUMBER[e.row.telescope]} band={e.row.observingBand} />
      ) : (
        emptyCell()
      )
  };

  const colObservingType = {
    field: 'type',
    renderHeader: () => headerDisplay('observationType.short'),
    flex: 1,
    disableClickEventBubbling: true,
    renderCell: (e: { row: ObservationInput }) => (
      <ObservingType type={OBSERVING_MODE_TRANSLATION_KEY[e.row.observingMode]} />
    )
  };

  const colSensCalcStatus = {
    field: 'weather',
    renderHeader: () =>
      headerDisplay(
        'sensitivityCalculatorResults.sensitivity',
        'sensitivityCalculatorResults.integrationTime'
      ),
    flex: 1.5,
    disableClickEventBubbling: true,
    renderCell: (e: { row: ObservationInput }) => element(integrationTime(e.row))
  };

  const colSensCalcBandwidth = {
    field: 'bandwidth',
    renderHeader: () => headerDisplay('page.7.plural'),
    flex: 1.5,
    disableClickEventBubbling: true,
    renderCell: (e: { row: ObservationInput }) => elementArray(getDataProducts(e.row))
  };

  const basicColumns = [
    colObservationId,
    colElevation,
    colObservingBand,
    colObservingType,
    colSensCalcStatus,
    colSensCalcBandwidth
  ];

  const getColumns = () => [...basicColumns];

  return (
    <>
      {proposal && proposal.observations && proposal?.observations?.length > 0 && (
        <DataGrid
          rows={proposal.observations}
          columns={getColumns()}
          getRowHeight={() => 'auto'}
          height={height}
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
