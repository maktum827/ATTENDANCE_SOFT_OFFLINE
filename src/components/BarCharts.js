import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { convertToBengaliDigits } from './utils/converter';

export default function PageViewsBarChart() {
  const theme = useTheme();
  const { t } = useTranslation();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  const { informations } = useSelector((state) => state.dashboardInfo);
  const years = informations[0]?.improvements.years || [];
  const students = informations[0]?.improvements.students || [];
  const passed = informations[0]?.improvements.passed || [];
  const failed = informations[0]?.improvements.failed || [];

  const totalExaminee = informations[0]?.improvements.students.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  const totalPassed = informations[0]?.improvements.passed.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  const totalFailed = informations[0]?.improvements.failed.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );

  const total = totalPassed + totalFailed;
  const passPercentage = (totalPassed / total) * 100;
  const failPercentage = (totalFailed / total) * 100;
  const percentage = (passPercentage - failPercentage).toFixed(2);

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
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box display="flex" alignItems="center">
              <Typography variant="h6" component="p">
                {t('examinee')}: {convertToBengaliDigits(totalExaminee || 0)}{' '}
                {t('people')}
              </Typography>
              <Chip
                sx={{ marginLeft: 1 }}
                size="small"
                color="primary"
                label={`${percentage}%`}
              />
            </Box>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('pastTenYears')}
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              categoryGapRatio: 0.5,
              data: years.reverse(),
            },
          ]}
          series={[
            {
              id: 'page-views',
              label: t('examinee'),
              data: students.reverse(),
              stack: 'A',
            },
            {
              id: 'downloads',
              label: t('passResult'),
              data: passed.reverse(),
              stack: 'A',
            },
            {
              id: 'conversions',
              label: t('failResult'),
              data: failed.reverse(),
              stack: 'A',
            },
          ]}
          height={245}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
