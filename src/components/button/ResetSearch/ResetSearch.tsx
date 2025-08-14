import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BaseButton from '../Base/Button';
interface ResetSearchButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function ResetSearchButton({
  disabled = false,
  action,
  primary = false,
  title = 'emailSearch.reset',
  testId = 'resetSearchButtonTestId',
  toolTip
}: ResetSearchButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<RestartAltIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
