import { Box } from '@mui/material';
import useAuth from '../hooks/UseAuth';

export default function COMMONWATERMARK() {
  const { logo_path: logoPath } = useAuth();

  return (
    <Box
      component="img"
      src={`local://${logoPath}`}
      alt="Watermark"
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '400px',
        height: '400px',
        opacity: 0.05,
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)', // perfectly centers the image
        userSelect: 'none', // prevent selection highlighting
      }}
    />
  );
}
