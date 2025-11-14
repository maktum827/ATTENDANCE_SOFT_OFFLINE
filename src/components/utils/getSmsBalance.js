import axios from 'axios';

/**
 * Fetch SMS balance from BulkSMSBD API
 *
 * @param {string} apiKey - SMS service API key
 * @returns {Promise<{ smsBalance: number, totalSms: number }>}
 */
export default async function getSmsBalance(apiKey) {
  try {
    if (!apiKey) {
      throw new Error('API key is required to fetch balance');
    }

    const res = await axios.get(
      `http://bulksmsbd.net/api/getBalanceApi?api_key=${apiKey}`,
    );

    const dataFinal = res.data;

    // Convert balance to total SMS (your logic)
    const totalSMS = ((parseFloat(dataFinal.balance) * 100) / 35).toFixed(2);
    const finalBalance = ((totalSMS * 40) / 100).toFixed(2);

    return {
      success: true,
      smsBalance: Number(finalBalance) || 0,
      totalSms: totalSMS || 0,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || 'Failed to fetch balance',
    };
  }
}
