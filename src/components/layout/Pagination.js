// React and Material UI components
import React from 'react';
import { Pagination, Select, MenuItem, FormControl } from '@mui/material';

// MUI Data Grid hooks
import { useGridApiContext, useGridSelector, gridPageSelector, gridPageCountSelector, gridPageSizeSelector } from '@mui/x-data-grid';

// Utilities and custom components
import { useTranslation } from 'react-i18next';
import { convertToBengaliDigits } from '../utils/converter';

const CustomPagination = () => {
    const { t } = useTranslation();
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const pageSize = useGridSelector(apiRef, gridPageSizeSelector);

    const handlePageChange = (event, value) => {
        apiRef.current.setPage(value - 1);
    };

    const handlePageSizeChange = (event) => {
        apiRef.current.setPageSize(event.target.value);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <FormControl variant="outlined" size="small" sx={{
                marginRight: '3px'
            }}>
                <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    sx={{
                        '& .MuiSelect-select': {
                            padding: '4.2px 8px', // Adjust padding here as needed
                        },
                    }}
                >
                    {[5, 10, 20, 50, 100].map(size => (
                        <MenuItem key={size} value={size}>
                            {convertToBengaliDigits(size)} {t('lineperpage')}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Pagination
                count={pageCount}
                page={page + 1}
                onChange={handlePageChange}
                variant="outlined"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
            />
        </div>
    );
};

export default CustomPagination;
