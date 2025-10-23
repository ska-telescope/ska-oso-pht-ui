import React from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { presentUnits } from '@utils/present/present';
import { STATUS_OK } from '../../utils/constants';
import { validateSDPPage } from '../../utils/validation/validation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import GridDataProducts from '../../components/grid/dataProduct/GridDataProducts';
import { PATH } from '../../utils/constants';
import { DataProductSDP } from '../../utils/types/dataProduct';
import Observation from '../../utils/types/observation';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const PAGE = 8;
const DATA_GRID_HEIGHT = 450;
const LABEL_WIDTH = 6;

export default function SdpDataPage() {
  const { t } = useScopedTranslation();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [baseObservations, setBaseObservations] = React.useState([]);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState()?.length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    const results: Observation[] = getProposal()?.observations?.filter(
      ob =>
        typeof getProposal()?.targetObservation?.find(
          e => e.observationId === ob.id && e.sensCalc.statusGUI === STATUS_OK
        ) !== 'undefined'
    );
    const values = results?.map(e => ({ label: e.id, value: e.id }));
    if (values) {
      setBaseObservations([...values]);
    }
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateSDPPage(getProposal()));
  }, [validateToggle]);

  const deleteIconClicked = (e: DataProductSDP) => {
    setCurrentRow(e.id);
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().dataProductSDP?.filter(e => e.id !== currentRow);

    setProposal({ ...getProposal(), dataProductSDP: obs1 });
    setCurrentRow(0);
    closeDeleteDialog();
  };

  const alertContent = () => {
    const rec = getProposal().dataProductSDP?.find(p => p.id === currentRow);
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('observations.dp.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.observationId}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('observatoryDataProduct.label')} labelWidth={LABEL_WIDTH}>
          {rec?.observatoryDataProduct[0] && (
            <Typography variant="body1">{t('observatoryDataProduct.options.1')}</Typography>
          )}
          {rec?.observatoryDataProduct[1] && (
            <Typography variant="body1">{t('observatoryDataProduct.options.2')}</Typography>
          )}
          {rec?.observatoryDataProduct[2] && (
            <Typography variant="body1">{t('observatoryDataProduct.options.3')}</Typography>
          )}
          {rec?.observatoryDataProduct[3] && (
            <Typography variant="body1">{t('observatoryDataProduct.options.4')}</Typography>
          )}
        </FieldWrapper>
        <FieldWrapper label={t('imageSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {rec?.imageSizeValue} {presentUnits(rec?.imageSizeUnits)}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('imageCellSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {rec?.imageCellSizeValue} {'arcsec'}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('weighting.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t('imageWeighting.' + rec?.weighting)}</Typography>
        </FieldWrapper>
      </Grid>
    );
  };

  const hasObservations = () => (baseObservations?.length > 0 ? true : false);

  const clickRow = (e: { id: number }) => {
    setCurrentRow(e.id);
  };

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="flex-start" justifyContent="space-around">
        <Grid size={{ xs: 11 }}>
          <Stack spacing={1}>
            <AddButton
              title="dataProduct.button"
              action={PATH[3]}
              disabled={!hasObservations()}
              testId="addDataProductButton"
            />
            <GridDataProducts
              baseObservations={baseObservations}
              deleteClicked={deleteIconClicked}
              height={DATA_GRID_HEIGHT}
              rowClick={clickRow}
              rows={getProposal().dataProductSDP}
            />
          </Stack>
        </Grid>
      </Grid>

      {openDialog && (
        <AlertDialog
          maxWidth="md"
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDialogResponse={deleteConfirmed}
          title="deleteDataProduct.confirmTitle"
        >
          {alertContent()}
        </AlertDialog>
      )}
    </Shell>
  );
}
