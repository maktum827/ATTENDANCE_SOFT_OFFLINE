// React and related imports
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// MUI components
import { Box, CircularProgress, Container, Grid, Chip } from '@mui/material';
import Close from '@mui/icons-material/Close';
import { useGetDeviceCapacityQuery } from '../../actions/zkTecoApi';
import MetaData from '../utils/metaData';
import { CustomCrossButton } from '../styles/style';

function DeviceCapacity({ handleClose, deviceData }) {
  const { t } = useTranslation();
  const { data: deviceCapacity, isLoading } =
    useGetDeviceCapacityQuery(deviceData);

  if (isLoading) {
    return (
      <Container
        maxWidth={false}
        sx={{
          borderRadius: '10px',
          maxWidth: '400px',
        }}
      >
        <MetaData title="DEVICE CAPACITY" />
        <Box
          sx={{
            width: '300px',
            height: '300px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress color="success" size="3rem" />
        </Box>
      </Container>
    );
  }

  const rows = [
    {
      type: 'ইউজার',
      maxCapacity: deviceCapacity?.users_capacity || 0,
      used: deviceCapacity?.users_used || 0,
      remain:
        (deviceCapacity?.users_capacity || 0) -
        (deviceCapacity?.users_used || 0),
    },
    {
      type: 'ফিঙ্গারপ্রিন্ট',
      maxCapacity: deviceCapacity?.fingers_capacity || 0,
      used: deviceCapacity?.fingers_used || 0,
      remain:
        (deviceCapacity?.fingers_capacity || 0) -
        (deviceCapacity?.fingers_used || 0),
    },
    {
      type: 'কার্ড',
      maxCapacity: deviceCapacity?.cards_capacity || 0,
      used: deviceCapacity?.cards_used || 0,
      remain:
        (deviceCapacity?.cards_capacity || 0) -
        (deviceCapacity?.cards_used || 0),
    },
  ];

  return (
    <Container
      maxWidth={false}
      sx={{
        borderRadius: '10px',
        maxWidth: '400px',
      }}
    >
      <MetaData title="DEVICE CAPACITY" />
      <CustomCrossButton
        onClick={handleClose}
        disableElevation
        disableRipple
        disableFocusRipple
      >
        <Close fontSize="small" />
      </CustomCrossButton>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '1.5rem',
        }}
      >
        <Grid container justifyContent="center">
          <Grid item xs={10}>
            <Chip
              sx={{
                margin: 'auto',
                display: 'flex',
                justifyContent: 'center',
                borderRadius: '50px',
                textAlign: 'center',
                padding: '0px 10px',
                fontSize: '1.1rem',
              }}
              label={t('deviceCapacity')}
            />
          </Grid>

          <Box sx={{ overflowX: 'auto', mt: 2, mb: 2 }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                    ধরণ
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                    সর্বোচ্চ ধারণ ক্ষমতা
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                    ব্যাবহার করা হয়েছে
                  </th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                    বাকি আছে
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((device) => (
                  <tr key={device.ip}>
                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                      {device.type}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '6px',
                        textAlign: 'center',
                      }}
                    >
                      {device.maxCapacity}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '6px',
                        textAlign: 'center',
                      }}
                    >
                      {device.used}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '6px',
                        textAlign: 'center',
                      }}
                    >
                      {device.remain}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Grid>
      </Box>
    </Container>
  );
}

DeviceCapacity.propTypes = {
  handleClose: PropTypes.func.isRequired,
  deviceData: PropTypes.shape({}).isRequired,
};

export default DeviceCapacity;
