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
import TableCalibrations from '@/components/table/tableCalibrations/TableCalibrations';

const PAGE = PAGE_CALIBRATION;
const GAP = 4;

export default function CalibrationPage() {
  const { application } = storageObject.useStore();

  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const { autoLink, osdCyclePolicy } = useOSDAccessors();
  const [openDialog, setOpenDialog] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;

  const maxObservations = osdCyclePolicy?.maxObservations ?? 99999999;

  React.useEffect(() => {
    setHelp('page.' + PAGE + '.help');
  }, []);

  const deleteConfirmed = () => {};

  const editIconClicked = (_row: any) => {};

  const deleteIconClicked = (_row: any) => {};

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
    const theText =
      maxObservations === 1
        ? hasTargetObservations()
          ? t('page.6.noObservations')
          : t('error.noCalibrationsLoggedOut')
        : hasTargetObservations()
        ? t('page.6.noObservations')
        : t('error.noCalibrationsLinking');
    return (
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ md: 10 }}>
          <Alert color={AlertColorTypes.Warning} text={theText} testId="noDataNotification" />
        </Grid>
      </Grid>
    );
  };

  const dataList = () => {
    return (
      <>
        <Stack pl={GAP} pr={GAP} spacing={GAP}>
          <TableCalibrations
            data={getProposal().calibrationStrategy ?? []}
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

  const alertContent = () => {
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        {}
      </Grid>
    );
  };

  return (
    <Shell page={PAGE}>
      <Box pl={GAP}>
        {!autoLink && osdCyclePolicy?.calibrationFactoryDefined !== true && (
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
            {osdCyclePolicy?.calibrationFactoryDefined !== true && dataList()}
            {osdCyclePolicy?.calibrationFactoryDefined && (
              <Box p={GAP}>
                <CalibrationEntry data={getProposal()?.calibrationStrategy?.[0]} />
              </Box>
            )}
          </>
        )}
        <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      </Box>
    </Shell>
  );
}
