import React from 'react';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Box } from '@mui/system';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import Proposal from '../../../utils/types/proposal';
import GroupObservation from '../../../utils/types/groupObservation';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface GroupObservationsFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
  obsId: string;
}

export default function GroupObservationsField({
  disabled = false,
  labelWidth = 5,
  onFocus,
  setValue,
  value,
  obsId
}: GroupObservationsFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'groupObservations';
  const { application, updateAppContent2 } = storageObject.useStore();
  const [editing, setEditing] = React.useState(false);
  const [groupId, setGroupId] = React.useState('');

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const observationGroupId = (id: string): string => {
    const proposal = getProposal();
    const group = proposal?.groupObservations?.find(e => e.observationId === id);
    return group?.groupId ?? '';
  };

  React.useEffect(() => {
    const groupId = observationGroupId(obsId);
    if (groupId.length && setValue) {
      setValue(groupId);
    }
  }, [obsId, getProposal().groupObservations]);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const options = () => {
    const uniqueGroups: GroupObservation[] = [];
    getProposal()?.groupObservations?.forEach(rec => {
      const existingGroup = uniqueGroups.find(g => g.groupId === rec.groupId);
      if (!existingGroup) {
        uniqueGroups.push(rec);
      }
    });

    const formattedGroupObs = [
      { label: t('groupObservations.new'), value: -1 },
      { label: t('groupObservations.none'), value: 0 },
      ...uniqueGroups.map(group => ({
        label: group?.groupId,
        value: group?.groupId ?? 0
      }))
    ];
    return formattedGroupObs as any;
  };

  const removeGroup = () => {
    const proposal = getProposal();
    const filtered =
      proposal?.groupObservations?.filter(item => item.observationId !== obsId) ?? [];

    setProposal({
      ...proposal,
      groupObservations: filtered
    });
  };

  const addGroup = () => {
    const newGroupObs: GroupObservation = {
      groupId: groupId,
      observationId: obsId
    };
    const filtered =
      getProposal()?.groupObservations?.filter(item => item.observationId !== obsId) ?? [];
    setProposal({
      ...getProposal(),
      groupObservations: [...filtered, newGroupObs]
    });
    setEditing(false);
    return groupId;
  };

  const reuseGroup = (groupId: string): string => {
    const proposal = getProposal();

    const newGroupObs: GroupObservation = {
      groupId,
      observationId: obsId
    };

    const filtered =
      proposal?.groupObservations?.filter(item => item.observationId !== obsId) ?? [];

    setProposal({
      ...proposal,
      groupObservations: [...filtered, newGroupObs]
    });

    return groupId;
  };

  const processEntry = (e: number) => {
    if (e < 0) {
      setEditing(true);
    } else if (e === 0) {
      removeGroup();
      setValue?.(e);
    } else {
      setValue?.(reuseGroup(String(e)));
    }
  };

  const setGroupValue = (e: string) => {
    setGroupId(e);
  };

  return (
    <Box pt={1}>
      {editing && (
        <TextEntry
          inputRef={inputRef}
          label={t('groupObservations.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={labelWidth}
          testId={FIELD + 'Value1'}
          value={groupId}
          setValue={setGroupValue}
          onBlur={addGroup}
          onFocus={onFocus}
          required
        />
      )}
      {!editing && (
        <DropDown
          disabled={disabled}
          value={value}
          label={t('groupObservations.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={labelWidth}
          onFocus={onFocus}
          options={options()}
          required
          setValue={processEntry}
          testId={FIELD + 'Entry'}
        />
      )}
    </Box>
  );
}
