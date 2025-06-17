import { Tooltip, Card, CardActionArea, CardHeader, Avatar, Typography } from '@mui/material';

interface CardTitleProps {
  className?: string;
  code?: string;
  colorAvatarBG?: string;
  colorAvatarFG?: string;
  colorCardBG?: string;
  colorCardFG?: string;
  id: string;
  onClick: any;
  title: string;
  toolTip: string;
}

export default function CardTitle({
  className = '',
  code = '',
  colorAvatarBG,
  colorAvatarFG,
  colorCardBG,
  colorCardFG,
  id,
  onClick,
  title,
  toolTip
}: CardTitleProps) {
  return (
    <Tooltip title={toolTip} arrow>
      <Card
        style={{
          color: colorCardFG,
          backgroundColor: colorCardBG,

          display: 'flex',
          justifyContent: 'center',
          minHeight: '90px'
        }}
        className={className}
        onClick={onClick}
        variant="outlined"
        id={id}
      >
        <CardActionArea>
          <CardHeader
            avatar={
              <Avatar
                variant="rounded"
                style={{
                  color: colorAvatarFG,
                  backgroundColor: colorAvatarBG
                }}
              >
                <Typography variant="body2" component="div">
                  {code}
                </Typography>
              </Avatar>
            }
            title={
              <Typography variant="h6" component="div" maxWidth={230}>
                <Typography>{title}</Typography>
              </Typography>
            }
          />
        </CardActionArea>
      </Card>
    </Tooltip>
  );
}
