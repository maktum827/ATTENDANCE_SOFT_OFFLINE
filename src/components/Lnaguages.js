// React and Hooks
import React from 'react';
import { useTranslation } from 'react-i18next';

// Material UI Components
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';

// Custom Actions and Utilities
import useAuth from './hooks/UseAuth';
import { changeLanguage } from './hooks/i18n';
import MetaData from './utils/metaData';

export default function LANGUAGESETTINGS() {
  const { t } = useTranslation();
  const { academyType } = useAuth();

  const changeLang = (lng) => {
    changeLanguage(lng, academyType);
  };

  return (
    <Box className="globalShapeDesign">
      <MetaData title="LANGUAGES" />
      <Box
        component={Paper}
        elevation={0}
        sx={{ width: '40%', padding: '1rem' }}
      >
        <nav>
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {t('languages')}
                </Typography>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => changeLang('en')}>
                <ListItemText primary="English" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => changeLang('bn')}>
                <ListItemText primary="বাংলা" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => changeLang('ar')}>
                <ListItemText primary="عربي" />
              </ListItemButton>
            </ListItem>
          </List>
        </nav>
      </Box>
    </Box>
  );
}
