import * as React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';

export default function HelpPanel() {
  const { help } = storageObject.useStore();

  const getHelp = () => help.component as string;

  return (
    <InfoCard
      color={InfoCardColorTypes.Info}
      fontSize={20}
      message={getHelp()}
      testId="helpPanelId"
    />
  );
}
