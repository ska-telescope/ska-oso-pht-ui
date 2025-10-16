import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { BANDWIDTH_TELESCOPE, NOT_SPECIFIED } from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Proposal from '../../../utils/types/proposal';
import emptyCell from '../../../components/fields/emptyCell/emptyCell';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const FIELD_OBS = 'observatoryDataProduct.options';

interface GridObservationSummaryProps {
  height?: number;
  proposal: Proposal | null;
  rowClick?: Function;
}

export default function GridObservationSummary({
  height = 171,
  proposal,
  rowClick
}: GridObservationSummaryProps) {
  const loggedIn = isLoggedIn();
  const { t } = useScopedTranslation();
  const { observatoryConstants } = useOSDAccessors();

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
  ) => <Box pt={1}>{inValue}</Box>;

  const element = (inValue: number | string) =>
    inValue === NOT_SPECIFIED ? emptyCell() : display(inValue);

  const elementArray = (inArr: Array<string>) => {
    return (
      <>
        {!inArr || (inArr?.length === 0 && emptyCell())}
        {inArr && inArr?.length > 0 && (
          <Grid container direction="column" justifyContent="space-between" alignItems="left">
            {inArr.map(el => {
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

  const sensitivityIntegrationTime = (rec: { type?: number; supplied?: any }) => {
    return (
      rec.supplied.value +
      ' ' +
      observatoryConstants?.Supplied[rec.supplied.type]?.units.find(
        e => (e.value = rec.supplied.units)
      )?.label
    );
  };

  const getObservationTargets = (rec: { type?: number; id?: any }) => {
    const array =
      proposal &&
      proposal.targetObservation &&
      proposal.targetObservation.filter(e => e.observationId === rec.id);
    if (!array || array?.length === 0) {
      return [];
    } else {
      const output: string[] = [];
      array.forEach(el => output.push(proposal.targets.find(e => e.id === el.targetId).name));
      return output;
    }
  };

  const getDataProducts = (rec: { type?: number; id?: any }): string[] => {
    const array = proposal.dataProductSDP?.filter(e => e.observationId.find(el => el === rec.id));
    if (!array || array?.length === 0) {
      return [];
    } else {
      const output = []; // TODO : This is dirty until final structure is fixed
      for (let i = 0; i < array?.length; i++) {
        for (let j = 0; j < array[i].observatoryDataProduct?.length; j++) {
          if (array[i].observatoryDataProduct[j]) {
            output.push(t(FIELD_OBS + '.' + (j + 1)));
          }
        }
      }
      return output;
    }
  };

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

  const colObservingBand = {
    field: 'telescope',
    renderHeader: () => headerDisplay('observingBand.label'),
    flex: 1,
    disableClickEventBubbling: true,
    renderCell: (e: { row: { observingBand: number } }) =>
      element(BANDWIDTH_TELESCOPE[e.row.observingBand]?.label)
  };

  const colObservingType = {
    field: 'type',
    renderHeader: () => headerDisplay('observationType.short'),
    disableClickEventBubbling: true,
    renderCell: (e: { row: { type: number } }) => element(t(`observationType.${e.row.type}`))
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
    renderCell: (e: { row: { type: number } }) => element(sensitivityIntegrationTime(e.row))
  };

  const colSensCalcBandwidth = {
    field: 'bandwidth',
    renderHeader: () => headerDisplay('page.8.plural'),
    flex: 1.5,
    disableClickEventBubbling: true,
    renderCell: (e: { row: { type: number } }) => elementArray(getDataProducts(e.row))
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
