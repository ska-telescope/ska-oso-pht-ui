import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BaseButton from '../Base/Button';

interface SensCalcButtonProps {
  title?: string;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
  link?: string;
}

export default function SensCalcButton({
  disabled = false,
  title = 'sensCalc.button',
  primary = false,
  testId = 'SensCalcButtonTestId',
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
        icon={<AutoAwesomeOutlinedIcon />}
        primary={primary}
        testId={testId}
        title={title}
        toolTip={toolTip}
      />
    </>
  );
}
