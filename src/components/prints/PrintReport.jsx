import React from 'react';
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
import COMMONWATERMARK from './WaterMark.jsx';
import PADHEADING from './Headers';

export default function AttendanceReportPrint(reportData) {
  const { t } = useTranslation();
  const { data, shift, month, type, year } = reportData?.reportData || [];

  // Number of days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build matrix: { className: { studentName: [ '✓', 'X', ... ] } }
  const matrix = React.useMemo(() => {
    const temp = {};
    data?.forEach((entry) => {
      const className =
        type === 'Student' ? entry.class_name : entry.designation;
      const studentName = entry.name?.trim() || 'Unnamed';
      const timestamp = new Date(entry.timestamp);
      if (
        timestamp.getFullYear() === year &&
        timestamp.getMonth() + 1 === month
      ) {
        const day = timestamp.getDate();
        if (!temp[className]) temp[className] = {};
        if (!temp[className][studentName])
          temp[className][studentName] = Array(daysInMonth).fill('X');
        temp[className][studentName][day - 1] = '✓';
      }
    });
    return temp;
  }, [data, year, month, daysInMonth, type]);

  return (
    <Box>
      <TableContainer>
        <COMMONWATERMARK />
        <PADHEADING
          text={
            type === 'Student'
              ? t('studentAttendanceReport')
              : t('staffAttendanceReport')
          }
        />

        {Object.entries(matrix).map(([className, users]) => (
          <Box key={className} sx={{ mb: 2 }}>
            <h2>
              {type === 'Student'
                ? `${t('className')}: ${className}, ${t('month')}: ${convertToBengaliDigits(
                    month,
                  )}, ${t('year')}: ${convertToBengaliDigits(year)}, ${t('shiftName')}: ${shift}`
                : `${t('month')}: ${convertToBengaliDigits(
                    month,
                  )}, ${t('year')}: ${convertToBengaliDigits(year)}, ${t('shiftName')}: ${shift}`}
            </h2>

            <Table aria-label="attendance table" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      padding: 0.5,
                      background: 'whitesmoke',
                      fontSize: '12px',
                    }}
                  >
                    {t('name')}
                  </TableCell>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <TableCell
                      key={i}
                      sx={{ padding: 1, textAlign: 'center', fontSize: '12px' }}
                    >
                      {convertToBengaliDigits(i + 1)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {Object.entries(users).map(([name, attendance], idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ padding: 0.5, fontSize: '11px' }}>
                      {name}
                    </TableCell>
                    {attendance.map((status, i) => (
                      <TableCell
                        key={i}
                        sx={{
                          padding: 0.5,
                          fontSize: '11px',
                          textAlign: 'center',
                        }}
                      >
                        {status}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
      </TableContainer>
    </Box>
  );
}
