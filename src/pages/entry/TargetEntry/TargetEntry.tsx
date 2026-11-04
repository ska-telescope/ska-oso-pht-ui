import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import {
  FieldError,
  useController,
  useFormContext,
  useFormState,
  UseFormReturn,
  useWatch
} from 'react-hook-form';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.ts';
import { BorderedSection, TextEntry, Progress } from '@ska-telescope/ska-gui-components';
import GetCoordinates, {
  RESOLVE_ERROR_UNKNOWN,
  ResolveError
} from '@services/axios/get/getCoordinates/getCoordinates';
import ReferenceCoordinatesField from '@components/fields/referenceCoordinates/ReferenceCoordinates.tsx';
import SolarSystemObjectField from '@components/fields/solarSystemObject/solarSystemObject.tsx';
import { generateTargetId, leadZero, trailingZeros } from '@utils/helpers.ts';
import { Proposal } from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import CancelButton from '@/components/button/Cancel/Cancel';
import ResolveButton from '@/components/button/Resolve/Resolve';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';
import VelocityField from '@/components/fields/velocity/Velocity';
import Target from '@/utils/types/target';
import {
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
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
import VelocityTypeField from '@/components/fields/velocityType/VelocityType';
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

  const nameInput = useController({ control, name: 'name' });
  const kindInput = useController({ control, name: 'kind' });
  const coord1Input = useController({ control, name: 'coord1' });
  const coord2Input = useController({ control, name: 'coord2' });
  // Which of velocity and redshift is checked depends on the velocity type
  const velTypeInput = useController({
    control,
    name: 'velType',
    rules: { deps: ['vel', 'redshift'] }
  });
  const velInput = useController({ control, name: 'vel' });
  const velUnitInput = useController({ control, name: 'velUnit' });
  const redshiftInput = useController({ control, name: 'redshift' });
  const fieldPatternInput = useController({ control, name: 'fieldPattern' });

  const name = nameInput.field.value;
  const kind = kindInput.field.value;
  const coord1 = coord1Input.field.value;
  const coord2 = coord2Input.field.value;
  const velType = velTypeInput.field.value;
  const vel = velInput.field.value;
  const velUnit = velUnitInput.field.value;
  const redshift = redshiftInput.field.value;

  /** The translated error RHF holds for an input, if any. */
  const errorText = (input: { fieldState: { error?: FieldError } }) => {
    const message = input.fieldState.error?.message;
    return message ? t(message) : '';
  };

  const [resolutionLoading, setResolutionLoading] = React.useState(false);
  const resolveRevisionRef = React.useRef(0);

  /**
   * Invalidates any pending coordinate-resolution response so it can't overwrite newer edits when
   * it arrives - the underlying GetCoordinates request itself is not aborted.
   */
  const invalidatePendingResolve = () => {
    resolveRevisionRef.current += 1;
    setResolutionLoading(false);
  };

  /** Sets an input as the user edits it; any edit makes a pending resolve out of date. */
  const editOf =
    <T,>(input: { field: { onChange: (value: T) => void } }) =>
    (value: T) => {
      invalidatePendingResolve();
      input.field.onChange(value);
    };

  /**
   * Tidies an input's text when it is left. Only a real change is set, so leaving a field the user
   * has not touched shows no error.
   */
  const tidyOnBlur =
    (
      input: { field: { value: string; onChange: (value: string) => void; onBlur: () => void } },
      tidy: (value: string) => string
    ) =>
    () => {
      const tidied = tidy(input.field.value);
      if (tidied !== input.field.value) {
        input.field.onChange(tidied);
      }
      input.field.onBlur();
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
        coord1: '',
        coord2: '',
        vel: '',
        redshift: ''
      });
    }
  };

  const tidyCoordinate = (value: string) => trailingZeros(leadZero(value.trimEnd()).toString());
  const trimEnd = (value: string) => value.trimEnd();

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
      const { name, kind, coord1, coord2, velType, vel, velUnit, redshift } =
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
              raStr: coord1 ?? '',
              decStr: coord2 ?? '',
              redshift: velType === VELOCITY_TYPE.REDSHIFT ? (redshift ?? '') : '',
              vel: velType === VELOCITY_TYPE.VELOCITY ? (vel ?? '') : ''
            };

          case REFERENCE_COORDINATE_TYPE_GALACTIC.value:
            return {
              ...baseTarget,
              velType: velType ?? DEFAULT_VELOCITY_TYPE,
              l: Number(coord1),
              b: Number(coord2),
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
      const hasTextValue = [name, coord1, coord2, vel, redshift].some(
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
            coord1: String(response.reference_coordinate.l),
            coord2: String(response.reference_coordinate.b)
          });
        } else {
          setEntryValues({
            coord1: response.reference_coordinate.ra_str,
            coord2: response.reference_coordinate.dec_str
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

  const isRequired = () => name !== '' || coord1 !== '' || coord2 !== '';

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

  const referenceCoordinatesField = () =>
    wrapper(
      <ReferenceCoordinatesField
        setValue={setTheReferenceCoordinates}
        value={kind}
        disabled={isEditMode || resolutionLoading}
      />
    );

  const solarSystemObjectField = () =>
    wrapper(<SolarSystemObjectField setValue={editOf(nameInput)} value={name} />);

  const fieldPatternTypeField = () => {
    return wrapper(
      <Box
        sx={{
          pt: 1
        }}
      >
        <TextEntry
          disabled={true}
          label={t('fieldPattern.label')}
          onFocus={() => setHelp('fieldPattern.help')}
          testId="fieldPatternId"
          value={fieldPatternInput.field.value}
          setValue={fieldPatternInput.field.onChange}
          toolTip={t('fieldPattern.toolTip')}
        />
      </Box>
    );
  };
  const nameField = () =>
    wrapper(
      <TextEntry
        required={isRequired()}
        label={t('name.label')}
        testId={'name'}
        value={name}
        setValue={editOf(nameInput)}
        suffix={!isSSO ? resolveButton() : undefined}
        onBlur={tidyOnBlur(nameInput, trimEnd)}
        onFocus={() => setHelp('name.help')}
        errorText={errorText(nameInput)}
        disabled={resolutionLoading}
      />
    );

  const skyDirection1Field = () =>
    wrapper(
      <SkyDirection1
        required={isRequired()}
        setValue={editOf(coord1Input)}
        skyUnits={kind}
        value={coord1}
        valueBlur={tidyOnBlur(coord1Input, tidyCoordinate)}
        valueFocus={() => setHelp('skyDirection.1')}
        errorText={errorText(coord1Input)}
      />
    );

  const skyDirection2Field = () =>
    wrapper(
      <SkyDirection2
        required={isRequired()}
        setValue={editOf(coord2Input)}
        skyUnits={kind}
        value={coord2}
        valueFocus={() => setHelp('skyDirection.2')}
        valueBlur={tidyOnBlur(coord2Input, tidyCoordinate)}
        errorText={errorText(coord2Input)}
      />
    );

  const velocityTypeField = () =>
    wrapper2(
      <VelocityTypeField
        setVelType={editOf(velTypeInput)}
        velType={velType}
        velTypeFocus={() => setHelp('velocityType')}
      />
    );

  const velocityField = () =>
    wrapper(
      <VelocityField
        setRedshift={editOf(redshiftInput)}
        setVel={editOf(velInput)}
        setVelUnit={editOf(velUnitInput)}
        redshift={redshift}
        redshiftBlur={tidyOnBlur(redshiftInput, trimEnd)}
        vel={vel}
        velType={velType}
        velUnit={velUnit}
        velFocus={() => setHelp('velocity.' + velType)}
        velUnitFocus={() => setHelp('velocity.' + velType)}
        velBlur={tidyOnBlur(velInput, trimEnd)}
        errorText={errorText(velType === VELOCITY_TYPE.VELOCITY ? velInput : redshiftInput)}
      />
    );

  return (
    <>
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
                <Grid size={{ md: 12, lg: 6 }}>{skyDirection1Field()}</Grid>
                <Grid size={{ md: 12, lg: 6 }}>{skyDirection2Field()}</Grid>
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
    </>
  );
}
