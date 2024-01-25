import * as React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
// import InfoPanel from '../infoPanel/infoPanel';
import { InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';
import { Help } from '../../services/types/help';

export default function HelpPanel() {
  const { help } = storageObject.useStore();

  const getHelp = () => help.component as Help;

  return (
    <InfoCard
      color={InfoCardColorTypes.Info}
      fontSize={20}
      message={getHelp()[1]}
      testId="helpPanelId"
    />
  );
}
