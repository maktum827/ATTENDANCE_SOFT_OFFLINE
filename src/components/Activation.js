// React and Hooks
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Material UI Components
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Grid,
} from '@mui/material';

// Custom Actions and Utilities
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import useAuth from './hooks/UseAuth';
import ActivationWindow from './minicomp/Activation';

export default function ACTIVATIONSTATUS() {
  const { t } = useTranslation();
  const { code, localIP } = useAuth();
  const [keyWindowOpen, setKeyWindowOpen] = useState(false);

  const handleKeyWindowOpen = () => {
    setKeyWindowOpen(true);
  };

  const handleKeyWindowClose = () => {
    setKeyWindowOpen(false);
  };

  const handleClickWhatsapp = () => {
    window.open('https://web.whatsapp.com', '_blank');
  };

  return (
    <Box className="globalShapeDesign">
      <ActivationWindow
        openWindow={keyWindowOpen}
        handleClose={handleKeyWindowClose}
      />
      <Box
        component={Paper}
        elevation={0}
        sx={{ width: '60%', padding: '1rem' }}
      >
        <Typography sx={{ fontWeight: 'bold' }}>{t('connection')}</Typography>
        <nav aria-label="secondary mailbox folders">
          <List>
            <ListItem disablePadding>
              <ListItemText primary={`${t('version')}: 4.6.0`} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={`${t('status')}: ${code ? t('activated') : t('disconnected')}`}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary={`${t('localIP')}: ${localIP}`} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary={`${t('secretCode')}: ${code}`} />
            </ListItem>
          </List>
        </nav>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Button
              variant="contained"
              color="inherit"
              endIcon={<WhatsAppIcon />}
              onClick={handleClickWhatsapp}
              disableElevation
              fullWidth
              sx={{ marginRight: 1.5 }}
              size="small"
            >
              {t('connectionStatus')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleKeyWindowOpen}
              color="primary"
              size="small"
              disableElevation
            >
              {t('connectionPannel')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
