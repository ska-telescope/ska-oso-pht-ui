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
import StokesField from '@components/fields/stokes/stokes.tsx';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import RobustField from '@components/fields/robust/Robust.tsx';
import { frequencyConversion } from '@utils/helpers.ts';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import {
  BANNER_PMT_SPACER,
  FOOTER_HEIGHT_PHT,
  FREQUENCY_GHZ,
  HELP_FONT,
  IW_BRIGGS,
  LAB_IS_BOLD,
  NAV,
  STATUS_OK,
  WRAPPER_HEIGHT
} from '@/utils/constants';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';
import Proposal from '@/utils/types/proposal';
import ImageWeightingField from '@/components/fields/imageWeighting/imageWeighting';
import { DataProductSDP } from '@/utils/types/dataProduct';
import AddButton from '@/components/button/Add/Add';
import { LAB_POSITION } from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { presentUnits } from '@/utils/present/present';
import Observation from '@/utils/types/observation';
import GridObservation from '@/components/grid/observation/GridObservation';

const GAP = 5;
const BACK_PAGE = 8;
const PAGE = 14;
const PAGE_PREFIX = 'SDP';
const FIELD_OBS = 'observatoryDataProduct.options';
const LABEL_WIDTH = 5;
const LABEL_WIDTH_TICK = 11;
const WRAPPER_WIDTH_BUTTON = 2;
const BOTTOM_LABEL_WIDTH = 6;

// const GUASSIAN_TAPPER_UNITS = 'Wavelengths (λ)'; TBC if needed

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
  const [pixelSizeUnits, setPixelSizeUnits] = React.useState('');
  const [weighting, setWeighting] = React.useState(1);
  const [robust, setRobust] = React.useState(3);
  const [channelsOut, setChannelsOut] = React.useState(1);
  const [fitSpectralPol, setFitSpectralPol] = React.useState(1);
  const [stokes, setStokes] = React.useState('I');
  const [tapering, setTapering] = React.useState(0);

  const { t } = useScopedTranslation();

  React.useEffect(() => {
    helpComponent(t('observations.dp.help'));
    const results = getProposal()?.observations?.filter(
      ob =>
        typeof getProposal()?.targetObservation?.find(
          e => e.observationId === ob.id && e.sensCalc.statusGUI === STATUS_OK
        ) !== 'undefined'
    );
    setBaseObservations(results ?? []);
  }, []);

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
        pt={3}
        container
        direction="row"
        alignItems="space-between"
        justifyContent="space-between"
      >
        <Grid size={{ xs: LABEL_WIDTH }}>
          <Typography>{t('observatoryDataProduct.label') + ' *'}</Typography>
        </Grid>
        <Grid size={{ xs: 12 - LABEL_WIDTH }}>{tickElement(1, dp1, setDP1)}</Grid>
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

  const pixelSizeField = () =>
    fieldWrapper(
      <PixelSizeField
        label={t('pixelSize.label')}
        widthLabel={LABEL_WIDTH}
        onFocus={() => helpComponent(t('pixelSize.help'))}
        setValue={(value, suffix) => {
          setPixelSizeValue(value);
          setPixelSizeUnits(suffix);
        }}
        testId="pixelSize"
        value={pixelSizeValue}
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

  const channelsOutField = () =>
    fieldWrapper(
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
        />
      </Box>
    );

  const stokesField = () => {
    return (
      <StokesField
        labelWidth={LABEL_WIDTH}
        onFocus={() => helpComponent(t('stokes.help'))}
        value={stokes}
        setValue={setStokes}
      />
    );
  };

  const fitSpectralPolField = () =>
    fieldWrapper(
      <Box pt={1}>
        <NumberEntry
          label={t('fitSpectralPol.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="fitSpectralPol"
          value={fitSpectralPol}
          setValue={setFitSpectralPol}
          onFocus={() => helpComponent(t('fitSpectralPol.help'))}
          required
        />
      </Box>
    );

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
      const results = [{ label: t('tapering.0'), value: 0 }];
      [0.25, 1, 4, 16, 64, 256, 1024].forEach(inValue => {
        const theLabel = (inValue * (1.4 / frequencyInGHz())).toFixed(3) + '"';
        results.push({ label: theLabel, value: inValue });
      });
      return results;
    };

    return fieldDropdown(
      false,
      'tapering',
      BOTTOM_LABEL_WIDTH,
      getOptions(),
      true,
      setTapering,
      null,
      tapering
    );
  };

  //TODO: Field as per wireframe, TBC if replacing existing tapering field
  // const gaussianTapperField = () => {
  //   return (
  //     <Box pt={1}>
  //       <NumberEntry
  //         label={t('guassianTapper.label')}
  //         labelBold
  //         labelPosition={LAB_POSITION}
  //         labelWidth={LABEL_WIDTH}
  //         testId="guassianTapper"
  //         value={guassianTapperValue}
  //         setValue={setGuassianTapperValue}
  //         required
  //         disabledUnderline
  //         suffix={GUASSIAN_TAPPER_UNITS}
  //       />
  //     </Box>
  //   );
  // };

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
        polarisations: ''
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
              <BorderedSection title={t('page.8.group1')}>{dataProductsField()}</BorderedSection>
              <BorderedSection title={t('page.8.group2')}>
                <Stack>
                  {fieldWrapper(imageSizeField())}
                  {fieldWrapper(pixelSizeField())}
                  {fieldWrapper(imageWeightingField())}
                  {weighting === IW_BRIGGS && fieldWrapper(robustField())}
                  {fieldWrapper(channelsOutField())}
                  {fieldWrapper(fitSpectralPolField())}
                  {fieldWrapper(stokesField())}
                  {baseObservations.find(
                    rec => rec.id === observationId && rec.observingBand !== 0
                  ) && fieldWrapper(taperingField())}
                </Stack>
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
  );
}
