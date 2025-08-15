/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid2 } from '@mui/material';
import { TickBox } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LAB_POSITION, WRAPPER_HEIGHT } from '@/utils/constants';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';

export default function MemberAccess() {
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const [submit, setSubmit] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [view, setView] = React.useState(false);

  React.useEffect(() => {
    helpComponent(t('manageTeamMember.help'));
  }, []);

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

  const handleCheckboxChangeSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmit(event.target.checked);
  };

  const handleCheckboxChangeEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdit(event.target.checked);
  };

  const handleCheckboxChangeView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setView(event.target.checked);
  };

  const submitField = () => {
    return fieldWrapper(
      <TickBox
        label={t('manageTeamMember.submit.label')}
        labelBold
        labelPosition={LAB_POSITION}
        testId="submitCheckbox"
        checked={submit}
        onChange={handleCheckboxChangeSubmit}
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
        checked={edit}
        onChange={handleCheckboxChangeEdit}
        onFocus={() => helpComponent(t('manageTeamMember.edit.help'))}
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
        checked={view}
        onChange={handleCheckboxChangeView}
        onFocus={() => helpComponent(t('manageTeamMember.view.help'))}
      />
    );
  };

  return (
    <>
      <Grid2
        p={2}
        pb={5}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
      >
        <Grid2 size={{ sm: 12, md: 6, lg: 6 }}>
          <Grid2
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
          </Grid2>
        </Grid2>
        {
          <Grid2 size={{ sm: 12, md: 6, lg: 6 }}>
            <HelpPanel />
          </Grid2>
        }
      </Grid2>
    </>
  );
}
