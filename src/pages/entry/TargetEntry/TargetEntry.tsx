import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { BorderedSection, TextEntry } from '@ska-telescope/ska-gui-components';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates';
import ReferenceCoordinatesField from '@components/fields/referenceCoordinates/ReferenceCoordinates.tsx';
import { leadZero, trailingZeros } from '@utils/helpers.ts';
import { Proposal } from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import ResolveButton from '@/components/button/Resolve/Resolve';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';
import VelocityField from '@/components/fields/velocity/Velocity';
import Target from '@/utils/types/target';
import {
  REFERENCE_COORDINATE_TYPE_ICRS,
  VELOCITY_TYPE,
  FIELD_PATTERN_POINTING_CENTRES,
  WRAPPER_HEIGHT,
  TYPE_PST,
  TYPE_ZOOM,
  TYPE_CONTINUUM,
  NOTIFICATION_DELAY_IN_SECONDS, REFERENCE_COORDINATE_TYPE_GALACTIC
} from '@/utils/constants';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import autoLinking from '@/utils/autoLinking/AutoLinking';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import VelocityTypeField from '@/components/fields/velocityType/VelocityType';
interface TargetEntryProps {
  setTarget?: Function;
  target?: Target;
  textAlign?: string;
  onCoord1FieldErrorChange?: (error: string) => void;
  onCoord2FieldErrorChange?: (error: string) => void;
  onNameFieldErrorChange?: (error: string) => void;
}

const GAP = 2;

export default function TargetEntry({
  setTarget = undefined,
  target = undefined,
  onCoord1FieldErrorChange,
  onCoord2FieldErrorChange,
  onNameFieldErrorChange
}: TargetEntryProps) {
  const { t } = useScopedTranslation();
  const { autoLink, isSV } = useOSDAccessors();
  const { notifyError, notifySuccess } = useNotify();

  const { application, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [skyDirection1Error, setSkyDirection1Error] = React.useState('');
  const [skyDirection2Error, setSkyDirection2Error] = React.useState('');
  const [rmFieldError, setRmFieldError] = React.useState('');
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [id, setId] = React.useState(0);
  const [name, setName] = React.useState('');
  const [coord1, setCoord1] = React.useState('');
  const [coord2, setCoord2] = React.useState('');
  const [velType, setVelType] = React.useState(0);
  const [vel, setVel] = React.useState('');
  const [velUnit, setVelUnit] = React.useState(0);
  const [redshift, setRedshift] = React.useState('');
  const [referenceCoordinates, setReferenceCoordinates] = React.useState(REFERENCE_COORDINATE_TYPE_ICRS.value);
  const [fieldPattern, setFieldPattern] = React.useState(FIELD_PATTERN_POINTING_CENTRES);

  React.useEffect(() => {
    if (nameFieldError === t('addTarget.error')) {
      if (formValidation()) {
        setNameFieldError('');
      }
    }
  }, [name]);

  React.useEffect(() => {
    if (onCoord1FieldErrorChange) {
      onCoord1FieldErrorChange(skyDirection1Error); // Notify parent
    }
  }, [skyDirection1Error]);

  React.useEffect(() => {
    if (onCoord2FieldErrorChange) {
      onCoord2FieldErrorChange(skyDirection2Error); // Notify parent
    }
  }, [skyDirection2Error]);

  React.useEffect(() => {
    if (onNameFieldErrorChange) {
      onNameFieldErrorChange(nameFieldError); // Notify parent
    }
  }, [nameFieldError]);

  const setTheName = (inValue: string) => {
    setName(inValue);
    if (!inValue.trim()) {
      setNameFieldError(t('addTarget.valueError'));
    } else {
      setNameFieldError('');
    }
    if (setTarget) {
      setTarget({ ...target, name: inValue });
    }
  };

  const isICRS =
  referenceCoordinates === REFERENCE_COORDINATE_TYPE_ICRS.value;


  const setTheCoord1 = (value: string) => {
  setCoord1(value);

  if (!setTarget) return;

  if (isICRS) {
    setTarget({
      ...target,
      raStr: leadZero(value).toString()
    });
  } else {
        setTarget({
      ...target,
      l: parseFloat(value)
    });
  }
};
  const setTheCoord2 = (value: string) => {
    setCoord2(value);

    if (!setTarget) return;

    if (isICRS) {
      setTarget({
        ...target,
        decStr: leadZero(value).toString()
      });
    } else {
      setTarget({
        ...target,
        b: parseFloat(value)
      });
    }
  };

  const setTheReferenceCoordinates = (newKind: number) => {
  if (newKind !== referenceCoordinates) {
    setName('');
    setCoord1('');
    setCoord2('');
    setVel('');
    setRedshift('');

    setSkyDirection1Error('');
    setSkyDirection2Error('');
    setRmFieldError('');
    setNameFieldError('');
  }

  setReferenceCoordinates(newKind);

  if (setTarget) {
    setTarget({
      ...target,
      kind: newKind
    });
  }
};

  const setTheRedshift = (inValue: string) => {
    setRedshift(inValue);
    if (setTarget) {
      setTarget({ ...target, redshift: inValue });
    }
  };

  const setTheVel = (inValue: string) => {
    setVel(inValue);
    if (setTarget) {
      setTarget({ ...target, vel: inValue });
    }
  };

  const setTheVelType = (inValue: number) => {
    setVelType(inValue);
    if (setTarget) {
      setTarget({ ...target, velType: inValue });
    }
  };

  const setTheVelUnit = (inValue: number) => {
    setVelUnit(inValue);
    if (setTarget) {
      setTarget({ ...target, velUnit: inValue });
    }
  };

  const targetIn = (target: Target) => {
    const incomingKind = target?.kind ?? REFERENCE_COORDINATE_TYPE_ICRS.value;
    const incomingIsICRS = incomingKind === REFERENCE_COORDINATE_TYPE_ICRS.value;
    setReferenceCoordinates(incomingKind);
    setId(target?.id ?? 0);
    setName(target?.name ?? '');
    setCoord1(
      incomingIsICRS
        ? target.raStr ?? ''
        : target.l != null
          ? String(target.l)
          : ''
    );
    setCoord2(
      incomingIsICRS
        ? target.decStr ?? ''
        : target.b != null
          ? String(target.b)
          : ''
    );
    setVelType(target?.velType ?? 0);
    setVel(target?.vel ?? '');
    setVelUnit(target?.velUnit ?? 0);
    setRedshift(target?.redshift ?? '');
  };


  const blurCoord1 = () => {
    setCoord1(trailingZeros(leadZero(coord1.trimEnd()).toString()));
  };

  const blurCoord2 = () => {
    setCoord2(trailingZeros(leadZero(coord2.trimEnd()).toString()));
  };

  const blurName = () => {
    const formatted = name.trimEnd();
    setName(formatted);
    if (setTarget) setTarget({ ...target, name: formatted });
  };


  const blurVel = () => {
    setVel(vel.trimEnd());
  };

  const blurRedshift = () => {
    setRedshift(redshift.trimEnd());
  };


  React.useEffect(() => {
    setHelp('name.help');
    if (target) {
      targetIn(target);
    }
  }, []);

  function formValidation() {
    let valid = true;
    const targets = getProposal()?.targets;
    targets?.forEach(rec => {
      if (rec.name.toLowerCase() === name.toLowerCase()) {
        valid = false;
        setNameFieldError(t('addTarget.error'));
      }
    });
    return valid;
  }

  const addButton = () => {
    const addButtonAction = () => {
      if (!formValidation()) {
        return;
      } else {
        AddTheTarget();
      }
    };

    const AddTheTarget = () => {
      const highest = getProposal()?.targets?.length
        ? getProposal()?.targets?.reduce((prev, current) =>
            prev && prev.id > current.id ? prev : current
          )
        : null;
      const highestId = highest ? highest.id : 0;

        const isICRS =
    referenceCoordinates === REFERENCE_COORDINATE_TYPE_ICRS.value;

      const newTarget: Target = {
        kind: referenceCoordinates,
        id: highestId + 1,
        name: name ?? '',

        ...(isICRS
          ? {
              raStr: coord1 ?? '',
              decStr: coord2 ?? ''
            }
          : {
              l: Number(coord1),
              b: Number(coord2)
            }),

        redshift: velType === VELOCITY_TYPE.REDSHIFT ? redshift ?? '' : '',
        vel: velType === VELOCITY_TYPE.VELOCITY ? vel ?? '' : '',
        velType: velType ?? 0,
        velUnit: velUnit ?? 0
      };

      const generateAutoLinkData = async () => {
        const defaults = await autoLinking(newTarget, getProposal, setProposal);
        if (defaults && defaults.success) {
          notifySuccess(t('autoLink.targetSuccess'), NOTIFICATION_DELAY_IN_SECONDS);
          clearForm();
        } else {
          notifyError(defaults?.error ?? t('autoLink.error'), NOTIFICATION_DELAY_IN_SECONDS);
        }
      };

      const addTargetAsync = async () => {
        const proposal = getProposal();
        if (
          (autoLink && proposal.scienceCategory === TYPE_CONTINUUM) ||
          proposal.scienceCategory === TYPE_ZOOM ||
          proposal.scienceCategory === TYPE_PST
        ) {
          generateAutoLinkData();
          return;
        }
        const updatedProposal = {
          ...getProposal(),
          targets: [...(getProposal().targets ?? []), newTarget]
        };
        setProposal(updatedProposal);
        notifySuccess(t('addTarget.success'), NOTIFICATION_DELAY_IN_SECONDS);
        clearForm();
      };
      addTargetAsync();
    };

    const clearForm = () => {
      setName('');
      setCoord1('');
      setCoord2('');
      setVel('');
      setRedshift('');
    };

    const disabled = () => {
      return (
        referenceCoordinates === REFERENCE_COORDINATE_TYPE_GALACTIC.value ||
        nameFieldError !== '' ||
        skyDirection1Error !== '' ||
        skyDirection2Error !== '' ||
        rmFieldError !== '' ||
        !(name?.length && coord1?.length && coord2?.length && targetLengthCheck())
      );
    };

    const targetLengthCheck = () => {
      return isSV ? getProposal()?.targets?.length === 0 : true;
    };

    return (
      <Grid size={{ xs: 12 }} sx={{ position: 'relative', zIndex: 99 }} mb={4}>
        <AddButton
          action={addButtonAction}
          disabled={disabled()}
          primary
          testId={'addTargetButton'}
          title="addTarget.label"
          toolTip={
            referenceCoordinates === REFERENCE_COORDINATE_TYPE_GALACTIC.value
              ? 'addTarget.galacticDisabled'
              : 'addTarget.toolTip'
          }
        />
      </Grid>
    );
  };

  const resolveButton = () => {
    const processCoordinatesResults = (response: any) => {
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
          setVelType(VELOCITY_TYPE.REDSHIFT);

          setRedshift(String(redshift));
          setVel('');
        } else {
          setVelType(VELOCITY_TYPE.VELOCITY);

          setVel(velocity != null ? String(velocity) : '');
          setRedshift('');
        }

        setNameFieldError('');
      } else {
        setNameFieldError(t('resolve.error.' + response.error)
        );
      }
    };

    const getCoordinates = async () => {
      const response = await GetCoordinates(name, referenceCoordinates);
      processCoordinatesResults(response);
    };

    return (
      <ResolveButton action={() => getCoordinates()} disabled={!name} testId={'resolveButton'} />
    );
  };

  const isRequired = () => name !== '' || coord1 !== '' || coord2 !== '';

  const wrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const wrapper2 = (children?: React.JSX.Element) => (
    <Box p={0} pt={2} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const referenceCoordinatesField = () =>
    wrapper(
      <ReferenceCoordinatesField
        setValue={setTheReferenceCoordinates}
        value={referenceCoordinates}
      />
    );

  const fieldPatternTypeField = () => {
    return wrapper(
      <Box pt={1}>
        <TextEntry
          disabled={true}
          label={t('fieldPattern.label')}
          onFocus={() => setHelp('fieldPattern.help')}
          testId="fieldPatternId"
          value={fieldPattern}
          setValue={setFieldPattern}
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
        suffix={resolveButton()}
        onBlur={blurName}
        onFocus={() => setHelp('name.help')}
        errorText={nameFieldError}
      />
    );

  const skyDirection1Field = () =>
    wrapper(
      <SkyDirection1
        required={isRequired()}
        setValue={setTheCoord1}
        skyUnits={referenceCoordinates}
        value={coord1}
        valueBlur={blurCoord1}
        valueFocus={() => setHelp('skyDirection.1')}
        setErrorText={setSkyDirection1Error} // Pass the callback
      />
    );

  const skyDirection2Field = () =>
    wrapper(
      <SkyDirection2
        required={isRequired()}
        setValue={setTheCoord2}
        skyUnits={referenceCoordinates}
        value={coord2}
        valueFocus={() => setHelp('skyDirection.2')}
        valueBlur={blurCoord2}
        setErrorText={setSkyDirection2Error} // Pass the callback
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
        setErrorText={setRmFieldError}
      />
    );

  return (
    <>
      <Grid pt={4}>
        <Box pl={10} sx={{ justifyContent: 'center', alignItems: 'center', width: '90%' }}>
          <BorderedSection title={t('referenceCoordinates.label')}>
            {referenceCoordinatesField()}
          </BorderedSection>
        </Box>
      </Grid>
      <Grid pt={1}>
        <Box pl={10} sx={{ justifyContent: 'center', alignItems: 'center', width: '90%' }}>
          <BorderedSection title={t('coordinate.label')}>
            {nameField()}
            <Grid
              container
              spacing={GAP}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid size={{ md: 12, lg: 6 }}>{skyDirection1Field()}</Grid>
              <Grid size={{ md: 12, lg: 6 }}>{skyDirection2Field()}</Grid>
            </Grid>
          </BorderedSection>
        </Box>
      </Grid>
      <Grid pt={1}>
        <Box pl={10} sx={{ justifyContent: 'center', alignItems: 'center', width: '90%' }}>
          <BorderedSection title={t('radialMotion.label')}>
            <Grid
              container
              spacing={GAP}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid size={{ md: 12, lg: 6 }}>{velocityTypeField()}</Grid>
              <Grid size={{ md: 12, lg: 6 }}>{velocityField()}</Grid>
            </Grid>
            {velType === VELOCITY_TYPE.VELOCITY}
          </BorderedSection>
        </Box>
      </Grid>
      {!isSV && (
        <Grid pt={1}>
          <Box pl={10} sx={{ justifyContent: 'center', alignItems: 'center', width: '90%' }}>
            <BorderedSection title={t('fieldPattern.groupLabel')}>
              {fieldPatternTypeField()}
            </BorderedSection>
          </Box>
        </Grid>
      )}
      {!id && <Grid pl={10}>{addButton()}</Grid>}
    </>
  );
}
