import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BaseButton from '../Base/Button';

interface PDFPreviewButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
}

export default function PDFPreviewButton({
  disabled = false,
  action,
  title = 'pdfPreview.label',
  primary = false,
  toolTip
}: PDFPreviewButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<PictureAsPdfIcon />}
      primary={primary}
      title={title}
      toolTip={toolTip}
    />
  );
}
