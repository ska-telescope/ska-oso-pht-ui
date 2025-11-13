import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  BorderedSection,
  DropDown,
  Spacer,
  SPACER_VERTICAL,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import RobustField from '@components/fields/robust/Robust.tsx';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import { useTheme } from '@mui/material/styles';
import PolarisationsField from '@/components/fields/polarisations/polarisations';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import {
  BANNER_PMT_SPACER,
  FOOTER_HEIGHT_PHT,
  IW_BRIGGS,
  LAB_POS_TICK,
  NAV,
  PAGE_DATA_PRODUCTS,
  PAGE_DATA_PRODUCTS_ADD,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM,
  WRAPPER_HEIGHT
} from '@/utils/constants';
import Proposal from '@/utils/types/proposal';
import ImageWeightingField from '@/components/fields/imageWeighting/imageWeighting';
import { SensCalcResults } from '@/utils/types/sensCalcResults';
import { DataProductSDP } from '@/utils/types/dataProduct';
import AddButton from '@/components/button/Add/Add';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { presentUnits } from '@/utils/present/present';
import Observation from '@/utils/types/observation';
import GridObservation from '@/components/grid/observation/GridObservation';
import ImageSizeField from '@/components/fields/imageSize/imageSize';
import ChannelsOutField from '@/components/fields/channelsOut/channelsOut';
import DataProductTypeField from '@/components/fields/dataProductType/dataProductType';
import TapperField from '@/components/fields/tapper/taper';
import TimeAveragingField from '@/components/fields/timeAveraging/timeAveraging';
import FrequencyAveragingField from '@/components/fields/frequencyAveraging/frequencyAveraging';
import BitDepthField from '@/components/fields/bitDepth/bitDepth';

const GAP = 5;
const BACK_PAGE = PAGE_DATA_PRODUCTS;
const PAGE = PAGE_DATA_PRODUCTS_ADD;
const PAGE_PREFIX = 'SDP';
const LABEL_WIDTH = 5;
const TICK_LABEL_WIDTH = 10;
const COL = 6;

export default function AddDataProduct() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [baseObservations, setBaseObservations] = React.useState<Observation[]>([]);
  const [observationId, setObservationId] = React.useState('');
  const [dataProductType, setDataProductType] = React.useState(1);
  const [bitDepth, setBitDepth] = React.useState(0);
  const [imageSizeValue, setImageSizeValue] = React.useState('0');
  const [imageSizeUnits, setImageSizeUnits] = React.useState(0);
  const [pixelSizeValue, setPixelSizeValue] = React.useState(0);
  const [pixelSizeUnits, setPixelSizeUnits] = React.useState(0);
  const [timeAveraging, setTimeAveraging] = React.useState(0);
  const [timeAveragingUnits, setTimeAveragingUnits] = React.useState(0);
  const [frequencyAveraging, setFrequencyAveraging] = React.useState(0);
  const [frequencyAveragingUnits, setFrequencyAveragingUnits] = React.useState(0);
  const [weighting, setWeighting] = React.useState(0);
  const [robust, setRobust] = React.useState(3);
  const [channelsOut, setChannelsOut] = React.useState(1);
  const [continuumSubtraction, setContinuumSubtraction] = React.useState(false);
  const [polarisations, setPolarisations] = React.useState(['I']);

  const { t } = useScopedTranslation();

  const maxObservationsReached = () => baseObservations.length > 0;

  const isDataTypeOne = () => dataProductType === 1;
  const isContinuum = () => getObservation()?.type === TYPE_CONTINUUM;
  const isSpectral = () => getObservation()?.type === TYPE_ZOOM;
  const isPST = () => getObservation()?.type === TYPE_PST;

  const getObservation = () => baseObservations?.find(obs => obs.id === observationId);
  // const getObservationPST = () => ({ type: 3 }); // TODO : Remove once there are real observations

  const getSuffix = () => {
    if (isContinuum() || isPST()) {
      return dataProductType.toString();
    }
    return '1';
  };

  React.useEffect(() => {
    helpComponent(t('observations.dp.help'));

    const observations = getProposal()?.observations;
    setBaseObservations(observations ?? []);
    setPixelSizeUnits(2);
  }, []);

  React.useEffect(() => {
    const getPixelSize = (sensCalc: SensCalcResults): number => {
      const DIVIDER = 3;
      const precisionStr = t('pixelSize.precision');
      const precision = Number(precisionStr);
      const arr =
        sensCalc?.section1 && sensCalc.section1.length > 2
          ? sensCalc.section1[3].value.split(' x ')
          : [];
      const result = arr.length > 1 ? (Number(arr[1]) / DIVIDER).toFixed(precision) : 0;
      if (pixelSizeUnits === 0 && sensCalc?.section1 && sensCalc.section1.length > 2) {
        setPixelSizeUnits(2);
      }
      return Number(result);
    };

    const calcPixelSize = (count: number, total: number): number => {
      if (count === 0 || total === 0) {
        return 0;
      }
      const precision = Number(t('pixelSize.precision'));
      return Number((total / count).toFixed(precision));
    };

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

  const fieldWrapper = (children?: React.JSX.Element, height = WRAPPER_HEIGHT) => (
    <Box p={0} pt={1} sx={{ height: height }}>
      {children}
    </Box>
  );

  const taperField = () =>
    fieldWrapper(
      <TapperField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('tapper.help'))}
        required
        setValue={setImageSizeValue}
        value={Number(imageSizeValue)}
        suffix={t('taper.units')}
      />
    );

  const imageSizeUnitsField = () => {
    const getOptions = () => {
      return [0, 1, 2].map(e => ({
        label: presentUnits(t('imageSize.' + e)),
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

  const imageSizeField = () =>
    fieldWrapper(
      <ImageSizeField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('imageSize.help'))}
        required
        setValue={setImageSizeValue}
        value={Number(imageSizeValue)}
        suffix={imageSizeUnitsField()}
      />
    );

  const timeAveragingUnitsField = () => {
    const getOptions = () => {
      return [0].map(e => ({
        label: presentUnits(t('timeAveraging.' + e)),
        value: e
      }));
    };

    return (
      <DropDown
        disabled
        options={getOptions()}
        testId="timeAveragingUnits"
        value={timeAveragingUnits}
        setValue={setTimeAveragingUnits}
        label=""
        onFocus={() => helpComponent(t('timeAveragingUnits.help'))}
      />
    );
  };

  const frequencyAveragingUnitsField = () => {
    const getOptions = () => {
      return [0].map(e => ({
        label: presentUnits(t('frequencyAveraging.' + e)),
        value: e
      }));
    };

    return (
      <DropDown
        disabled
        options={getOptions()}
        testId="frequencyAveragingUnits"
        value={frequencyAveragingUnits}
        setValue={setFrequencyAveragingUnits}
        label=""
        onFocus={() => helpComponent(t('frequencyAveragingUnits.help'))}
      />
    );
  };

  const timeAveragingField = () =>
    fieldWrapper(
      <TimeAveragingField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('timeAveraging.help'))}
        required
        setValue={setTimeAveraging}
        value={Number(timeAveraging)}
        suffix={timeAveragingUnitsField()}
      />
    );

  const frequencyAveragingField = () =>
    fieldWrapper(
      <FrequencyAveragingField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('frequencyAveraging.help'))}
        required
        setValue={setFrequencyAveraging}
        value={Number(frequencyAveraging)}
        suffix={frequencyAveragingUnitsField()}
      />
    );

  const pixelSizeUnitsField = () => {
    return pixelSizeUnits === 0 ? '' : presentUnits(t('pixelSize.' + pixelSizeUnits));
  };

  const pixelSizeField = () =>
    fieldWrapper(
      <PixelSizeField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('pixelSize.help'))}
        setValue={setPixelSizeValue}
        required
        value={pixelSizeValue}
        suffix={pixelSizeUnitsField()}
      />
    );

  const imageWeightingField = () =>
    fieldWrapper(
      <ImageWeightingField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('imageWeighting.help'))}
        required
        setValue={setWeighting}
        value={weighting}
      />
    );

  const bitDepthField = () =>
    fieldWrapper(
      <BitDepthField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('bitDepth.help'))}
        required
        setValue={setBitDepth}
        value={bitDepth}
      />
    );

  const dataProductTypeField = () =>
    fieldWrapper(
      <DataProductTypeField
        observationType={getObservation()?.type || TYPE_CONTINUUM}
        onFocus={() => helpComponent(t('dataProductType.help'))}
        setValue={setDataProductType}
        value={dataProductType}
      />
    );

  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        onFocus={() => helpComponent(t('robust.help'))}
        setValue={setRobust}
        value={robust}
      />
    );

  const channelsOutField = () =>
    fieldWrapper(
      <ChannelsOutField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('channelsOut.help'))}
        required
        setValue={setChannelsOut}
        value={channelsOut}
      />
    );

  const continuumSubtractionField = () =>
    fieldWrapper(
      <Box pt={2}>
        <TickBox
          label={t('continuumSubtraction.label')}
          labelBold
          labelPosition={LAB_POS_TICK}
          labelWidth={TICK_LABEL_WIDTH}
          testId="continuumSubtraction"
          checked={continuumSubtraction}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setContinuumSubtraction(event.target.checked)
          }
          onFocus={() => helpComponent(t('continuumSubtraction.help'))}
        />
      </Box>
    );

  const polarisationsField = () => {
    return (
      <PolarisationsField
        onFocus={() => helpComponent(t('polarisations.help'))}
        isPST={isPST()}
        value={polarisations}
        setValue={setPolarisations}
        labelWidth={0}
      />
    );
  };

  const pageFooter = () => {
    const enabled = () => {
      return pixelSizeValue > 0 && Number(imageSizeValue) > 0;
    };

    const addToProposal = () => {
      const hasRecord = getProposal().dataProductSDP;
      let highestId = 1;
      if (hasRecord) {
        highestId =
          getProposal().dataProductSDP?.reduce(
            (acc, dataProducts) => (dataProducts.id > acc ? dataProducts.id : acc),
            0
          ) ?? 0;
      }
      const newDataProduct: DataProductSDP = {
        id: highestId + 1,
        dataProductsSDPId: `${PAGE_PREFIX}-${highestId + 1}`,
        observatoryDataProduct: [true], // TODO dataProductType,
        observationId: [observationId],
        imageSizeValue: Number(imageSizeValue),
        imageSizeUnits,
        pixelSizeValue,
        pixelSizeUnits,
        weighting: weighting.toString(),
        robust,
        polarisations,
        channelsOut,
        fitSpectralPol: 3
      };
      if (hasRecord) {
        setProposal({
          ...getProposal(),
          dataProductSDP: [...(getProposal()?.dataProductSDP ?? []), newDataProduct]
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
      navigate(NAV[BACK_PAGE]);
    };

    return (
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom: FOOTER_HEIGHT_PHT,
          left: 0,
          right: 0
        }}
        elevation={0}
      >
        <Grid
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid />
          <Grid />
          <Grid>
            <AddButton disabled={!enabled()} primary testId="addButton" action={buttonClicked} />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box pt={2} sx={{ height: '91vh', display: 'flex', flexDirection: 'column' }}>
      <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />
      <Spacer size={BANNER_PMT_SPACER} axis={SPACER_VERTICAL} />
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          minHeight: 0
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="stretch"
          spacing={GAP}
          m={GAP}
          mt={1}
          sx={{ flexGrow: 1 }}
        >
          <Grid size={{ md: 4, lg: 2 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: '#ccc',
                borderRadius: '8px',
                minHeight: 0
              }}
            >
              {baseObservations && (
                <GridObservation
                  data={baseObservations}
                  rowClick={(e: any) => setObservationId(e.row.id)}
                  disabled={maxObservationsReached()}
                />
              )}
            </Box>
          </Grid>
          <Grid size={{ md: 7, lg: 7 }}>
            <Stack spacing={GAP}>
              {!isSpectral() && dataProductTypeField()}

              {isContinuum() && (
                <BorderedSection
                  title={t('page.7.group.' + TYPE_CONTINUUM + '.' + dataProductType)}
                >
                  {isDataTypeOne() && (
                    <Grid pb={1} container>
                      <Grid size={{ md: COL }}>{fieldWrapper(imageSizeField())}</Grid>
                      <Grid size={{ md: COL }}>{fieldWrapper(pixelSizeField())}</Grid>
                      <Grid size={{ md: COL }}>{fieldWrapper(imageWeightingField())}</Grid>
                      <Grid size={{ md: COL }}>
                        {weighting === IW_BRIGGS && fieldWrapper(robustField())}
                      </Grid>
                      <Grid size={{ md: COL }}>{fieldWrapper(taperField())}</Grid>
                      <Grid size={{ md: COL }}>{fieldWrapper(channelsOutField())}</Grid>
                    </Grid>
                  )}
                  {!isDataTypeOne() && (
                    <Grid pb={1} container>
                      <Grid size={{ md: 8 }}>{fieldWrapper(timeAveragingField())}</Grid>
                      <Grid size={{ md: 8 }}>{fieldWrapper(frequencyAveragingField())}</Grid>
                    </Grid>
                  )}
                </BorderedSection>
              )}

              {isSpectral() && (
                <BorderedSection title={t('page.7.group.' + TYPE_ZOOM)}>
                  <Grid pb={1} container>
                    <Grid size={{ md: COL }}>{fieldWrapper(imageSizeField())}</Grid>
                    <Grid size={{ md: COL }}>{fieldWrapper(pixelSizeField())}</Grid>
                    <Grid size={{ md: COL }}>{fieldWrapper(imageWeightingField())}</Grid>
                    <Grid size={{ md: COL }}>
                      {weighting === IW_BRIGGS && fieldWrapper(robustField())}
                    </Grid>
                    <Grid size={{ md: COL }}>{fieldWrapper(taperField())}</Grid>
                    <Grid size={{ md: COL }}>{fieldWrapper(channelsOutField())}</Grid>
                    <Grid size={{ md: COL }}>{fieldWrapper(continuumSubtractionField())}</Grid>
                  </Grid>
                </BorderedSection>
              )}

              {isPST() && (
                <BorderedSection title={t('page.7.group.' + TYPE_PST + '.' + dataProductType)}>
                  {isDataTypeOne() && (
                    <Grid pb={1} container>
                      <Grid size={{ md: COL }}>{fieldWrapper(bitDepthField())}</Grid>
                    </Grid>
                  )}
                  {!isDataTypeOne() && (
                    <Grid pb={1} container>
                      <Grid size={{ md: COL }}>TO BE PROVIDED BY SCIENCE OPERATIONS</Grid>
                    </Grid>
                  )}
                </BorderedSection>
              )}

              {isContinuum() && isDataTypeOne() && (
                <BorderedSection title={t('polarisations.label')}>
                  {fieldWrapper(polarisationsField(), '150px')}
                </BorderedSection>
              )}
              {isSpectral() && (
                <BorderedSection title={t('polarisations.label')}>
                  {fieldWrapper(polarisationsField(), '150px')}
                </BorderedSection>
              )}
              {isPST() && isDataTypeOne() && (
                <BorderedSection title={t('polarisations.label')}>
                  {fieldWrapper(polarisationsField())}
                </BorderedSection>
              )}
            </Stack>
          </Grid>

          <Grid size={{ md: 11, lg: 3 }}>
            <BorderedSection borderColor={theme.palette.info.main} title={t('page.7.descTitle')}>
              <Typography variant="subtitle1" color="text.disabled">
                {t('page.7.descContent.' + getObservation()?.type + '.' + getSuffix())
                  .split('\n')
                  .map((line, index) => (
                    <React.Fragment key={index}>
                      {line.trim()}
                      <br />
                    </React.Fragment>
                  ))}
              </Typography>
            </BorderedSection>
          </Grid>
        </Grid>
        {pageFooter()}
      </Box>
    </Box>
  );
}
