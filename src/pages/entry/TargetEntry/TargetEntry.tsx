import React from 'react';
import { Box, Grid, InputAdornment, Tooltip } from '@mui/material';
import {
  FormProvider,
  useFormContext,
  useFormState,
  UseFormReturn,
  useWatch
} from 'react-hook-form';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.ts';
import { BorderedSection, Progress } from '@ska-telescope/ska-gui-components';
import GetCoordinates, {
  RESOLVE_ERROR_UNKNOWN,
  ResolveError
} from '@services/axios/get/getCoordinates/getCoordinates';
import AddButton from '@/components/button/Add/Add';
import CancelButton from '@/components/button/Cancel/Cancel';
import ResolveButton from '@/components/button/Resolve/Resolve';
import {
  ControlledNumberField,
  ControlledSelect,
  ControlledTextField
} from '@ska-telescope/ska-gui-components/controlled';
import {
  SKY_DIRECTION_AXIS,
  SkyDirectionAxis,
  SSO_OPTIONS,
  VELOCITY_UNITS,
  VelocityUnit,
  WRAPPER_HEIGHT,
  NOTIFICATION_DELAY_IN_SECONDS
} from '@/utils/constants';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { linkTarget } from '@/utils/autoLinking/AutoLinking';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { ProposalType } from '@/models/proposals/proposal';
import {
  RADIAL_MOTION_TYPE,
  RadialMotionType,
  REFERENCE_COORDINATE_KIND,
  ReferenceCoordinateKind,
  TargetInput
} from '@/models/proposals/targets';
import { newTargetEntry, useTargetEntryForm } from '@/models/proposals/targetEntry';
import { PointingKind } from '@/generated/models';
interface TargetEntryProps {
  // The local form holding the entry, when the parent needs its values (the edit dialog);
  // otherwise the entry keeps its own
  entryForm?: UseFormReturn<TargetInput>;
  // The target being edited; leave out when adding a new one
  target?: TargetInput;
  textAlign?: string;
}

const GAP = 2;

const REFERENCE_COORDINATE_OPTIONS = [
  { label: 'ICRS', value: REFERENCE_COORDINATE_KIND.ICRS },
  { label: 'Galactic', value: REFERENCE_COORDINATE_KIND.GALACTIC },
  { label: 'Solar System Object', value: REFERENCE_COORDINATE_KIND.SPECIAL }
];

// The PDM's pointing patterns, shown by their PDM names until the PHT has text for them
const FIELD_PATTERN_TYPE_OPTIONS = Object.values(PointingKind).map((kind) => ({
  label: kind,
  value: kind
}));

// The coordinate systems' and radial motion types' numbers in the translations
const SKY_DIRECTION_TRANSLATION = {
  [REFERENCE_COORDINATE_KIND.ICRS]: 0,
  [REFERENCE_COORDINATE_KIND.GALACTIC]: 1
} as const;
const RADIAL_MOTION_TRANSLATION = {
  [RADIAL_MOTION_TYPE.VELOCITY]: 'velocity.0',
  [RADIAL_MOTION_TYPE.REDSHIFT]: 'velocity.1'
} as const;

// The coordinate inputs each coordinate system shows
type CoordinateFieldDef = {
  name:
    | 'referenceCoordinate.raStr'
    | 'referenceCoordinate.decStr'
    | 'referenceCoordinate.l'
    | 'referenceCoordinate.b';
  axis: SkyDirectionAxis;
};
const ICRS_FIELDS: CoordinateFieldDef[] = [
  { name: 'referenceCoordinate.raStr', axis: SKY_DIRECTION_AXIS.LONGITUDE },
  { name: 'referenceCoordinate.decStr', axis: SKY_DIRECTION_AXIS.LATITUDE }
];
const GALACTIC_FIELDS: CoordinateFieldDef[] = [
  { name: 'referenceCoordinate.l', axis: SKY_DIRECTION_AXIS.LONGITUDE },
  { name: 'referenceCoordinate.b', axis: SKY_DIRECTION_AXIS.LATITUDE }
];

// A new radial motion of a type: none yet, in the unit given
const newRadialMotion = (
  type: RadialMotionType,
  unit: VelocityUnit = 'km / s'
): TargetInput['radialMotion'] =>
  type === RADIAL_MOTION_TYPE.VELOCITY
    ? { type, velocity: { value: 0, unit } }
    : { type, redshift: 0 };

export default function TargetEntry({
  entryForm = undefined,
  target = undefined
}: TargetEntryProps) {
  const { t } = useScopedTranslation();
  const { autoLink, isSV, osdCyclePolicy, osdLOW } = useOSDAccessors();
  const { axiosClient: authAxiosClient } = useAxiosAuthClient();
  const { notifyError, notifySuccess } = useNotify();

  const form = useFormContext<ProposalType>();
  const { setHelp } = useHelp();

  // The entry is held in a small local form, so it is not saved and goes when the entry closes;
  // the targets it adds go to the global form. Each input is bound to the entry form, whose schema
  // checks it as it changes; loading state stays with the page. A target's name can't repeat
  // another's in the proposal.
  const targets = useWatch({ control: form.control, name: 'targets' }) ?? [];
  const ownEntryForm = useTargetEntryForm(targets);
  const entryValues = entryForm ?? ownEntryForm;
  const { control } = entryValues;
  const { isValid } = useFormState({ control });
  // The inputs are bound to the entry form themselves; these values only decide what is shown
  const entry = useWatch({ control }) as TargetInput;
  const { name, referenceCoordinate, radialMotion } = entry;
  const kind = referenceCoordinate.kind;

  const [resolutionLoading, setResolutionLoading] = React.useState(false);
  const resolveRevisionRef = React.useRef(0);

  /**
   * Invalidates any pending coordinate-resolution response so it can't overwrite newer edits when
   * it arrives - the underlying GetCoordinates request itself is not aborted. Any edit does this.
   */
  const invalidatePendingResolve = () => {
    resolveRevisionRef.current += 1;
    setResolutionLoading(false);
  };

  const isSSO = kind === REFERENCE_COORDINATE_KIND.SPECIAL;

  const setTheReferenceCoordinates = (newKind: ReferenceCoordinateKind) => {
    invalidatePendingResolve();

    // A new coordinate system starts the entry again, without errors, keeping only its ID, the
    // field pattern type, and the radial motion type and unit. A solar system object has its own radial
    // motion.
    if (newKind !== kind) {
      const { id, fieldPatternType, radialMotion: kept } = entryValues.getValues();
      const radialMotionKept =
        newKind === REFERENCE_COORDINATE_KIND.SPECIAL || kind === REFERENCE_COORDINATE_KIND.SPECIAL
          ? {}
          : {
              radialMotion: newRadialMotion(
                kept.type,
                kept.type === RADIAL_MOTION_TYPE.VELOCITY ? kept.velocity.unit : undefined
              )
            };
      entryValues.reset(newTargetEntry(newKind, { id, fieldPatternType, ...radialMotionKept }));
    }
  };

  // A new type starts its value again, as velocity and redshift are not both kept
  const setTheRadialMotionType = (type: RadialMotionType) => {
    invalidatePendingResolve();
    entryValues.setValue('radialMotion', newRadialMotion(type), { shouldValidate: true });
  };

  // A solar system object is found by its name, which is also the target's name
  const setTheSolarSystemObject = (objectName: string) => {
    invalidatePendingResolve();
    entryValues.setValue('name', objectName, { shouldValidate: true });
  };

  React.useEffect(() => {
    setHelp('name.help');
  }, []);

  const clearForm = () => {
    invalidatePendingResolve();
    entryValues.reset(newTargetEntry());
  };

  const addButton = () => {
    // The whole entry is checked before the target is added
    const addButtonAction = () => {
      invalidatePendingResolve();
      return entryValues.handleSubmit(AddTheTarget)();
    };

    // The entry as the schema parsed it, so its text is trimmed
    const AddTheTarget = (added: TargetInput) => {
      const generateAutoLinkData = async () => {
        await linkTarget(
          added,
          form,
          authAxiosClient,
          osdLOW?.basicCapabilities?.minElevationDeg ?? null
        );
        clearForm();
      };

      const addTargetAsync = async () => {
        if (autoLink) {
          generateAutoLinkData();
          return;
        }
        form.setValue('targets', [...(form.getValues('targets') ?? []), added]);
        notifySuccess(t('addTarget.success'), NOTIFICATION_DELAY_IN_SECONDS);
        clearForm();
      };
      addTargetAsync();
    };

    // The schema covers what the entry needs: a name, and coordinates unless it is a solar
    // system object
    const disabled = () =>
      kind === REFERENCE_COORDINATE_KIND.GALACTIC || !isValid || !targetLengthCheck();

    const targetLengthCheck = () => {
      const maxTargets = osdCyclePolicy?.maxTargets;
      return maxTargets == null || targets.length < maxTargets;
    };

    // Anything other than a new entry's values, the ID aside
    const hasAnyFieldEntered = () => {
      const { id: _, ...entered } = entry;
      const { id: __, ...empty } = newTargetEntry();
      return JSON.stringify(entered) !== JSON.stringify(empty);
    };

    return (
      <Grid
        size={{ xs: 12 }}
        sx={{
          mb: 4,
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          width: '90%'
        }}
      >
        <AddButton
          action={addButtonAction}
          disabled={disabled()}
          primary
          title="addTarget.label"
          toolTip={
            kind === REFERENCE_COORDINATE_KIND.GALACTIC
              ? 'addTarget.galacticDisabled'
              : 'addTarget.toolTip'
          }
        />

        {hasAnyFieldEntered() ? (
          <CancelButton
            action={clearForm}
            disabled={resolutionLoading}
            primary={false}
            ariaLabel="clearBtn.label"
            title="clearBtn.label"
            toolTip="addTarget.clearToolTip"
          />
        ) : null}
      </Grid>
    );
  };

  const resolveButton = () => {
    /**
     * Shows why the name could not be resolved in an error pop-up: the backend's message when it
     * sent one, otherwise our own for the kind of failure.
     */
    const showResolveError = (response?: ResolveError) => {
      notifyError(
        response?.message ?? t('resolve.error.' + (response?.error ?? RESOLVE_ERROR_UNKNOWN)),
        NOTIFICATION_DELAY_IN_SECONDS
      );
    };

    /** Sets a value the resolve found, checking it as the inputs do. */
    const setResolved = (...[field, value]: Parameters<typeof entryValues.setValue>) =>
      entryValues.setValue(field, value, { shouldValidate: true });

    /**
     * Applies a coordinate-resolve response to the form, unless it's been superseded.
     */
    const processCoordinatesResults = (response: any, requestRevision: number) => {
      if (resolveRevisionRef.current !== requestRevision) {
        return;
      }

      if (response && !response.error) {
        invalidatePendingResolve();
        if (response.reference_coordinate.kind === 'galactic') {
          setResolved('referenceCoordinate.l', response.reference_coordinate.l);
          setResolved('referenceCoordinate.b', response.reference_coordinate.b);
        } else {
          setResolved('referenceCoordinate.raStr', response.reference_coordinate.ra_str);
          setResolved('referenceCoordinate.decStr', response.reference_coordinate.dec_str);
        }

        const velocity = response.radial_velocity?.quantity?.value;
        const redshift = response.radial_velocity?.redshift;

        if (redshift && redshift !== 0) {
          setResolved('radialMotion', { type: RADIAL_MOTION_TYPE.REDSHIFT, redshift });
        } else {
          const unit =
            radialMotion.type === RADIAL_MOTION_TYPE.VELOCITY
              ? radialMotion.velocity.unit
              : 'km / s';
          setResolved('radialMotion', {
            type: RADIAL_MOTION_TYPE.VELOCITY,
            velocity: { value: velocity ?? 0, unit }
          });
        }
      } else {
        showResolveError(response);
      }
    };

    /**
     * Resolves the entered target name to coordinates, tracking the request's revision so a
     * later edit or resolve click can't be overwritten by an earlier, slower response.
     */
    const getCoordinates = async () => {
      if (kind === REFERENCE_COORDINATE_KIND.SPECIAL) {
        return;
      }
      const requestRevision = resolveRevisionRef.current;
      const requestName = name;

      setResolutionLoading(true);

      try {
        const response = await GetCoordinates(requestName, kind);
        processCoordinatesResults(response, requestRevision);
      } catch {
        if (resolveRevisionRef.current === requestRevision) {
          showResolveError(undefined);
        }
      } finally {
        if (resolveRevisionRef.current === requestRevision) {
          setResolutionLoading(false);
        }
      }
    };

    return (
      <>
        {resolutionLoading ? (
          <Progress size={20} />
        ) : (
          <ResolveButton action={() => getCoordinates()} disabled={!name || resolutionLoading} />
        )}
      </>
    );
  };

  // Required once anything is entered
  const coordinatesEntered = () => {
    switch (referenceCoordinate.kind) {
      case REFERENCE_COORDINATE_KIND.ICRS:
        return referenceCoordinate.raStr !== '' || referenceCoordinate.decStr !== '';
      case REFERENCE_COORDINATE_KIND.GALACTIC:
        return referenceCoordinate.l !== null || referenceCoordinate.b !== null;
      default:
        return false;
    }
  };
  const isRequired = () => name !== '' || coordinatesEntered();

  const wrapper = (children?: React.JSX.Element) => (
    <Box
      sx={{
        p: 0,
        pt: 1,
        height: WRAPPER_HEIGHT
      }}
    >
      {children}
    </Box>
  );

  // Editing an existing target: its coordinate system is fixed, and the dialog
  // confirms the edit instead of the Add button
  const isEditMode = !!target;

  const RADIAL_MOTION_TYPE_OPTIONS = [RADIAL_MOTION_TYPE.VELOCITY, RADIAL_MOTION_TYPE.REDSHIFT].map(
    (type) => ({ label: t(RADIAL_MOTION_TRANSLATION[type] + '.label'), value: type })
  );
  const VELOCITY_UNIT_OPTIONS = VELOCITY_UNITS.map((unit) => ({ label: unit, value: unit }));

  const endAdornment = (content: React.ReactNode) => ({
    input: { endAdornment: <InputAdornment position="end">{content}</InputAdornment> }
  });

  const referenceCoordinatesField = () => {
    const disabled = isEditMode || resolutionLoading;
    return wrapper(
      <Tooltip title={disabled ? t('referenceCoordinates.tooltip') : ''}>
        <Box sx={{ pt: 1 }}>
          <ControlledSelect
            name="referenceCoordinate.kind"
            options={REFERENCE_COORDINATE_OPTIONS}
            required
            label={t('referenceCoordinates.label')}
            // A new coordinate system starts the entry again, so it resets the form itself
            withFormUpdate={false}
            onChange={(event) =>
              setTheReferenceCoordinates(event.target.value as ReferenceCoordinateKind)
            }
            disabled={disabled}
          />
        </Box>
      </Tooltip>
    );
  };

  const solarSystemObjectField = () =>
    wrapper(
      <Box sx={{ pt: 1 }}>
        <ControlledSelect
          name="referenceCoordinate.name"
          options={SSO_OPTIONS}
          required
          label={t('name.label')}
          onChange={(event) => setTheSolarSystemObject(event.target.value as string)}
        />
      </Box>
    );

  const fieldPatternTypeField = () =>
    wrapper(
      <Box sx={{ pt: 1 }}>
        <Tooltip title={t('fieldPattern.toolTip')}>
          <ControlledSelect
            name="fieldPatternType"
            options={FIELD_PATTERN_TYPE_OPTIONS}
            disabled
            label={t('fieldPattern.label')}
            onFocus={() => setHelp('fieldPattern.help')}
          />
        </Tooltip>
      </Box>
    );

  const nameField = () =>
    wrapper(
      <ControlledTextField
        name="name"
        required={isRequired()}
        label={t('name.label')}
        slotProps={!isSSO ? endAdornment(resolveButton()) : undefined}
        onChange={invalidatePendingResolve}
        onFocus={() => setHelp('name.help')}
        disabled={resolutionLoading}
      />
    );

  // The inputs for the chosen coordinate system: text for ICRS, degrees for Galactic, and none for
  // a solar system object, which is found by name
  const coordinateFields = () => {
    if (kind === REFERENCE_COORDINATE_KIND.SPECIAL) {
      return null;
    }
    const translated = SKY_DIRECTION_TRANSLATION[kind];
    const fieldProps = ({ name: fieldName, axis }: CoordinateFieldDef) => ({
      name: fieldName,
      required: isRequired(),
      label: t(`skyDirection.label.${axis}.${translated}`),
      slotProps: endAdornment(t(`skyDirection.units.${axis}.${translated}`)),
      onChange: invalidatePendingResolve,
      onFocus: () => setHelp(`skyDirection.${axis}`)
    });
    switch (kind) {
      case REFERENCE_COORDINATE_KIND.ICRS:
        return ICRS_FIELDS.map((def) => (
          <Grid key={def.name} size={{ md: 12, lg: 6 }}>
            {wrapper(<ControlledTextField {...fieldProps(def)} />)}
          </Grid>
        ));
      case REFERENCE_COORDINATE_KIND.GALACTIC:
        return GALACTIC_FIELDS.map((def) => (
          <Grid key={def.name} size={{ md: 12, lg: 6 }}>
            {wrapper(<ControlledNumberField {...fieldProps(def)} />)}
          </Grid>
        ));
    }
  };

  const velocityTypeField = () =>
    wrapper(
      <ControlledSelect
        name="radialMotion.type"
        options={RADIAL_MOTION_TYPE_OPTIONS}
        label={t('velocityType.label')}
        // Velocity and redshift have their own fields, so a new type replaces the radial motion
        withFormUpdate={false}
        onChange={(event) => setTheRadialMotionType(event.target.value as RadialMotionType)}
        onFocus={() => setHelp('velocityType')}
      />
    );

  const radialMotionKey = RADIAL_MOTION_TRANSLATION[radialMotion.type];
  const velocityField = () =>
    wrapper(
      radialMotion.type === RADIAL_MOTION_TYPE.VELOCITY ? (
        <Grid container spacing={0.5}>
          <Grid size={9}>
            <ControlledNumberField
              name="radialMotion.velocity.value"
              label={t(radialMotionKey + '.label')}
              onChange={invalidatePendingResolve}
              onFocus={() => setHelp(radialMotionKey)}
            />
          </Grid>
          <Grid size={3}>
            <ControlledSelect
              name="radialMotion.velocity.unit"
              options={VELOCITY_UNIT_OPTIONS}
              onChange={invalidatePendingResolve}
              onFocus={() => setHelp(radialMotionKey)}
            />
          </Grid>
        </Grid>
      ) : (
        <ControlledNumberField
          name="radialMotion.redshift"
          label={t(radialMotionKey + '.label')}
          onChange={invalidatePendingResolve}
          onFocus={() => setHelp(radialMotionKey)}
        />
      )
    );

  // The inputs below find the entry form through this provider
  return (
    <FormProvider {...entryValues}>
      <Grid
        sx={{
          pt: 4
        }}
      >
        <Box
          sx={{
            pl: 10,
            justifyContent: 'center',
            alignItems: 'center',
            width: '90%'
          }}
        >
          <BorderedSection title={t('referenceCoordinates.label')}>
            {referenceCoordinatesField()}
          </BorderedSection>
        </Box>
      </Grid>
      <Grid
        sx={{
          pt: 1
        }}
      >
        <Box
          sx={{
            pl: 10,
            justifyContent: 'center',
            alignItems: 'center',
            width: '90%'
          }}
        >
          <BorderedSection title={t('coordinate.label')}>
            {isSSO ? solarSystemObjectField() : nameField()}
            {!isSSO && (
              <Grid
                container
                spacing={GAP}
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                {coordinateFields()}
              </Grid>
            )}
          </BorderedSection>
        </Box>
      </Grid>
      {!isSSO && (
        <Grid
          sx={{
            pt: 1
          }}
        >
          <Box
            sx={{
              pl: 10,
              justifyContent: 'center',
              alignItems: 'center',
              width: '90%'
            }}
          >
            <BorderedSection title={t('radialMotion.label')}>
              <Grid
                container
                spacing={GAP}
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Grid size={6}>{velocityTypeField()}</Grid>
                <Grid size={6}>{velocityField()}</Grid>
              </Grid>
            </BorderedSection>
          </Box>
        </Grid>
      )}
      {!isSV && (
        <Grid
          sx={{
            pt: 1
          }}
        >
          <Box
            sx={{
              pl: 10,
              justifyContent: 'center',
              alignItems: 'center',
              width: '90%'
            }}
          >
            <BorderedSection title={t('fieldPattern.groupLabel')}>
              {fieldPatternTypeField()}
            </BorderedSection>
          </Box>
        </Grid>
      )}
      {!isEditMode && (
        <Grid
          sx={{
            pl: 10
          }}
        >
          {addButton()}
        </Grid>
      )}
    </FormProvider>
  );
}
