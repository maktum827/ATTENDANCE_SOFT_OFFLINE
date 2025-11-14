import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { convertToBengaliDigits } from '../utils/converter';
import COMMONWATERMARK from './WaterMark';
import PADHEADING from './Headers';

export default function SummaryAttendanceTable(data) {
  const { t } = useTranslation();
  const columns = [
    t('serialNo'),
    t('idNo'),
    t('name'),
    t('classOrDesignation'),
    t('totalWorkingDays'),
    t('attendance1'),
    t('attendanceInTime'),
    t('lateAttendance'),
    t('totalAbsent'),
    t('totalLate'),
  ];

  const userData = data?.data || [];

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Watermark */}
      <COMMONWATERMARK />

      {/* Header */}
      <PADHEADING
        text={
          convertToBengaliDigits(userData?.heading) ||
          t('attendanceSummarySheet')
        }
      />

      {/* Table */}
      <TableContainer sx={{ mt: 1 }}>
        <Table
          sx={{ borderCollapse: 'collapse', width: '100%' }}
          aria-label="summary attendance"
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    border: '1px solid #ddd',
                    backgroundColor: '#f2f2f2',
                    padding: 1,
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {userData.rows.map((row, index) => (
              <TableRow key={row.id || index}>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(index + 1)}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(row.id)}
                </TableCell>
                <TableCell sx={{ border: '1px solid #ddd', padding: 1 }}>
                  {row.name || ''}
                </TableCell>
                <TableCell sx={{ border: '1px solid #ddd', padding: 1 }}>
                  {row.className || ''}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(row.totalDays)}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(row.presentDays)}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(row.presentOnTimeDays)}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(row.latePresentDays)}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(row.absentDays)}
                </TableCell>
                <TableCell
                  sx={{
                    border: '1px solid #ddd',
                    padding: 1,
                    textAlign: 'center',
                  }}
                >
                  {convertToBengaliDigits(
                    (row.totalLateDuration || '')
                      .replace('h', ' ঘন্টা')
                      .replace('m', ' মিনিট'),
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
