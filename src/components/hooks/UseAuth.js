import { useMemo } from 'react';
import { useLoadUserQuery } from '../../actions/othersApi';

const useAuth = () => {
  const { data } = useLoadUserQuery();
  const user = useMemo(() => data?.data || [], [data]);

  // Optional: Memoize the returned values to prevent recalculating if 'user' hasn't changed
  return useMemo(
    () => ({
      code: user?.code || '',
      email: user?.email || '',
      academicName: user?.name || '',
      academicAddress: user?.address || '',
      englishName: user?.english_name || '',
      englishAddress: user?.english_address || '',
      academicMobile: user?.mobile || '',
      academyType: user?.academy_type || '',
      logo: user?.logo_url || '',
      calligraphy: user?.calligraphy_url || '',
      academyPhoto: user?.academy_photo_url || '',
      localIP: user?.localIP || '',
      defaultPhoto: user.default_photo,
    }),
    [user],
  );
};

export default useAuth;
