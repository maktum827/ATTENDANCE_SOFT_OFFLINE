// SETUPDATA.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Stack,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import {
  useAddClassMutation,
  useAddDepartmentMutation,
  useAddDesignationMutation,
  useAddGroupMutation,
  useDeleteClassMutation,
  useDeleteDepartmentMutation,
  useDeleteDesignationMutation,
  useDeleteGroupMutation,
  useGetClassesQuery,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useGetGroupsQuery,
} from '../actions/zkTecoApi';
import LoadingScreen from './minicomp/LoadingScreen';
import { convertToBengaliDigits } from './utils/converter';

function SETUPDATA() {
  const { t } = useTranslation();
  // --- States ---
  const [newClass, setNewClass] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDesignationCode, setNewDesignationCode] = useState('');
  const [newGroup, setNewGroup] = useState('');

  const [addDepartment] = useAddDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const { data, isLoading } = useGetDepartmentsQuery();
  const departments = data?.departments || [];

  const [addDesignation] = useAddDesignationMutation();
  const [deleteDesignation] = useDeleteDesignationMutation();
  const { data: designationData, isLoading: designationLoading } =
    useGetDesignationsQuery();
  const designations = designationData?.designations || [];

  const [addClass] = useAddClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  const [addGroup] = useAddGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();
  const { data: classData, isLoading: classLoading } = useGetClassesQuery();
  const classes = classData?.classes || [];

  const { data: groupData, isLoading: groupLoading } = useGetGroupsQuery();
  const groups = groupData?.groups || [];

  // --- Handlers ---
  const handleAddClass = async () => {
    if (newClass.trim()) {
      await addClass({ class_name: newClass, code_number: newCode }).unwrap();
      setNewClass('');
      setNewCode('');
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
    }
  };

  const handleAddDepartment = async () => {
    if (newDepartment.trim()) {
      await addDepartment({ department: newDepartment }).unwrap();
      setNewDepartment('');
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
    }
  };

  const handleDeleteDepartment = async (index) => {
    await deleteDepartment(index).unwrap();
    enqueueSnackbar(t('successMessage'), { variant: 'success' });
  };

  const handleAddDesignation = async () => {
    if (newDesignation.trim()) {
      await addDesignation({
        designation: newDesignation,
        code_number: newDesignationCode,
      }).unwrap();
      setNewDesignation('');
      setNewDesignationCode('');
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
    }
  };

  const handleDeleteDesignation = async (index) => {
    await deleteDesignation(index).unwrap();
    enqueueSnackbar(t('successMessage'), { variant: 'success' });
  };

  const handleDeleteClass = async (index) => {
    await deleteClass(index).unwrap();
    enqueueSnackbar(t('successMessage'), { variant: 'success' });
  };

  const handleAddGroup = async () => {
    if (newGroup.trim()) {
      await addGroup({ group: newGroup }).unwrap();
      setNewGroup('');
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
    }
  };

  const handleDeleteGroup = async (id) => {
    await deleteGroup(id).unwrap();
    enqueueSnackbar(t('successMessage'), { variant: 'success' });
  };

  if (isLoading || classLoading || groupLoading || designationLoading)
    return <LoadingScreen />;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Right Side - Departments */}
        <Grid item md={12} lg={4}>
          <Card className="customBorder" sx={{ borderRadius: 3, boxShadow: 0 }}>
            <CardHeader title={t('manageDepartments')} />
            <Divider />
            <CardContent>
              {/* Plain HTML form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Only add department if form is valid
                  if (e.target.checkValidity()) {
                    handleAddDepartment();
                  }
                }}
              >
                <Stack direction="row" spacing={2} mb={2}>
                  <TextField
                    label={t('newDepartment')}
                    name="department"
                    required
                    size="small"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    fullWidth
                  />
                  <Button
                    type="submit" // ✅ native form submit triggers required validation
                    fullWidth
                    disableElevation
                    sx={{ maxWidth: 100 }}
                    variant="contained"
                    startIcon={<Add />}
                    size="small"
                  >
                    {t('add')}
                  </Button>
                </Stack>
              </form>

              {departments.length === 0 ? (
                <Typography color="text.secondary">
                  {t('sorryNotFound')}
                </Typography>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {departments.map((dept) => (
                    <Chip
                      key={dept.id}
                      label={dept.name}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      onDelete={() => handleDeleteDepartment(dept.id)}
                      deleteIcon={
                        <Tooltip title="Delete">
                          <Delete fontSize="small" color="error" />
                        </Tooltip>
                      }
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={12} lg={5}>
          <Card
            className="customBorder"
            sx={{
              borderRadius: 3,
              boxShadow: 0,
            }}
          >
            <CardHeader title={t('manageClasses')} />
            <Divider />
            <CardContent>
              {/* Plain HTML form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Only add class if form is valid
                  if (e.target.checkValidity()) {
                    handleAddClass();
                  }
                }}
              >
                <Stack direction="row" spacing={2} mb={2}>
                  <TextField
                    label={t('newClass')}
                    name="className"
                    required
                    size="small"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t('code')}
                    name="code"
                    required
                    type="number"
                    size="small"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />

                  <Button
                    type="submit" // ✅ native form submit triggers required validation
                    fullWidth
                    disableElevation
                    sx={{ maxWidth: 100 }}
                    variant="contained"
                    startIcon={<Add />}
                    size="small"
                  >
                    {t('add')}
                  </Button>
                </Stack>
              </form>

              {classes.length === 0 ? (
                <Typography color="text.secondary">
                  {t('sorryNotFound')}
                </Typography>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {classes.map((cls) => (
                    <Chip
                      key={cls.id}
                      size="small"
                      label={`${cls.name}, ${t('code')}: ${convertToBengaliDigits(cls.code_number)}`}
                      onDelete={() => handleDeleteClass(cls.id)}
                      deleteIcon={
                        <Tooltip title={t('delete')}>
                          <Delete fontSize="small" color="error" />
                        </Tooltip>
                      }
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={12} lg={3}>
          <Card className="customBorder" sx={{ borderRadius: 3, boxShadow: 0 }}>
            <CardHeader title={t('manageGroupes')} />
            <Divider />
            <CardContent>
              {/* Plain HTML form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Only add group if form is valid
                  if (e.target.checkValidity()) {
                    handleAddGroup();
                  }
                }}
              >
                <Stack direction="row" spacing={2} mb={2}>
                  <TextField
                    label={t('newGroup')}
                    name="group"
                    required
                    size="small"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    fullWidth
                  />
                  <Button
                    type="submit" // ✅ native form submit triggers required validation
                    fullWidth
                    disableElevation
                    sx={{ maxWidth: 100 }}
                    variant="contained"
                    startIcon={<Add />}
                    size="small"
                  >
                    {t('add')}
                  </Button>
                </Stack>
              </form>

              {groups.length === 0 ? (
                <Typography color="text.secondary">
                  {t('sorryNotFound')}
                </Typography>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {groups.map((g) => (
                    <Chip
                      key={g.id}
                      label={g.name}
                      color="info"
                      variant="outlined"
                      size="small"
                      onDelete={() => handleDeleteGroup(g.id)}
                      deleteIcon={
                        <Tooltip title="Delete">
                          <Delete fontSize="small" color="error" />
                        </Tooltip>
                      }
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={12} lg={4}>
          <Box display="none">Hello</Box>
        </Grid>

        <Grid item md={12} lg={5}>
          <Card className="customBorder" sx={{ borderRadius: 3, boxShadow: 0 }}>
            <CardHeader
              title={`${t('manageDesignations')} (${t('forOfficiant')})`}
            />
            <Divider />
            <CardContent>
              {/* Plain HTML form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Only add designation if form is valid
                  if (e.target.checkValidity()) {
                    handleAddDesignation();
                  }
                }}
              >
                <Stack direction="row" spacing={2} mb={2}>
                  <TextField
                    label={t('newDesignation')}
                    name="designation"
                    required
                    size="small"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t('code')}
                    name="designation_code"
                    type="number"
                    required
                    size="small"
                    value={newDesignationCode}
                    onChange={(e) => setNewDesignationCode(e.target.value)}
                  />
                  <Button
                    type="submit" // ✅ native form submit triggers required validation
                    fullWidth
                    disableElevation
                    sx={{ maxWidth: 100 }}
                    variant="contained"
                    startIcon={<Add />}
                    size="small"
                  >
                    {t('add')}
                  </Button>
                </Stack>
              </form>

              {designations.length === 0 ? (
                <Typography color="text.secondary">
                  {t('sorryNotFound')}
                </Typography>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {designations.map((desig) => (
                    <Chip
                      key={desig.id}
                      label={`${desig.name}, ${t('code')}: ${convertToBengaliDigits(desig.code_number)}`}
                      color="success"
                      variant="outlined"
                      size="small"
                      onDelete={() => handleDeleteDesignation(desig.id)}
                      deleteIcon={
                        <Tooltip title="Delete">
                          <Delete fontSize="small" color="error" />
                        </Tooltip>
                      }
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SETUPDATA;
