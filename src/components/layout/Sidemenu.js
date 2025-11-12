// React and Hooks
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Material UI components
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Language,
  DeviceHub,
  Cable,
  PeopleAltOutlined,
  InfoOutlined,
  LibraryBooks,
} from '@mui/icons-material';
// // MUI Icons
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import SmsFailedOutlinedIcon from '@mui/icons-material/SmsFailedOutlined';

export default function SideBarMenu({ handleClickMenu }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  // AES Decryption
  // const bytes = CryptoJS.AES.decrypt(activation, '@mishok');
  // const bytes1 = CryptoJS.AES.decrypt(activated_at, '@mishok');
  // const activated_date = dayjs(bytes1.toString(CryptoJS.enc.Utf8), "YYYY-MM-DD");
  // const expiryDate = dayjs(bytes.toString(CryptoJS.enc.Utf8)); // Handles multiple formats

  // const isDateValid = activated_date.isBefore(expiryDate) || activated_date.isSame(expiryDate);

  // const [keyWindowOpen, setKeyWindowOpen] = useState(!isDateValid ? true : false);

  const handleClick = (key) => {
    // if (!isDateValid && key !== 'settings') return;

    // check authentication
    // const allowedTypes = {
    //     adminis: ['principal', 'admin', 'councilMember', 'superUser'],
    //     education: ['education', 'principal', 'admin', 'councilMember', 'superUser'],
    //     accounts: ['accountant', 'principal', 'admin', 'councilMember', 'superUser'],
    //     boarding: ['boardingSuper', 'principal', 'admin', 'councilMember', 'superUser'],
    //     donation: ['accountant', 'education', 'principal', 'admin', 'councilMember', 'superUser'],
    // };

    // if (allowedTypes[key] && !allowedTypes[key].includes(type)) {
    //     enqueueSnackbar(t('authorRequired'), { variant: 'error' });
    //     return;
    // }

    setSelected(key); // for highlighting selected list
    if (
      key !== 'adminis' &&
      key !== 'education' &&
      key !== 'others' &&
      key !== 'website' &&
      key !== 'msg'
    ) {
      handleClickMenu(key);
    } // for ignoring menu that i don't want to close sidebar after clicking on it
  };

  return (
    <List
      sx={{
        width: '100%',
        height: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <ListItemButton
        selected={selected === 'dashboard'}
        onClick={() => handleClick('dashboard')}
      >
        <ListItemIcon>
          <DashboardIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('dashboard')} />
      </ListItemButton>
      <ListItemButton
        selected={selected === 'setupData'}
        onClick={() => handleClick('setupData')}
      >
        <ListItemIcon>
          <LibraryBooks fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('setupData')} />
      </ListItemButton>
      <ListItemButton
        selected={selected === 'users'}
        onClick={() => handleClick('users')}
      >
        <ListItemIcon>
          <PeopleAltOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('users')} />
      </ListItemButton>
      <ListItemButton
        selected={selected === 'attendance'}
        onClick={() => handleClick('attendance')}
      >
        <ListItemIcon>
          <AssuredWorkloadIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('attendance')} />
      </ListItemButton>
      <ListItemButton
        selected={selected === 'rules'}
        onClick={() => handleClick('rules')}
      >
        <ListItemIcon>
          <GavelIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('rules')} />
      </ListItemButton>
      <ListItemButton
        selected={selected === 'notActive'}
        onClick={() => handleClick('notActive')}
      >
        <ListItemIcon>
          <SmsFailedOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('notActive')} />
      </ListItemButton>
      <ListItemButton
        selected={selected === 'devices'}
        onClick={() => handleClick('devices')}
      >
        <ListItemIcon>
          <DeviceHub fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('devices')} />
      </ListItemButton>
      <ListItemButton
        onClick={() => handleClick('languages')}
        selected={selected === 'languages'}
      >
        <ListItemIcon>
          <Language fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('languages')} />
      </ListItemButton>
      <ListItemButton
        onClick={() => handleClick('connection')}
        selected={selected === 'connection'}
      >
        <ListItemIcon>
          <Cable fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('connection')} />
      </ListItemButton>
      <ListItemButton
        onClick={() => handleClick('about')}
        selected={selected === 'about'}
      >
        <ListItemIcon>
          <InfoOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('about')} />
      </ListItemButton>
    </List>
  );
}
