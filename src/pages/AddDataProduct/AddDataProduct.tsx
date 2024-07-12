import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  Button,
  ButtonColorTypes,
  ButtonVariantTypes,
  DropDown,
  LABEL_POSITION,
  NumberEntry,
  TickBox
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { IMAGE_SIZE_UNITS, NAV } from '../../utils/constants';
import HelpPanel from '../../components/info/helpPanel/helpPanel';
import Proposal from '../../utils/types/proposal';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import ImageWeightingField from '../../components/fields/imageWeighting/imageWeighting';
import Observation from '../../utils/types/observation';
import { SensCalcResult } from 'services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import DataProduct from '../../utils/types/dataProduct';

// TODO : Add documentation page specifically for Adding a Data product
// TODO : Replace individual tick-boxes with a mapping

const BACK_PAGE = 7;
const PAGE = 13;

export default function AddDataProduct() {
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [baseObservations, setBaseObservations] = React.useState([]);
  const [observationId, setObservationId] = React.useState('');
  const [dp1, setDP1] = React.useState(false);
  const [dp2, setDP2] = React.useState(false);
  const [dp3, setDP3] = React.useState(false);
  const [dp4, setDP4] = React.useState(false);
  const [dp5, setDP5] = React.useState(false);
  const [imageSizeValue, setImageSizeValue] = React.useState(0);
  const [imageSizeUnits, setImageSizeUnits] = React.useState(IMAGE_SIZE_UNITS.DEGREES);
  const [pixelSizeValue, setPixelSizeValue] = React.useState(0);
  const [pixelSizeUnits, setPixelSizeUnits] = React.useState('');
  const [weighting, setWeighting] = React.useState(0);

  const { t } = useTranslation('pht');
  const FIELD_OBS = 'observatoryDataProduct.options';
  const LABEL_WIDTH = 5;

  React.useEffect(() => {
    helpComponent(t('observations.dp.help'));
    const results: Observation[] = getProposal()?.observations?.filter(
      ob =>
        typeof getProposal()?.targetObservation.find(e => e.observationId === ob.id) !== 'undefined'
    );
    setBaseObservations([...results?.map(e => ({ label: e.id, value: e.id }))]);
  }, []);

  React.useEffect(() => {
    const getImageWeighting = (id: string) => {
      const temp = getProposal()?.observations.find(e => e.id === id);
      return temp ? temp.imageWeighting : 0;
    };

    const getPixelSize = (sensCalc: SensCalcResult): number => {
      const DIVIDER = 3;
      const precisionStr = t('pixelSize.precision');
      const precision = Number(precisionStr);
      const arr = sensCalc?.section1?.length > 2 ? sensCalc.section1[3].value.split(' x ') : [];
      const result = arr.length > 1 ? (Number(arr[1]) / DIVIDER).toFixed(precision) : 0;
      if (pixelSizeUnits === '' && sensCalc?.section1?.length > 2) {
        setPixelSizeUnits(sensCalc.section1[3].units);
      }
      return Number(result);
    };

    const calcPixelSize = (count: number, total: number): number => {
      if (count === 0 || total === 0) {
        return 0;
      }
      const precision = Number(t('pixelSize.precision'));
      const result = Number((total / count).toFixed(precision));
      return result;
    };

    if (observationId) {
      setWeighting(getImageWeighting(observationId));
    }

    if (observationId && baseObservations) {
      let pixelTotal = 0;
      let pixelCount = 0;
      getProposal().targetObservation?.forEach(rec => {
        if (rec.observationId === observationId) {
          pixelCount++;
          pixelTotal += rec?.sensCalc ? getPixelSize(rec.sensCalc) : 0;
        }
      });
      setPixelSizeValue(calcPixelSize(pixelCount, pixelTotal));
    }
  }, [baseObservations, observationId]);

  const observationsField = () => {
    return (
      <>
        {baseObservations && (
          <DropDown
            options={baseObservations}
            testId="observations"
            value={observationId}
            setValue={setObservationId}
            label={t('observations.single')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH}
            onFocus={() => helpComponent(t('observations.dp.help'))}
            required
          />
        )}
      </>
    );
  };

  const tickElement = (key: number, value: boolean, setter: Function) => (
    <FieldWrapper
      label={key === 1 ? t('observatoryDataProduct.label') : ''}
      labelWidth={LABEL_WIDTH}
    >
      <TickBox
        key={key}
        label={t(FIELD_OBS + '.' + key)}
        labelBold
        labelPosition={LABEL_POSITION.END}
        labelWidth={11}
        testId={'observatoryDataProduct' + key}
        checked={value}
        onFocus={() => helpComponent(t('observatoryDataProduct.help'))}
        onChange={() => setter(!value)}
      />
    </FieldWrapper>
  );

  const dataProductsField = () => {
    return (
      <>
        {tickElement(1, dp1, setDP1)}
        {tickElement(2, dp2, setDP2)}
        {tickElement(3, dp3, setDP3)}
        {tickElement(4, dp4, setDP4)}
        {tickElement(5, dp5, setDP5)}
      </>
    );
  };

  const imageSizeUnitsField = () => {
    const options = [
      { label: IMAGE_SIZE_UNITS.ARCSECS, value: IMAGE_SIZE_UNITS.ARCSECS },
      { label: IMAGE_SIZE_UNITS.ARCMINS, value: IMAGE_SIZE_UNITS.ARCMINS },
      { label: IMAGE_SIZE_UNITS.DEGREES, value: IMAGE_SIZE_UNITS.DEGREES }
    ];

    return (
      <DropDown
        options={options}
        testId="frequencyUnits"
        value={imageSizeUnits}
        setValue={setImageSizeUnits}
        label=""
        onFocus={() => helpComponent(t('frequencyUnits.help'))}
      />
    );
  };

  const imageSizeField = () => {
    const errorText = () => (imageSizeValue ? '' : t('imageSize.error'));
    return (
      <NumberEntry
        label={t('imageSize.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        labelWidth={LABEL_WIDTH}
        testId="imageSize"
        value={imageSizeValue}
        setValue={setImageSizeValue}
        onFocus={() => helpComponent(t('imageSize.help'))}
        required
        suffix={imageSizeUnitsField()}
        errorText={errorText()}
      />
    );
  };

  const pixelSizeField = () => {
    return (
      <NumberEntry
        label={t('pixelSize.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        labelWidth={LABEL_WIDTH}
        testId="pixelSize"
        value={pixelSizeValue}
        setValue={setPixelSizeValue}
        required
        disabled
        suffix={pixelSizeUnits}
      />
    );
  };

  const pageFooter = () => {
    const getIcon = () => <AddIcon />;

    const enabled = () => {
      const dp = dp1 || dp2 || dp3 || dp4 || dp5;
      return dp && pixelSizeValue > 0 && imageSizeValue > 0;
    };

    const addToProposal = () => {
      const highestId = getProposal().dataProducts.reduce(
        (acc, dataProducts) => (dataProducts.id > acc ? dataProducts.id : acc),
        0
      );
      const observatoryDataProduct = [dp1, dp2, dp3, dp4, dp5];
      const newDataProduct: DataProduct = {
        id: highestId + 1,
        observatoryDataProduct,
        observationId,
        imageSizeValue,
        imageSizeUnits,
        pixelSizeValue,
        pixelSizeUnits,
        weighting
      };

      setProposal({
        ...getProposal(),
        dataProducts: [...getProposal().dataProducts, newDataProduct]
      });
    };

    const buttonClicked = () => {
      addToProposal();
      navigate(NAV[7]);
    };

    return (
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      >
        <Grid
          p={1}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid item />
          <Grid item />
          <Grid item>
            <Button
              ariaDescription="add Button"
              color={ButtonColorTypes.Secondary}
              disabled={!enabled()}
              icon={getIcon()}
              label={t('button.add')}
              testId="addButton"
              onClick={buttonClicked}
              variant={ButtonVariantTypes.Contained}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Grid p={1} container direction="column" alignItems="space-evenly" justifyContent="center">
      <Grid item>
        <PageBanner backPage={BACK_PAGE} pageNo={PAGE} />
      </Grid>

      <Grid
        p={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="center"
        spacing={1}
      >
        <Grid item xs={9} md={5}>
          <Grid
            container
            direction="column"
            alignItems="space-evenly"
            justifyContent="center"
            p={2}
            spacing={2}
          >
            <Grid item>{observationsField()}</Grid>
            <Grid item>{dataProductsField()}</Grid>
            <Grid item>{imageSizeField()}</Grid>
            <Grid item>{pixelSizeField()}</Grid>
            <Grid item>
              <ImageWeightingField
                disabled
                labelWidth={LABEL_WIDTH}
                onFocus={() => helpComponent(t('imageWeighting.help'))}
                value={weighting}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3} ml={5}>
          <HelpPanel />
        </Grid>
      </Grid>
      {pageFooter()}
    </Grid>
  );
}
