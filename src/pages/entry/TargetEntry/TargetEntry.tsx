import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import { useFormContext, useFormState, UseFormReturn, useWatch } from 'react-hook-form';
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
  VelocityType,
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
// Which of these is checked depends on the velocity type, so both are re-checked with any change
const DEPENDENT_FIELDS: (keyof TargetEntryType)[] = ['vel', 'redshift'];

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
  // the targets it adds go to the global form. Its schema does the checking; loading state stays
  // with the page. A new target's name can't repeat one already in the proposal.
  const targets = (useWatch({ control: form.control, name: 'targets' }) ?? []) as Target[];
  const ownEntryForm = useTargetEntryForm(targets.map((rec) => rec.name));
  const entryValues = entryForm ?? ownEntryForm;
  const entry = useWatch({ control: entryValues.control }) as TargetEntryType;
  const { name, kind, coord1, coord2, velType, vel, velUnit, redshift, fieldPattern } = entry;
  const { errors } = useFormState({ control: entryValues.control });
  const errorText = (field: keyof TargetEntryType) => {
    const message = errors[field]?.message;
    return message ? t(message) : '';
  };

  // Only the fields that actually change are checked, so leaving an untouched field shows no error
  const updateEntry = (changes: Partial<TargetEntryType>) => {
    const changed = (Object.keys(changes) as (keyof TargetEntryType)[]).filter(
      (key) => entryValues.getValues(key) !== changes[key]
    );
    if (!changed.length) {
      return;
    }
    changed.forEach((key) => entryValues.setValue(key, changes[key] as never));
    entryValues.trigger([...new Set([...changed, ...DEPENDENT_FIELDS])]);
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

  const setTheName = (inValue: string) => {
    invalidatePendingResolve();
    updateEntry({ name: inValue });
  };

  const isSSO = kind === REFERENCE_COORDINATE_TYPE_SSO.value;

  const setTheCoord1 = (value: string) => {
    invalidatePendingResolve();
    updateEntry({ coord1: value });
  };
  const setTheCoord2 = (value: string) => {
    invalidatePendingResolve();
    updateEntry({ coord2: value });
  };

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

  const setTheRedshift = (inValue: string) => {
    invalidatePendingResolve();
    updateEntry({ redshift: inValue });
  };

  const setTheVel = (inValue: string) => {
    invalidatePendingResolve();
    updateEntry({ vel: inValue });
  };

  const setTheVelType = (inValue: VelocityType) => {
    invalidatePendingResolve();
    updateEntry({ velType: inValue });
  };

  const setTheVelUnit = (inValue: number) => {
    invalidatePendingResolve();
    updateEntry({ velUnit: inValue });
  };

  const blurCoord1 = () => {
    updateEntry({ coord1: trailingZeros(leadZero(coord1.trimEnd()).toString()) });
  };

  const blurCoord2 = () => {
    updateEntry({ coord2: trailingZeros(leadZero(coord2.trimEnd()).toString()) });
  };

  const blurName = () => {
    updateEntry({ name: name.trimEnd() });
  };

  const blurVel = () => {
    updateEntry({ vel: vel.trimEnd() });
  };

  const blurRedshift = () => {
    updateEntry({ redshift: redshift.trimEnd() });
  };

  React.useEffect(() => {
    setHelp('name.help');
  }, []);

  const clearForm = () => {
    invalidatePendingResolve();
    entryValues.reset({ ...TARGET_ENTRY_DEFAULTS });
  };

  const addButton = () => {
    const addButtonAction = async () => {
      invalidatePendingResolve();
      if (await entryValues.trigger()) {
        AddTheTarget();
      }
    };

    const AddTheTarget = () => {
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

    const disabled = () => {
      return (
        kind === REFERENCE_COORDINATE_TYPE_GALACTIC.value ||
        Object.keys(errors).length > 0 ||
        !(name?.length && (isSSO || (coord1?.length && coord2?.length)) && targetLengthCheck())
      );
    };

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
        if (response.reference_coordinate.kind === 'galactic') {
          setTheCoord1(String(response.reference_coordinate.l));
          setTheCoord2(String(response.reference_coordinate.b));
        } else {
          setTheCoord1(response.reference_coordinate.ra_str);
          setTheCoord2(response.reference_coordinate.dec_str);
        }

        const velocity = response.radial_velocity?.quantity?.value;
        const redshift = response.radial_velocity?.redshift;

        if (redshift && redshift !== 0) {
          updateEntry({ velType: VELOCITY_TYPE.REDSHIFT, redshift: String(redshift), vel: '' });
        } else {
          updateEntry({
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

  // this allows for the
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
    wrapper(<SolarSystemObjectField setValue={setTheName} value={name} />);

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
          value={fieldPattern}
          setValue={(value: string) => updateEntry({ fieldPattern: value })}
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
        setValue={setTheName}
        suffix={!isSSO ? resolveButton() : undefined}
        onBlur={blurName}
        onFocus={() => setHelp('name.help')}
        errorText={errorText('name')}
        disabled={resolutionLoading}
      />
    );

  const skyDirection1Field = () =>
    wrapper(
      <SkyDirection1
        required={isRequired()}
        setValue={setTheCoord1}
        skyUnits={kind}
        value={coord1}
        valueBlur={blurCoord1}
        valueFocus={() => setHelp('skyDirection.1')}
        errorText={errorText('coord1')}
      />
    );

  const skyDirection2Field = () =>
    wrapper(
      <SkyDirection2
        required={isRequired()}
        setValue={setTheCoord2}
        skyUnits={kind}
        value={coord2}
        valueFocus={() => setHelp('skyDirection.2')}
        valueBlur={blurCoord2}
        errorText={errorText('coord2')}
      />
    );

  const velocityTypeField = () =>
    wrapper2(
      <VelocityTypeField
        setVelType={setTheVelType}
        velType={velType}
        velTypeFocus={() => setHelp('velocityType')}
      />
    );

  const velocityField = () =>
    wrapper(
      <VelocityField
        setRedshift={setTheRedshift}
        setVel={setTheVel}
        setVelUnit={setTheVelUnit}
        redshift={redshift}
        redshiftBlur={blurRedshift}
        vel={vel}
        velType={velType}
        velUnit={velUnit}
        velFocus={() => setHelp('velocity.' + velType)}
        velUnitFocus={() => setHelp('velocity.' + velType)}
        velBlur={blurVel}
        errorText={errorText(velType === VELOCITY_TYPE.VELOCITY ? 'vel' : 'redshift')}
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
              {velType === VELOCITY_TYPE.VELOCITY}
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
