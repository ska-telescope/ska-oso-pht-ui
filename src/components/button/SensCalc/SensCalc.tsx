import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import BaseButton from '../Base/Button';

interface SensCalcButtonProps {
  title?: string;
  disabled?: boolean;
  primary?: boolean;
  toolTip?: string;
  link?: string;
}

export default function SensCalcButton({
  disabled = false,
  title = 'sensCalc.button',
  primary = false,
  toolTip = 'sensCalc.tooltip',
  link = ''
}: SensCalcButtonProps) {
  const ClickFunction = () => {
    link?.length && window.open(link, '_blank');
  };

  return (
    <>
      <BaseButton
        action={ClickFunction}
        disabled={disabled}
        icon={<CalculateOutlinedIcon />}
        primary={primary}
        title={title}
        toolTip={toolTip}
      />
    </>
  );
}
