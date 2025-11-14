import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  Box,
  Grid,
  Button,
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { t } from 'i18next';
import { CustomCrossButton } from '../styles/style';
import { useGetTimeRulesQuery } from '../../actions/zkTecoApi';
import usePDFComponent from '../prints/usePDFComponent';
import SummaryAttendanceTable from '../prints/printSummary';

function calculateLateDuration(graceTime, inOutTime) {
  if (!graceTime || !inOutTime) return 0;

  const grace = dayjs(graceTime, 'hh:mm A');
  const inOut = dayjs(inOutTime, 'hh:mm A');

  const diff = inOut.diff(grace, 'minute');
  return diff > 0 ? diff : 0;
}

function formatMinutes(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs ? `${hrs} ঘণ্টা ` : ''}${mins} মিনিট`;
}

function MAKINGSUMMERYSHEET({ openWindow, handleClose, data, isStudent }) {
  const [shift, setShift] = useState('');
  const { changePDFComponent } = usePDFComponent();
  const { data: rulesData } = useGetTimeRulesQuery();
  const rules = rulesData?.rules || [];

  const uniqueShifts = Array.from(new Set(rules.map((r) => r.shift_name)));

  const { handleSubmit: formSubmit, control } = useForm({
    defaultValues: { dateFrom: null, dateTo: null },
  });

  const filterByShiftAndEntry = (filteredData) => {
    const map = new Map();
    filteredData.forEach((row) => {
      if (row.condition !== 'exit' || row.shift_name !== shift) return; // change with entry later

      const key = `${row.student_id}-${dayjs(row.timestamp).format('YYYY-MM-DD')}`;
      const currentInOut = dayjs(row.timestamp, ['h:mm A', 'HH:mm:ss']);

      if (
        !map.has(key) ||
        currentInOut.isBefore(
          dayjs(map.get(key).timestamp, ['h:mm A', 'HH:mm:ss']),
        )
      ) {
        map.set(key, row);
      }
    });
    return Array.from(map.values());
  };

  const onSubmit = async ({ dateFrom, dateTo }) => {
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return (
        (!dateFrom || itemDate >= new Date(dateFrom)) &&
        (!dateTo || itemDate <= new Date(dateTo))
      );
    });

    const filteredShiftEntries = filterByShiftAndEntry(filtered);
    const uniqueDates = Array.from(
      new Set(
        filteredShiftEntries.map((item) =>
          dayjs(item.timestamp).format('YYYY-MM-DD'),
        ),
      ),
    );

    const summary = {};
    filteredShiftEntries.forEach((row) => {
      const { user_id: idNo } = row;
      const formattedDate = dayjs(row.timestamp).format('YYYY-MM-DD');

      if (!summary[idNo]) {
        summary[idNo] = {
          id: idNo,
          name: row.name,
          className: row.class_name || row.designgation,
          presentDays: 0,
          presentOnTimeDays: 0,
          latePresentDays: 0,
          totalLateDuration: 0,
          seenDates: new Set(),
        };
      }

      // calculate isLate
      const endTime = dayjs(row.end_time, 'HH:mm:ss');
      const extendedTime = endTime.add(row.grace_period, 'minute');
      const entryTime = dayjs(row.timestamp);
      const lateByMinutes = entryTime.diff(extendedTime, 'minute');
      const isLate = lateByMinutes > 0;

      const user = summary[idNo];
      if (!user.seenDates.has(formattedDate)) {
        user.seenDates.add(formattedDate);
        user.presentDays += 1;
        if (isLate === 'true') {
          user.latePresentDays += 1;
          user.totalLateDuration += calculateLateDuration(
            row.grace_period,
            row.timestamp,
          );
        } else {
          user.presentOnTimeDays += 1;
        }
      }
    });

    const formattedSummary = Object.values(summary).map(({ ...rest }) => ({
      ...rest,
      totalDays: uniqueDates.length,
      absentDays: uniqueDates.length - rest.presentDays,
      totalLateDuration: formatMinutes(rest.totalLateDuration),
    }));

    const finalData = {
      isStudent,
      rows: formattedSummary,
      heading: `এক নজরে হাজিরা (${dayjs(dateFrom).format('YYYY-MM-DD')} থেকে ${dayjs(dateTo).format('YYYY-MM-DD')}), ${t('shift')}: ${shift}`,
    };

    changePDFComponent(<SummaryAttendanceTable data={finalData} />);
    handleClose();
  };

  return (
    <Dialog open={openWindow} maxWidth="xs" onClose={handleClose}>
      <CustomCrossButton
        onClick={handleClose}
        disableElevation
        disableRipple
        disableFocusRipple
      >
        <Close fontSize="small" />
      </CustomCrossButton>
      <form onSubmit={formSubmit(onSubmit)}>
        <Box padding="0.5rem 1.5rem 1rem 1.5rem" sx={{ width: '350px' }}>
          <Grid container spacing={2} mt={0.8}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('shift')}</InputLabel>
                <Select
                  value={shift}
                  label={t('shift')}
                  onChange={(e) => setShift(e.target.value)}
                  required
                >
                  {uniqueShifts.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {['dateFrom', 'dateTo'].map((lbl) => (
              <Grid item xs={12} key={lbl}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name={lbl}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        label={t(lbl)}
                        format="YYYY-MM-DD"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            required: true,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            ))}
            <Grid item xs={12} textAlign="right">
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="small"
                disableElevation
              >
                {t('ok')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Dialog>
  );
}

MAKINGSUMMERYSHEET.propTypes = {
  openWindow: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isStudent: PropTypes.bool.isRequired,
};

export default MAKINGSUMMERYSHEET;
