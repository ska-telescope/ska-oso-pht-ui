import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { BorderedSection, TextEntry } from '@ska-telescope/ska-gui-components';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates';
import ReferenceCoordinatesField from '@components/fields/referenceCoordinates/ReferenceCoordinates.tsx';
import { leadZero } from '@utils/helpers.ts';
import { Proposal } from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import ResolveButton from '@/components/button/Resolve/Resolve';
import ReferenceFrameField from '@/components/fields/referenceFrame/ReferenceFrame';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';
import VelocityField from '@/components/fields/velocity/Velocity';
import Target from '@/utils/types/target';
import {
  RA_TYPE_ICRS,
  VELOCITY_TYPE,
  FIELD_PATTERN_POINTING_CENTRES,
  WRAPPER_HEIGHT
} from '@/utils/constants';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import autoLinking from '@/utils/autoLinking/AutoLinking';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import VelocityTypeField from '@/components/fields/velocityType/VelocityType';
interface TargetEntryProps {
  raType: number;
  setTarget?: Function;
  target?: Target;
  textAlign?: string;
  onRAFieldErrorChange?: (error: string) => void;
  onDecFieldErrorChange?: (error: string) => void;
  onNameFieldErrorChange?: (error: string) => void;
}

const NOTIFICATION_DELAY_IN_SECONDS = 5;

export default function TargetEntry({
  raType,
  setTarget = undefined,
  target = undefined,
  onRAFieldErrorChange,
  onDecFieldErrorChange,
  onNameFieldErrorChange
}: TargetEntryProps) {
  const { t } = useScopedTranslation();
  const { autoLink, isSV } = useOSDAccessors();
  const { notifyError, notifySuccess } = useNotify();

  const { application, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [skyDirection1Error, setSkyDirection1Error] = React.useState('');
  const [skyDirection2Error, setSkyDirection2Error] = React.useState('');
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [id, setId] = React.useState(0);
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [velType, setVelType] = React.useState(0);
  const [vel, setVel] = React.useState('');
  const [velUnit, setVelUnit] = React.useState(0);
  const [redshift, setRedshift] = React.useState('');
  const [referenceFrame, setReferenceFrame] = React.useState(RA_TYPE_ICRS.value);
  const [referenceCoordinates, setReferenceCoordinates] = React.useState(RA_TYPE_ICRS.label);
  const [fieldPattern, setFieldPattern] = React.useState(FIELD_PATTERN_POINTING_CENTRES);

  React.useEffect(() => {
    if (nameFieldError === t('addTarget.error')) {
      if (formValidation()) {
        setNameFieldError('');
      }
    }
  }, [name]);

  React.useEffect(() => {
    if (setTarget) {
      setTarget({ ...target, decStr: dec, raStr: ra, vel: vel, redshift: redshift });
    }
  }, [ra, dec, vel, redshift]);

  React.useEffect(() => {
    if (onRAFieldErrorChange) {
      onRAFieldErrorChange(skyDirection1Error); // Notify parent
    }
  }, [skyDirection1Error]);

  React.useEffect(() => {
    if (onDecFieldErrorChange) {
      onDecFieldErrorChange(skyDirection2Error); // Notify parent
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

  const setTheDec = (inValue: string) => {
    const formattedDec = leadZero(inValue);
    setDec(formattedDec.toString());
    if (setTarget) {
      setTarget({ ...target, decStr: formattedDec.toString() });
    }
  };

  const setTheRA = (inValue: string) => {
    const formattedRA = leadZero(inValue);
    setRA(formattedRA.toString());
    if (setTarget) {
      setTarget({ ...target, raStr: formattedRA.toString() });
    }
  };

  const setTheRedshift = (inValue: string) => {
    setRedshift(inValue);
    if (setTarget) {
      setTarget({ ...target, redshift: inValue });
    }
  };

  const setTheReferenceFrame = (inValue: React.SetStateAction<number>) => {
    setReferenceFrame(inValue);
    if (setTarget) {
      setTarget({ ...target, kind: inValue });
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
    setId(target?.id ?? 0);
    setName(target?.name ?? '');
    setRA(target?.raStr ?? '');
    setDec(target?.decStr ?? '');
    setVelType(target?.velType ?? 0);
    setVel(target?.vel ?? '');
    setVelUnit(target?.velUnit ?? 0);
    setRedshift(target?.redshift ?? '');
    setReferenceFrame(target?.kind ?? RA_TYPE_ICRS.value);
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
        clearForm();
      }
    };

    const AddTheTarget = () => {
      const highest = getProposal()?.targets?.length
        ? getProposal()?.targets?.reduce((prev, current) =>
            prev && prev.id > current.id ? prev : current
          )
        : null;
      const highestId = highest ? highest.id : 0;

      const newTarget: Target = {
        kind: RA_TYPE_ICRS.value,
        decStr: dec ?? '',
        id: highestId + 1,
        name: name ?? '',
        b: 0, // Default value for `b`
        l: 0, // Default value for `l`
        raStr: ra ?? '',
        redshift: velType === VELOCITY_TYPE.REDSHIFT ? redshift ?? '' : '',
        referenceFrame: RA_TYPE_ICRS.label,
        vel: velType === VELOCITY_TYPE.VELOCITY ? vel ?? '' : '',
        velType: velType ?? 0,
        velUnit: velUnit ?? 0
      };

      const generateAutoLinkData = async () => {
        const defaults = await autoLinking(newTarget, getProposal, setProposal);
        if (defaults && defaults.success) {
          notifySuccess(t('autoLink.targetSuccess'), NOTIFICATION_DELAY_IN_SECONDS);
        } else {
          notifyError(defaults?.error ?? t('autoLink.error'), NOTIFICATION_DELAY_IN_SECONDS);
        }
      };

      const addTargetAsync = async () => {
        if (autoLink && typeof getProposal().scienceCategory === 'number') {
          generateAutoLinkData();
          return;
        }
        const updatedProposal = {
          ...getProposal(),
          targets: [...(getProposal().targets ?? []), newTarget]
        };
        setProposal(updatedProposal);
        notifySuccess(t('addTarget.success'), NOTIFICATION_DELAY_IN_SECONDS);
      };
      addTargetAsync();
    };

    const clearForm = () => {
      setName('');
      setRA('');
      setDec('');
      setVel('');
      setRedshift('');
    };

    const disabled = () => {
      return (
        nameFieldError !== '' ||
        skyDirection1Error !== '' ||
        skyDirection2Error !== '' ||
        !(name?.length && ra?.length && dec?.length && targetLengthCheck())
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
          toolTip="addTarget.toolTip"
        />
      </Grid>
    );
  };

  const resolveButton = () => {
    const processCoordinatesResults = (response: any) => {
      if (response && !response.error) {
        const values = response.split(' ');
        const redshift =
          values?.length > 2 && values[2] !== 'null'
            ? Number(values[2])
                .toExponential(2)
                .toString()
            : '';
        const vel = values?.length > 3 && values[3] !== 'null' ? values[3] : '';
        setDec(values[0]);
        setRA(values[1]);
        setRedshift(redshift);
        setVel(vel);
        setNameFieldError('');
      } else {
        setNameFieldError(t('resolve.error.' + response.error));
      }
    };

    const getCoordinates = async () => {
      const response = await GetCoordinates(name, raType);
      processCoordinatesResults(response);
    };

    return (
      <ResolveButton action={() => getCoordinates()} disabled={!name} testId={'resolveButton'} />
    );
  };

  const wrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const referenceCoordinatesField = () =>
    wrapper(
      <ReferenceCoordinatesField
        setValue={setReferenceCoordinates}
        value={referenceCoordinates.toUpperCase()}
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
        required
        label={t('name.label')}
        testId={'name'}
        value={name}
        setValue={setTheName}
        suffix={resolveButton()}
        onFocus={() => setHelp('name.help')}
        errorText={nameFieldError}
      />
    );

  const skyDirection1Field = () =>
    wrapper(
      <SkyDirection1
        setValue={setTheRA}
        skyUnits={raType}
        value={ra}
        valueFocus={() => setHelp('skyDirection.1')}
        setErrorText={setSkyDirection1Error} // Pass the callback
      />
    );

  const skyDirection2Field = () =>
    wrapper(
      <SkyDirection2
        setValue={setTheDec}
        skyUnits={raType}
        value={dec}
        valueFocus={() => setHelp('skyDirection.2')}
        setErrorText={setSkyDirection2Error} // Pass the callback
      />
    );

  const velocityTypeField = () =>
    wrapper(
      <VelocityTypeField
        setVelType={setTheVelType}
        velType={velType}
        // velTypeFocus={() => setHelp('')}   TODO : Need to find out why this is not working great
      />
    );

  const velocityField = () =>
    wrapper(
      <VelocityField
        setRedshift={setTheRedshift}
        setVel={setTheVel}
        setVelUnit={setTheVelUnit}
        redshift={redshift}
        vel={vel}
        velType={velType}
        velUnit={velUnit}
        velFocus={() => setHelp('velocity.help' + velType)}
        // velTypeFocus={() => setHelp('')}   TODO : Need to find out why this is not working great
        velUnitFocus={() => setHelp('velocity.help' + velType)}
      />
    );

  const referenceFrameField = () =>
    wrapper(
      <ReferenceFrameField
        onFocus={() => setHelp('referenceFrame.help')}
        setValue={setTheReferenceFrame}
        value={referenceFrame}
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
            {skyDirection1Field()}
            {skyDirection2Field()}
          </BorderedSection>
        </Box>
      </Grid>
      <Grid pt={1}>
        <Box pl={10} sx={{ justifyContent: 'center', alignItems: 'center', width: '90%' }}>
          <BorderedSection title={t('radialMotion.label')}>
            {velocityTypeField()}
            {velocityField()}
            {velType === VELOCITY_TYPE.VELOCITY && referenceFrameField()}
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
