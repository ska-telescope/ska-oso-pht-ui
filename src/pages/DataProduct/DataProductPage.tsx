import React from 'react';
import { useNavigate } from 'react-router';
import { useFormContext, useWatch } from 'react-hook-form';
import { Grid, Stack, Typography } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Proposal } from '@utils/types/proposal.tsx';
import { IMAGE_WEIGHTING, PAGE_DATA_PRODUCTS, PATH } from '@utils/constants.ts';
import { DataProductSDPNew } from '@utils/types/dataProduct.tsx';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import DataProductInPlace from './DataProductInPlace';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TableDataProducts from '@/components/table/tableDataProducts/TableDataProducts';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { ProposalType } from '@/models/proposals/proposal';
import { isImageDataProduct } from '@/models/proposals/dataProducts';
import { getSubmitPageStatuses } from '@/models/proposals/submit';

const PAGE = PAGE_DATA_PRODUCTS;
const LABEL_WIDTH = 6;
const GAP = 4;

export default function DataProductsPage() {
  const { t } = useScopedTranslation();

  const { application, updateAppContent1 } = storageObject.useStore();
  const [currentRow, setCurrentRow] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);
  const { osdCyclePolicy } = useOSDAccessors();
  const navigate = useNavigate();

  const form = useFormContext<ProposalType>();
  const getProposal = () => application.content2 as Proposal;

  // Write submit status checks into the status store (to be deleted in future refactor)
  useWatch({ control: form.control, name: ['proposalType', 'dataProducts', 'targetObservation'] });
  const status = getSubmitPageStatuses(form.getValues()).dataProducts;
  React.useEffect(() => {
    const statuses = application.content1 as number[];
    if (!statuses || statuses.length <= PAGE || statuses[PAGE] === status) {
      return;
    }
    updateAppContent1(statuses.map((value, i) => (i === PAGE ? status : value)));
  }, [status, application.content1, updateAppContent1]);

  const deleteIconClicked = (e: DataProductSDPNew) => {
    setCurrentRow(e.id);
    setOpenDialog(true);
  };

  const editIconClicked = (e: DataProductSDPNew) => {
    setCurrentRow(e.id);
    // The entry page edits the proposal form's data product with this id
    navigate(PATH[3], { replace: true, state: { id: e.id } });
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    form.setValue(
      'dataProducts',
      form.getValues('dataProducts').filter((dp) => dp.id !== currentRow)
    );
    setCurrentRow('');
    closeDeleteDialog();
  };

  const alertContent = () => {
    const dp = form.getValues('dataProducts').find((other) => other.id === currentRow);
    const image = dp && isImageDataProduct(dp) ? dp : undefined;
    const weighting = IMAGE_WEIGHTING.find((item) => item.label === image?.weighting)?.value;
    return (
      <Grid
        container
        sx={{
          flexDirection: 'column',
          p: 2,
          alignItems: 'space-evenly',
          justifyContent: 'space-around'
        }}
      >
        <FieldWrapper label={t('observations.dp.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{dp?.observationId}</Typography>
        </FieldWrapper>
        {image && (
          <>
            <FieldWrapper label={t('imageSize.label')} labelWidth={LABEL_WIDTH}>
              <Typography variant="body1">
                {image.imageSize.value} {image.imageSize.unit}
              </Typography>
            </FieldWrapper>
            <FieldWrapper label={t('pixelSize.label')} labelWidth={LABEL_WIDTH}>
              <Typography variant="body1">
                {image.pixelSize.value} {image.pixelSize.unit}
              </Typography>
            </FieldWrapper>
            <FieldWrapper label={t('weighting.label')} labelWidth={LABEL_WIDTH}>
              {/* The weighting translations are keyed by the legacy weighting codes */}
              <Typography variant="body1">{t('imageWeighting.' + weighting)}</Typography>
            </FieldWrapper>
          </>
        )}
      </Grid>
    );
  };

  const hasObservations = (): boolean => {
    const proposal = getProposal();
    return !!proposal && Array.isArray(proposal.observations) && proposal.observations.length > 0;
  };

  const noObservations = () => {
    return (
      <Grid
        container
        direction="row"
        sx={{
          alignItems: 'space-evenly',
          justifyContent: 'space-around'
        }}
      >
        <Grid size={{ md: 10 }}>
          <Alert
            color={AlertColorTypes.Warning}
            text={t('error.noObservations')}
            testId="noObservationsNotification"
          />
        </Grid>
      </Grid>
    );
  };

  const dataProductList = () => {
    if (!hasObservations()) {
      return null;
    }

    return (
      <>
        <Stack
          spacing={GAP}
          sx={{
            pl: GAP,
            pr: GAP
          }}
        >
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
        {!hasObservations() && noObservations()}

        {hasObservations() && (
          <>
            {osdCyclePolicy?.maxDataProducts !== 1 && dataProductList()}
            {osdCyclePolicy?.maxDataProducts === 1 && (
              <DataProductInPlace observation={getProposal().observations![0]} />
            )}
          </>
        )}
      </>
    </Shell>
  );
}
