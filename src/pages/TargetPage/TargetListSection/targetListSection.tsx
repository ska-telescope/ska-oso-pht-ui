import React from 'react';
import { Box, Grid, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  AlertColorTypes,
  BorderedSection,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
import { Proposal } from '@utils/types/proposal.tsx';
import { FOOTER_SPACER, RA_TYPE_ICRS, VELOCITY_TYPE } from '@utils/constants.ts';
import SvgAsImg from '@components/svg/svgAsImg.tsx';
import GetVisibility from '@services/axios/get/getVisibilitySVG/getVisibilitySVG.tsx';
import TargetEntry from '../../entry/TargetEntry/TargetEntry';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../../components/wrappers/fieldWrapper/FieldWrapper';
import Target from '../../../utils/types/target';
import GridTargets from '../../../components/grid/targets/GridTargets';
import SpatialImaging from './SpatialImaging/SpatialImaging';
import TargetFileImport from './TargetFileImport/TargetFileImport';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';

export default function TargetListSection() {
  const { t } = useScopedTranslation();
  const { isSV } = useAppFlow();
  const theme = useTheme();
  const { application, updateAppContent2 } = storageObject.useStore();
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [rowTarget, setRowTarget] = React.useState<Target | null>(null);
  const [skyDirection1Error, setSkyDirection1Error] = React.useState('');
  const [skyDirection2Error, setSkyDirection2Error] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [visibilitySVG, setVisibilitySVG] = React.useState(null);
  const { osdCyclePolicy } = useOSDAccessors();
  const autoLink = osdCyclePolicy?.maxTargets === 1 && osdCyclePolicy?.maxObservations === 1;

  const DATA_GRID_HEIGHT = osdCyclePolicy?.maxTargets ? '18vh' : '60vh';

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    if (
      (getProposal()?.targets?.length ?? 0) > (osdCyclePolicy?.maxTargets ?? 0) - 1 &&
      !visibilitySVG
    ) {
      const ra = getProposal()?.targets?.map(target => {
        return { ra: target.raStr };
      });
      const dec = getProposal()?.targets?.map(target => {
        return { dec: target.decStr };
      });
      // only LOW for now
      GetVisibility(ra[0].ra, dec[0].dec, 'LOW').then(response => {
        setVisibilitySVG(response.data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProposal()?.targets, osdCyclePolicy?.maxTargets]);

  const deleteIconClicked = (e: Target) => {
    setRowTarget(e);
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setOpenEditDialog(false);
  };

  const deleteConfirmed = () => {
    // filter out target
    const targets = getProposal().targets?.filter(e => e.id !== rowTarget?.id);
    // filter out targetObservation entries linked to deleted target
    const targetObservations = getProposal().targetObservation?.filter(
      e => e.targetId !== rowTarget?.id
    );
    //below we need to remove all associated entries with the deleted target (these would be automatically created / linked when a target is added)
    if (autoLink) {
      // filter out calibrationStrategy entries from associated targetObservation
      const obsId = getProposal().targetObservation?.find(e => e.targetId === rowTarget?.id)
        ?.observationId;
      const calibrationStrategy =
        getProposal().calibrationStrategy?.[0] !== undefined
          ? getProposal().calibrationStrategy.filter(e => e.observationIdRef !== obsId)
          : undefined;
      const dataProductsSDP = getProposal().dataProductSDP.filter(e => e.observationId !== obsId);
      const observations = getProposal().observations.filter(e => e.id !== obsId);
      setProposal({
        ...getProposal(),
        targets: targets,
        targetObservation: targetObservations,
        calibrationStrategy: calibrationStrategy,
        dataProductSDP: dataProductsSDP,
        observations: observations
      });
    } else {
      setProposal({ ...getProposal(), targets: targets, targetObservation: targetObservations });
    }
    setVisibilitySVG(null); // remove visibility plot display as target is deleted
    setRowTarget(null);
    closeDialog();
  };

  const editIconClicked = (e: Target) => {
    setRowTarget(e);
    setOpenEditDialog(true);
  };

  const editConfirmed = () => {
    if (rowTarget && rowTarget.velType === VELOCITY_TYPE.VELOCITY) {
      rowTarget.redshift = '';
    } else if (rowTarget) {
      rowTarget.vel = '';
    }
    const obs1 = getProposal().targets?.map(rec => {
      return rec.id === rowTarget?.id ? rowTarget : rec;
    });
    setProposal({ ...getProposal(), targets: obs1 });
    setRowTarget(null);
    closeDialog();
  };

  const alertDeleteContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal()?.targets?.find(p => p.id === rowTarget?.id);
    return (
      <Grid
        p={2}
        pb={0}
        container
        direction="column"
        alignItems="center"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('name.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.name}</Typography>
        </FieldWrapper>
        <FieldWrapper
          label={t('skyDirection.label.1.' + RA_TYPE_ICRS.value)}
          labelWidth={LABEL_WIDTH}
        >
          <Typography variant="body1">{rec?.raStr}</Typography>
        </FieldWrapper>
        <FieldWrapper
          label={t('skyDirection.label.2.' + RA_TYPE_ICRS.value)}
          labelWidth={LABEL_WIDTH}
        >
          <Typography variant="body1">{rec?.decStr}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('velocity.0')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.vel}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('velocity.1')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec?.redshift}</Typography>
        </FieldWrapper>

        <Alert
          color={AlertColorTypes.Info}
          text={t('deleteTarget.info')}
          testId="deleteTargetInfoId"
        />
      </Grid>
    );
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const displayRow1 = () => {
    return (
      <Grid
        p={1}
        pt={2}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="centre"
        spacing={4}
        sx={{ height: '100vh', width: '95vw' }}
      >
        <Grid size={{ md: 12, lg: 6 }} order={{ md: 2, lg: 1 }}>
          <Stack>
            <GridTargets
              deleteClicked={deleteIconClicked}
              editClicked={editIconClicked}
              height={DATA_GRID_HEIGHT}
              raType={RA_TYPE_ICRS.value}
              rows={getProposal().targets}
            />
            {visibilitySVG !== null && getProposal()?.targets?.length > 0 && (
              <Box pt={6} px={3}>
                <SvgAsImg svgXml={visibilitySVG} />
              </Box>
            )}
          </Stack>
        </Grid>
        <Grid size={{ md: 12, lg: 6 }} order={{ md: 1, lg: 2 }}>
          <Box
            sx={{
              width: '100%',
              border: isSV() ? '1px solid red' : '1px solid grey',
              borderColor: isSV() ? theme.palette.primary.light : 'grey',
              borderRadius: isSV() ? '16px' : '0'
            }}
          >
            <Tabs
              textColor="secondary"
              indicatorColor="secondary"
              value={value}
              variant="fullWidth"
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab
                label={t('addTarget.label')}
                {...a11yProps(0)}
                sx={{ border: '1px solid grey', width: '100%' }}
              />
              {!isSV() && (
                <Tab
                  label={t('importFromFile.label')}
                  {...a11yProps(1)}
                  sx={{ border: '1px solid grey', width: '100%' }}
                />
              )}
              {!isSV() && (
                <Tab
                  label={t('spatialImaging.label')}
                  {...a11yProps(2)}
                  sx={{ border: '1px solid grey', width: '100%' }}
                />
              )}
            </Tabs>
            {value === 0 && <TargetEntry raType={RA_TYPE_ICRS.value} textAlign="left" />}
            {value === 1 && <TargetFileImport raType={RA_TYPE_ICRS.value} />}
            {value === 2 && <SpatialImaging />}
          </Box>
          <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container direction="row" alignItems="space-evenly" justifyContent="space-evenly">
      {osdCyclePolicy?.maxTargets &&
        (getProposal()?.targets?.length ?? 0) > osdCyclePolicy?.maxTargets - 1 && (
          <Grid size={{ md: 10 }} mb={2}>
            <BorderedSection borderColor={theme.palette.warning.main}>
              <Grid
                container
                direction="row"
                alignItems="space-evenly"
                justifyContent="space-evenly"
              >
                <Grid>
                  {t(
                    osdCyclePolicy?.maxTargets > 1
                      ? 'targets.limitReached_plural'
                      : 'targets.limitReached',
                    {
                      value: osdCyclePolicy?.maxTargets
                    }
                  )}
                </Grid>
              </Grid>
            </BorderedSection>
          </Grid>
        )}
      {displayRow1()}
      {openDeleteDialog && (
        <AlertDialog
          open={openDeleteDialog}
          onClose={closeDialog}
          onDialogResponse={deleteConfirmed}
          title="deleteTarget.label"
          disabled={false} // required attribute
        >
          {alertDeleteContent()}
        </AlertDialog>
      )}
      {openEditDialog && (
        <AlertDialog
          maxWidth="lg"
          open={openEditDialog}
          onClose={closeDialog}
          onDialogResponse={editConfirmed}
          disabled={!!skyDirection1Error || !!skyDirection2Error || !!nameError}
          title="editTarget.label"
        >
          <TargetEntry
            raType={RA_TYPE_ICRS.value}
            setTarget={setRowTarget}
            target={rowTarget ? rowTarget : undefined}
            showBeamData={!!rowTarget?.tiedArrayBeams?.pstBeams}
            onRAFieldErrorChange={setSkyDirection1Error} // Pass callback
            onDecFieldErrorChange={setSkyDirection2Error} // Pass callback
            onNameFieldErrorChange={setNameError} // Pass callback
          />
        </AlertDialog>
      )}
    </Grid>
  );
}
