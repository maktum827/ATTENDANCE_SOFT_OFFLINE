// React and Hooks
import React, { useEffect, useState } from 'react';
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
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';

// Custom Actions and Utilities
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MetaData from './utils/metaData';
import ActivationWindow from './minicomp/Activation';
import useAuth from './hooks/UseAuth';
import { ContentCopy } from '@mui/icons-material';

export default function ACTIVATIONSTATUS() {
  const { t } = useTranslation();
  const { is_active: isActive } = useAuth();
  const [keyWindowOpen, setKeyWindowOpen] = useState(false);
  const [hardwareID, setHardWareId] = useState(null);

  const handleKeyWindowOpen = () => {
    setKeyWindowOpen(true);
  };

  const handleKeyWindowClose = () => {
    setKeyWindowOpen(false);
  };

  const handleClickWhatsapp = () => {
    window.open('https://wa.me/01746841988', '_blank');
  };

  useEffect(() => {
    const load = async () => {
      const id = await window.electron.activation.getHardwareId();
      setHardWareId(id);
      // const license = await window.electron.activation.readLicense();
      // console.log('Existing license:', license);
    };
    load();
  }, []);

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (hardwareID) {
      navigator.clipboard.writeText(hardwareID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
    }
  };

  return (
    <Box className="globalShapeDesign">
      <MetaData title="CONNECTION" />
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
        <Paper
          className="customBorder"
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            borderRadius: 3,
            maxWidth: 400,
          }}
        >
          {/* Version */}
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>{t('version')}:</strong> 5.00
          </Typography>

          {/* Status with colored chip */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              <strong>{t('status')}:</strong>
            </Typography>
            <Chip
              label={isActive ? t('activated') : t('inActive')}
              color={isActive ? 'success' : 'error'}
              size="small"
            />
          </Box>

          {/* Secret / Hardware ID with copy button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                backgroundColor: '#e0e0e0',
                p: 0.5,
                borderRadius: 1,
                wordBreak: 'break-all',
              }}
            >
              {hardwareID || t('loading........')}
            </Typography>
            {hardwareID && (
              <Tooltip title={copied ? t('copied') : t('copy')}>
                <IconButton size="small" onClick={handleCopy}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Paper>

        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleKeyWindowOpen}
              color="success"
              size="small"
              loading={!hardwareID}
              disableElevation
            >
              {t('connectionPannel')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Button
              variant="contained"
              endIcon={<WhatsAppIcon />}
              onClick={handleClickWhatsapp}
              disableElevation
              fullWidth
              size="small"
              sx={{ marginRight: 1.5 }}
            >
              {t('connectionStatus')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
