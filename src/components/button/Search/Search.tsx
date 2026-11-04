import SearchIcon from '@mui/icons-material/Search';
import BaseButton from '../Base/Button';
interface SearchButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function SearchButton({
  disabled = false,
  action,
  primary = false,
  title = 'search.label',
  toolTip,
  size = 'medium'
}: SearchButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<SearchIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
      size={size}
    />
  );
}
