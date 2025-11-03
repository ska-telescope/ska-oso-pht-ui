import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';
import { HELP_FONT } from '../../../utils/constants';

interface HelpPanelProps {
  maxHeight?: string;
  minHeight?: string;
}

export default function HelpPanel({ maxHeight = '', minHeight = '0' }: HelpPanelProps) {
  const { help } = storageObject.useStore();

  const getHelp = () => (help.component as unknown) as string;

  return (
    <InfoCard
      color={InfoCardColorTypes.Info}
      fontSize={HELP_FONT}
      maxHeight={maxHeight}
      minHeight={minHeight}
      message={getHelp()}
      testId="helpPanelId"
    />
  );
}
