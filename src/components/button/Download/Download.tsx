import DownloadIcon from '@mui/icons-material/DownloadRounded';
import BaseButton from '../Base/Button';

interface DownloadButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
}

export default function DownloadButton({
  disabled = false,
  action,
  title = 'downloadBtn.label',
  primary = false,
  toolTip
}: DownloadButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<DownloadIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
    />
  );
}
