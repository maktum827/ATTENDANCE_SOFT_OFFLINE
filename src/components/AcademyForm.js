import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Paper,
  Button,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhotoCamera } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useAddAcademyMutation } from '../actions/zkTecoApi';

export default function ACADEMYFORM(academy) {
  const { t } = useTranslation();
  const [addAcademy] = useAddAcademyMutation();
  const [logoPreview, setLogoPreview] = useState(null);

  const defaultValues = {
    id: '',
    name: '',
    address: '',
    english_name: '',
    english_address: '',
    contact: '',
    email: '',
    website: '',
    facebook_page: '',
    established_year: '',
    institute_code: '',
    logo_path: null,
  };

  const [preData, setPreData] = useState(academy?.academy || defaultValues);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: preData || defaultValues,
    onSubmit: async (values) => {
      const formData = new FormData();

      // Append all text fields
      Object.keys(values).forEach((key) => {
        if (key !== 'logo_path') formData.append(key, values[key]);
      });

      // Append logo if available
      if (values.logo_path instanceof File) {
        formData.append('logo_path', values.logo_path);
      }

      // Call the API mutation
      await addAcademy(formData).unwrap();
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
    },
  });

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      formik.setFieldValue('logo_path', file);
    }
  };

  useEffect(() => {
    if (preData?.logo_path) {
      setLogoPreview(`local://${preData?.logo_path}`);
    }
  }, [preData?.logo_path]);

  const handleReset = () => {
    setPreData(defaultValues);
    setLogoPreview(null);
  };

  return (
    <Box>
      <Paper
        elevation={0}
        component="form"
        onSubmit={formik.handleSubmit}
        noValidate
        sx={{ p: 2 }}
      >
        <Typography variant="h5">{t('academicInfo')}</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} textAlign="center" mb={1}>
            <Stack spacing={2} alignItems="center" position="relative">
              {/* Hidden file input */}
              <input
                accept="image/*"
                id="logo_path"
                name="logo_path"
                type="file"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />

              {/* Avatar */}
              <label htmlFor="logo_path" style={{ marginTop: 0 }}>
                <Tooltip title="clickHereToUploadLogo">
                  <Box position="relative" sx={{ display: 'inline-block' }}>
                    <Avatar
                      alt="logo preview"
                      src={logoPreview}
                      sx={{
                        width: 90,
                        height: 90,
                        cursor: 'pointer',
                        border: '2px solid #ccc',
                      }}
                    />
                    {/* Camera icon overlay */}
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'white',
                        boxShadow: 1,
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  </Box>
                </Tooltip>
              </label>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              name="name"
              size="small"
              label={t('academicName')}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="address"
              size="small"
              name="address"
              label={t('address')}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="english_name"
              name="english_name"
              size="small"
              label={t('englishName')}
              value={formik.values.english_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.english_name &&
                Boolean(formik.errors.english_name)
              }
              helperText={
                formik.touched.english_name && formik.errors.english_name
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="english_address"
              size="small"
              name="english_address"
              label={t('englishAddress')}
              value={formik.values.english_address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.english_address &&
                Boolean(formik.errors.english_address)
              }
              helperText={
                formik.touched.english_address && formik.errors.english_address
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="contact"
              size="small"
              name="contact"
              label={t('contactNumber')}
              value={formik.values.contact}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.contact && Boolean(formik.errors.contact)}
              helperText={formik.touched.contact && formik.errors.contact}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="email"
              name="email"
              size="small"
              label={t('email')}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="website"
              name="website"
              size="small"
              label={t('website')}
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.website && Boolean(formik.errors.website)}
              helperText={formik.touched.website && formik.errors.website}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="facebook_page"
              name="facebook_page"
              size="small"
              label={t('facebook_page')}
              value={formik.values.facebook_page}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.facebook_page &&
                Boolean(formik.errors.facebook_page)
              }
              helperText={
                formik.touched.facebook_page && formik.errors.facebook_page
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="established_year"
              name="established_year"
              size="small"
              label={t('established_year')}
              value={formik.values.established_year}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.established_year &&
                Boolean(formik.errors.established_year)
              }
              helperText={
                formik.touched.established_year &&
                formik.errors.established_year
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="institute_code"
              name="institute_code"
              size="small"
              label={t('institute_code')}
              value={formik.values.institute_code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.institute_code &&
                Boolean(formik.errors.institute_code)
              }
              helperText={
                formik.touched.institute_code && formik.errors.institute_code
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="right">
              <Button
                variant="contained"
                disableElevation
                color="error"
                onClick={handleReset}
              >
                {t('clear')}
              </Button>
              <Button disableElevation type="submit" variant="contained">
                {t('save')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
