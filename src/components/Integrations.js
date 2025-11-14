import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import SlackIcon from '@mui/icons-material/Chat'; // Example icons
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';
import { Check, Close, Message } from '@mui/icons-material';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import {
  useDeleteMessageIntegrationMutation,
  useGetSmsServiceQuery,
} from '../actions/zkTecoApi';
import { convertToBengaliDigits } from './utils/converter';
import { CustomCrossButton } from './styles/style';
import SMSINTEGRATIONFORM from './minicomp/SmsApiForm';
import LoadingScreen from './minicomp/LoadingScreen';
import GETCONFIRMATION from './minicomp/GetConfirmation';

export default function Integrations() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const { data, isLoading } = useGetSmsServiceQuery();
  const [deleteMessage] = useDeleteMessageIntegrationMutation();

  const handleSmsConnect = () => {
    setOpen(true);
  };

  const handleSmsDisconnect = () => {
    setOpenConfirmation(true);
  };
  const handleCloseConfirmation = () => setOpenConfirmation(false);

  const handleOk = async () => {
    await deleteMessage().unwrap();
    enqueueSnackbar(t('successMessage'), { variant: 'success' });
    setOpenConfirmation(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <Box sx={{ p: 4 }}>
      <Dialog open={openConfirmation} onClose={handleCloseConfirmation}>
        <GETCONFIRMATION
          handleClose={handleCloseConfirmation}
          confirmationText={t('confirmMessageIntegraion')}
          handleOk={handleOk}
        />
      </Dialog>

      <Dialog open={open} maxWidth="xs">
        <CustomCrossButton
          onClick={handleClose}
          disableElevation
          disableRipple
          disableFocusRipple
        >
          <Close fontSize="small" />
        </CustomCrossButton>
        <DialogTitle textAlign="center">{t('smsIntegration')}</DialogTitle>
        <DialogContent>
          <SMSINTEGRATIONFORM action={handleClose} />
        </DialogContent>
      </Dialog>

      <Typography variant="h5" mb={3}>
        {t('integrations')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardContent
              sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
            >
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <Message />
              </Avatar>
              <Box>
                <Typography variant="h6">{t('message')}</Typography>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {t('messageDescription')}
                  </Typography>
                  <Check sx={{ ml: 1 }} color="success" />
                </Box>
              </Box>
            </CardContent>
            <CardActions
              sx={{
                justifyContent: 'right',
              }}
            >
              {!data?.sms_service ? (
                <Button
                  disableElevation
                  variant="contained"
                  onClick={handleSmsConnect}
                >
                  {t('connect')} ({convertToBengaliDigits('500')} {t('money')})
                </Button>
              ) : (
                <Button
                  disableElevation
                  variant="contained"
                  color="error"
                  onClick={handleSmsDisconnect}
                >
                  {t('disconnect')}
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
