import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import CustomPagination from '../layout/Pagination';

const defaultColumnSettings = {
  sortable: false,
  flex: 1,
  minWidth: 120,
  disableColumnMenu: true,
};

export const useDataGridColumns = (columns) =>
  columns.map((col) => ({ ...defaultColumnSettings, ...col }));

export function CustomDataGrid({
  rows,
  columns,
  loading,
  initialState,
  localeText,
  getRowClassName,
  isRowSelectable,
  sx,
  slots,
  onRowSelectionModelChange,
  apiRef,
  onCellEditStart,
  processRowUpdate,
  experimentalFeatures,
  onProcessRowUpdateError,
  selectionModel,
}) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      density="compact"
      pageSizeOptions={[5, 10, 20, 50, 100]}
      checkboxSelection
      scrollbarSize={0}
      onRowSelectionModelChange={onRowSelectionModelChange}
      selectionModel={selectionModel}
      localeText={localeText}
      showCellVerticalBorder
      showColumnVerticalBorder
      getRowClassName={getRowClassName}
      isRowSelectable={isRowSelectable}
      apiRef={apiRef}
      onCellEditStart={onCellEditStart}
      processRowUpdate={processRowUpdate}
      experimentalFeatures={experimentalFeatures}
      onProcessRowUpdateError={onProcessRowUpdateError}
      sx={{
        '& .highlight-row': { backgroundColor: '#FFFFF0' },
        '& .zeroRemainRow': { backgroundColor: '#FFEAEB' },
        '& .zeroRemainRowDark': { backgroundColor: '#440000' },
        '& .warning-row': { backgroundColor: '#FFEAEB' },
        '& .danger-row': { backgroundColor: '#eaeaea' },
        ...sx,
      }}
      initialState={{
        pagination: { paginationModel: { pageSize: 100 } },
        ...initialState,
      }}
      slots={{
        pagination: CustomPagination,
        ...slots,
      }}
      slotProps={{
        toolbar: { showQuickFilter: true },
      }}
    />
  );
}

// More specific prop-types to satisfy `forbid-prop-types`
CustomDataGrid.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  loading: PropTypes.bool,
  initialState: PropTypes.shape({}),
  localeText: PropTypes.shape({}),
  getRowClassName: PropTypes.func,
  isRowSelectable: PropTypes.func,
  sx: PropTypes.shape({}),
  slots: PropTypes.shape({}),
  onRowSelectionModelChange: PropTypes.func,
  apiRef: PropTypes.shape({}),
  onCellEditStart: PropTypes.func,
  processRowUpdate: PropTypes.func,
  experimentalFeatures: PropTypes.shape({}),
  onProcessRowUpdateError: PropTypes.func,
  selectionModel: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ),
    PropTypes.number,
  ]),
};
