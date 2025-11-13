import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Typography,
  Avatar,
  Stack,
  FormControlLabel,
  IconButton,
  Switch,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhotoCamera } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import {
  useAddUserMutation,
  useGetClassesQuery,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useGetGroupsQuery,
  useGetUsersQuery,
} from '../actions/zkTecoApi';

export default function AdmitForm(rowData) {
  const { t } = useTranslation();
  const { data: departmentData, isLoading: departmentLoading } =
    useGetDepartmentsQuery();
  const { data: classData, isLoading: classLoading } = useGetClassesQuery();
  const [addUser] = useAddUserMutation();
  const departments = departmentData?.departments || [];
  const classes = classData?.classes || [];
  const { data: groupData, isLoading: groupLoading } = useGetGroupsQuery();
  const groups = groupData?.groups || [];
  const { data: designationData, isLoading: designationLoading } =
    useGetDesignationsQuery();
  const designations = designationData?.designations || [];

  const { data: userData, isLoading: userLoading } = useGetUsersQuery();
  const users = userData?.users || [];
  const [photoPreview, setPhotoPreview] = useState(null);
  const year = Number(new Date().getFullYear().toString().slice(-2));

  const defaultValues = {
    id: '',
    user_type: '',
    user_id: 0,
    name: '',
    dob: '',
    gender: '',
    department: '',
    group_name: '',
    designation: '',
    residence: '',
    class_name: '',
    guardian: '',
    contact: '',
    email: '',
    address: '',
    admission_date: new Date().toISOString().slice(0, 10),
    emergency_contact: '',
    status: true,
    photo: null,
  };

  const [preData, setPreData] = useState(rowData?.rowData || defaultValues);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: preData || defaultValues,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();

      // Append all text fields
      Object.keys(values).forEach((key) => {
        if (key !== 'photo') formData.append(key, values[key]);
      });

      // Append photo if available
      if (values.photo instanceof File) {
        formData.append('photo', values.photo);
      }

      // Call the API mutation
      await addUser(formData).unwrap();
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
      setPreData(defaultValues);
      resetForm();
      setPhotoPreview(null);
    },
  });

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      formik.setFieldValue('photo', file);
    }
  };

  const handleReset = () => {
    setPreData(defaultValues);
    setPhotoPreview(null);
  };

  useEffect(() => {
    if (preData?.photo_path) {
      setPhotoPreview(`local://${preData?.photo_path}`);
    }
  }, [preData?.photo_path]);

  useEffect(() => {
    if (formik.values.user_type === 'student') {
      const code =
        classes?.find((c) => c.name === formik.values.class_name)
          ?.code_number || 0;
      const newId = `${year}${code}0${users.length + 1 || 1}`;
      formik.setFieldValue('user_id', newId);
    } else if (formik.values.user_type === 'officiant') {
      const code =
        designations?.find((c) => c.name === formik.values.designation)
          ?.code_number || 0;

      const newId = `${year}${code}0${users.length + 1 || 1}`;
      formik.setFieldValue('user_id', newId);
    }
    // eslint-disable-next-line
  }, [formik.values.class_name, formik.values.designation]);

  if (
    departmentLoading ||
    groupLoading ||
    classLoading ||
    designationLoading ||
    userLoading
  )
    return (
      <Box padding={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ mx: 'auto', p: 3 }}>
      <Typography variant="h5">{t('newUserForm')}</Typography>

      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Grid container spacing={1.5}>
          <Grid item xs={12} textAlign="center" mb={1}>
            <Stack spacing={2} alignItems="center" position="relative">
              {/* Hidden file input */}
              <input
                accept="image/*"
                id="photo"
                name="photo"
                type="file"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />

              {/* Avatar */}
              <label htmlFor="photo" style={{ marginTop: 0 }}>
                <Box position="relative" sx={{ display: 'inline-block' }}>
                  <Avatar
                    alt="Photo preview"
                    src={photoPreview}
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
              </label>
            </Stack>
          </Grid>

          <Grid item xs={6}>
            <FormControl
              fullWidth
              size="small"
              error={
                formik.touched.user_type && Boolean(formik.errors.user_type)
              }
            >
              <InputLabel id="user_type-label">{t('userType')}</InputLabel>
              <Select
                labelId="user_type-label"
                id="user_type"
                name="user_type"
                label={t('userType')}
                value={formik.values.user_type || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="student">{t('student')}</MenuItem>
                <MenuItem value="officiant">{t('officiant')}</MenuItem>
              </Select>
              <FormHelperText>
                {formik.touched.user_type && formik.errors.user_type}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.gender && Boolean(formik.errors.gender)}
            >
              <InputLabel id="gender-label">{t('gender')}</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                name="gender"
                label={t('gender')}
                value={formik.values.gender || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="male">{t('male')}</MenuItem>
                <MenuItem value="female">{t('female')}</MenuItem>
                <MenuItem value="other">{t('other')}</MenuItem>
              </Select>
              <FormHelperText>
                {formik.touched.gender && formik.errors.gender}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              name="name"
              size="small"
              label={t('fullName')}
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
              id="guardian"
              size="small"
              name="guardian"
              label={t('guardianName')}
              value={formik.values.guardian}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.guardian && Boolean(formik.errors.guardian)}
              helperText={formik.touched.guardian && formik.errors.guardian}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="dob"
              name="dob"
              label={t('dateOfBirth')}
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={formik.values.dob}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dob && Boolean(formik.errors.dob)}
              helperText={formik.touched.dob && formik.errors.dob}
            />
          </Grid>

          {formik.values.user_type === 'student' ? (
            // JSX for student fields
            <>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  size="small"
                  error={
                    formik.touched.applyingClass &&
                    Boolean(formik.errors.applyingClass)
                  }
                >
                  <InputLabel id="department-label">
                    {t('department')}
                  </InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    label={t('department')}
                    value={formik.values.department || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                    {/* add more as needed */}
                  </Select>
                  <FormHelperText>
                    {formik.touched.department && formik.errors.department}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  size="small"
                  error={
                    formik.touched.class_name &&
                    Boolean(formik.errors.class_name)
                  }
                >
                  <InputLabel id="class-label">{t('className')}</InputLabel>
                  <Select
                    labelId="class-label"
                    id="class_name"
                    name="class_name"
                    label={t('className')}
                    value={formik.values.class_name || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {formik.touched.class_name && formik.errors.class_name}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  size="small"
                  error={
                    formik.touched.group_name &&
                    Boolean(formik.errors.group_name)
                  }
                >
                  <InputLabel id="class-label">{t('group')}</InputLabel>
                  <Select
                    labelId="class-label"
                    id="group_name"
                    name="group_name"
                    label={t('group')}
                    value={formik.values.group_name || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {groups.map((d) => (
                      <MenuItem key={d.id} value={d.name}>
                        {d.name}
                      </MenuItem>
                    ))}
                    {/* add more as needed */}
                  </Select>
                  <FormHelperText>
                    {formik.touched.group_name && formik.errors.group_name}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                size="small"
                error={
                  formik.touched.designation &&
                  Boolean(formik.errors.designation)
                }
              >
                <InputLabel id="class-label">{t('designation')}</InputLabel>
                <Select
                  labelId="class-label"
                  id="designation"
                  name="designation"
                  label={t('designation')}
                  value={formik.values.designation || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {designations.map((d) => (
                    <MenuItem key={d.id} value={d.name}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {formik.touched.designation && formik.errors.designation}
                </FormHelperText>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              size="small"
              error={
                formik.touched.residence && Boolean(formik.errors.residence)
              }
            >
              <InputLabel id="residence-label">{t('residence')}</InputLabel>
              <Select
                labelId="residence-label"
                id="residence"
                name="residence"
                label={t('residence')}
                value={formik.values.residence || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="residential">{t('residential')}</MenuItem>
                <MenuItem value="non_residential">
                  {t('non_residential')}
                </MenuItem>
                <MenuItem value="day_care">{t('dayCare')}</MenuItem>
              </Select>
              <FormHelperText>
                {formik.touched.residence && formik.errors.residence}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              size="small"
              label={t('optionalEmail')}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="emergency_contact"
              size="small"
              name="emergency_contact"
              label={t('emergencyContact')}
              value={formik.values.emergency_contact}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="address"
              name="address"
              label={t('address')}
              multiline
              size="small"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="admission_date"
              name="admission_date"
              size="small"
              label={t('admissionDate')}
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.admission_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              id="user_id"
              name="user_id"
              type="number"
              size="small"
              label={t('idNo')}
              value={formik.values.user_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.user_id && Boolean(formik.errors.user_id)}
              helperText={formik.touched.user_id && formik.errors.user_id}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <FormControlLabel
              control={
                <Switch
                  id="status"
                  name="status"
                  color="primary"
                  checked={Boolean(formik.values.status)}
                  onChange={(e) =>
                    formik.setFieldValue('status', e.target.status)
                  }
                />
              }
              label={formik.values.status ? t('active') : t('inactive')}
            />
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
      </Box>
    </Box>
  );
}
