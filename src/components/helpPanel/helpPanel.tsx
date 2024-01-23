import * as React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import InfoPanel from '../infoPanel/infoPanel';
import { Help } from '../../services/types/help';

export default function HelpPanel() {
  const { help } = storageObject.useStore();

  const getHelp = () => help.content as Help;

  return (
    <InfoPanel
      title={getHelp()[0]}
      description={getHelp()[1]}
      additional={getHelp()[2]}
      testId="infoPanelId"
    />
  );
}
