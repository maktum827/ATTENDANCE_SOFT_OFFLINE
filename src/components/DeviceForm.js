// React and Related Imports
import { useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

// Material-UI Imports
import {
  TextField,
  Grid,
  Box,
  Container,
  MenuItem,
  Button,
} from '@mui/material';
// Custom Imports
import { useAddDeviceMutation } from 'src/actions/zkTecoApi.js';
import MetaData from './utils/metaData.js';

export default function NEWDEVICEFORM(selectedData) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const formRef = useRef(null);
  const [addNewDevice] = useAddDeviceMutation();

  const initialValues = selectedData?.selectedData || {
    id: '',
    name: '',
    user: '',
    ip: '',
    port: '',
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, { resetForm }) => {
      try {
        await addNewDevice(values).unwrap();
        resetForm();
        selectedData?.onClose();
        enqueueSnackbar(t('successMessage'), { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(t('notWorked'), { variant: 'error' });
      }
    },
  });

  return (
    <Container>
      <MetaData title="NEW DEVICE FORM" />
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        ref={formRef}
        encType="multipart/form-data"
      >
        <Grid container spacing={2} padding={1}>
          {/* Device Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="name"
              name="name"
              label={t('name')}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>

          {/* Device User */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              size="small"
              id="user"
              name="user"
              label={t('user')}
              value={formik.values.user}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.user && Boolean(formik.errors.user)}
              helperText={formik.touched.user && formik.errors.user}
            >
              <MenuItem value="Student">{t('student')}</MenuItem>
              <MenuItem value="Officiant">{t('officiant')}</MenuItem>
              <MenuItem value="All">{`${t('student')}/${t('officiant')}`}</MenuItem>
            </TextField>
          </Grid>

          {/* IP Address */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="ip"
              name="ip"
              label={t('ip')}
              value={formik.values.ip}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ip && Boolean(formik.errors.ip)}
              helperText={formik.touched.ip && formik.errors.ip}
            />
          </Grid>

          {/* Port */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="port"
              name="port"
              label={t('port')}
              value={formik.values.port}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.port && Boolean(formik.errors.port)}
              helperText={formik.touched.port && formik.errors.port}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              disableElevation
              type="submit"
              color="success"
              variant="contained"
            >
              {t('save')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
