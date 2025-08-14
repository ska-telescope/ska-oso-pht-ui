import SearchIcon from '@mui/icons-material/Search';
import BaseButton from '../Base/Button';
interface UserSearchButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function UserSearchButton({
  disabled = false,
  action,
  primary = false,
  title = 'searchForMember.label',
  testId = 'investigatorSearchButtonTestId',
  toolTip
}: UserSearchButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<SearchIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
