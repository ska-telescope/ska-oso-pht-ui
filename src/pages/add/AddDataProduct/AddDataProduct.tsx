import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Grid2, Paper, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DropDown,
  InfoCard,
  InfoCardColorTypes,
  LABEL_POSITION,
  NumberEntry,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import PageBannerPPT from '../../../components/layout/pageBannerPPT/PageBannerPPT';
import { HELP_FONT, NAV, STATUS_OK, WRAPPER_HEIGHT } from '../../../utils/constants';
import HelpPanel from '../../../components/info/helpPanel/HelpPanel';
import Proposal from '../../../utils/types/proposal';
import ImageWeightingField from '../../../components/fields/imageWeighting/imageWeighting';
import { SensCalcResults } from '../../../utils/types/sensCalcResults';
import { DataProductSDP } from '../../../utils/types/dataProduct';
import Observation from '../../../utils/types/observation';
import AddButton from '../../../components/button/Add/Add';
import { LAB_POSITION } from '../../../utils/constants';

const BACK_PAGE = 7;
const PAGE = 13;
const PAGE_PREFIX = 'SDP';
const FOOTER_HEIGHT = 40;
const FIELD_OBS = 'observatoryDataProduct.options';
const LABEL_WIDTH = 4;
const LABEL_WIDTH_TICK = 11;

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
  const [imageSizeValue, setImageSizeValue] = React.useState('0');
  const [imageSizeUnits, setImageSizeUnits] = React.useState(0);
  const [pixelSizeValue, setPixelSizeValue] = React.useState(0);
  const [pixelSizeUnits, setPixelSizeUnits] = React.useState('');
  const [weighting, setWeighting] = React.useState(0);

  const { t } = useTranslation('pht');

  React.useEffect(() => {
    helpComponent(t('observations.dp.help'));
    const results: Observation[] = getProposal()?.observations?.filter(
      ob =>
        typeof getProposal()?.targetObservation?.find(
          e => e.observationId === ob.id && e.sensCalc.statusGUI === STATUS_OK
        ) !== 'undefined'
    );
    setBaseObservations([...results?.map(e => ({ label: e.id, value: e.id }))]);
  }, []);

  React.useEffect(() => {
    const getImageWeighting = (id: string) => {
      const temp = getProposal()?.observations?.find(e => e.id === id);
      return temp ? temp.imageWeighting : 0;
    };

    const getPixelSize = (sensCalc: SensCalcResults): number => {
      const DIVIDER = 3;
      const precisionStr = t('pixelSize.precision');
      const precision = Number(precisionStr);
      const arr = sensCalc?.section1?.length > 2 ? sensCalc.section1[3].value.split(' x ') : [];
      const result = arr.length > 1 ? (Number(arr[1]) / DIVIDER).toFixed(precision) : 0;
      if (pixelSizeUnits === '' && sensCalc?.section1?.length > 2) {
        setPixelSizeUnits(t('imageSize.2'));
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
      <Box pt={1}>
        {baseObservations && (
          <DropDown
            options={baseObservations}
            testId="observations"
            value={observationId}
            setValue={setObservationId}
            label={t('observations.single')}
            labelBold
            labelPosition={LAB_POSITION}
            labelWidth={LABEL_WIDTH}
            onFocus={() => helpComponent(t('observations.dp.help'))}
            required
          />
        )}
      </Box>
    );
  };

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const tickElement = (key: number, value: boolean, setter: Function) => (
    <TickBox
      key={key}
      label={t(FIELD_OBS + '.' + key)}
      labelPosition={LABEL_POSITION.END}
      labelWidth={LABEL_WIDTH_TICK}
      testId={'observatoryDataProduct' + key}
      checked={value}
      onFocus={() => helpComponent(t('observatoryDataProduct.help'))}
      onChange={() => setter(!value)}
    />
  );

  const dataProductsField = () => {
    return (
      <Card>
        <Typography p={1} variant="h6">
          {t('observatoryDataProduct.label') + ' *'}
        </Typography>
        <CardContent>
          {tickElement(1, dp1, setDP1)}
          {tickElement(2, dp2, setDP2)}
          {tickElement(3, dp3, setDP3)}
          {tickElement(4, dp4, setDP4)}
        </CardContent>
      </Card>
    );
  };

  const dataProductsFieldOld = () => {
    return (
      <Grid2
        container
        minWidth={800}
        direction="row"
        alignItems="space-between"
        justifyContent="space-between"
      >
        <Grid2 size={{ xs: LABEL_WIDTH }}>
          <Typography>{t('observatoryDataProduct.label') + ' *'}</Typography>
        </Grid2>
        <Grid2 size={{ xs: 12 - LABEL_WIDTH }}>
          {tickElement(1, dp1, setDP1)}
          {tickElement(2, dp2, setDP2)}
          {tickElement(3, dp3, setDP3)}
          {tickElement(4, dp4, setDP4)}
        </Grid2>
      </Grid2>
    );
  };

  const imageSizeUnitsField = () => {
    const getOptions = () => {
      return [0, 1, 2].map(e => ({
        label: t('imageSize.' + e),
        value: e
      }));
    };

    return (
      <DropDown
        options={getOptions()}
        testId="frequencyUnits"
        value={imageSizeUnits}
        setValue={setImageSizeUnits}
        label=""
        onFocus={() => helpComponent(t('frequencyUnits.help'))}
      />
    );
  };

  const imageSizeField = () => {
    const errorText = () => (Number(imageSizeValue) ? '' : t('imageSize.error'));
    const setTheNumber = (inNum: number) => {
      const str = Math.abs(inNum).toString();
      const num = Number(str);
      setImageSizeValue(num.toString());
    };
    return (
      <Box pt={1}>
        <NumberEntry
          label={t('imageSize.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="imageSize"
          value={imageSizeValue}
          setValue={(e: number) => setTheNumber(e)}
          onFocus={() => helpComponent(t('imageSize.help'))}
          required
          suffix={imageSizeUnitsField()}
          errorText={errorText()}
        />
      </Box>
    );
  };

  const pixelSizeField = () => {
    return (
      <Box pt={1}>
        <NumberEntry
          label={t('pixelSize.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="pixelSize"
          value={pixelSizeValue}
          setValue={setPixelSizeValue}
          required
          disabled
          suffix={pixelSizeUnits}
        />
      </Box>
    );
  };

  const imageWeightingField = () => {
    return (
      <ImageWeightingField
        disabled
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('imageWeighting.help'))}
        value={weighting}
      />
    );
  };

  const pageFooter = () => {
    const enabled = () => {
      const dp = dp1 || dp2 || dp3 || dp4;
      return dp && pixelSizeValue > 0 && Number(imageSizeValue) > 0;
    };

    const addToProposal = () => {
      const hasRecord = getProposal().dataProductSDP;
      let highestId = 1;
      if (hasRecord) {
        highestId = getProposal().dataProductSDP?.reduce(
          (acc, dataProducts) => (dataProducts.id > acc ? dataProducts.id : acc),
          0
        );
      }
      const observatoryDataProduct = [dp1, dp2, dp3, dp4];
      const newDataProduct: DataProductSDP = {
        id: highestId + 1,
        dataProductsSDPId: `${PAGE_PREFIX}-${highestId + 1}`,
        observatoryDataProduct,
        observationId: [observationId],
        imageSizeValue: Number(imageSizeValue),
        imageSizeUnits,
        pixelSizeValue,
        pixelSizeUnits,
        weighting
      };
      if (hasRecord) {
        setProposal({
          ...getProposal(),
          dataProductSDP: [...getProposal().dataProductSDP, newDataProduct]
        });
      } else {
        setProposal({
          ...getProposal(),
          dataProductSDP: [newDataProduct]
        });
      }
    };

    const buttonClicked = () => {
      addToProposal();
      navigate(NAV[7]);
    };

    return (
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: FOOTER_HEIGHT, left: 0, right: 0 }}
        elevation={0}
      >
        <Grid2
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid2 />
          <Grid2 />
          <Grid2>
            <AddButton disabled={!enabled()} primary testId="addButton" action={buttonClicked} />
          </Grid2>
        </Grid2>
      </Paper>
    );
  };

  return (
    <>
      <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />

      <Grid2
        p={2}
        container
        direction="row"
        alignItems="space-around"
        justifyContent="space-around"
        spacing={1}
      >
        <Grid2 size={{ md: 11, lg: 4 }}>
          <Stack>
            {fieldWrapper(observationsField())}
            {dataProductsFieldOld()}
            {fieldWrapper(imageSizeField())}
            {fieldWrapper(pixelSizeField())}
            {fieldWrapper(imageWeightingField())}
          </Stack>
        </Grid2>
        {false && <Grid2 size={{ md: 11, lg: 3 }}>{dataProductsField()}</Grid2>}
        <Grid2 size={{ md: 11, lg: 3 }}>
          <Stack spacing={1}>
            <HelpPanel />
            <InfoCard
              color={InfoCardColorTypes.Warning}
              fontSize={HELP_FONT}
              message="The associated input options of these observatory data products are under development and subject to change."
              testId="developmentPanelId"
            />
          </Stack>
        </Grid2>
      </Grid2>
      {pageFooter()}
    </>
  );
}
