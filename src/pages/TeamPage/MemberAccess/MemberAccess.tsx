/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid } from '@mui/material';
import { TickBox } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LAB_POSITION, WRAPPER_HEIGHT } from '@/utils/constants';
import {
  PROPOSAL_ACCESS_SUBMIT,
  PROPOSAL_ACCESS_UPDATE,
  PROPOSAL_ACCESS_VIEW
} from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface MemberAccessProps {
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function MemberAccess({ selectedOptions, setSelectedOptions }: MemberAccessProps) {
  const { t } = useScopedTranslation();
  const { helpComponent } = storageObject.useStore();

  React.useEffect(() => {
    helpComponent(t('manageTeamMember.help'));
  }, []);

  React.useEffect(() => {
    if (
      selectedOptions.includes(PROPOSAL_ACCESS_SUBMIT) &&
      !selectedOptions.includes(PROPOSAL_ACCESS_UPDATE)
    ) {
      handleCheckboxChange(PROPOSAL_ACCESS_UPDATE);
    }
    if (
      selectedOptions.includes(PROPOSAL_ACCESS_UPDATE) &&
      !selectedOptions.includes(PROPOSAL_ACCESS_VIEW)
    ) {
      handleCheckboxChange(PROPOSAL_ACCESS_VIEW);
    }
  }, [selectedOptions]);

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box
      p={0}
      pt={1}
      sx={{
        height: WRAPPER_HEIGHT
      }}
    >
      {children}
    </Box>
  );

  const handleCheckboxChange = (value: string) => {
    setSelectedOptions((prev: string[]) => {
      return prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value];
    });
  };

  const submitField = () => {
    return fieldWrapper(
      <TickBox
        label={t('manageTeamMember.submit.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="submitCheckbox"
        checked={selectedOptions.includes(PROPOSAL_ACCESS_SUBMIT)}
        onChange={() => handleCheckboxChange(PROPOSAL_ACCESS_SUBMIT)}
        onFocus={() => helpComponent(t('manageTeamMember.submit.help'))}
      />
    );
  };

  const editField = () => {
    return fieldWrapper(
      <TickBox
        label={t('manageTeamMember.edit.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="editCheckbox"
        checked={selectedOptions.includes(PROPOSAL_ACCESS_UPDATE)}
        onChange={() => handleCheckboxChange(PROPOSAL_ACCESS_UPDATE)}
        onFocus={() => helpComponent(t('manageTeamMember.edit.help'))}
        disabled={selectedOptions.includes(PROPOSAL_ACCESS_SUBMIT)}
      />
    );
  };

  const viewField = () => {
    return fieldWrapper(
      <TickBox
        label={t('manageTeamMember.view.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="viewCheckbox"
        checked={selectedOptions.includes(PROPOSAL_ACCESS_VIEW)}
        onChange={() => handleCheckboxChange(PROPOSAL_ACCESS_VIEW)}
        onFocus={() => helpComponent(t('manageTeamMember.view.help'))}
        disabled={
          selectedOptions.includes(PROPOSAL_ACCESS_UPDATE) ||
          selectedOptions.includes(PROPOSAL_ACCESS_SUBMIT)
        }
      />
    );
  };

  return (
    <>
      <Grid
        p={2}
        pb={5}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
      >
        <Grid size={{ sm: 12, md: 6, lg: 6 }}>
          <Grid
            size={{ sm: 12, md: 12, lg: 10 }}
            pt={1}
            container
            direction="column"
            alignItems="stretch"
            justifyContent="space-evenly"
          >
            {submitField()}
            {editField()}
            {viewField()}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
