import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Box, Grid } from '@mui/material';
import { ProposalType } from '@/models/proposals/proposal';
import { CalibrationStrategy } from '@/utils/types/calibrationStrategy';
import Shell from '../../components/layout/Shell/Shell';
import CalibrationEntry from '../entry/Calibration/CalibrationEntry';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { PATH, PAGE_CALIBRATION, PAGE_CALIBRATION_ENTRY } from '@/utils/constants';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import AddButton from '@/components/button/Add/Add';

const PAGE = PAGE_CALIBRATION;
const GAP = 4;

export default function CalibrationPage() {
  // The form owns the links and calibration
  const form = useFormContext<ProposalType>();
  const links = useWatch({ control: form.control, name: 'targetObservation' }) ?? [];
  const strategies = (useWatch({ control: form.control, name: 'calibrationStrategy' }) ??
    []) as CalibrationStrategy[];

  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const { autoLink, osdCyclePolicy } = useOSDAccessors();

  React.useEffect(() => {
    setHelp('page.' + PAGE + '.help');
  }, []);

  const hasData = (): boolean => links.length > 0 && strategies.length > 0;

  const hasTargetObservations = () => links.length > 0;

  const noData = () => {
    // Calibration needs a target linked to an observation, which is the same for every proposal
    const theText = autoLink
      ? t('error.noCalibrationsNoTarget')
      : hasTargetObservations()
        ? t('error.noCalibrationsLoggedOut')
        : t('error.noCalibrationsLinking');
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
            color={autoLink ? AlertColorTypes.Error : AlertColorTypes.Warning}
            text={theText}
            testId="noDataNotification"
          />
        </Grid>
      </Grid>
    );
  };

  const dataList = () => {
    // For now, there is only ever one calibration entry, so we can skip the list and just show the single entry if it exists.
    return <></>;
  };

  return (
    <Shell page={PAGE}>
      <Box
        sx={{
          pl: GAP
        }}
      >
        {!autoLink && osdCyclePolicy?.calibrationFactoryDefined !== true && (
          <Box
            sx={{
              pb: GAP
            }}
          >
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
              <Box
                sx={{
                  p: GAP
                }}
              >
                <CalibrationEntry data={strategies[0]} />
              </Box>
            )}
          </>
        )}
      </Box>
    </Shell>
  );
}
