// React and related hooks
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip } from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid';
import useAuth from './hooks/UseAuth';
import { useGetLateMessagesQuery } from '../actions/zkTecoApi';
import { CustomDataGrid } from './utils/useDataGridColumns';
import MetaData from './utils/metaData';

function CustomToolbar() {
  const { t } = useTranslation();
  return (
    <GridToolbarContainer sx={{ justifyContent: 'center' }}>
      <Chip
        sx={{
          fontSize: '1rem',
        }}
        label={t('notActive')}
      />
    </GridToolbarContainer>
  );
}

function GridToolbar() {
  return <CustomToolbar />;
}

export default function SMSLOGS() {
  const { t } = useTranslation();
  const { code } = useAuth();

  const { data, isLoading } = useGetLateMessagesQuery(code, {
    skip: !code,
    refetchOnMountOrArgChange: true,
  });
  const logs = data?.sms_logs || [];

  const localeText = {
    footerRowSelected: (count) =>
      `${count} ${t('line')}${count !== 1 ? t('lines') : ''} ${t('selectedLine')}`,
    noRowsLabel: t('sorryNotFound'),
    noResultsOverlayLabel: t('sorryNotFound'),
  };

  const columns = [
    { field: 'id', headerName: t('serialNo'), headerClassName: 'CustomHeader' },
    { field: 'shift', headerName: t('shift'), minWidth: 150, flex: 1 },
    { field: 'receivers', headerName: t('receiver'), minWidth: 300, flex: 1 },
    { field: 'smsCount', headerName: t('smsCount'), minWidth: 150, flex: 1 },
    {
      field: 'balanceDeducted',
      headerName: t('balanceDeducted'),
      minWidth: 150,
      flex: 1,
    },
    { field: 'status', headerName: t('status'), minWidth: 150, flex: 1 },
    {
      field: 'date',
      headerName: `${t('date')} ${t('and')} ${t('time')}`,
      minWidth: 150,
      flex: 1,
    },
  ];

  // Transform settings to table data
  const rows = logs?.map((s, index) => ({
    id: index + 1, // Your own row ID
    dataId: s.id, // Original record ID
    code: s.code,
    date: s.created_at,
    shift: s.shift,
    smsCount: s.sms_count,
    status: s.status === 'success' ? '✔️' : '❌',
    balanceDeducted: s.balance_deducted,
    receivers: JSON.parse(s.receivers), // convert string to array
  }));

  return (
    <Box className="globalShapeDesign">
      <MetaData title="SMS LOGS" />
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
        slots={{ toolbar: GridToolbar }}
      />
    </Box>
  );
}
