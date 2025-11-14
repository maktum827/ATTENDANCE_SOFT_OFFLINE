// React and related imports
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// MUI components
import { Box, Button, Typography } from '@mui/material';

export function GETCONFIRMATION({ handleClose, confirmationText, handleOk }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="body1">{confirmationText}</Typography>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          type="button"
          disableElevation
          onClick={handleOk}
          variant="contained"
          color="success"
          sx={{ ml: 1 }}
        >
          {t('yes')}
        </Button>
        <Button
          disableElevation
          onClick={handleClose}
          variant="outlined"
          sx={{ ml: 1 }}
          color="inherit"
        >
          {t('no')}
        </Button>
      </Box>
    </Box>
  );
}

// ✅ PropTypes for strict ESLint compliance
GETCONFIRMATION.propTypes = {
  handleClose: PropTypes.func.isRequired,
  confirmationText: PropTypes.string.isRequired,
  handleOk: PropTypes.func.isRequired,
};

export default GETCONFIRMATION;
