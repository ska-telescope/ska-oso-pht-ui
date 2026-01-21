import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, SPACER_VERTICAL, Spacer } from '@ska-telescope/ska-gui-components';
import { presentUnits } from '@utils/present/present';
import { validateSDPPage } from '@utils/validation/validation.tsx';
import { Proposal } from '@utils/types/proposal.tsx';
import { FOOTER_SPACER, PAGE_DATA_PRODUCTS, PATH } from '@utils/constants.ts';
import { DataProductSDPNew, SDPImageContinuumData } from '@utils/types/dataProduct.tsx';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import DataProduct from '../entry/DataProduct/DataProduct';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TableDataProducts from '@/components/table/tableDataProducts/TableDataProducts';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

const PAGE = PAGE_DATA_PRODUCTS;
const LABEL_WIDTH = 6;
const GAP = 4;

export default function DataProductsPage() {
  const { t } = useScopedTranslation();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const { autoLink, osdCyclePolicy } = useOSDAccessors();
  const navigate = useNavigate();

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

  // on page load
  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  //re-validate when data changes
  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateSDPPage(getProposal(), autoLink));
  }, [validateToggle]);

  const deleteIconClicked = (e: DataProductSDPNew) => {
    setCurrentRow(Number(e.id));
    setOpenDialog(true);
  };

  const editIconClicked = (e: DataProductSDPNew) => {
    setCurrentRow(Number(e.id));
    navigate(PATH[3], { replace: true, state: e });
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().dataProductSDP?.filter(e => e.id !== String(currentRow));

    setProposal({ ...getProposal(), dataProductSDP: obs1 }); // TODO if we create a SDP here, we should add the dataProductsSDPId to TargetObservation
    setCurrentRow(0);
    closeDeleteDialog();
  };

  const alertContent = () => {
    const rec = getProposal().dataProductSDP?.find(p => String(p.id) === String(currentRow));
    const data = rec?.data as SDPImageContinuumData;
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
        <FieldWrapper label={t('imageSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {data?.imageSizeValue} {presentUnits(String(data?.imageSizeUnits ?? ''))}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('pixelSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {data?.pixelSizeValue} {'arcsec'}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('weighting.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t('imageWeighting.' + data?.weighting)}</Typography>
        </FieldWrapper>
      </Grid>
    );
  };

  const hasObservations = (): boolean => {
    const proposal = getProposal();
    return !!proposal && Array.isArray(proposal.observations) && proposal.observations.length > 0;
  };

  const hasTargetObservations = () => {
    return (getProposal()?.targetObservation?.length ?? 0) > 0;
  };

  const noObservations = () => {
    return (
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ md: 10 }}>
          <Alert
            color={AlertColorTypes.Warning}
            text={
              osdCyclePolicy?.maxObservations === 1 && hasTargetObservations
                ? t('page.8.noObservations')
                : t('error.noObservationsLoggedOut')
            }
            testId="noObservationsNotification"
          />
        </Grid>
      </Grid>
    );
  };

  const dataProductList = () => {
    if (autoLink ? !hasTargetObservations() : !hasObservations()) {
      return null;
    }

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
            data={getProposal().dataProductSDP ?? []}
            deleteFunction={deleteIconClicked}
            updateFunction={editIconClicked}
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
        {(autoLink ? !hasTargetObservations() : !hasObservations()) && noObservations()}

        {(autoLink ? hasTargetObservations() : hasObservations()) && (
          <>
            {osdCyclePolicy?.maxDataProducts !== 1 && dataProductList()}
            {osdCyclePolicy?.maxDataProducts === 1 && (
              <DataProduct data={getProposal()?.dataProductSDP?.[0]} />
            )}
          </>
        )}
        <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      </>
    </Shell>
  );
}
