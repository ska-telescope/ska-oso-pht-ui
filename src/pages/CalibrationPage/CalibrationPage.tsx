import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { Box, Grid, Stack } from '@mui/material';
import { Proposal } from '@utils/types/proposal.tsx';
import Shell from '../../components/layout/Shell/Shell';
import CalibrationEntry from '../entry/Calibration/CalibrationEntry';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { FOOTER_SPACER, PATH, PAGE_CALIBRATION, PAGE_CALIBRATION_ENTRY } from '@/utils/constants';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import AddButton from '@/components/button/Add/Add';
import AlertDialog from '@/components/alerts/alertDialog/AlertDialog';

const PAGE = PAGE_CALIBRATION;
const GAP = 4;

export default function CalibrationPage() {
  const { application } = storageObject.useStore();

  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const { autoLink, osdCyclePolicy } = useOSDAccessors();
  const [openDialog, setOpenDialog] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    setHelp('page.' + PAGE + '.help');
  }, []);

  const deleteConfirmed = () => {
    // const obs1 = getProposal().dataProductSDP?.filter(e => e.id !== String(currentRow));
    // setProposal({ ...getProposal(), dataProductSDP: obs1 }); // TODO if we create a SDP here, we should add the dataProductsSDPId to TargetObservation
    // setCurrentRow(0);
    // closeDeleteDialog();
  };

  const hasData = (): boolean => {
    const proposal = getProposal();
    return (
      !!proposal &&
      Array.isArray(proposal.calibrationStrategy) &&
      proposal.calibrationStrategy.length > 0
    );
  };

  const hasTargetObservations = () => {
    return (getProposal()?.targetObservation?.length ?? 0) > 0;
  };

  const noData = () => {
    return (
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ md: 10 }}>
          <Alert
            color={AlertColorTypes.Error}
            text={t('error.noCalibrationsLoggedOut')}
            testId="noDataNotification"
          />
        </Grid>
      </Grid>
    );
  };

  const dataList = () => {
    return (
      <>
        <Stack pl={GAP} pr={GAP} spacing={GAP}>
          {/* <TableDataProducts
            data={getProposal().dataProductSDP ?? []}
            deleteFunction={deleteIconClicked}
            updateFunction={editIconClicked}
          /> */}
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

  const alertContent = () => {
    // const rec = getProposal().dataProductSDP?.find(p => String(p.id) === String(currentRow));
    // const data = rec?.data as SDPImageContinuumData;
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        {/* <FieldWrapper label={t('observations.dp.label')} labelWidth={LABEL_WIDTH}>
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
        </FieldWrapper> */}
      </Grid>
    );
  };

  return (
    <Shell page={PAGE}>
      <Box pl={GAP}>
        {!autoLink && (
          <Box pb={GAP}>
            <AddButton
              title={'page.' + PAGE + '.title'}
              action={PATH[PAGE_CALIBRATION_ENTRY]}
              primary={!hasData()}
              testId="addDataProductButton"
            />
          </Box>
        )}
        {(autoLink ? !hasTargetObservations() : !hasData()) && noData()}

        {(autoLink ? hasTargetObservations() : hasData()) && (
          <>
            {osdCyclePolicy?.maxDataProducts !== 1 && dataList()}
            {osdCyclePolicy?.maxDataProducts === 1 && (
              <Box p={GAP}>
                <CalibrationEntry data={getProposal()?.calibrationStrategy?.[0]} />
              </Box>
            )}
          </>
        )}
        <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      </Box>
    </Shell>

    // <Shell page={PAGE}>
    //   <>
    //     {hasData() && (
    //       <Grid
    //         p={1}
    //         container
    //         direction="row"
    //         alignItems="space-evenly"
    //         justifyContent="center"
    //         spacing={1}
    //       >
    //         <Grid size={{ xs: 4, md: 8 }} sx={{ position: 'relative' }}>
    //           {!axiosViewError && <CalibrationEntry data={strategy} />}
    //           {axiosViewError && (
    //             <Alert
    //               color={AlertColorTypes.Error}
    //               testId="axiosErrorTestId"
    //               text={axiosViewError}
    //             />
    //           )}
    //         </Grid>
    //       </Grid>
    //     )}
    //     {!hasData() && (
    //       <Grid
    //         p={10}
    //         container
    //         direction="column"
    //         alignItems="space-evenly"
    //         justifyContent="space-around"
    //       >
    //         <Alert
    //           color={AlertColorTypes.Error}
    //           text={t('page.' + PAGE + errorSuffix())}
    //           testId="helpPanelId"
    //         />
    //       </Grid>
    //     )}
    //   </>
    // </Shell>
  );
}
