// React and related imports
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

// MUI imports
import {
  Box,
  Button,
  Dialog,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Custom imports
import { useSoftwareActivationMutation } from '../../actions/zkTecoApi';
import { CustomCrossButton } from '../styles/style';

export default function ActivationWindow({ openWindow, handleClose }) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [activationKey, setActivationKey] = useState('');

  const [applyActivation, { isLoading }] = useSoftwareActivationMutation();

  // ✅ Handle activation key input
  const handleCodeChange = (event) => {
    setActivationKey(event.target.value);
  };

  // ✅ Fetch user data
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await applyActivation({ code: activationKey }).unwrap();
      if (res.success) {
        window.location.reload();
      } else if (res.status === 'applied') {
        enqueueSnackbar(t('codeExpired'), { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  // ✅ Open WhatsApp
  const handleClickWhatsapp = () => {
    window.open('https://wa.me/01746841988', '_blank');
  };

  return (
    <Dialog open={openWindow || false} onClose={handleClose}>
      <CustomCrossButton
        onClick={handleClose}
        disableElevation
        disableRipple
        disableFocusRipple
      >
        <Close fontSize="small" />
      </CustomCrossButton>

      <Typography
        mt={1}
        variant="h6"
        color="success"
        sx={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}
      >
        {t('connectionWizerd')}
      </Typography>

      <Typography
        mt={1}
        variant="body1"
        sx={{ padding: '0rem 1.5rem 0.5rem 1.5rem' }}
      >
        {t('connectionGuides1')}
      </Typography>

      <Typography variant="body1" sx={{ padding: '0rem 1.5rem 0.5rem 1.5rem' }}>
        {t('connectionGuides2')}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box padding="0.5rem 1.5rem 1rem 1.5rem">
          <TextField
            autoFocus
            required
            size="small"
            id="activationKey"
            name="activationKey"
            onChange={handleCodeChange}
            placeholder={t('enterconnectionCodeHere')}
            fullWidth
          />

          <Grid container spacing={2} mt={0.8}>
            <Grid item xs={12} sm={9}>
              <Button
                variant="contained"
                color="primary"
                endIcon={<WhatsAppIcon />}
                onClick={handleClickWhatsapp}
                disableElevation
                fullWidth
                size="small"
              >
                {t('connectionStatus')}
              </Button>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                loading={isLoading}
                fullWidth
                size="small"
                disableElevation
              >
                {t('ok')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Dialog>
  );
}
