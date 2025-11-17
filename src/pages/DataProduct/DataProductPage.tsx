import React from 'react';
import { Alert, Grid, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { presentUnits } from '@utils/present/present';
import { validateSDPPage } from '../../utils/validation/validation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import { MOCK_CALL, PAGE_DATA_PRODUCTS, PATH } from '../../utils/constants';
import { DataProductSDP } from '../../utils/types/dataProduct';
import DataProduct from '../entry/DataProduct/DataProduct';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TableDataProducts from '@/components/grid/tableDataProducts/TableDataProducts';

const PAGE = PAGE_DATA_PRODUCTS;
const LABEL_WIDTH = 6;
const GAP = 4;

export default function DataProductsPage() {
  const { t } = useScopedTranslation();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);

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
          {rec?.observatoryDataProduct[0] ||
          rec?.observatoryDataProduct[1] ||
          rec?.observatoryDataProduct[2] ||
          rec?.observatoryDataProduct[3] ? (
            <>
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
            </>
          ) : (
            <></>
          )}
        </FieldWrapper>
        <FieldWrapper label={t('imageSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {rec?.imageSizeValue} {presentUnits(String(rec?.imageSizeUnits ?? ''))}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('pixelSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {rec?.pixelSizeValue} {'arcsec'}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('weighting.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t('imageWeighting.' + rec?.weighting)}</Typography>
        </FieldWrapper>
      </Grid>
    );
  };

  const hasObservations = () => (getProposal()?.observations?.length ?? 0) > 0;

  const noObservations = () => {
    return (
      <Alert severity={AlertColorTypes.Error} data-testid="noObservationsNotification">
        {t('error.noObservations')}
      </Alert>
    );
  };

  const dataProductList = () => {
    return (
      <>
        <Stack pl={GAP} pr={GAP} spacing={GAP}>
          <AddButton
            title="dataProduct.button"
            action={PATH[3]}
            disabled={!hasObservations()}
            testId="addDataProductButton"
          />
          <TableDataProducts
            data={getProposal().dataProductSDP}
            deleteFunction={deleteIconClicked}
            updateFunction={() => {}}
          />
        </Stack>
        <AlertDialog
          maxWidth="md"
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDialogResponse={deleteConfirmed}
          title="deleteDataProduct.confirmTitle"
          disabled={false}
        >
          {alertContent()}
        </AlertDialog>
      </>
    );
  };

  return (
    <Shell page={PAGE}>
      <>
        {hasObservations() && dataProductList()}
        {false && hasObservations() && MOCK_CALL && <DataProduct />}
        {!hasObservations() && noObservations()}
      </>
    </Shell>
  );
}
