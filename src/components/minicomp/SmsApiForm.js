// React and Related Imports
import { useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

// Material-UI Imports
import { TextField, Grid, Box, Container, Button } from '@mui/material';
// Custom Imports
import { useAddSmsServiceMutation } from '../../actions/zkTecoApi.js';
import MetaData from '../utils/metaData.js';

export default function SMSINTEGRATIONFORM(action) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const formRef = useRef(null);
  const [addSmsService] = useAddSmsServiceMutation();

  const initialValues = {
    api_key: '',
    sender_id: '',
    password: '',
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      try {
        await addSmsService(values).unwrap();
        enqueueSnackbar(t('successMessage'), { variant: 'success' });
        action?.action();
      } catch (err) {
        enqueueSnackbar(t('notWorked'), { variant: 'error' });
      }
    },
  });

  return (
    <Container>
      <MetaData title="SMS INTEGRATION" />
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        ref={formRef}
        encType="multipart/form-data"
      >
        <Grid container spacing={2} padding={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="api_key"
              name="api_key"
              label={t('api_key')}
              value={formik.values.api_key}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.api_key && Boolean(formik.errors.api_key)}
              helperText={formik.touched.api_key && formik.errors.api_key}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="sender_id"
              name="sender_id"
              label={t('sender_id')}
              value={formik.values.sender_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.sender_id && Boolean(formik.errors.sender_id)
              }
              helperText={formik.touched.sender_id && formik.errors.sender_id}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="password"
              type="password"
              name="password"
              label={t('password')}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
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
              {t('connect')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
