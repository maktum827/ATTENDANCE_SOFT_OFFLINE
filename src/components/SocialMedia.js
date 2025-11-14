import React from 'react';
import { Box, IconButton, Tooltip, Paper, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { YouTube } from '@mui/icons-material';

export default function SocialMediaPanel() {
  const socialLinks = [
    {
      icon: <FacebookIcon />,
      url: 'https://www.facebook.com/profile.php?id=61552482210896',
      name: 'Facebook',
    },
    {
      icon: <YouTube />,
      url: 'https://www.youtube.com/@tanzimit',
      name: 'YouTube',
    },
    {
      icon: <WhatsAppIcon />,
      url: 'https://wa.me/01746841988',
      name: 'WhatsApp',
    },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        zIndex: 999,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }}
      >
        {/* Social Icons */}
        {socialLinks.map((item) => (
          <Tooltip key={item.name} title={item.name} placement="right">
            <IconButton
              color="primary"
              onClick={() => window.open(item.url, '_blank')}
              sx={{
                transition: 'transform 0.2s, background-color 0.2s',
                '&:hover': {
                  transform: 'scale(1.2)',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                },
              }}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Paper>
    </Box>
  );
}
