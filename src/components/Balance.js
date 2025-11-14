// MUI components and icons
import { Box, Grid, Chip, Typography, Divider } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import LoadingScreen from './minicomp/LoadingScreen';
import { convertToBengaliDigits } from './utils/converter';
import { useGetSmsServiceQuery } from '../actions/zkTecoApi';
import SENDSMS from './utils/sendSmsService';
import getSmsBalance from './utils/getSmsBalance';
// Custom utilities
// import dayjs from 'dayjs';

export default function BALANCECHECK() {
  const { data: smsServiceData } = useGetSmsServiceQuery();
  const [balanceData, setBalanceData] = useState({
    smsBalance: 0,
    totalSms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleClick = () => {
    window.open('https://wa.me/01746841988', '_blank');
  };

  useEffect(() => {
    const loadBalance = async () => {
      const apiKey = smsServiceData?.sms_service?.config;

      const result = await getSmsBalance(apiKey);

      if (result.success) {
        setBalanceData({
          smsBalance: result.smsBalance,
          totalSms: result.totalSms,
        });
      } else {
        setError(result.message);
      }

      setLoading(false);
    };

    loadBalance();
  }, [smsServiceData?.sms_service]);

  // useEffect(() => {
  //   if (balanceData?.smsBalance > 0) {
  //     const handleSend = async () => {
  //       await SENDSMS({
  //         apiKey: smsServiceData?.sms_service?.config,
  //         senderNumber: smsServiceData?.sms_service?.sender_id,
  //         mobile: '01746841988',
  //         userMessages: 'This is the test message',
  //       });
  //     };
  //     handleSend();
  //   }
  // }, [balanceData?.smsBalance, smsServiceData]);

  if (loading) return <LoadingScreen />;

  return (
    <Box
      sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        mx: 'auto',
        maxWidth: '450px',
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          width: '100%',
          boxShadow: '0px 0px 15px 0.5px #e0ecff',
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        {/* Title */}
        <Grid item xs={12} textAlign="center">
          <Chip
            sx={{ fontSize: '1.1rem', mb: 2 }}
            label={t('balanceInquery')}
          />
          <Divider />
        </Grid>

        {/* Balance Details */}
        <Grid item xs={6}>
          <Typography>{t('currentBalance')}</Typography>
          <Typography>{t('messageRate')}</Typography>
          <Typography>{t('totalMessage')}</Typography>
          {/* <Typography>{t('expiryDate')}</Typography> */}
        </Grid>
        <Grid item xs={6}>
          <Typography textAlign="right">
            {convertToBengaliDigits(balanceData?.smsBalance || 0)}{' '}
            {t('moneySymbol')}
          </Typography>
          <Typography textAlign="right">
            {convertToBengaliDigits(0.4)} {t('moneySymbol')}
          </Typography>
          <Typography textAlign="right">
            {convertToBengaliDigits(balanceData.totalSms || 0)} {t('the')}
          </Typography>
        </Grid>

        <Grid item xs={12} textAlign="center">
          <Divider />
          <Chip
            onClick={handleClick}
            size="small"
            sx={{ mt: 2, boxShadow: 1 }}
            color="primary"
            label={t('newRecharge')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
