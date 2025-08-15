import SearchIcon from '@mui/icons-material/Search';
import BaseButton from '../Base/Button';
interface SearchButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function SearchButton({
  disabled = false,
  action,
  primary = false,
  title = 'search.label',
  testId = 'SearchButtonTestId',
  toolTip
}: SearchButtonProps) {
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
