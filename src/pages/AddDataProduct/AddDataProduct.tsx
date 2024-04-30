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
import { NAV } from '../../utils/constants';
import HelpPanel from '../../components/info/helpPanel/helpPanel';
import Proposal from '../../utils/types/proposal';

// TODO : Improved validation
// TODO : Add documentation page specifically for Adding a Data product

const BACK_PAGE = 7;
const PAGE = 13;

export default function AddDataProduct() {
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [observatoryDataProduct, setObservatoryDataProduct] = React.useState();
  const [observations, setObservations] = React.useState();
  const [imageSize, setImageSize] = React.useState('');
  const [pixelSize, setPixelSize] = React.useState('');
  const [weighting, setWeighting] = React.useState('');

  const { t } = useTranslation('pht');
  const FIELD_OBS = 'observatoryDataProductConfig.options';

  React.useEffect(() => {
    helpComponent(t('observatoryDataProductConfig.help'));
  }, []);

  const observationsField = () => {
    const getOptions = () => {
      return getProposal()?.observations?.map(e => ({
        label: e.id,
        value: e.id
      }));
    };
    return (
      <>
        {getOptions() && (
          <DropDown
            options={getOptions()}
            testId="observations"
            value={observations}
            setValue={setObservations}
            label={t('observations.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            onFocus={() => helpComponent(t('observations.dp.help'))}
          />
        )}
      </>
    );
  };
  
  const obsDataProductField = () => {
    const OPTIONS = [1, 2, 3, 4, 5];

    const getOptions = () => {
      return OPTIONS.map(e => ({
        label: t(FIELD_OBS + '.' + e),
        value: e
      }));
    };

    return (
      <DropDown
        options={getOptions()}
        testId="observatoryDataProduct"
        value={observatoryDataProduct}
        setValue={setObservatoryDataProduct}
        label={t('observatoryDataProductConfig.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        onFocus={() => helpComponent(t('observatoryDataProductConfig.help'))}
      />
    );
  };


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
      return getProposal()?.observations?.length > 0 ? false : true;
    };

    const addToProposal = () => {
      const highestId = getProposal().dataProducts.reduce(
        (acc, dataProducts) => (dataProducts.id > acc ? dataProducts.id : acc),
        0
      );
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
            <Grid item>{obsDataProductField()}</Grid>
            <Grid item>{observationsField()}</Grid>
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
