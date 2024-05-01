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
import { NAV } from '../../utils/constants';
import HelpPanel from '../../components/info/helpPanel/helpPanel';
import Proposal from '../../utils/types/proposal';

// TODO : Improved validation
// TODO : Add documentation page specifically for Adding a Data product
// TODO : Replace individual tick-boxes with a mapping

const BACK_PAGE = 7;
const PAGE = 13;

export default function AddDataProduct() {
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

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

  React.useEffect(() => {
    helpComponent(t('observations.dp.help'));
  }, []);

  const observationsField = () => {
    const getOptions = () => {
      const theOptions = [
        { label: t('observations.all'), value: 0 },
        ...getProposal()?.observations?.map(e => ({
          label: e.id,
          value: e.id
        }))
      ];
      return theOptions;
    };

    return (
      <>
        {getOptions() && (
          <DropDown
            options={getOptions()}
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
    <TickBox
      key={key}
      label={t(FIELD_OBS + '.' + key)}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH}
      testId={'observatoryDataProduct' + key}
      checked={value}
      onFocus={() => helpComponent(t('observatoryDataProduct.help'))}
      onChange={() => setter(!value)}
    />
  );

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
    />
  );

  const weightingField = () => (
    <TextEntry
      label={t('weighting.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH}
      testId="weighting"
      value={weighting}
      setValue={setWeighting}
      onFocus={() => helpComponent(t('weighting.help'))}
      required
    />
  );

  const pageFooter = () => {
    const getIcon = () => <AddIcon />;

    const enabled = () => {
      const dp = dp1 || dp2 || dp3 || dp4 || dp5;
      return dp && imageSize.length > 0 && pixelSize.length > 0 && weighting.length > 0;
    };

    const addToProposal = () => {
      const highestId = getProposal().dataProducts.reduce(
        (acc, dataProducts) => (dataProducts.id > acc ? dataProducts.id : acc),
        0
      );
      const observatoryDataProduct = [dp1, dp2, dp3, dp4, dp5];
      const newDataProduct = {
        id: highestId + 1,
        observatoryDataProduct,
        observations,
        imageSize,
        pixelSize,
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
            <Grid item>{tickElement(1, dp1, setDP1)}</Grid>
            <Grid item>{tickElement(2, dp2, setDP2)}</Grid>
            <Grid item>{tickElement(3, dp3, setDP3)}</Grid>
            <Grid item>{tickElement(4, dp4, setDP4)}</Grid>
            <Grid item>{tickElement(5, dp5, setDP5)}</Grid>
            <Grid item>{imageSizeField()}</Grid>
            <Grid item>{pixelSizeField()}</Grid>
            <Grid item>{weightingField()}</Grid>
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
