import * as React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';
import { HELP_FONT, HELP_VIEWPORT } from '../../../utils/constants';

export default function HelpPanel() {
  const { help } = storageObject.useStore();

  const getHelp = () => help.component as string;

  return (
    <InfoCard
      color={InfoCardColorTypes.Info}
      fontSize={HELP_FONT}
      maxHeight={HELP_VIEWPORT}
      minHeight={HELP_VIEWPORT}
      message={getHelp()}
      testId="helpPanelId"
    />
  );
}
