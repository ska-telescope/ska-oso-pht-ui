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
  TextEntry
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { DATA_PRODUCT, NAV } from '../../utils/constants';
import HelpPanel from '../../components/helpPanel/helpPanel';
import Proposal from '../../services/types/proposal';

// TODO : Documentation
// TODO : Improved validation
// TODO : Combine Bandwidth & Spectral Resolution ( SensCalc )

const PAGE = 13;

export default function AddDataProduct() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [observatoryDataProduct, setObservatoryDataProduct] = React.useState();
  const [pipeline, setPipeline] = React.useState();
  const [imageSize, setImageSize] = React.useState('');
  const [pixelSize, setPixelSize] = React.useState('');
  const [weighting, setWeighting] = React.useState('');

  React.useEffect(() => {
    helpComponent(t('arrayConfiguration.help'));
  }, []);

  const obsDataProductField = () => (
    <DropDown
      options={DATA_PRODUCT.observatoryDataProduct}
      testId="observatoryDataProduct"
      value={observatoryDataProduct}
      select
      setValue={setObservatoryDataProduct}
      label={t('observatoryDataProductConfig.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      onFocus={() => helpComponent(t('observatoryDataProductConfig.help'))}
    />
  );

  const pipelineField = () => (
    <DropDown
      options={DATA_PRODUCT.pipeline}
      testId="pipeline"
      value={pipeline}
      setValue={setPipeline}
      label={t('pipeline.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      onFocus={() => helpComponent(t('pipeline.help'))}
    />
  );

  const imageSizeField = () => (
    <TextEntry
      label={t('imageSize.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      testId="imageSize"
      value={imageSize}
      setValue={setImageSize}
      onFocus={() => helpComponent(t('imageSize.help'))}
    />
  );

  const pixelSizeField = () => (
    <TextEntry
      label={t('pixelSize.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      testId="pixelSize"
      value={pixelSize}
      setValue={setPixelSize}
      onFocus={() => helpComponent(t('pixelSize.help'))}
    />
  );

  const weightingField = () => (
    <TextEntry
      label={t('weighting.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      testId="weighting"
      value={weighting}
      setValue={setWeighting}
      onFocus={() => helpComponent(t('weighting.help'))}
    />
  );

  const pageFooter = () => {
    const getIcon = () => <AddIcon />;

    const disabled = () => {
      return false;
    };

    const addToProposal = () => {
      const highestId = getProposal().dataProducts.reduce(
        (acc, dataProducts) => (dataProducts.id > acc ? dataProducts.id : acc),
        0
      );
      const newDataProduct = {
        id: highestId + 1,
        observatoryDataProduct,
        pipeline,
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
              disabled={disabled()}
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
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner pageNo={PAGE} />
      </Grid>

      <Grid
        p={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
        spacing={1}
      >
        <Grid item xs={9}>
          <Grid
            container
            direction="column"
            alignItems="space-evenly"
            justifyContent="space-around"
          >
            <Grid item>{obsDataProductField()}</Grid>
            <Grid item>{pipelineField()}</Grid>
            <Grid item>{imageSizeField()}</Grid>
            <Grid item>{pixelSizeField()}</Grid>
            <Grid item>{weightingField()}</Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <HelpPanel />
        </Grid>
      </Grid>
      {pageFooter()}
    </Grid>
  );
}
