// React and related hooks
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';

// MUI components and icons
import {
  Box,
  Button,
  Grid,
  ButtonGroup,
  Menu,
  MenuItem,
  Autocomplete,
  TextField,
  Chip,
  FormControl,
  Select,
  Switch,
  OutlinedInput,
} from '@mui/material';

import {
  DataGrid,
  GridRowModes,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
  useGridApiContext,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AddCircle, Delete, SaveOutlined, Send } from '@mui/icons-material';
import PropTypes from 'prop-types';
import useAuth from './hooks/UseAuth.js';
import { useDataGridColumns } from './utils/useDataGridColumns.js';
import MetaData from './utils/metaData.js';
import CustomPagination from './layout/Pagination.js';
import { shifts } from '../constants/commonContstants.js';
import { useSendSMSMutation } from '../actions/onlineApi.js';
import {
  useAddTimeRulesMutation,
  useDeleteRuleMutation,
  useGetClassesQuery,
  useGetDesignationsQuery,
  useGetTimeRulesQuery,
  useSendShiftSmsMutation,
} from '../actions/zkTecoApi.js';

dayjs.extend(customParseFormat);

function EditToolbar({ setRows, setRowModesModel }) {
  const { t } = useTranslation();
  const apiRef = useGridApiContext();

  // for changing local text of mui dataGrid
  const localeText = {
    toolbarQuickFilterPlaceholder: t('typeHere'),
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = () => {
    const id = Date.now(); // unique timestamp ID (e.g. 1731329438456)

    setRows((prev) => [...prev, { id, serial: prev.length + 1, isNew: true }]);

    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  // handle pdf making
  const handlePrint = async () => {
    // changePDFComponent(
    //   <DATATABLEPRINT
    //     data={currentData}
    //     heading={t('attendanceRules')}
    //     department={t('attendance')}
    //   />,
    // );
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // for csv export using MUI API
  const handleExportCsv = () => {
    const csvOptions = {
      fileName: 'data',
      delimiter: ',',
      utf8WithBom: true,
    };
    apiRef.current.exportDataAsCsv(csvOptions);
  };

  return (
    <GridToolbarContainer>
      <Grid container sx={{ width: '100%' }} alignItems="center">
        <Grid
          item
          xs={6} // instead of size={{ xs: 6, sm: 3 }}
          sm={3}
          order={{ xs: 2, sm: 1 }}
          display="flex"
          justifyContent="flex-start" // 'left' is not a valid value, use 'flex-start'
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
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': { width: 32, height: 30, ml: -0.5, mr: 1 },
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
            <MenuItem onClick={handlePrint}>{t('printData')}</MenuItem>
          </Menu>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          order={{ xs: 1, sm: 2 }}
          display="flex"
          justifyContent="center"
        >
          <Chip
            sx={{
              fontSize: '1rem',
            }}
            label={t('attendanceRules')}
          />
        </Grid>

        <Grid
          item
          xs={6}
          sm={3}
          order={{ xs: 3, sm: 3 }}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <GridToolbarQuickFilter
            placeholder={localeText.toolbarQuickFilterPlaceholder}
          />
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

EditToolbar.propTypes = {
  setRows: PropTypes.func.isRequired,
  setRowModesModel: PropTypes.func.isRequired,
};

export default function RulesManager() {
  const { t } = useTranslation();
  const { code } = useAuth();
  const [newTimeRule] = useAddTimeRulesMutation();

  const { data: rulesData, isLoading } = useGetTimeRulesQuery();
  const rules = rulesData?.rules;

  const [sendSMS] = useSendSMSMutation();

  const [deleteRule] = useDeleteRuleMutation();
  const [
    sendShiftSms,
    { data: shiftData, isSuccess, loading: shiftSmsLoading },
  ] = useSendShiftSmsMutation();
  const absentsData = useMemo(() => shiftData?.sms_logs || [], [shiftData]);

  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [rowId, setRowId] = React.useState(null);

  const { data } = useGetDesignationsQuery();
  const designations = data?.designations || [];
  const uniqueDesignations = Array.from(
    new Set(designations.map((person) => person.name).filter(Boolean)),
  );

  const { data: classData } = useGetClassesQuery();
  const classes = classData?.classes || [];
  const uniqueClassGroupNames = Array.from(
    new Set(classes.map((c) => c.name).filter(Boolean)),
  );

  const allUsers = [...uniqueClassGroupNames, ...uniqueDesignations];

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleDeleteClick = (id) => async () => {
    try {
      await deleteRule(id).unwrap();
      enqueueSnackbar(t('successMessage'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t(`Rule delete error: ${err}`), { variant: 'error' });
    }
  };

  const handleLateSMS = (id) => async () => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;
    try {
      await sendShiftSms({ data: { rule, code } }).unwrap();
    } catch (err) {
      enqueueSnackbar(t(`Auto SMS sending error: ${err}`), {
        variant: 'error',
      });
    }
  };

  React.useEffect(() => {
    const send = async () => {
      if (isSuccess && code && absentsData) {
        try {
          await sendSMS({ data: absentsData, code }).unwrap();
          enqueueSnackbar(t('successMessage'), { variant: 'success' });
        } catch (error) {
          enqueueSnackbar(t(`Failed to send shift-wise SMS: ${error}`), {
            variant: 'error',
          });
        }
      }
    };

    send();
  }, [absentsData, code, isSuccess, sendSMS, t]);

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows?.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    setRowId(id);
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

  // Update rows state when rules change
  useEffect(() => {
    if (!isLoading && rules?.length > 0) {
      const initialRows = rules?.map((r, index) => ({
        serial: index + 1,
        ...r,
        startTime: formatAMPM(r.start_time),
        endTime: formatAMPM(r.end_time),
      }));
      setRows(initialRows);
    }
  }, [isLoading, rules, t]);

  const formatTime = (timeStr) => {
    const parsed = dayjs(timeStr, ['hh:mm A', 'HH:mm']);
    return parsed.isValid() ? parsed.format('HH:mm:ss') : '';
  };

  // for saving new Rule
  const prevRowsRef = useRef(rows);
  useEffect(() => {
    const saveNewRule = async () => {
      if (prevRowsRef.current !== rows && rowId) {
        const values = rows.find((row) => row.id === rowId);
        if (values && !values.isNew) {
          const ruleData = { ...values };
          try {
            // ✅ Format time fields before sending
            if (ruleData.startTime) {
              ruleData.startTime = formatTime(ruleData.startTime);
            }
            if (ruleData.endTime) {
              ruleData.endTime = formatTime(ruleData.endTime);
            }

            // Optional: validate required fields
            if (
              !ruleData.startTime ||
              !ruleData.endTime ||
              !ruleData.condition ||
              !ruleData.shift_name ||
              !ruleData.users
            ) {
              enqueueSnackbar(t('requireText'), { variant: 'error' });
              return;
            }

            await newTimeRule(ruleData).unwrap();
            enqueueSnackbar(t('successMessage'), { variant: 'success' });
            setRowId(null);
          } catch (error) {
            enqueueSnackbar(t(`Failed to save new Rule: ${error}`), {
              variant: 'error',
            });
          }
        }
      }

      prevRowsRef.current = rows;
    };

    saveNewRule();
  }, [rowId, rows, code, t, newTimeRule, data]);

  const columns = useDataGridColumns([
    {
      field: 'serial',
      headerName: t('serialNo'),
      minWidth: 50,
      width: 50,
      disableColumnMenu: false,
      flex: 0,
    },
    {
      field: 'condition',
      headerName: t('condition'),
      editable: true,
      flex: 0,
      minWidth: 80,
      width: 80,
      renderCell: (params) => (params.value ? t(params.value) : 'exit'),
      // ✅ renderEditCell to support dropdown editing with translated labels
      renderEditCell: (params) => {
        const handleInputChange = (event) => {
          const newValue = event.target.value;
          params.api.setEditCellValue(
            { id: params.id, field: params.field, value: newValue },
            event,
          );
        };

        return (
          <FormControl fullWidth variant="standard">
            <Select
              value={params.value ?? ''}
              onChange={handleInputChange}
              disableUnderline
              sx={{ marginLeft: '5px', marginTop: '5px' }}
              required
            >
              <MenuItem value="entry">{t('entry')}</MenuItem>
              <MenuItem value="exit">{t('exit')}</MenuItem>
            </Select>
          </FormControl>
        );
      },
    },
    {
      field: 'shift_name',
      headerName: t('shiftName'),
      editable: true,
      flex: 0,
      minWidth: 130,
      width: 130,
      renderEditCell: (params) => {
        const handleInputChange = (event, newValue) => {
          params.api.setEditCellValue({
            ...params,
            value: newValue,
          });
        };

        return (
          <Autocomplete
            freeSolo
            value={params.value || ''}
            onInputChange={(event, newValue) =>
              handleInputChange(event, newValue)
            }
            options={shifts}
            fullWidth
            sx={{ marginLeft: '5px' }}
            renderInput={(inputParams) => (
              <TextField
                required
                variant="standard"
                fullWidth
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...inputParams}
                InputProps={{
                  ...inputParams.InputProps,
                  disableUnderline: true,
                }}
              />
            )}
          />
        );
      },
    },
    {
      field: 'users',
      headerName: t('users'),
      editable: true,
      minWidth: 250,
      width: 250,
      flex: 0,
      renderEditCell: (params) => {
        const value = Array.isArray(params.value) ? params.value : [];

        const handleChange = (event) => {
          const newValue = event.target.value; // already an array
          params.api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: newValue,
          });
        };

        return (
          <FormControl fullWidth>
            <Select
              multiple
              value={value}
              variant="standard"
              size="small"
              onChange={handleChange}
              required
              input={
                <OutlinedInput
                  notched={false}
                  sx={{
                    minHeight: 2, // optional: reduce height
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& .MuiSelect-select': {
                      padding: 0, // remove inner padding
                      marginLeft: 1,
                      marginRight: 1,
                    },
                  }}
                />
              }
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    overflowX: 'auto',
                  }}
                >
                  {selected.map((val) => (
                    <Chip key={val} label={val} />
                  ))}
                </Box>
              )}
            >
              {allUsers.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      },
    },

    {
      field: 'startTime',
      headerName: t('startTime'),
      minWidth: 100,
      flex: 0,
      editable: true,
      renderEditCell: (params) => {
        const handleTimeChange = (newValue) => {
          if (newValue && dayjs(newValue).isValid()) {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: dayjs(newValue).format('hh:mm A'), // 12-hour format with AM/PM
            });
          }
        };

        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              ampm // Enable 12-hour format
              value={
                dayjs(params.value, 'hh:mm A').isValid()
                  ? dayjs(params.value, 'hh:mm A')
                  : null
              }
              onChange={handleTimeChange}
              required
              slotProps={{
                textField: {
                  variant: 'standard',
                  size: 'small',
                  fullWidth: true,
                  InputProps: {
                    disableUnderline: true,
                  },
                },
              }}
              sx={{
                paddingLeft: '5px',
                paddingRight: '5px',
              }}
            />
          </LocalizationProvider>
        );
      },
    },
    {
      field: 'endTime',
      headerName: t('endTime'),
      minWidth: 100,
      flex: 0,
      editable: true,
      renderEditCell: (params) => {
        const handleTimeChange = (newValue) => {
          if (newValue && dayjs(newValue).isValid()) {
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: dayjs(newValue).format('hh:mm A'), // 12-hour format with AM/PM
            });
          }
        };

        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              ampm // Enable 12-hour format
              value={
                dayjs(params.value, 'hh:mm A').isValid()
                  ? dayjs(params.value, 'hh:mm A')
                  : null
              }
              onChange={handleTimeChange}
              required
              slotProps={{
                textField: {
                  variant: 'standard',
                  size: 'small',
                  fullWidth: true,
                  InputProps: {
                    disableUnderline: true,
                  },
                },
              }}
              sx={{
                paddingLeft: '5px',
                paddingRight: '5px',
              }}
            />
          </LocalizationProvider>
        );
      },
    },

    {
      field: 'grace_period',
      headerName: t('gracePeriod'),
      minWidth: 140,
      width: 140,
      flex: 0,
      editable: true,
      renderEditCell: (params) => {
        const handleInputChange = ({ target: { value } }) => {
          // Optional: Validate or parse value as number
          params.api.setEditCellValue({
            ...params,
            value, // shorthand
          });
        };

        return (
          <TextField
            type="number"
            variant="standard"
            size="small"
            sx={{
              paddingLeft: '5px',
              marginTop: '5px',
            }}
            value={params.value || ''}
            onChange={handleInputChange}
            InputProps={{
              disableUnderline: true,
            }}
            fullWidth
          />
        );
      },
    },
    {
      field: 'auto_sms',
      headerName: t('autoSMS'),
      flex: 0,
      minWidth: 90,
      width: 90,
      editable: true,
      // Show check or cross emoji in read-only mode
      renderCell: (params) => (params.value ? '☑️' : '❌'),
      renderEditCell: (params) => {
        const handleToggleChange = (event) => {
          params.api.setEditCellValue({
            ...params,
            value: event.target.checked,
          });
        };

        return (
          <Switch
            checked={!!params.value}
            onChange={handleToggleChange}
            color="primary"
            inputProps={{ 'aria-label': 'auto sms toggle' }}
          />
        );
      },
    },
    {
      field: 'message',
      headerName: t('message'),
      editable: true,
      renderEditCell: (params) => {
        const handleInputChange = (event, newValue) => {
          params.api.setEditCellValue({
            ...params,
            value: newValue,
          });
        };

        return (
          <Autocomplete
            freeSolo
            value={params.value || ''}
            onInputChange={handleInputChange}
            options={[]}
            fullWidth
            sx={{
              marginLeft: '5px',
            }}
            renderInput={(inputParams) => (
              <TextField
                variant="standard"
                fullWidth
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...inputParams}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            )}
          />
        );
      },
    },

    {
      field: 'absent_sms',
      headerName: t('notActive'),
      flex: 0,
      minWidth: 95,
      width: 95,
      editable: true,
      // Show check or cross emoji in read-only mode
      renderCell: (params) => (params.value ? '☑️' : '❌'),
      renderEditCell: (params) => {
        const handleToggleChange = (event) => {
          params.api.setEditCellValue({
            ...params,
            value: event.target.checked,
          });
        };

        return (
          <Switch
            checked={!!params.value}
            onChange={handleToggleChange}
            color="primary"
            inputProps={{ 'aria-label': 'auto sms toggle' }}
          />
        );
      },
    },
    {
      field: 'absent_message',
      headerName: t('message'),
      editable: true,
      renderEditCell: (params) => {
        const handleInputChange = (event, newValue) => {
          params.api.setEditCellValue({
            ...params,
            value: newValue,
          });
        };

        return (
          <Autocomplete
            freeSolo
            value={params.value || ''}
            onInputChange={handleInputChange}
            options={[]}
            fullWidth
            sx={{
              marginLeft: '5px',
            }}
            renderInput={(inputParams) => (
              <TextField
                variant="standard"
                fullWidth
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...inputParams}
                InputProps={{
                  ...inputParams.InputProps,
                  disableUnderline: true,
                }}
              />
            )}
          />
        );
      },
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      minWidth: 80,
      width: 80,
      flex: 0,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveOutlined />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,

          // <GridActionsCellItem
          //   icon={
          //     <Send
          //       sx={{
          //         color: 'success',
          //       }}
          //     />
          //   }
          //   label={`${t('send')} ${t('notActive')}`}
          //   onClick={handleLateSMS(id)}
          //   showInMenu
          // />,
          <GridActionsCellItem
            icon={
              <Delete
                sx={{
                  color: 'red',
                }}
              />
            }
            label={t('delete')}
            onClick={handleDeleteClick(id)}
            showInMenu
          />,
        ];
      },
    },
  ]);

  // for change mui defualt localtext of row selection
  const localeText = {
    footerRowSelected: (count) =>
      `${count} ${t('line')}${count !== 1 ? t('lines') : ''} ${t(
        'selectedLine',
      )}`,
    noRowsLabel: t('sorryNotFound'),
    noResultsOverlayLabel: t('sorryNotFound'),
  };

  return (
    <Box className="globalShapeDesign">
      <MetaData title="TIME RULES" />
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        loading={isLoading || shiftSmsLoading}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        localeText={localeText}
        density="compact"
        pageSizeOptions={[5, 10, 20, 50, 100]}
        showCellVerticalBorder
        showColumnVerticalBorder
        // rowHeight={200}
        checkboxSelection
        sx={{
          '& .MuiDataGrid-row--editing': {
            boxShadow: 'none',
          },
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 100 }, // Default page size
          },

          columns: {
            columnVisibilityModel: {
              __check__: false,
            },
          },
        }}
        slots={{
          toolbar: EditToolbar,
          pagination: CustomPagination,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel, rows },
        }}
      />
    </Box>
  );
}
