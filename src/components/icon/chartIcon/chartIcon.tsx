import MultilineChartOutlinedIcon from '@mui/icons-material/MultilineChartOutlined';
import Icon from '../icon/Icon';

interface ChartIconProps {
  disabled?: boolean;
  onClick?: Function;
  padding?: number;
  toolTip?: string;
}

export default function ChartIcon({
  disabled = false,
  padding = 1,
  onClick = undefined,
  toolTip = ''
}: ChartIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<MultilineChartOutlinedIcon />}
      toolTip={toolTip}
      sx={{ padding: padding }}
    />
  );
}
