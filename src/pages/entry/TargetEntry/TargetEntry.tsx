import React from 'react';
import { Box, Grid, InputAdornment, Tooltip } from '@mui/material';
import { storageObject } from '@utils/storage/store';
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
import { generateTargetId, leadZero, trailingZeros } from '@utils/helpers.ts';
import { Proposal } from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import CancelButton from '@/components/button/Cancel/Cancel';
import ResolveButton from '@/components/button/Resolve/Resolve';
import Target from '@/utils/types/target';
import {
  ControlledNumberField,
  ControlledSelect,
  ControlledTextField
} from '@ska-telescope/ska-gui-components/controlled';
import {
  REFERENCE_COORDINATE_OPTIONS,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  SKY_DIRECTION_AXIS,
  SkyDirectionAxis,
  SSO_OPTIONS,
  VELOCITY_UNITS,
  VELOCITY_DEFINITION,
  VELOCITY_TYPE,
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
  TARGET_ENTRY_DEFAULTS,
  TargetEntryType,
  useTargetEntryForm
} from '@/models/proposals/targetEntry';
interface TargetEntryProps {
  // The local form holding the entry, when the parent needs its values (the edit dialog);
  // otherwise the entry keeps its own
  entryForm?: UseFormReturn<TargetEntryType>;
  // The target being edited; leave out when adding a new one
  target?: Target;
  textAlign?: string;
}

const GAP = 2;

// The coordinate inputs each coordinate system shows, bound to the target's own field names
type CoordinateFieldDef = {
  name: 'raStr' | 'decStr' | 'l' | 'b';
  axis: SkyDirectionAxis;
  testId: string;
};
const ICRS_FIELDS: CoordinateFieldDef[] = [
  { name: 'raStr', axis: SKY_DIRECTION_AXIS.LONGITUDE, testId: 'skyDirectionValue1' },
  { name: 'decStr', axis: SKY_DIRECTION_AXIS.LATITUDE, testId: 'skyDirectionValue2' }
];
const GALACTIC_FIELDS: CoordinateFieldDef[] = [
  { name: 'l', axis: SKY_DIRECTION_AXIS.LONGITUDE, testId: 'skyDirectionValue' },
  { name: 'b', axis: SKY_DIRECTION_AXIS.LATITUDE, testId: 'skyDirectionValue' }
];
const DEFAULT_VELOCITY_TYPE = TARGET_ENTRY_DEFAULTS.velType;
const DEFAULT_VELOCITY_UNIT = TARGET_ENTRY_DEFAULTS.velUnit;
const DEFAULT_KIND = TARGET_ENTRY_DEFAULTS.kind;

export default function TargetEntry({
  entryForm = undefined,
  target = undefined
}: TargetEntryProps) {
  const { t } = useScopedTranslation();
  const { autoLink, isSV, osdCyclePolicy } = useOSDAccessors();
  const { axiosClient: authAxiosClient } = useAxiosAuthClient();
  const { notifyError, notifySuccess } = useNotify();

  const { application, updateAppContent2 } = storageObject.useStore();
  const form = useFormContext<ProposalType>();
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  // The entry is held in a small local form, so it is not saved and goes when the entry closes;
  // the targets it adds go to the global form. Each input is bound to the entry form, whose schema
  // checks it as it changes; loading state stays with the page. A new target's name can't repeat
  // one already in the proposal.
  const targets = (useWatch({ control: form.control, name: 'targets' }) ?? []) as Target[];
  const ownEntryForm = useTargetEntryForm(targets.map((rec) => rec.name));
  const entryValues = entryForm ?? ownEntryForm;
  const { control } = entryValues;
  const { isValid } = useFormState({ control });
  // The inputs are bound to the entry form themselves; these values only decide what is shown
  const { name, kind, raStr, decStr, l, b, velType, vel, velUnit, redshift } = useWatch({
    control
  }) as TargetEntryType;

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

  /** Sets values that come from somewhere other than the inputs, checking them as the inputs do. */
  const setEntryValues = (changes: Partial<TargetEntryType>) =>
    (Object.keys(changes) as (keyof TargetEntryType)[]).forEach((key) =>
      entryValues.setValue(key, changes[key] as never, { shouldValidate: true })
    );

  const isSSO = kind === REFERENCE_COORDINATE_TYPE_SSO.value;

  const setTheReferenceCoordinates = (newKind: number) => {
    invalidatePendingResolve();

    // A new coordinate system starts the entry again, without errors
    if (newKind !== kind) {
      entryValues.reset({
        ...entryValues.getValues(),
        kind: newKind,
        name: '',
        raStr: '',
        decStr: '',
        l: '',
        b: '',
        vel: '',
        redshift: ''
      });
    }
  };

  React.useEffect(() => {
    setHelp('name.help');
  }, []);

  const clearForm = () => {
    invalidatePendingResolve();
    entryValues.reset({ ...TARGET_ENTRY_DEFAULTS });
  };

  const addButton = () => {
    // The whole entry is checked before the target is added
    const addButtonAction = () => {
      invalidatePendingResolve();
      return entryValues.handleSubmit(() => AddTheTarget())();
    };

    const AddTheTarget = () => {
      const { name, kind, raStr, decStr, l, b, velType, vel, velUnit, redshift } =
        entryValues.getValues();
      const baseTarget = {
        kind,
        id: generateTargetId(),
        name: name ?? '',
        velUnit: velUnit ?? DEFAULT_VELOCITY_UNIT,
        velocityDefinition: VELOCITY_DEFINITION.RADIO
      };

      const buildTarget = (): Target => {
        switch (kind) {
          case REFERENCE_COORDINATE_TYPE_SSO.value:
            return {
              ...baseTarget,
              vel: '',
              redshift: '',
              velType: DEFAULT_VELOCITY_TYPE
            };

          case REFERENCE_COORDINATE_TYPE_ICRS.value:
            return {
              ...baseTarget,
              velType: velType ?? DEFAULT_VELOCITY_TYPE,
              raStr,
              decStr,
              redshift: velType === VELOCITY_TYPE.REDSHIFT ? (redshift ?? '') : '',
              vel: velType === VELOCITY_TYPE.VELOCITY ? (vel ?? '') : ''
            };

          case REFERENCE_COORDINATE_TYPE_GALACTIC.value:
            return {
              ...baseTarget,
              velType: velType ?? DEFAULT_VELOCITY_TYPE,
              l: Number(l),
              b: Number(b),
              redshift: velType === VELOCITY_TYPE.REDSHIFT ? (redshift ?? '') : '',
              vel: velType === VELOCITY_TYPE.VELOCITY ? (vel ?? '') : ''
            };

          default:
            throw new Error(`Unsupported reference coordinate kind: ${kind}`);
        }
      };

      const newTarget: Target = buildTarget();

      const generateAutoLinkData = async () => {
        const defaults = await linkTarget(
          newTarget,
          getProposal,
          setProposal,
          form,
          authAxiosClient
        );
        if (defaults && defaults.success) {
          notifySuccess(t('autoLink.targetSuccess'), NOTIFICATION_DELAY_IN_SECONDS);
          clearForm();
        } else {
          notifyError(t(defaults?.error ?? 'autoLink.error'), NOTIFICATION_DELAY_IN_SECONDS);
        }
      };

      const addTargetAsync = async () => {
        if (autoLink) {
          generateAutoLinkData();
          return;
        }
        form.setValue('targets', [...(form.getValues('targets') ?? []), newTarget]);
        notifySuccess(t('addTarget.success'), NOTIFICATION_DELAY_IN_SECONDS);
        clearForm();
      };
      addTargetAsync();
    };

    // The schema covers what the entry needs: a name, and coordinates unless it is a solar
    // system object
    const disabled = () =>
      kind === REFERENCE_COORDINATE_TYPE_GALACTIC.value || !isValid || !targetLengthCheck();

    const targetLengthCheck = () => {
      const maxTargets = osdCyclePolicy?.maxTargets;
      return maxTargets == null || targets.length < maxTargets;
    };

    const hasAnyFieldEntered = () => {
      const hasTextValue = [name, raStr, decStr, l, b, vel, redshift].some(
        (value) => value.trim().length > 0
      );
      const hasSelectorChange =
        velType !== DEFAULT_VELOCITY_TYPE || velUnit !== DEFAULT_VELOCITY_UNIT;
      return hasTextValue || hasSelectorChange || kind !== DEFAULT_KIND;
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
          testId={'addTargetButton'}
          title="addTarget.label"
          toolTip={
            kind === REFERENCE_COORDINATE_TYPE_GALACTIC.value
              ? 'addTarget.galacticDisabled'
              : 'addTarget.toolTip'
          }
        />

        {hasAnyFieldEntered() ? (
          <CancelButton
            action={clearForm}
            disabled={resolutionLoading}
            primary={false}
            testId={'clearFormButton'}
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
          setEntryValues({
            l: String(response.reference_coordinate.l),
            b: String(response.reference_coordinate.b)
          });
        } else {
          setEntryValues({
            raStr: response.reference_coordinate.ra_str,
            decStr: response.reference_coordinate.dec_str
          });
        }

        const velocity = response.radial_velocity?.quantity?.value;
        const redshift = response.radial_velocity?.redshift;

        if (redshift && redshift !== 0) {
          setEntryValues({ velType: VELOCITY_TYPE.REDSHIFT, redshift: String(redshift), vel: '' });
        } else {
          setEntryValues({
            velType: VELOCITY_TYPE.VELOCITY,
            vel: velocity != null ? String(velocity) : '',
            redshift: ''
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
          <ResolveButton
            action={() => getCoordinates()}
            disabled={!name || resolutionLoading}
            testId={'resolveButton'}
          />
        )}
      </>
    );
  };

  const isRequired = () => [name, raStr, decStr, l, b].some((value) => value !== '');

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

  const wrapper2 = (children?: React.JSX.Element) => (
    <Box
      sx={{
        p: 0,
        pt: 2,
        height: WRAPPER_HEIGHT
      }}
    >
      {children}
    </Box>
  );

  // Editing an existing target: its coordinate system is fixed, and the dialog
  // confirms the edit
  //instead of the Add button
  const isEditMode = !!target;

  const VELOCITY_TYPE_OPTIONS = [VELOCITY_TYPE.VELOCITY, VELOCITY_TYPE.REDSHIFT].map((e) => ({
    label: t('velocity.' + e + '.label'),
    value: e
  }));
  const VELOCITY_UNIT_OPTIONS = VELOCITY_UNITS.map(({ value }) => ({
    label: t('velocity.units.' + value),
    value
  }));

  const trimEnd = (value: string) => value.trimEnd();
  const tidyCoordinate = (value: string) => trailingZeros(leadZero(value.trimEnd()).toString());

  /**
   * Tidies an input's text when it is left. Only a real change is set, so leaving a field the user
   * has not touched shows no error.
   */
  const tidyOnBlur =
    (
      fieldName: 'name' | 'raStr' | 'decStr' | 'vel' | 'redshift',
      tidy: (value: string) => string
    ) =>
    () => {
      const value = entryValues.getValues(fieldName);
      const tidied = tidy(value);
      if (tidied !== value) {
        entryValues.setValue(fieldName, tidied, { shouldValidate: true });
      }
    };

  const endAdornment = (content: React.ReactNode) => ({
    input: { endAdornment: <InputAdornment position="end">{content}</InputAdornment> }
  });

  const referenceCoordinatesField = () => {
    const disabled = isEditMode || resolutionLoading;
    return wrapper(
      <Tooltip title={disabled ? t('referenceCoordinates.tooltip') : ''}>
        <Box sx={{ pt: 1 }}>
          <ControlledSelect
            name="kind"
            options={REFERENCE_COORDINATE_OPTIONS}
            required
            label={t('referenceCoordinates.label')}
            data-testid="referenceCoordinatesType"
            // A new coordinate system starts the entry again, so it resets the form itself
            withFormUpdate={false}
            onChange={(event) => setTheReferenceCoordinates(Number(event.target.value))}
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
          name="name"
          options={SSO_OPTIONS}
          required
          label={t('name.label')}
          data-testid="solarSystemObjectType"
          onChange={invalidatePendingResolve}
        />
      </Box>
    );

  const fieldPatternTypeField = () =>
    wrapper(
      <Box sx={{ pt: 1 }}>
        <Tooltip title={t('fieldPattern.toolTip')}>
          <ControlledTextField
            name="fieldPattern"
            disabled
            label={t('fieldPattern.label')}
            onFocus={() => setHelp('fieldPattern.help')}
            data-testid="fieldPatternId"
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
        data-testid="name"
        slotProps={!isSSO ? endAdornment(resolveButton()) : undefined}
        onChange={invalidatePendingResolve}
        onBlur={tidyOnBlur('name', trimEnd)}
        onFocus={() => setHelp('name.help')}
        disabled={resolutionLoading}
      />
    );

  // The inputs for the chosen coordinate system: text for ICRS, numbers for Galactic, and none for a
  // solar system object, which is found by name
  const coordinateFields = () => {
    const field = (
      { name: fieldName, axis, testId }: CoordinateFieldDef,
      Entry: typeof ControlledTextField | typeof ControlledNumberField
    ) => (
      <Grid key={fieldName} size={{ md: 12, lg: 6 }}>
        {wrapper(
          <Entry
            name={fieldName}
            required={isRequired()}
            label={t(`skyDirection.label.${axis}.${kind}`)}
            slotProps={endAdornment(t(`skyDirection.units.${axis}.${kind}`))}
            data-testid={testId}
            onChange={invalidatePendingResolve}
            onBlur={
              Entry === ControlledTextField
                ? tidyOnBlur(fieldName as 'raStr' | 'decStr', tidyCoordinate)
                : undefined
            }
            onFocus={() => setHelp(`skyDirection.${axis}`)}
          />
        )}
      </Grid>
    );
    switch (kind) {
      case REFERENCE_COORDINATE_TYPE_ICRS.value:
        return ICRS_FIELDS.map((def) => field(def, ControlledTextField));
      case REFERENCE_COORDINATE_TYPE_GALACTIC.value:
        return GALACTIC_FIELDS.map((def) => field(def, ControlledNumberField));
      default:
        return null;
    }
  };

  const velocityTypeField = () =>
    wrapper2(
      <Box sx={{ pt: 1 }}>
        <ControlledSelect
          name="velType"
          options={VELOCITY_TYPE_OPTIONS}
          required
          data-testid="velocityType"
          onChange={invalidatePendingResolve}
          onFocus={() => setHelp('velocityType')}
        />
      </Box>
    );

  const velocityField = () =>
    wrapper(
      velType === VELOCITY_TYPE.VELOCITY ? (
        <ControlledTextField
          name="vel"
          label={t('velocity.' + velType + '.label')}
          data-testid="velocityValue"
          slotProps={endAdornment(
            <ControlledSelect
              name="velUnit"
              options={VELOCITY_UNIT_OPTIONS}
              data-testid="velocityUnits"
              variant="standard"
              onChange={invalidatePendingResolve}
              onFocus={() => setHelp('velocity.' + velType)}
            />
          )}
          onChange={invalidatePendingResolve}
          onBlur={tidyOnBlur('vel', trimEnd)}
          onFocus={() => setHelp('velocity.' + velType)}
        />
      ) : (
        <ControlledTextField
          name="redshift"
          label={t('velocity.' + velType + '.label')}
          data-testid="redshiftValue"
          onChange={invalidatePendingResolve}
          onBlur={tidyOnBlur('redshift', trimEnd)}
          onFocus={() => setHelp('velocity.' + velType)}
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
                <Grid size={{ md: 12, lg: 6 }}>{velocityTypeField()}</Grid>
                <Grid size={{ md: 12, lg: 6 }}>{velocityField()}</Grid>
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
