import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BaseButton from '../Base/Button';

interface OverviewButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function OverviewButton({
  disabled = false,
  action,
  primary = false,
  title = 'overviewBtn.label',
  testId = 'overviewButtonTestId',
  toolTip
}: OverviewButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<ArrowBackIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
