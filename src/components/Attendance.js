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
  gridVisibleColumnFieldsSelector,
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
import usePDFComponent from './prints/usePDFComponent';
import DATATABLEPRINT from './prints/PrintDataTable';

dayjs.extend(customParseFormat);

// CustomToolbar Component
function CustomToolbar() {
  const { t } = useTranslation();
  const { changePDFComponent } = usePDFComponent();

  const { data } = useGetAttendanceQuery({ refetchOnMountOrArgChange: true });
  const Attendance = data?.attendances || [];

  const [openReport, setOpenReport] = useState(false);
  const [openSummery, setOpenSummery] = useState(false);
  const [userType, setUserType] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [currentData, setCurrentData] = useState('');

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

    // Get all visible column fields
    const visibleColumnFields = gridVisibleColumnFieldsSelector(apiRef);

    // Filter visible columns to exclude specific ones like '__check__' and 'actions'
    const excludedFields = ['__check__', 'condition', 'actions'];
    const filteredColumnFields = apiRef.current
      .getAllColumns()
      .filter((column) => !excludedFields.includes(column.field))
      .map((column) => column.field)
      .filter((field) => visibleColumnFields.includes(field)); // Ensure only visible columns are included

    // Map visible and filtered column fields to header names
    const headerNames = filteredColumnFields.map((field) => {
      const column = apiRef.current.getColumn(field);
      return column;
    });

    // Get filtered and sorted row IDs
    const filteredRowIds = gridFilteredSortedRowIdsSelector(apiRef);

    // Map row data to include only fields corresponding to filteredColumnFields
    const filteredRows = filteredRowIds.map((id, index) => {
      const row = apiRef.current.getRow(id);
      const filteredRow = filteredColumnFields.reduce((acc, field) => {
        acc[field] = row[field];
        return acc;
      }, {});
      filteredRow.serial = index + 1; //Manually assign serial
      return filteredRow;
    });

    const finalData = {
      heading: t('AttendancePannel'),
      columns: headerNames,
      rows: filteredRows,
    };
    setCurrentData(finalData);
  };

  const handlePrint = async () => {
    changePDFComponent(<DATATABLEPRINT data={currentData} />);
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
        data={Attendance}
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
            <MenuItem onClick={handlePrint}>{t('printData')}</MenuItem>
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
  const { loading } = useInsertAttendance();

  const { data, isLoading: attendanceLoading } = useGetAttendanceQuery({
    refetchOnMountOrArgChange: true,
  });

  const Attendance = data?.attendances || [];
  const [deleteAttendance] = useDeleteAttendanceMutation();

  const handleDelete = async (id) => {
    try {
      await deleteAttendance(id).unwrap();
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
      ...s,
      classOrDesignation: s.class_name || s.designation,
      time: `${formatAMPM(s.start_time)} - ${formatAMPM(s.end_time)}`,
      gracePeriod: formatAMPM(extendedTime.format('HH:mm')),
      late: isLate ? `${lateByMinutes} ${t('minute')}` : '✔️',
      inOut: dayjs(s.timestamp).format('hh:mm A'),
      department_1: s.department,
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
    { field: 'serial', headerName: t('serialNo'), maxWidth: 50 },
    { field: 'shift_name', headerName: t('shift'), maxWidth: 120 },
    {
      field: 'user_type',
      headerName: t('type'),
      maxWidth: 80,
      renderCell: (params) => <Box>{t(params.value)}</Box>,
    },
    {
      field: 'user_id',
      headerName: t('idNo'),
      sortable: true,
      maxWidth: 80,
    },
    {
      field: 'photo_path',
      headerName: t('picture'),
      width: 80,
      minWidth: 80,
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
    { field: 'name', headerName: t('name'), maxWidth: 150 },
    {
      field: 'department_1',
      headerName: t('department'),
      maxWidth: 150,
    },
    {
      field: 'classOrDesignation',
      headerName: t('classOrDesignation'),
      maxWidth: 180,
    },
    { field: 'group_name', headerName: t('group'), maxWidth: 80 },
    { field: 'time', headerName: t('time') },
    {
      field: 'gracePeriod',
      headerName: t('gracePeriod'),
      maxWidth: 150,
      flex: 1,
    },
    { field: 'inOut', headerName: t('inOut'), maxWidth: 85 },
    { field: 'late', headerName: t('late'), maxWidth: 50 },
    {
      field: 'condition',
      headerName: t('status'),
      maxWidth: 80,
      renderCell: (params) => <Box>{t(params.value)}</Box>,
    },
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
      <MetaData title="ATTENDANCE" />
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
