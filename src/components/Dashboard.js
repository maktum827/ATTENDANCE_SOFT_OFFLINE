// React and hooks
import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';

// MUI components
import {
  Grid,
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { convertToBengaliDigits } from './utils/converter';
import useAuth from './hooks/UseAuth';
import {
  useGetAttendanceQuery,
  useGetTimeRulesQuery,
  useGetUsersQuery,
} from '../actions/zkTecoApi';
import LoadingScreen from './minicomp/LoadingScreen';
import useZKTecoStream from './utils/useZKTecoStream';

export default function Dashboard() {
  // useZKTecoStream();
  const { logo, is_active: isActive } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [shift, setShift] = useState('');
  const { data: userData } = useGetUsersQuery();
  const users = useMemo(() => userData?.users || [], [userData]);
  const latestPunch = useSelector((state) => state.punch.latestPunch);
  // const [sendShiftSms, { data: shiftData, isSuccess }] =
  //   useSendShiftSmsMutation();
  // const absentsData = useMemo(() => shiftData?.sms_logs || [], [shiftData]);

  // const [sendSMS] = useSendSMSMutation();

  const [userInfo, setUserInfo] = useState({
    name: '',
    class_designation: '',
    photo_path: '',
    idNo: '',
    isStudent: false,
  });

  const { data: rulesList, isLoading: RuleLoading } = useGetTimeRulesQuery();
  const rules = useMemo(() => rulesList?.rules || [], [rulesList]);

  const { data, isLoading: AttendLoading } = useGetAttendanceQuery();
  const Attendance = useMemo(() => data?.attendances || [], [data]);

  // Handle latest punch updates
  useEffect(() => {
    if (latestPunch?.user && typeof latestPunch.user === 'string') {
      const user = latestPunch.user
        .split(' - ')
        .map((str) => str.trim().replace(/['"]+/g, ''));

      if (user.length < 2) return;
      const userId = Number(user[1]);

      const s = users?.find((u) => u.user_id === userId);
      if (s) {
        setUserInfo({
          name: s.name || '',
          class_designation: s.class_name || s.designation || '',
          idNo: s.user_id || '',
          photo_path: s.photo_path || logo,
          isStudent: s.user_type === 'student',
        });
      }
    }
  }, [latestPunch, users, logo]);

  // Counting today's attendance
  const targetDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const formatted = useMemo(() => {
    if (!users || !shift) return [];

    const summary = { [shift]: {} };

    const filteredAttendance = Attendance?.filter(
      (att) =>
        att.condition === 'entry' &&
        att.shift === shift &&
        dayjs(att.created_at).format('YYYY-MM-DD') === targetDate,
    );

    filteredAttendance?.forEach((att) => {
      const idNo = att.id_no;
      const user = users.find((s) => s.user_id === idNo);
      if (!user) return;

      const className = user.admitted_class?.trim();
      if (!className) return;

      if (!summary[shift][className]) {
        summary[shift][className] = {
          shift,
          className,
          total: 0,
          present: 0,
          absent: 0,
          seenIds: new Set(),
        };
      }

      const classSummary = summary[shift][className];
      if (!classSummary.seenIds.has(idNo)) {
        classSummary.present += 1;
        classSummary.seenIds.add(idNo);
      }
    });

    users.forEach((user) => {
      const className = user.admitted_class?.trim();
      if (!className) return;

      if (!summary[shift][className]) {
        summary[shift][className] = {
          className,
          total: 0,
          present: 0,
          absent: 0,
          seenIds: new Set(),
        };
      }

      const entry = summary[shift][className];
      entry.total += 1;
      if (!entry.seenIds.has(user.user_id)) {
        entry.absent += 1;
      }
    });

    return Object.values(summary[shift]);
  }, [Attendance, users, shift, targetDate]);

  const uniqueShifts = useMemo(() => {
    if (!rules?.length) return [];
    return [...new Set(rules.map((r) => r.shift_name))];
  }, [rules]);

  // Auto SMS timer setup
  useEffect(() => {
    const now = new Date();

    const timers = rules.map((rule) => {
      if (!rule.not_active || !rule.end_time) return null;

      const [hours, minutes, seconds] = rule.end_time.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(
        hours,
        minutes + Number(rule.grace_period || 0),
        seconds || 0,
        0,
      );

      const delay = endTime.getTime() - now.getTime();
      if (delay <= 0) return null;

      return setTimeout(async () => {
        try {
          // await sendShiftSms({ data: { rule, code: rule.code } }).unwrap();
          // eslint-disable-next-line no-console
          console.log(`✅ Auto SMS sent for "${rule.shift_name}"`);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`❌ Auto SMS error for "${rule.shift_name}":`, err);
        }
      }, delay);
    });

    return () => timers.forEach((timerId) => timerId && clearTimeout(timerId));
  }, [rules]);

  // useEffect(() => {
  //   const send = async () => {
  //     if (isSuccess && code && absentsData.length > 0) {
  //       try {
  //         // await sendSMS({ data: absentsData, code }).unwrap();
  //       } catch (error) {
  //         // eslint-disable-next-line no-console
  //         console.error('Failed to send shift-wise SMS:', error);
  //       }
  //     }
  //   };
  //   send();
  // }, [absentsData, code, isSuccess]);

  const onRelive = () => window.location.reload();

  if (RuleLoading || AttendLoading)
    return (
      <div>
        <LoadingScreen />
      </div>
    );

  return (
    <Box
      sx={{ padding: 1 }}
      textAlign="center"
      alignItems="center"
      justifyContent="center"
    >
      <Grid container spacing={1} justifyContent="center">
        {/* Attendance summary */}
        <Grid item xs={12} md={5}>
          <Chip
            variant="outlined"
            sx={{
              fontSize: '1rem',
              marginBottom: '5px',
              boxShadow: '0px 0px 5px 0.5px #001a961c',
            }}
            label={t('todayAttendance')}
          />
          <Paper
            elevation={0}
            sx={{
              padding: 1,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '82vh',
              justifyContent: 'center',
              borderRadius: 2,
            }}
          >
            <FormControl sx={{ minWidth: '250px' }} size="small">
              <InputLabel>{t('shift')}</InputLabel>
              <Select
                value={shift}
                label={t('shift')}
                onChange={(e) => setShift(e.target.value)}
                required
              >
                <MenuItem value="">{t('select')}</MenuItem>
                {uniqueShifts.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TableContainer sx={{ marginTop: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ padding: 1 }}>
                      <strong>{t('class')}</strong>
                    </TableCell>
                    <TableCell align="center" sx={{ padding: 1 }}>
                      <strong>{`${t('total')} ${t('students')}`}</strong>
                    </TableCell>
                    <TableCell align="center" sx={{ padding: 1 }}>
                      <strong>{t('present')}</strong>
                    </TableCell>
                    <TableCell align="center" sx={{ padding: 1 }}>
                      <strong>{t('absent')}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formatted.map((row) => (
                    <TableRow key={row.className}>
                      <TableCell sx={{ padding: 1 }}>{row.className}</TableCell>
                      <TableCell align="center" sx={{ padding: 1 }}>
                        {convertToBengaliDigits(row.total)}
                      </TableCell>
                      <TableCell align="center" sx={{ padding: 1 }}>
                        {convertToBengaliDigits(row.present)}
                      </TableCell>
                      <TableCell align="center" sx={{ padding: 1 }}>
                        {convertToBengaliDigits(row.absent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Live attendance */}
        <Grid item xs={12} md={5}>
          <Chip
            variant="outlined"
            sx={{
              fontSize: '1rem',
              marginBottom: '5px',
              boxShadow: '0px 0px 5px 0.5px #001a961c',
            }}
            label={`${t('live')} ${t('attendance')}`}
          />
          <Paper
            elevation={0}
            sx={{
              padding: 1,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '82vh',
              justifyContent: 'center',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                alt="PHOTO"
                src={`local://${userInfo.photo_path}`}
                sx={{
                  width: 300,
                  height: 300,
                  objectFit: 'contain',
                  zIndex: 1,
                }}
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 3,
                width: '100%',
                maxWidth: 400,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              {users.length !== 0 && isActive ? (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '1.2rem',
                    }}
                  >
                    {t('userInfo')}
                  </Typography>

                  <Stack spacing={2} textAlign="left">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {t('name')}: {userInfo.name}
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {userInfo.isStudent ? t('class') : t('designation')}:{' '}
                      {userInfo.class_designation}
                    </Typography>
                    <Divider />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {t('idNo')}: {convertToBengaliDigits(userInfo.idNo)}
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: 'error.main', mb: 1 }}
                  >
                    🚫 {t('noLive')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, color: 'text.secondary' }}
                  >
                    {t('confirmInfo')}
                  </Typography>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={onRelive}
                  >
                    🔄 {t('tryAgain')}
                  </Button>
                </Box>
              )}
            </Paper>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
