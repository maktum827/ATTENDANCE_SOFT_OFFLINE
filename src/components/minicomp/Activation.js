// React and related imports
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
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
import { useGetUserDataMutation } from '../../actions/onlineApi';
import { CustomCrossButton } from '../styles/style';
import { useConnectUserMutation } from '../../actions/othersApi';

export function ActivationWindow({ openWindow, handleClose }) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [activationKey, setActivationKey] = useState('');

  const [getUserData, { data: userData, isSuccess: isUserDataSuccess }] =
    useGetUserDataMutation();
  const [connectUser, { isSuccess: isConnectSuccess }] =
    useConnectUserMutation();

  const userInfo = useMemo(() => userData?.data || [], [userData]);

  // ✅ Handle activation key input
  const handleCodeChange = (event) => {
    setActivationKey(event.target.value);
  };

  // ✅ Fetch user data
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await getUserData({ activationKey }).unwrap();
      enqueueSnackbar(t('fetchingUserData'), { variant: 'info' });
    } catch (error) {
      enqueueSnackbar(t('failedToFetchUserData'), { variant: 'error' });
    }
  };

  // ✅ Once user data fetched successfully, connect user
  useEffect(() => {
    if (isUserDataSuccess && userInfo) {
      connectUser(userInfo);
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
      handleClose();
    }
  }, [
    isUserDataSuccess,
    userInfo,
    connectUser,
    enqueueSnackbar,
    handleClose,
    t,
  ]);

  // ✅ Once connection succeeds, reload
  useEffect(() => {
    if (isConnectSuccess) {
      window.location.reload();
    }
  }, [isConnectSuccess]);

  // ✅ Open WhatsApp
  const handleClickWhatsapp = () => {
    window.open('https://web.whatsapp.com', '_blank');
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
                color="inherit"
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

// ✅ PropTypes for ESLint and clarity
ActivationWindow.propTypes = {
  openWindow: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ActivationWindow;
