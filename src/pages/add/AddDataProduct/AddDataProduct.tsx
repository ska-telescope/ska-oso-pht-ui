import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  BorderedSection,
  DropDown,
  InfoCard,
  InfoCardColorTypes,
  LABEL_POSITION,
  NumberEntry,
  Spacer,
  SPACER_VERTICAL,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import RobustField from '@components/fields/robust/Robust.tsx';
import { frequencyConversion } from '@utils/helpers.ts';
import StokesField from '@components/fields/stokes/stokes.tsx';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import {
  BANNER_PMT_SPACER,
  FOOTER_HEIGHT_PHT,
  FREQUENCY_GHZ,
  HELP_FONT,
  IW_BRIGGS,
  LAB_IS_BOLD,
  LAB_POSITION,
  NAV,
  PAGE_DATA_PRODUCTS,
  PAGE_DATA_PRODUCTS_ADD,
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
import HelpShell from '@/components/layout/HelpShell/HelpShell';

const GAP = 5;
const BACK_PAGE = PAGE_DATA_PRODUCTS;
const PAGE = PAGE_DATA_PRODUCTS_ADD;
const PAGE_PREFIX = 'SDP';
const FIELD_OBS = 'observatoryDataProduct.options';
const LABEL_WIDTH = 5;
const LABEL_WIDTH_TICK = 11.5;
const WRAPPER_WIDTH_BUTTON = 2;

export default function AddDataProduct() {
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [baseObservations, setBaseObservations] = React.useState<Observation[]>([]);
  const [observationId, setObservationId] = React.useState('');
  const [dp1, setDP1] = React.useState(true);
  const [imageSizeValue, setImageSizeValue] = React.useState('0');
  const [imageSizeUnits, setImageSizeUnits] = React.useState(0);
  const [pixelSizeValue, setPixelSizeValue] = React.useState(0);
  const [pixelSizeUnits, setPixelSizeUnits] = React.useState(0);
  const [weighting, setWeighting] = React.useState(0);
  const [robust, setRobust] = React.useState(3);
  const [channelsOut, setChannelsOut] = React.useState(1);
  const [polarisations, setPolarisations] = React.useState('I');
  const [tapering, setTapering] = React.useState(0);

  const { t } = useScopedTranslation();

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
      <Grid
        pl={1}
        pt={2}
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid size={{ xs: 3 }}>
          <Typography>{t('observatoryDataProduct.label') + ' *'}</Typography>
        </Grid>
        <Grid size={{ xs: 9 }}>{tickElement(1, dp1, setDP1)}</Grid>
      </Grid>
    );
  };

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

  const imageSizeField = () => {
    const errorText = () => (Number(imageSizeValue) ? '' : t('imageSize.error'));
    const setTheNumber = (inNum: number) => {
      const str = Math.abs(inNum).toString();
      const num = Number(str);
      setImageSizeValue(num.toString());
    };
    return (
      <Box pt={1} sx={{ maxWidth: '800px' }}>
        <NumberEntry
          label={t('imageSize.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={5}
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

  const pixelSizeUnitsField = () => {
    return pixelSizeUnits === 0 ? '' : presentUnits(t('pixelSize.' + pixelSizeUnits));
  };

  const pixelSizeField = () =>
    fieldWrapper(
      <PixelSizeField
        label={t('pixelSize.label')}
        onFocus={() => helpComponent(t('pixelSize.help'))}
        setValue={setPixelSizeValue}
        testId="pixelSize"
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
        setValue={setWeighting}
        value={weighting}
      />
    );

  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        onFocus={() => helpComponent(t('robust.help'))}
        setValue={setRobust}
        testId="robust"
        value={robust}
      />
    );

  const channelsOutField = () => {
    return fieldWrapper(
      <Box pt={1}>
        <NumberEntry
          label={t('channelsOut.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="channelsOut"
          value={channelsOut}
          setValue={setChannelsOut}
          onFocus={() => helpComponent(t('channelsOut.help'))}
          required
          errorText={channelsOut < 0 || channelsOut > 40 ? t('channelsOut.error') : ''}
        />
      </Box>
    );
  };

  const stokesField = () => {
    return (
      <StokesField
        onFocus={() => helpComponent(t('stokes.help'))}
        value={polarisations}
        setValue={setPolarisations}
      />
    );
  };

  const fieldDropdown = (
    disabled: boolean,
    field: string,
    labelWidth: number,
    options: { label: string; value: string | number }[],
    required: boolean,
    setValue: Function,
    suffix: any,
    value: string | number
  ) => {
    return fieldWrapper(
      <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
        <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - WRAPPER_WIDTH_BUTTON : 12 }}>
          <DropDown
            disabled={disabled}
            options={options}
            testId={field}
            value={value}
            setValue={setValue}
            label={t(field + '.label')}
            labelBold={LAB_IS_BOLD}
            labelPosition={LAB_POSITION}
            labelWidth={suffix ? labelWidth + 1 : labelWidth}
            onFocus={() => helpComponent(t(field + '.help'))}
            required={required}
          />
        </Grid>
        <Grid size={{ xs: suffix ? WRAPPER_WIDTH_BUTTON : 0 }}>{suffix}</Grid>
      </Grid>
    );
  };

  const taperingField = () => {
    const getCentralFrequency = () => {
      const selectedObservation = baseObservations.find(rec => rec.id === observationId);
      return selectedObservation?.centralFrequency ?? null;
    };

    const getCentralFrequencyUnits = () => {
      const selectedObservation = baseObservations.find(rec => rec.id === observationId);
      return selectedObservation?.centralFrequencyUnits ?? null;
    };
    const frequencyInGHz = () => {
      return frequencyConversion(
        getCentralFrequency(),
        getCentralFrequencyUnits() as number,
        FREQUENCY_GHZ
      );
    };

    const getOptions = () => {
      const results = [{ label: t('gaussianTaper.0'), value: 0 }];
      [0.25, 1, 4, 16, 64, 256, 1024].forEach(inValue => {
        const theLabel = (inValue * (1.4 / frequencyInGHz())).toFixed(3) + '"';
        results.push({ label: theLabel, value: inValue });
      });
      return results;
    };

    return fieldDropdown(
      false,
      'gaussianTaper',
      5,
      getOptions(),
      true,
      setTapering,
      null,
      tapering
    );
  };

  const pageFooter = () => {
    const enabled = () => {
      const dp = dp1;
      return dp && pixelSizeValue > 0 && Number(imageSizeValue) > 0;
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
      const observatoryDataProduct = [dp1];
      const newDataProduct: DataProductSDP = {
        id: highestId + 1,
        dataProductsSDPId: `${PAGE_PREFIX}-${highestId + 1}`,
        observatoryDataProduct,
        observationId: [observationId],
        imageSizeValue: Number(imageSizeValue),
        imageSizeUnits,
        pixelSizeValue,
        pixelSizeUnits,
        weighting,
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
  <HelpShell page={PAGE}>
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
                />
              )}
            </Box>
          </Grid>
          <Grid size={{ md: 7, lg: 6 }}>
            <Stack spacing={5}>
              <BorderedSection title={t('page.7.group1')}>{dataProductsField()}</BorderedSection>
              <BorderedSection title={t('page.7.group2')}>
                <Grid container rowSpacing={3} spacing={3}>
                  <Grid size={{ xs: 4, md: 4 }}>{fieldWrapper(imageSizeField())}</Grid>
                  <Grid size={{ xs: 4, md: 4 }}>{fieldWrapper(imageWeightingField())}</Grid>
                  <Grid size={{ xs: 4, md: 4 }}>{fieldWrapper(stokesField())}</Grid>
                  <Grid size={{ xs: 4, md: 4 }}>{fieldWrapper(pixelSizeField())}</Grid>
                  {weighting === IW_BRIGGS && (
                    <Grid size={{ xs: 4, md: 4 }}>{fieldWrapper(robustField())}</Grid>
                  )}
                  <Grid size={{ xs: 4, md: 4 }}>{fieldWrapper(channelsOutField())}</Grid>
                  <Grid size={{ xs: 4, md: 4 }}>
                    {baseObservations.find(
                      rec => rec.id === observationId && rec.observingBand !== 0
                    ) && fieldWrapper(taperingField())}
                  </Grid>
                </Grid>
              </BorderedSection>
            </Stack>
          </Grid>
          <Grid size={{ md: 11, lg: 3 }}>
            <Stack spacing={1}>
              <HelpPanel />
              <InfoCard
                color={InfoCardColorTypes.Warning}
                fontSize={HELP_FONT}
                message="The associated input options of these observatory data products are under development and subject to change."
                testId="developmentPanelId"
              />
            </Stack>
          </Grid>
        </Grid>
        {pageFooter()}
      </Box>
    </Box>
    </HelpShell>
  );
}
