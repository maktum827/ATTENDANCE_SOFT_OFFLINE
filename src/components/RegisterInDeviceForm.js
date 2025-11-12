// React and related hooks
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

// MUI components and icons
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Container,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Close, Fingerprint } from '@mui/icons-material';
import { green } from '@mui/material/colors';

// Custom components and utilities
import { CustomCrossButton } from './styles/style';
import { convertToBengaliDigits } from './utils/converter';

// Custom hooks
import useAuth from './hooks/UseAuth';
import { getAttendanceTypes } from '../constants/othersConstants';
import {
  useAddZkNewUserMutation,
  useGetDevicesQuery,
} from '../actions/zkTecoApi';

function DEVICEREGISTERFORM({ closeDialog, rowData }) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const formRef = useRef(null);
  const { code } = useAuth();

  const [zkNewUser, { isLoading: loading, isSuccess }] =
    useAddZkNewUserMutation();
  const { data } = useGetDevicesQuery();
  const devices = data?.devices || [];

  // check device is exist or not
  const device = devices?.find((d) => d.ip === rowData.ip);

  // Fix nested ternary
  let defaultAttendanceMethod = 'finger';
  if (rowData?.card) defaultAttendanceMethod = 'card';
  else if (rowData?.pin) defaultAttendanceMethod = 'pin';

  const defaultValues = {
    attendanceMethod: defaultAttendanceMethod,
    residence: rowData?.residence || '',
    card: rowData?.card || '',
    pin: rowData?.pin || '',
    deviceIPs: device?.ip ? [`${device.ip}:${device.port}`] : [],
  };

  const { handleSubmit, control, getValues } = useForm({ defaultValues });
  const [attendanceType, setAttendanceType] = useState([]);

  useEffect(() => {
    if (isSuccess) {
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
      closeDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const handleAttendanceTypeChange = (e) => {
    if (e.target.value === 'all') setAttendanceType(['card', 'pin']);
    else if (e.target.value === 'finger') setAttendanceType([]);
    else setAttendanceType([e.target.value]);
  };

  useEffect(() => {
    if (rowData?.card || rowData?.pin) {
      const availableTypes = ['card', 'pin'].filter((type) => rowData[type]);
      setAttendanceType(availableTypes.length ? availableTypes : []);
    } else setAttendanceType([]);
  }, [rowData]);

  const onSubmit = async (newData) => {
    const selectedIPs = newData.deviceIPs.map(
      (ipWithPort) => ipWithPort.split(':')[0],
    );
    const newDevices = devices.filter((dev) => selectedIPs.includes(dev.ip));

    const userData = {
      userType: rowData.isStudent ? 'Student' : 'Officiant',
      isUpdate: Boolean(rowData.uid),
      uid: rowData.uid,
      idNo: rowData.user_id,
      privilege: '',
      finger:
        newData.attendanceMethod === 'all' ||
        newData.attendanceMethod === 'finger'
          ? 'finger'
          : '',
      card: newData.card,
      pin: newData.pin,
    };
    const finalData = [newDevices, userData];

    try {
      zkNewUser({ data: finalData, code });
    } catch (err) {
      enqueueSnackbar(t('zktecoOffMeesage'), { variant: 'error' });
    }
  };

  const attendanceOptions = getAttendanceTypes(t);

  return (
    <Container
      maxWidth={false}
      sx={{ borderRadius: '10px', maxWidth: '700px' }}
    >
      <CustomCrossButton
        onClick={closeDialog}
        disableElevation
        disableRipple
        disableFocusRipple
      >
        <Close fontSize="small" />
      </CustomCrossButton>

      <Grid container spacing={3} paddingTop={4} paddingBottom={4}>
        <Grid item xs={12} sm={5}>
          <Paper
            sx={{ padding: 2, height: '100%', borderRight: '1px dashed' }}
            elevation={0}
          >
            <Avatar
              alt="Profile Picture"
              src={`local://${rowData?.photo_path}`}
              sx={{
                width: 100,
                height: 100,
                margin: '0 auto',
                mb: 2,
                border: '1px solid #ccc',
              }}
            />
            <Typography variant="h7" component="div" fontWeight="bold">
              {t('idNo')}: {convertToBengaliDigits(rowData?.user_id || '')}
            </Typography>
            <Typography variant="h7" component="div" fontWeight="bold">
              {t('name')}: {rowData?.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {rowData.user_type === 'student' ? t('class') : t('designation')}:{' '}
              {rowData?.class_name || rowData?.designation}
            </Typography>
            {rowData.user_type === 'student' && (
              <Typography variant="body1" color="textSecondary">
                {t('group')}: {rowData?.group_name}
              </Typography>
            )}
            <Typography variant="body1" color="textSecondary">
              {t('guardian')}: {rowData?.guardian}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {t('address')}: {rowData?.address}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {t('contact')}: {convertToBengaliDigits(rowData?.contact || '')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={7}>
          <Paper sx={{ padding: 2, height: '100%' }} elevation={0}>
            <Box marginBottom="1rem">
              <Typography fontWeight="bold" gutterBottom>
                {t('deviceUserRegistration')}
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              ref={formRef}
              encType="multipart/form-data"
            >
              <Grid container spacing={1.5} item xs={12}>
                {['residential', 'attendanceMethod'].map((lbl) => (
                  <Grid item xs={12} key={lbl}>
                    {lbl === 'attendanceMethod' ? (
                      <Controller
                        name={lbl}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              handleAttendanceTypeChange(e);
                            }}
                            fullWidth
                            size="small"
                            select
                            label={t(lbl)}
                          >
                            {attendanceOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    ) : (
                      <TextField
                        defaultValue={t(rowData.residence)}
                        fullWidth
                        size="small"
                        label={t(lbl)}
                        disabled
                      />
                    )}
                  </Grid>
                ))}

                {attendanceType.map((lbl) => (
                  <Grid item xs={12} key={lbl}>
                    <Controller
                      name={lbl}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          value={field.value}
                          onChange={field.onChange}
                          fullWidth
                          size="small"
                          required
                          label={t(lbl)}
                        />
                      )}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <Controller
                    name="deviceIPs"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        multiple
                        fullWidth
                        size="small"
                        label={t('deviceNames')}
                        value={Array.isArray(field.value) ? field.value : []}
                        onChange={(e) => field.onChange(e.target.value)}
                        SelectProps={{
                          multiple: true,
                          renderValue: (selected) =>
                            Array.isArray(selected)
                              ? selected
                                  .map((ipWithPort) => {
                                    const [ip, port] = ipWithPort.split(':');
                                    const deviceObj = devices?.find(
                                      (d) =>
                                        d.ip === ip &&
                                        d.port.toString() === port,
                                    );
                                    return deviceObj ? deviceObj.name : '';
                                  })
                                  .join(', ')
                              : '',
                        }}
                      >
                        <MenuItem value="">{t('select')}</MenuItem>
                        {devices?.map((option) => (
                          <MenuItem
                            key={option.id}
                            value={`${option.ip}:${option.port}`}
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="success"
                type="submit"
                startIcon={
                  ['finger', 'all'].includes(getValues('attendanceMethod')) ? (
                    <Fingerprint />
                  ) : null
                }
                sx={{ mt: 2, justifyContent: 'left' }}
                disabled={loading}
                disableElevation
              >
                {t('save')}
                {loading && (
                  <CircularProgress
                    size={30}
                    sx={{
                      color: green[500],
                      position: 'absolute',
                      top: 3,
                      left: 6.8,
                      zIndex: 1,
                    }}
                  />
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

DEVICEREGISTERFORM.propTypes = {
  closeDialog: PropTypes.func.isRequired,
  rowData: PropTypes.shape({
    ip: PropTypes.string,
    card: PropTypes.number,
    pin: PropTypes.string,
    residence: PropTypes.string,
    user_type: PropTypes.string,
    designation: PropTypes.string,
    uid: PropTypes.number,
    user_id: PropTypes.number,
    name: PropTypes.string,
    photo_path: PropTypes.string,
    typeParam: PropTypes.string,
    class_name: PropTypes.string,
    group_name: PropTypes.string,
    guardian: PropTypes.string,
    address: PropTypes.string,
    contact: PropTypes.string,
    isStudent: PropTypes.bool,
  }).isRequired,
};

export default DEVICEREGISTERFORM;
