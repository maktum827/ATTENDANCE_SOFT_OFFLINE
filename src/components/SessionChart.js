import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTranslation } from 'react-i18next';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Box } from '@mui/material';
import { convertToBengaliDigits } from './utils/converter';

// Helper component to define area gradient
function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

// Helper function to calculate last 30 days dynamically
const getLast30Days = (t) => {
  const today = new Date();
  return Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    return `${t(monthName)} ${convertToBengaliDigits(day)}`;
  }).reverse();
};

export default function SessionsChart() {
  const theme = useTheme();
  const { t } = useTranslation();

  // Memoized calculation of the last 30 days
  const data = React.useMemo(() => getLast30Days(t), [t]);

  // const { informations } = useSelector(state => state.dashboardInfo);
  // const accounts = informations[0]?.accounts || {};
  // const boarding = informations[0]?.boarding || {};
  const accounts = {};
  const boarding = {};

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  const [department, setDepartment] = React.useState('accounts');

  // Optimized toggle handler using useCallback
  const handleChange = React.useCallback((event, newDepartment) => {
    setDepartment(newDepartment);
  }, []);

  // Helper function to get data for the current department, providing fallback empty arrays if needed
  const getDepartmentData = (field) => {
    const departmentData =
      department === 'accounts' ? accounts[field] : boarding[field];
    return Array.isArray(departmentData) ? departmentData : []; // Return empty array if data is invalid
  };

  // Calculate the sum of the array
  const totalIncome = getDepartmentData('income').reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  const totalExpense = getDepartmentData('expense').reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );

  const total = totalIncome + totalExpense;
  const incomePercentage = (totalIncome / total) * 100;
  const expensePercentage = (totalExpense / total) * 100;
  const percentage = (incomePercentage - expensePercentage).toFixed(2);

  return (
    <Card
      elevation={0}
      sx={{ width: '100%', boxShadow: '0px 0px 5px 0.5px #001a961c' }}
    >
      <CardContent>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box display="flex" alignItems="center">
              <Typography variant="h6" component="p">
                {t('income')}: {convertToBengaliDigits(totalIncome)}{' '}
                {t('moneySymbol')}
              </Typography>
              <Chip
                sx={{ marginLeft: 1 }}
                size="small"
                color="success"
                label={`${convertToBengaliDigits(percentage)}%`}
              />
            </Box>
            <ToggleButtonGroup
              color="primary"
              value={department}
              exclusive
              onChange={handleChange}
              aria-label="Department"
            >
              <ToggleButton size="small" value="accounts">
                {t('accounts')}
              </ToggleButton>
              <ToggleButton size="small" value="boarding">
                {t('boarding')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('monthlySessions')}
          </Typography>
        </Stack>

        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data,
              tickInterval: (index, i) => (i + 1) % 4 === 0,
            },
          ]}
          series={[
            {
              id: 'direct',
              label: t('income'),
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: getDepartmentData('income'),
            },
            {
              id: 'referral',
              label: t('expense'),
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: getDepartmentData('expense'),
            },
            {
              id: 'organic',
              label: t('balance'),
              showMark: false,
              curve: 'linear',
              stack: 'total',
              stackOrder: 'ascending',
              area: true,
              data: getDepartmentData('balance'),
            },
          ]}
          height={240}
          margin={{ left: 50, right: 25, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-organic': {
              fill: "url('#organic')",
            },
            '& .MuiAreaElement-series-referral': {
              fill: "url('#referral')",
            },
            '& .MuiAreaElement-series-direct': {
              fill: "url('#direct')",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.dark} id="organic" />
          <AreaGradient color={theme.palette.primary.main} id="referral" />
          <AreaGradient color={theme.palette.primary.light} id="direct" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
