// React and related hooks
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';

// MUI components and icons
import {
  Grid,
  Button,
  ButtonGroup,
  Box,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  GridActionsCellItem,
  gridFilteredSortedRowIdsSelector,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  useGridApiContext,
} from '@mui/x-data-grid';
import { Delete, FileDownloadOutlined } from '@mui/icons-material';

// Custom components and utilities
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { CustomDataGrid } from './utils/useDataGridColumns';
import {
  useDeleteAttendanceMutation,
  useGetAttendanceQuery,
} from '../actions/zkTecoApi';
import useAuth from './hooks/UseAuth';
import MetaData from './utils/metaData';
import MakingReport from './minicomp/MakingReport';
import MAKINGSUMMERYSHEET from './minicomp/MakingSummary';
import useInsertAttendance from './utils/insertAttendance';
import { BASE_URL_EXPRESS } from '../constants/othersConstants';

dayjs.extend(customParseFormat);

// CustomToolbar Component
function CustomToolbar() {
  const { t } = useTranslation();
  const { code } = useAuth();

  const { data } = useGetAttendanceQuery(code, {
    skip: !code,
    refetchOnMountOrArgChange: true,
  });
  const Attendance = data?.attendances || [];

  const [currentRows, setCurrentRows] = useState([]);
  const [openReport, setOpenReport] = useState(false);
  const [openSummery, setOpenSummery] = useState(false);
  const [userType, setUserType] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const localeText = {
    toolbarQuickFilterPlaceholder: t('typeHere'),
  };

  const apiRef = useGridApiContext();

  const handleExportCsv = () => {
    const csvOptions = {
      fileName: 'data',
      delimiter: ',',
      utf8WithBom: true,
    };
    apiRef.current.exportDataAsCsv(csvOptions);
  };

  const handleDownloadFile = (event) => {
    setAnchorEl(event.currentTarget);

    const rows = apiRef.current
      .getAllRowIds()
      .map((id) => apiRef.current.getRow(id));
    const rowIds = gridFilteredSortedRowIdsSelector(apiRef);
    const filteredRows = rows.filter((row) => rowIds.includes(row.id));

    const headerNames = apiRef.current
      .getAllColumns()
      .filter(
        (column) =>
          column.field !== '__check__' &&
          column.field !== 'actions' &&
          column.field !== 'imageUrl',
      )
      .map((column) => column.headerName || column.field);

    setCurrentRows({
      isStudent: true,
      heading: t('AttendancePannel'),
      columns: headerNames,
      rows: filteredRows,
    });
  };

  const handlePdf = async () => {
    try {
      const response = await fetch(
        `${BASE_URL_EXPRESS}/api/pdf/adminis/attendance_list/${code}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentRows),
        },
      );

      if (!response.ok) throw new Error('Network response was not OK');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance.pdf';
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar(t(`Failed to make pdf: ${error}`), {
        variant: 'error',
      });
    }
  };

  const handleClose = () => setAnchorEl(null);
  const handleReport = (type) => {
    setUserType(type);
    setOpenReport(true);
  };
  const handleCloseReport = () => setOpenReport(false);
  const handleCloseSummery = () => setOpenSummery(false);
  const summerySheet = () => setOpenSummery(true);

  return (
    <GridToolbarContainer>
      <MakingReport
        openWindow={openReport}
        handleClose={handleCloseReport}
        userType={userType}
        Attendance={Attendance}
      />
      <MAKINGSUMMERYSHEET
        openWindow={openSummery}
        handleClose={handleCloseSummery}
        data={currentRows?.rows || []}
        isStudent
      />
      <Grid container alignItems="center">
        <Grid
          xs={6}
          sm={3}
          order={{ sm: 1, xs: 2 }}
          item
          display="flex"
          justifyContent="left"
        >
          <ButtonGroup size="small" variant="outlined">
            <Button onClick={handleDownloadFile}>
              <FileDownloadOutlined />
            </Button>
          </ButtonGroup>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleExportCsv}>{t('saveExcel')}</MenuItem>
            <MenuItem onClick={() => handleReport('Student')}>
              {t('printReport')} ({t('student')})
            </MenuItem>
            <MenuItem onClick={() => handleReport('Officiant')}>
              {t('printReport')} ({t('officiants')})
            </MenuItem>
            <MenuItem onClick={summerySheet}>{t('summerySheet')}</MenuItem>
            <MenuItem onClick={handlePdf}>{t('printData')}</MenuItem>
          </Menu>
        </Grid>
        <Grid
          xs={12}
          sm={6}
          order={{ sm: 2, xs: 1 }}
          item
          display="flex"
          justifyContent="center"
        >
          <Chip label={t('AttendancePannel')} sx={{ fontSize: '1rem' }} />
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

// AttendanceList Component
export default function AttendanceList() {
  const { t } = useTranslation();
  const { code, logo } = useAuth();
  const { loading } = useInsertAttendance();

  const { data, isLoading: attendanceLoading } = useGetAttendanceQuery(code, {
    skip: !code,
    refetchOnMountOrArgChange: true,
  });

  const Attendance = data?.attendances || [];
  const [deleteAttendance] = useDeleteAttendanceMutation();

  const handleDelete = async (id) => {
    try {
      await deleteAttendance({ id, code }).unwrap();
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('errorMessage'), { variant: 'error' });
    }
  };

  const formatAMPM = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(+hours, +minutes);
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const rows = Attendance.map((s, index) => {
    const endTime = dayjs(s.end_time, 'HH:mm:ss');
    const extendedTime = endTime.add(s.grace_period, 'minute');
    const entryTime = dayjs(s.timestamp);
    const lateByMinutes = entryTime.diff(extendedTime, 'minute');
    const isLate = lateByMinutes > 0;

    return {
      serial: index + 1,
      id: s.id,
      shift: s.shift,
      userType: t(s.user_type),
      idNo: s.id_no,
      imageUrl: s?.photo_url || logo,
      name: s.name,
      department: s.department,
      classOrDesignation: s.class_designation,
      groupName: s.group_name ?? '---',
      startTime: s.start_time,
      endTime: s.end_time,
      time: `${formatAMPM(s.start_time)} - ${formatAMPM(s.end_time)}`,
      gracePeriod: formatAMPM(extendedTime.format('HH:mm')),
      late: isLate ? `${lateByMinutes} ${t('minute')}` : '✔️',
      inOut: dayjs(s.timestamp).format('hh:mm A'),
      status: t(s.condition),
      punchStatus: s.condition,
      date: dayjs(s.created_at).format('YYYY-MM-DD'),
    };
  });

  const localeText = {
    footerRowSelected: (count) =>
      `${count} ${t('line')}${count !== 1 ? t('lines') : ''} ${t('selectedLine')}`,
    noRowsLabel: t('sorryNotFound'),
    noResultsOverlayLabel: t('sorryNotFound'),
  };

  const columns = [
    { field: 'serial', headerName: t('serialNo'), maxWidth: 50, flex: 1 },
    { field: 'shift', headerName: t('shift'), maxWidth: 120, flex: 1 },
    { field: 'userType', headerName: t('type'), maxWidth: 80, flex: 1 },
    {
      field: 'idNo',
      headerName: t('idNo'),
      sortable: true,
      maxWidth: 80,
      flex: 1,
    },
    {
      field: 'imageUrl',
      headerName: t('picture'),
      width: 80,
      minWidth: 80,
      flex: 0,
      renderCell: (params) => (
        <img
          src={`${BASE_URL}${params.value}`}
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
    { field: 'name', headerName: t('name'), maxWidth: 150, flex: 1 },
    {
      field: 'department',
      headerName: t('department'),
      maxWidth: 100,
      flex: 1,
    },
    {
      field: 'classOrDesignation',
      headerName: t('classOrDesignation'),
      maxWidth: 180,
      flex: 1,
    },
    { field: 'groupName', headerName: t('group'), maxWidth: 80, flex: 1 },
    { field: 'time', headerName: t('time'), flex: 1 },
    {
      field: 'gracePeriod',
      headerName: t('gracePeriod'),
      maxWidth: 85,
      flex: 1,
    },
    { field: 'inOut', headerName: t('inOut'), maxWidth: 85 },
    { field: 'late', headerName: t('late'), maxWidth: 50, flex: 1 },
    { field: 'status', headerName: t('status'), maxWidth: 80, flex: 1 },
    { field: 'date', headerName: t('date') },
    {
      field: 'actions',
      headerName: t('actions'),
      headerClassName: 'CustomHeader',
      type: 'actions',
      minWidth: 80,
      getActions: (params) => [
        <GridActionsCellItem
          key={params.id}
          icon={<Delete sx={{ color: 'red' }} />}
          label={t('delete')}
          onClick={() => handleDelete(params.row.id)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Box className="globalShapeDesign">
      <MetaData title="STUDENT ATTENDANCE" />
      <CustomDataGrid
        rows={rows}
        columns={columns}
        loading={loading || attendanceLoading}
        localeText={localeText}
        initialState={{
          columns: {
            columnVisibilityModel: { __check__: false, department: false },
          },
        }}
        // Attendance
        slots={{ toolbar: CustomToolbar }}
      />
    </Box>
  );
}
