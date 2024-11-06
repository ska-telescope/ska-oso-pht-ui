import React from 'react';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import Alert from '../../../components/alerts/standardAlert/StandardAlert';

export default function TargetMosaicSection() {
  return (
    <Alert
      color={AlertColorTypes.Info}
      text="This functionality is not currently available"
      testId="helpPanelId"
    />
  );
}
