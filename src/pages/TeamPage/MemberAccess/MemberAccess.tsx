/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { Box, Grid2 } from '@mui/material';
import { TickBox } from '@ska-telescope/ska-gui-components';
import { useTranslation } from 'react-i18next';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LAB_POSITION, WRAPPER_HEIGHT } from '@/utils/constants';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';

interface MemberAccessProps {
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

// const MemberAccess = React.forwardRef<{ getSelectedOptions: () => string[] }>(({ investigatorPermissions}: MemberAccessProps, ref) => {
export default function MemberAccess({ selectedOptions, setSelectedOptions }: MemberAccessProps) {
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const [submit, setSubmit] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [view, setView] = React.useState(false);

  React.useEffect(() => {
    helpComponent(t('manageTeamMember.help'));
  }, []);

    React.useEffect(() => {
      console.log('selectedOptions in MemberAccess:', selectedOptions);
      if (selectedOptions.includes('submit') && !selectedOptions.includes('update')) {
        handleCheckboxChange('update');
      }
      if (selectedOptions.includes('update') && !selectedOptions.includes('view')) {
        handleCheckboxChange('view');
      }
    }, [selectedOptions]);

  //   React.useEffect(() => {
  //     handleCheckboxChange('submit');
  //   }, [submit]);

  //   React.useEffect(() => {
  //     handleCheckboxChange('update');
  //   }, [edit]);

  //   React.useEffect(() => {
  //     handleCheckboxChange('view');
  //   }, [view]);

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

  const handleCheckboxChangeSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmit(event.target.checked);
    // if (event.target.checked) {
    //   // submit rights automatically gives edit and view rights
    //   setEdit(true);
    //   setView(true);
    // }
    // if (!event.target.checked) {
    //   setEdit(false);
    //   setView(false);
    // }
  };

  const handleCheckboxChangeEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdit(event.target.checked);
    // if (event.target.checked) {
    //   // edit rights automatically gives view rights
    //   setView(true);
    // }
    // if (!event.target.checked) {
    //   // edit rights automatically gives view rights
    //   setView(false);
    // }
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
        checked={selectedOptions.includes('submit')}
        onChange={() => handleCheckboxChange('submit')}
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
        checked={selectedOptions.includes('update')}
        onChange={() => handleCheckboxChange('update')}
        onFocus={() => helpComponent(t('manageTeamMember.edit.help'))}
        // disabled={submit}
        disabled={selectedOptions.includes('submit')}
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
        checked={selectedOptions.includes('view')}
        onChange={() => handleCheckboxChange('view')}
        onFocus={() => helpComponent(t('manageTeamMember.view.help'))}
        // disabled={edit}
        disabled={selectedOptions.includes('update') || selectedOptions.includes('submit')}
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
