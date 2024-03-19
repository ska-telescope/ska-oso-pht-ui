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
  LABEL_POSITION,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { NAV } from '../../utils/constants';
import HelpPanel from '../../components/helpPanel/helpPanel';
import Proposal from '../../services/types/proposal';

// TODO : Cypress Testing
// TODO : Documentation
// TODO : Improved validation
// TODO : Add functionality
// TODO : Combine Bandwidth & Spectral Resolution ( SensCalc )

const PAGE = 13;

export default function AddDataProduct() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [field1, setField1] = React.useState('');
  const [field2, setField2] = React.useState('');

  React.useEffect(() => {
    helpComponent(t('arrayConfiguration.help'));
  }, []);

  const field1Field = () => (
    <TextEntry
      label="FIELD 1"
      labelBold
      labelPosition={LABEL_POSITION.START}
      testId="field1"
      value={field1}
      setValue={setField1}
      onFocus={() => helpComponent('FIELD1 HELP')}
    />
  );

  const field2Field = () => (
    <TextEntry
      label="FIELD 2"
      labelBold
      labelPosition={LABEL_POSITION.START}
      testId="field2"
      value={field2}
      setValue={setField2}
      onFocus={() => helpComponent('FIELD2 HELP')}
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
        field1,
        field2
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
            <Grid item>{field1Field()}</Grid>
            <Grid item>{field2Field()}</Grid>
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
