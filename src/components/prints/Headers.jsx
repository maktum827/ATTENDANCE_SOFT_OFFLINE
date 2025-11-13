import { Avatar, Chip, Divider, Grid, Typography } from '@mui/material';
import useAuth from '../hooks/UseAuth.js';
import { convertToBengaliDigits } from '../utils/converter.js';

export default function PADHEADING(text) {
  const {
    name,
    address,
    contact,
    english_name: englishName,
    english_address: englishAddress,
    logo_path: logoPath,
  } = useAuth();

  return (
    <Grid
      container
      sx={{ width: '100%' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Grid
        size={{ xs: 12, sm: 5 }}
        marginRight="0.6rem"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: { xs: 'center', sm: 'right' },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            '@media print': {
              background: 'white',
              color: 'black',
            },
          }}
        >
          {name || ''}
        </Typography>
        <Typography
          variant="overline"
          sx={{
            lineHeight: '8px',
            '@media print': {
              background: 'white',
              color: 'black',
            },
          }}
        >
          {address || ''}
        </Typography>
        <Typography
          variant="overline"
          sx={{
            mt: 0.5,
            lineHeight: '15px',
            '@media print': {
              background: 'white',
              color: 'black',
            },
          }}
        >
          {convertToBengaliDigits(contact || '')}
        </Typography>
      </Grid>
      <Grid
        size={1}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'center',
        }}
      >
        <Avatar
          alt="Logo"
          src={`local://${logoPath}`}
          sx={{
            width: '55px',
            height: '55px',
            objectFit: 'contain',
          }}
        />
      </Grid>
      <Grid
        size={5}
        marginLeft="0.6rem"
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'right',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontFamily: 'Times New Roman',
            fontSize: '10px',
            lineHeight: '20px',
            '@media print': {
              background: 'white',
              color: 'black',
            },
          }}
        >
          {englishName || 'ENGLISH ACADEMIC NAME WILL BE HERE'}
        </Typography>

        <Typography
          variant="overline"
          className="rcptHdngTxtEn"
          sx={{
            lineHeight: '10px',
            fontFamily: 'Times New Roman',
            fontSize: '9px',
            '@media print': {
              background: 'white',
              color: 'black',
            },
          }}
        >
          {englishAddress || 'ENGLISH ADDRESS WILL BE HERE'}
        </Typography>

        <Typography
          variant="overline"
          className="rcptHdngTxtEn"
          sx={{
            lineHeight: '22px',
            mt: 0.2,
            fontFamily: 'Times New Roman',
            '@media print': {
              background: 'white',
              color: 'black',
            },
          }}
        >
          {contact || ''}
        </Typography>
      </Grid>
      <Divider
        sx={{
          borderColor: '#ccc',
          width: '100%',
          my: '3px',
        }}
      />
      <Grid
        size={12}
        container
        display="flex"
        justifyContent="center"
        marginTop={1}
        sx={{ marginTop: '0px' }}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <Chip
            sx={{
              margin: 'auto',
              display: 'flex',
              justifyContent: 'center',
              borderRadius: '50px',
              textAlign: 'center',
              padding: '0px 10px 0px 10px',
              fontSize: '1.1rem',
              '@media print': {
                background: 'whitesmoke',
                color: 'black',
              },
            }}
            label={text?.text || ''}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
