// React and related hooks
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

// MUI components and icons
import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import {
  Grid,
  Box,
  Dialog,
  Chip,
  Typography,
  ButtonGroup,
  IconButton,
  Button,
} from '@mui/material';
import {
  AddCircle,
  AppRegistration,
  AppRegistrationIcon,
  Delete,
  Edit,
} from '@mui/icons-material';

// Custom components and utilities
import MetaData from './utils/metaData';
import { CustomDataGrid, useDataGridColumns } from './utils/useDataGridColumns';
import DEVICEREGISTERFORM from './RegisterInDeviceForm';

// Custom hooks
import useAuth from './hooks/UseAuth';
import {
  useDeleteZkUserMutation,
  useGetDevicesQuery,
  useGetUsersQuery,
  useGetZkUsersMutation,
} from '../actions/zkTecoApi';
import AdmitForm from './AdmitForm';
import { CustomCrossButton } from './styles/style';

function CustomToolbar({ handleClick }) {
  const { t } = useTranslation();
  // for changing local text of mui dataGrid
  const localeText = {
    toolbarQuickFilterPlaceholder: t('typeHere'),
  };

  return (
    <GridToolbarContainer>
      <Grid container alignItems="center">
        <Grid
          xs={6}
          sm={3}
          order={{ sm: 1, xs: 2 }}
          item
          display="flex"
          justifyContent="left"
        >
          <ButtonGroup
            size="small"
            variant="outlined"
            aria-label="Basic button group"
          >
            <Button aria-label="Add icon" onClick={handleClick}>
              <AddCircle />
            </Button>
            {/* <Button aria-label="Print icon" onClick={handleDownloadFile}>
        <FileDownloadOutlinedIcon />
      </Button> */}
          </ButtonGroup>
        </Grid>
        <Grid
          xs={12}
          sm={6}
          order={{ sm: 2, xs: 1 }}
          item
          display="flex"
          justifyContent="center"
        >
          <Chip
            sx={{
              fontSize: '1rem',
            }}
            label={t('users')}
          />
        </Grid>
        <Grid
          xs={6}
          sm={3}
          order={{ sm: 3, xs: 3 }}
          item
          display="flex"
          justifyContent="end"
        >
          <GridToolbarQuickFilter
            placeholder={localeText.toolbarQuickFilterPlaceholder}
          />
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

export default function USERT() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  // const dispatch = useDispatch();
  const { code, logo } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);
  const [getZkUsers, { data: zkUsers, isLoading }] = useGetZkUsersMutation();

  const { data } = useGetDevicesQuery();
  const devices = useMemo(() => data?.devices || [], [data]);

  const { data: userData, isLoading: userLoading } = useGetUsersQuery();
  const users = userData?.users || [];

  const [deleteZkUser] = useDeleteZkUserMutation();

  const [selectedRow, setSelectedRow] = useState('');

  useEffect(() => {
    if (devices.length > 0) {
      try {
        // Now fetch new ZK users
        getZkUsers(devices).unwrap();
      } catch (err) {
        enqueueSnackbar('Failed to stop ZKTeco streams', {
          variant: 'error',
        });
      }
    }
  }, [devices, getZkUsers, enqueueSnackbar]);

  // for change mui localtext selection
  const localeText = {
    footerRowSelected: (count) =>
      `${count} ${t('line')}${count !== 1 ? t('lines') : ''} ${t('selectedLine')}`,
    noRowsLabel: t('sorryNotFound'),
    noResultsOverlayLabel: t('sorryNotFound'),
  };

  const handleClick = () => {
    setOpenForm(true);
  };

  const handleRegistration = (rowData) => {
    setSelectedRow(rowData);
    setOpen(true);
  };

  const handleEditForm = (rowData) => {
    setSelectedRow(rowData);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    await deleteZkUser(id);
    enqueueSnackbar(t('successMessage'), { variant: 'success' });
  };

  const handleCloseAdmitForm = () => {
    setOpenForm(false);
  };

  const handleClose = () => {
    setOpen(false);
    getZkUsers({ data: devices, code });
  };

  const columns = useDataGridColumns([
    {
      field: 'serial',
      headerName: t('serialNo'),
      minWidth: 80,
      width: 80,
      disableColumnMenu: false,
      flex: 0,
    },
    {
      field: 'user_id',
      headerName: t('idNo'),
      minWidth: 80,
      width: 80,
      sortable: true,
      flex: 0,
    },
    {
      field: 'user_type',
      headerName: t('type'),
      minWidth: 80,
      width: 80,
      sortable: true,
      flex: 0,
      renderCell: (params) => <Box>{t(params.value)}</Box>,
    },
    {
      field: 'photo_path',
      headerName: t('picture'),
      width: 80,
      minWidth: 80,
      flex: 0,
      renderCell: (params) => (
        <img
          src={`local://${params.value}`}
          alt="User"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            marginTop: '2.5px',
          }}
        />
      ),
    },
    { field: 'name', headerName: t('name') },
    { field: 'classOrDesignation', headerName: t('classOrDesignation') },
    {
      field: 'group_name',
      headerName: t('group'),
      renderCell: (params) => <Box>{params.value || '----------'}</Box>,
    },
    { field: 'address', headerName: t('address') },
    {
      field: 'residence',
      headerName: t('residence_type'),
      renderCell: (params) => <Box>{t(params.value)}</Box>,
    },
    {
      field: 'attendance',
      headerName: t('attendance'),
      headerClassName: 'CustomHeader',
      minWidth: 100,
      width: 100,
      flex: 0,
      renderCell: (params) => <Box>{params.row.isMatched ? '✔️' : ''}</Box>,
    },
    {
      field: 'actions',
      headerName: t('actions'),
      type: 'actions',
      width: 110,
      minWidth: 110,
      flex: 0,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="edit"
          onClick={() => handleEditForm(params.row)}
        />,
        <GridActionsCellItem
          icon={<AppRegistration />}
          label="edit"
          onClick={() => handleRegistration(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Delete
              sx={{
                color: 'red',
              }}
            />
          }
          label={t('delete')}
          onClick={() => handleDelete(params.row)}
          showInMenu
        />,
      ],
    },
  ]);

  const matchedData = [];
  const seenIds = new Set(); // track all matched IDs to avoid duplication

  // 1. Match users with users or staffs
  zkUsers?.forEach((user) => {
    const [type, rawId] = user.name.split(/[-–—]+/).map((s) => s.trim());
    const id = parseInt(rawId, 10);
    if (!id) return;

    let matched = null;

    matched = users?.find((s) => s.user_id === id);
    if (matched) {
      matchedData.push({
        isMatched: true,
        ip: user.ip,
        port: user.port,
        uid: user.uid,
        card: user.card,
        pin: user.password,
        // finger: user.fingerprint,
        isStudent: type.toLowerCase() === 'student',
        ...matched,
      });
      seenIds.add(id);
    }
  });

  // 2. Add remaining users (unmatched users)
  const unmatchedUsers = users
    ?.filter((s) => !seenIds.has(Number(s.user_id)))
    .map((s) => ({
      ip: null,
      port: null,
      uid: null,
      isStudent: true,
      ...s,
    }));

  // 4. Final data
  const finalData = [...matchedData, ...unmatchedUsers];

  // Transform staff array into the desired format
  const rows = finalData?.map((d, index) => {
    return {
      serial: index + 1,
      ...d,
      classOrDesignation: d.class_name || t('designation'),
      // id: d.id,
      // user_id: d.user_id,
      // uid: d.uid,
      // ip: d.ip,
      // port: d.port,
      // idNo: d.isStudent ? d.admit_no : d.staff_id,
      // photo_path: d?.photo_path ? d.photo_path : logo,
      // fullName: d.name,
      // dob: d.dob,
      // class_name: d.class_name,
      // group_name: d.group_name,
      // contact: d.contact,
      // typeParam: d.isStudent ? 'student' : 'teacher',
      // address: d.address,
      // residence_type: t(d.residence),
      // card: d.card, // only for use in params
      // // finger: d.fingerprint, // only for use in params
      // pin: d.pin, // only for use in params
      // devices: d.ip, // only for use in params
      // isMatched: d.isMatched,
      // isStudent: d.isStudent, // only for use in params
    };
  });

  return (
    <Box className="globalShapeDesign">
      <MetaData title="USERS" />
      <Dialog
        open={openForm}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="sm"
      >
        <CustomCrossButton
          onClick={handleCloseAdmitForm}
          disableElevation
          disableRipple
          disableFocusRipple
        >
          <CloseIcon fontSize="small" />
        </CustomCrossButton>
        <AdmitForm rowData={selectedRow} onClose={() => setOpenForm(false)} />
      </Dialog>
      <Dialog
        open={open}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="md"
      >
        <DEVICEREGISTERFORM
          closeDialog={handleClose}
          rowData={selectedRow || {}}
        />
      </Dialog>

      <CustomDataGrid
        rows={rows}
        columns={columns}
        localeText={localeText}
        loading={isLoading || userLoading}
        initialState={{
          columns: {
            columnVisibilityModel: {
              __check__: false,
            },
          },
        }}
        slots={{
          // eslint-disable-next-line react/no-unstable-nested-components
          toolbar: () => <CustomToolbar handleClick={handleClick} />,
        }}
      />
    </Box>
  );
}
