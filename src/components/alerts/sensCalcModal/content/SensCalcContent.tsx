import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { presentUnits, presentValue } from '@utils/present/present';
import {
  CUSTOM_VALID_FIELDS,
  FREQUENCY_STR_KHZ,
  FREQUENCY_STR_MHZ,
  LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ,
  REFERENCE_COORDINATE_TYPE_SSO,
  SA_CUSTOM,
  STATUS_INITIAL,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_PST
} from '../../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { useEffect, useState } from 'react';
import Target from '@utils/types/target.tsx';
import Observation from '@utils/types/observation.tsx';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Proposal from '@utils/types/proposal.tsx';
import { getSpectralAveragingFactor } from '@services/axios/get/getSensitivityCalculator/getContinuumData/getContinuumData.tsx';
import { DataProductSDPNew } from '@utils/types/dataProduct.tsx';
import { convertFrequencyToDisplayUnits, getSpectralResolutionHz } from '@utils/helpers.ts';

interface SensCalcContentProps {
  targetObservation?: TargetObservation;
  isNatural?: boolean;
}

const GAP = 4;
const SPACER_HEIGHT = 30;

export default function SensCalcContent({
  targetObservation,
  isNatural = false
}: SensCalcContentProps) {
  const { t } = useScopedTranslation();

  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  const [target, setTarget] = useState<Target | undefined>(undefined);
  const [observation, setObservation] = useState<Observation | undefined>(undefined);
  const [dataProduct, setDataProduct] = useState<DataProductSDPNew | undefined>(undefined);

  useEffect(() => {
    setTarget(getProposal().targets?.find((target) => target.id == targetObservation?.targetId));
    setObservation(
      getProposal().observations?.find(
        (observation) => observation.id == targetObservation?.observationId
      )
    );
    setDataProduct(
      getProposal().dataProductSDP?.find(
        (dataProduct) => dataProduct.id == targetObservation?.dataProductsSDPId
      )
    );
  }, [targetObservation]);

  const PresentCustomResultValue = (eValue: any, eId: string) => {
    if (eId === 'targetName') {
      return eValue;
    }
    if (!CUSTOM_VALID_FIELDS.includes(eId)) {
      if (isNatural) {
        return t('sensitivityCalculatorResults.nonGaussian');
      }
      return t('sensitivityCalculatorResults.customArray');
    }
    return `${presentValue(eValue)}`;
  };

  const displayElement = (
    elementId: string,
    elementValue?: string | number,
    elementUnits?: string
  ) => {
    return (
      <Grid key={elementId} container direction="row" justifyContent="center" alignItems="center">
        <Grid size={{ xs: 6 }}>
          <Typography id={elementId} sx={{ align: 'right', fontWeight: 'normal' }} variant="body1">
            {t(`sensitivityCalculatorResults.${elementId}`)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography
            id={`${elementId}-label`}
            data-testid={`field-${elementId}`}
            sx={{ align: 'left', fontWeight: 'bold' }}
            variant="body1"
          >
            {observation?.subarray === SA_CUSTOM || isNatural
              ? PresentCustomResultValue(elementValue, elementId)
              : presentValue(elementValue)}{' '}
            {!elementUnits || observation?.subarray === SA_CUSTOM || isNatural
              ? ''
              : presentUnits(elementUnits)}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  if (observation?.type === TYPE_PST) {
    return (
      <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Warning}>
        <Typography p={GAP}>{t('page.7.pstUnavailable')}</Typography>
      </Alert>
    );
  }

  if (target?.kind === REFERENCE_COORDINATE_TYPE_SSO.value) {
    return (
      <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Warning}>
        <Typography p={GAP}>{t('sensitivityCalculatorResults.notApplicableForSSO')}</Typography>
      </Alert>
    );
  }

  if (targetObservation?.sensCalc?.error) {
    return (
      <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Error}>
        <Typography p={GAP}>{targetObservation?.sensCalc?.error}</Typography>
      </Alert>
    );
  }

  if (
    targetObservation?.sensCalc?.statusGUI === STATUS_INITIAL ||
    targetObservation?.sensCalc == undefined
  ) {
    return (
      <Alert>
        <Typography p={GAP}>{t('sensitivityCalculatorResults.noData')}</Typography>
      </Alert>
    );
  }

  const spectralResolution = observation
    ? convertFrequencyToDisplayUnits(
        [TYPE_CONTINUUM, TYPE_CONTINUUM_SPECTRAL, TYPE_CONTINUUM_SPECTRAL_LONG].includes(
          observation?.type
        )
          ? getSpectralAveragingFactor(observation, dataProduct) *
              LOW_CONTINUUM_SPECTRAL_RESOLUTION_KHZ
          : getSpectralResolutionHz(observation) * 1e-3,
        FREQUENCY_STR_KHZ
      )
    : undefined;

  return (
    <>
      {displayElement('targetName', target?.name)}
      {displayElement(
        'bandwidth',
        [TYPE_CONTINUUM, TYPE_CONTINUUM_SPECTRAL, TYPE_CONTINUUM_SPECTRAL_LONG].includes(
          observation?.type
        )
          ? observation?.continuumBandwidth
          : observation?.bandwidth,
        FREQUENCY_STR_MHZ
      )}
      {displayElement('spectralResolution', spectralResolution?.value, spectralResolution?.unit)}
      {displayElement('integrationTime', observation?.supplied.value, 'h')}

      {targetObservation?.sensCalc?.section1 && (
        <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />
      )}
      {targetObservation?.sensCalc?.section1?.map((rec) =>
        displayElement(rec.field, rec.value, rec.units)
      )}
      {targetObservation?.sensCalc?.section2 && (
        <Spacer size={SPACER_HEIGHT} axis={SPACER_VERTICAL} />
      )}
      {targetObservation?.sensCalc?.section2?.map((rec) =>
        displayElement(rec.field, rec.value, rec.units)
      )}
    </>
  );
}
