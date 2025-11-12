import React, { useState } from 'react';
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
import { useSnackbar } from 'notistack';
import { CustomCrossButton } from '../styles/style';
import { useGetTimeRulesQuery } from '../../actions/onlineApi';
import { BASE_URL_EXPRESS } from '../../constants/othersConstants';
import useAuth from '../hooks/UseAuth';

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
  const { code } = useAuth();
  const [shift, setShift] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { data: rulesData } = useGetTimeRulesQuery(code, { skip: !code });
  const rules = rulesData?.rules || [];

  const uniqueShifts = Array.from(new Set(rules.map((r) => r.shift_name)));

  const { handleSubmit: formSubmit, control } = useForm({
    defaultValues: { dateFrom: null, dateTo: null },
  });

  const filterByShiftAndEntry = (filteredData) => {
    const map = new Map();
    filteredData.forEach((row) => {
      if (row.punchStatus !== 'entry' || row.shift !== shift) return;

      const key = `${row.idNo}-${dayjs(row.date).format('YYYY-MM-DD')}`;
      const currentInOut = dayjs(row.inOut, ['h:mm A', 'HH:mm:ss']);

      if (
        !map.has(key) ||
        currentInOut.isBefore(dayjs(map.get(key).inOut, ['h:mm A', 'HH:mm:ss']))
      ) {
        map.set(key, row);
      }
    });
    return Array.from(map.values());
  };

  const onSubmit = async ({ dateFrom, dateTo }) => {
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        (!dateFrom || itemDate >= new Date(dateFrom)) &&
        (!dateTo || itemDate <= new Date(dateTo))
      );
    });

    const filteredShiftEntries = filterByShiftAndEntry(filtered);
    const uniqueDates = Array.from(
      new Set(
        filteredShiftEntries.map((item) =>
          dayjs(item.date).format('YYYY-MM-DD'),
        ),
      ),
    );

    const summary = {};
    filteredShiftEntries.forEach((row) => {
      const { idNo } = row;
      const formattedDate = dayjs(row.date).format('YYYY-MM-DD');

      if (!summary[idNo]) {
        summary[idNo] = {
          id: idNo,
          name: row.name,
          className: row.classOrDesignation,
          presentDays: 0,
          presentOnTimeDays: 0,
          latePresentDays: 0,
          totalLateDuration: 0,
          seenDates: new Set(),
        };
      }

      const user = summary[idNo];
      if (!user.seenDates.has(formattedDate)) {
        user.seenDates.add(formattedDate);
        user.presentDays += 1;
        if (row.isLate === 'true') {
          user.latePresentDays += 1;
          user.totalLateDuration += calculateLateDuration(
            row.gracePeriod,
            row.inOut,
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

    try {
      const response = await fetch(
        `${BASE_URL_EXPRESS}/api/pdf/summery_report/${code}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalData),
        },
      );

      if (!response.ok) throw new Error('Network response was not OK');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'summery.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar(`PDF download failed ${error}`, { variant: 'error' });
    }

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
  data: PropTypes.arrayOf(
    PropTypes.shape({
      idNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      shift: PropTypes.string,
      punchStatus: PropTypes.string,
      inOut: PropTypes.string,
      isLate: PropTypes.string,
      gracePeriod: PropTypes.string,
      classOrDesignation: PropTypes.string,
    }),
  ).isRequired,
  isStudent: PropTypes.bool.isRequired,
};

export default MAKINGSUMMERYSHEET;
