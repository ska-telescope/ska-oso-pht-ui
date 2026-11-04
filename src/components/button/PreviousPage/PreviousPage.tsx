import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import BaseButton from '../Base/Button';

interface PreviousPageButtonProps {
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  title?: string;
  toolTip?: string;
}

export default function PreviousPageButton({
  disabled = false,
  action,
  primary = false,
  title = 'baseBtn.label',
  toolTip
}: PreviousPageButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<ArrowBackIosIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
    />
  );
}
