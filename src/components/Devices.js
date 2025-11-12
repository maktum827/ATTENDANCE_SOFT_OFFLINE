// React and related hooks
import React, { useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

// MUI components and icons
import {
  Box,
  Dialog,
  Button,
  Grid,
  ButtonGroup,
  Chip,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';

// Constants
import {
  AddCircle,
  Cancel,
  CheckCircle,
  Close,
  Delete,
  Edit,
} from '@mui/icons-material';
import {
  useConnectAttendanceDeviceMutation,
  useGetDevicesQuery,
} from '../actions/zkTecoApi.js';
import NEWDEVICEFORM from './DeviceForm.js';
import { CustomDataGrid } from './utils/useDataGridColumns.js';
import { CustomCrossButton } from './styles/style.js';
import MetaData from './utils/metaData.js';

export default function ATTENDANCEDEVICES() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading } = useGetDevicesQuery();
  const devices = useMemo(() => data?.devices || [], [data]);

  const [
    connectAttendanceDevice,
    { data: devicesData, isLoading: connectLoading },
  ] = useConnectAttendanceDeviceMutation();

  // const [deleteAttendanceDevice] = useDeleteAttendanceDeviceMutation();

  const [open, setOpen] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState(null);

  const localeText = {
    footerRowSelected: (count) =>
      `${count} ${t('line')}${count !== 1 ? t('lines') : ''} ${t(
        'selectedLine',
      )}`,
    noRowsLabel: t('sorryNotFound'),
    noResultsOverlayLabel: t('sorryNotFound'),
  };

  const handleDelete = async (id) => {
    // await deleteAttendanceDevice(id);
    enqueueSnackbar(t('successMessage'), { variant: 'success' });
  };

  const handleOpen = () => {
    setSelectedData(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (rowData) => {
    setSelectedData(rowData);
    setOpen(true);
  };

  useEffect(() => {
    if (devices?.length > 0) {
      connectAttendanceDevice(devices);
    }
  }, [devices, connectAttendanceDevice]);

  const columns = [
    { field: 'id', headerName: t('serialNo'), headerClassName: 'CustomHeader' },
    {
      field: 'name',
      headerName: t('deviceName'),
      minWidth: 150,
      flex: 1,
    },
    { field: 'ip', headerName: t('ipAddress'), minWidth: 150, flex: 1 },
    { field: 'port', headerName: t('port'), minWidth: 150 },
    {
      field: 'user',
      headerName: t('deviceUser'),
      minWidth: 150,
      flex: 1,
      renderCell: (params) => <Box>{t(params.value)}</Box>,
    },
    {
      field: 'connection',
      headerName: t('connection'),
      type: 'actions',
      width: 140,
      minWidth: 100,
      flex: 0,
      getActions: (params) => {
        const status = params.row.connection; // ✅ safer access
        const isConnected = status === 'success';

        return [
          <Button
            key="connection"
            variant="contained"
            size="small"
            loading={connectLoading}
            color={isConnected ? 'success' : 'error'}
            startIcon={isConnected ? <CheckCircle /> : <Cancel />}
            disableElevation
          >
            {isConnected ? t('connected') : t('notConnected')}
          </Button>,
        ];
      },
    },
    {
      field: 'actions',
      headerName: t('actions'),
      headerClassName: 'CustomHeader',
      type: 'actions',
      minWidth: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="edit"
          onClick={() => handleEdit(params.row)}
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
  ];

  // Transform settings to table data
  const rows = devices.map((s, index) => {
    const device = devicesData?.results.find((d) => d.ip === s.ip);
    return {
      id: index + 1,
      ...s,
      connection: device?.status || 'failed',
    };
  });

  return (
    <Box className="globalShapeDesign">
      <Dialog open={open} maxWidth="xs">
        <CustomCrossButton
          onClick={handleClose}
          disableElevation
          disableRipple
          disableFocusRipple
        >
          <Close fontSize="small" />
        </CustomCrossButton>
        <DialogTitle textAlign="center">{t('addNewDevice')}</DialogTitle>
        <DialogContent>
          <NEWDEVICEFORM
            onClose={() => setOpen(false)}
            selectedData={selectedData}
          />
        </DialogContent>
      </Dialog>

      <Grid container alignItems="center" mt={0.6}>
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
            <Button aria-label="Add icon" onClick={handleOpen}>
              <AddCircle />
            </Button>
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
            label={t('connectedDevices')}
          />
        </Grid>
        <Grid
          xs={6}
          sm={3}
          order={{ sm: 3, xs: 3 }}
          item
          display="none"
          justifyContent="end"
        >
          EMPTY
        </Grid>
      </Grid>
      <MetaData title="DEVICES" />
      <Box mt={0.5}>
        <CustomDataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          localeText={localeText}
          initialState={{
            columns: {
              columnVisibilityModel: {
                __check__: false,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
