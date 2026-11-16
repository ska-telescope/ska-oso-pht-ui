import { useLocation, useNavigate } from 'react-router';
import { Grid, Paper } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProposalType } from '@/models/proposals/proposal';
import {
  DATA_PRODUCT_KIND,
  DataProductKind,
  getDataProductSchema,
  getDataProductsSchema,
  newDataProduct
} from '@/models/proposals/dataProducts';
import { mainDataProductKind, newDataProductsForMode } from '@/utils/autoLinking/AutoLinking';
import {
  FOOTER_HEIGHT_PHT,
  NAV,
  PAGE_DATA_PRODUCTS,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST
} from '@/utils/constants';
import Proposal from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import Observation from '@/utils/types/observation';
import DataProductView, { DataProductsForm } from '@/pages/DataProduct/DataProductView';

const BACK_PAGE = PAGE_DATA_PRODUCTS;

const getEntrySchema = () => z.object({ dataProducts: getDataProductsSchema().length(1) });

/**
 * Adds a data product, or updates the one given, in an entry form of its own. It is written to
 * the proposal form only when it is valid and the user adds or updates it.
 */
function DataProductEntry({
  observations,
  editId
}: {
  observations: Observation[];
  editId?: string;
}) {
  const navigate = useNavigate();
  const proposalForm = useFormContext<ProposalType>();
  const existing = editId
    ? proposalForm.getValues('dataProducts').find((dp) => dp.id === editId)
    : undefined;
  const defaultObservation =
    observations.find((obs) => obs.id === existing?.observationId) ??
    observations.find((obs) => obs.type === TYPE_PST) ??
    observations[0];

  const entryForm = useForm<DataProductsForm>({
    mode: 'all',
    resolver: zodResolver(getEntrySchema()) as never,
    defaultValues: {
      dataProducts: [
        existing ?? newDataProduct(mainDataProductKind(defaultObservation), defaultObservation.id)
      ]
    }
  });
  const dp = useWatch({ control: entryForm.control, name: 'dataProducts.0' });
  const observation = observations.find((obs) => obs.id === dp.observationId) ?? defaultObservation;

  // A data product of another observation starts again with that observation's defaults
  const selectObservation = (next: Observation) => {
    if (next.id === dp.observationId) {
      return;
    }
    entryForm.setValue(
      'dataProducts.0',
      { ...newDataProduct(mainDataProductKind(next), next.id), id: dp.id },
      { shouldValidate: true }
    );
  };

  const switchContinuumKind = (kind: DataProductKind) =>
    entryForm.setValue(
      'dataProducts.0',
      { ...newDataProduct(kind, observation.id), id: dp.id },
      { shouldValidate: true }
    );

  const commit = () => {
    if (!getDataProductSchema().safeParse(dp).success) {
      return;
    }
    const dataProducts = proposalForm.getValues('dataProducts');
    const updated = dataProducts.some((other) => other.id === dp.id)
      ? dataProducts.map((other) => (other.id === dp.id ? dp : other))
      : [...dataProducts, dp];
    // A continuum and spectral observation also needs its hidden visibilities companion
    const needsCompanion =
      observation.type === TYPE_CONTINUUM_SPECTRAL &&
      !updated.some(
        (other) =>
          other.observationId === observation.id &&
          other.kind === DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES
      );
    proposalForm.setValue('dataProducts', [
      ...updated,
      ...(needsCompanion ? newDataProductsForMode(observation).slice(1) : [])
    ]);
    navigate(NAV[BACK_PAGE]);
  };

  const footer = (
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
        container
        direction="row"
        sx={{ p: 2, alignItems: 'space-between', justifyContent: 'space-between' }}
      >
        <Grid />
        <Grid />
        <Grid>
          <AddButton
            disabled={!entryForm.formState.isValid}
            primary
            action={commit}
            testId={'addDataProductButtonEntry'}
            title={existing ? 'updateBtn.label' : 'addBtn.label'}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <FormProvider {...entryForm}>
      <DataProductView
        index={0}
        observation={observation}
        observations={observations}
        onSelectObservation={selectObservation}
        onContinuumKindChange={switchContinuumKind}
        footer={footer}
      />
    </FormProvider>
  );
}

/**
 * The page to add a data product, or to edit the one passed in the route state, for a proposal
 * with several data products. An SV proposal's data product is edited in place on the data
 * products page instead (DataProductInPlace).
 */
export default function DataProduct() {
  const locationProperties = useLocation();
  const { application } = storageObject.useStore();
  const observations = (application.content2 as Proposal)?.observations ?? [];

  if (observations.length === 0) {
    return null;
  }
  const editId = (locationProperties.state as { id?: string } | null)?.id;
  return <DataProductEntry key={editId ?? 'new'} observations={observations} editId={editId} />;
}
