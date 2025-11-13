// React and related imports
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// MUI components
import {
  Box,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
} from '@mui/material';
import Close from '@mui/icons-material/Close';

// Custom imports
import { CustomCrossButton } from '../styles/style';
import { useGetTimeRulesQuery } from '../../actions/zkTecoApi';
import AttendanceReportPrint from '../prints/PrintReport';
import usePDFComponent from '../prints/usePDFComponent';

function MakingReport({ openWindow, handleClose, userType, Attendance }) {
  const { t } = useTranslation();
  const { changePDFComponent } = usePDFComponent();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [shift, setShift] = useState('');
  const [className, setClassName] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { data: rulesData } = useGetTimeRulesQuery();
  const rules = rulesData?.rules || [];

  const filteredData =
    userType === 'Student'
      ? Attendance?.filter((item) => item.user_type === 'Student')
      : Attendance?.filter((item) => item.user_type === 'Officiant');

  const uniqueClasses =
    userType === 'Student'
      ? [...new Set(filteredData?.map((item) => item.class_name))]
      : [...new Set(filteredData?.map((item) => item.designation))];

  const uniqueShifts = [...new Set(rules?.map((r) => r.shift_name))];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Filter data based on selected filters
    const filteredStudent = filteredData.filter((item) => {
      const classNameFromData = item.class_name;
      const date = new Date(item.created_at);
      const yearFromData = date.getFullYear();
      const monthFromData = date.getMonth() + 1;
      return (
        classNameFromData === className &&
        yearFromData === year &&
        monthFromData === month &&
        item.condition === 'entry' &&
        item.shift_name === shift
      );
    });

    const filteredOfficiant = filteredData.filter((item) => {
      const date = new Date(item.created_at);
      const yearFromData = date.getFullYear();
      const monthFromData = date.getMonth() + 1;
      return yearFromData === year && monthFromData === month;
    });

    const reportData = {
      data: userType === 'Student' ? filteredStudent : filteredOfficiant,
      year,
      month,
      type: userType,
      shift,
    };

    changePDFComponent(<AttendanceReportPrint reportData={reportData} />);

    handleClose();
  };

  return (
    <Dialog open={openWindow} onClose={handleClose}>
      <CustomCrossButton
        onClick={handleClose}
        disableElevation
        disableRipple
        disableFocusRipple
      >
        <Close fontSize="small" />
      </CustomCrossButton>

      <form onSubmit={handleSubmit}>
        <Box padding="0.5rem 1.5rem 1rem 1.5rem" width="350px">
          <Grid container spacing={2} mt={0.8}>
            {userType === 'Student' && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('className')}</InputLabel>
                  <Select
                    value={className}
                    label={t('className')}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                  >
                    {uniqueClasses.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

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

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('month')}</InputLabel>
                <Select
                  value={month}
                  label={t('month')}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {t(m.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('year')}</InputLabel>
                <Select
                  value={year}
                  label={t('year')}
                  onChange={(e) => setYear(e.target.value)}
                  required
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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

MakingReport.propTypes = {
  openWindow: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  userType: PropTypes.string.isRequired,
  Attendance: PropTypes.arrayOf(
    PropTypes.shape({
      user_type: PropTypes.string,
      class_designation: PropTypes.string,
      created_at: PropTypes.string,
      condition: PropTypes.string,
      shift: PropTypes.string,
      // add any other keys your Attendance data includes
    }),
  ).isRequired,
};

export default MakingReport;
