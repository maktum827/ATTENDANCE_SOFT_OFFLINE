import { useMemo } from 'react';
import { useGetAcademyQuery } from '../../actions/zkTecoApi';

const useAuth = () => {
  const { data: academyData } = useGetAcademyQuery();
  const academy = useMemo(() => academyData?.academy || [], [academyData]);

  // Optional: Memoize the returned values to prevent recalculating if 'user' hasn't changed
  return useMemo(
    () => ({
      ...academy,
    }),
    [academy],
  );
};

export default useAuth;
