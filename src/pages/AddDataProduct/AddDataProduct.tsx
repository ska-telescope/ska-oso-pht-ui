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
  TextEntry,
  TickBox
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { NAV, OBSERVATION } from '../../utils/constants';
import HelpPanel from '../../components/info/helpPanel/helpPanel';
import Proposal from '../../utils/types/proposal';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';

// TODO : Improved validation
// TODO : Add documentation page specifically for Adding a Data product
// TODO : Replace individual tick-boxes with a mapping
// TODO : Need to make ImageSize numeric, with a dropdown for units
// TODO : Move ImageWeighting to a separate component as it is also on the Observation Page

const BACK_PAGE = 7;
const PAGE = 13;

export default function AddDataProduct() {
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [baseObservations, setBaseObservations] = React.useState(null);
  const [observations, setObservations] = React.useState('0');
  const [dp1, setDP1] = React.useState(false);
  const [dp2, setDP2] = React.useState(false);
  const [dp3, setDP3] = React.useState(false);
  const [dp4, setDP4] = React.useState(false);
  const [dp5, setDP5] = React.useState(false);
  const [imageSize, setImageSize] = React.useState('');
  const [pixelSize, setPixelSize] = React.useState('');
  const [weighting, setWeighting] = React.useState('');

  const { t } = useTranslation('pht');
  const FIELD_OBS = 'observatoryDataProduct.options';
  const LABEL_WIDTH = 5;

  const getImageWeighting = (id: string) => {
    const temp = getProposal()?.observations.find(e => e.id === id);
    return temp ? temp.imageWeighting : 0;
  };

  const getPixelSize = rec => {
    const DIVIDER = 3;
    const arr =
      rec.sensCalc?.section1?.length > 2 ? rec.sensCalc.section1[3].value.split(' x ') : [];
    if (arr.length > 1) {
      const newValue = Number(arr[1]);
      return (newValue / DIVIDER).toFixed(t('pixelSize.precision'));
    } else {
      return t('pixelSize.notFound');
    }
  };

  React.useEffect(() => {
    helpComponent(t('observations.dp.help'));
    const theOptions = [
      ...getProposal()?.targetObservation?.map(e => ({
        label: e.observationId,
        value: e.observationId,
        weighting: getImageWeighting(e.observationId),
        pixelSize: getPixelSize(e)
      }))
    ];
    setBaseObservations(theOptions);
  }, []);

  React.useEffect(() => {
    if (observations && baseObservations) {
      const temp = baseObservations.find(e => e.value === observations);
      setWeighting(temp ? temp.weighting : null);
      setPixelSize(temp ? temp.pixelSize : null);
    }
  }, [baseObservations, observations]);

  const observationsField = () => {
    return (
      <>
        {baseObservations && (
          <DropDown
            options={baseObservations}
            testId="observations"
            value={observations}
            setValue={setObservations}
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

  const imageSizeField = () => (
    <TextEntry
      label={t('imageSize.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH}
      testId="imageSize"
      value={imageSize}
      setValue={setImageSize}
      onFocus={() => helpComponent(t('imageSize.help'))}
      required
    />
  );

  const pixelSizeField = () => (
    <TextEntry
      label={t('pixelSize.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH}
      testId="pixelSize"
      value={pixelSize}
      setValue={setPixelSize}
      onFocus={() => helpComponent(t('pixelSize.help'))}
      required
      disabled
    />
  );

  const imageWeightingField = () => (
    <DropDown
      options={OBSERVATION.ImageWeighting}
      testId="imageWeighting"
      value={weighting}
      label={t('imageWeighting.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH}
      onFocus={() => helpComponent(t('imageWeighting.help'))}
      required
      disabled
    />
  );

  const pageFooter = () => {
    const getIcon = () => <AddIcon />;

    const enabled = () => {
      const dp = dp1 || dp2 || dp3 || dp4 || dp5;
      return dp && pixelSize !== '' && imageSize?.length > 0;
    };

    const addToProposal = () => {
      const highestId = getProposal().DataProductSDP.reduce(
        (acc, dataProducts) => (dataProducts.id > acc ? dataProducts.id : acc),
        0
      );
      const observatoryDataProduct = [dp1, dp2, dp3, dp4, dp5];
      const newDataProduct = {
        id: highestId + 1,
        dataProductsSDPId: `SDP-${highestId+1}`,
        observatoryDataProduct,
        observationId: [observations], // TODO check if this is correct, we need an array of observation ids
        imageSizeValue: imageSize,
        imageSizeUnits: '', // TODO add units
        pixelSizeValue: pixelSize,
        pixelSizeUnits: '', // TODO add units
        weighting
      };

      setProposal({
        ...getProposal(),
        DataProductSDP: [...getProposal().DataProductSDP, newDataProduct]
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
    <Grid container direction="column" alignItems="space-evenly" justifyContent="center">
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
            <Grid item>{imageWeightingField()}</Grid>
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
