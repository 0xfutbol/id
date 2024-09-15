import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useLocalStorage } from 'react-use';

export const METASOCCER_ID_REFERRER = 'METASOCCER_ID_REFERRER';

export const useReferrerParam = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setSavedReferrer] = useLocalStorage<string>(METASOCCER_ID_REFERRER);

  useEffect(() => {
    const referrer = searchParams.get('referrer');

    if (typeof referrer === 'string' && referrer.length > 0) {
      setSavedReferrer(referrer);

      // Remove the referrer from the URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('referrer');
      const newPathname = window.location.pathname + '?' + newSearchParams.toString();

      router.replace(newPathname);
    }
  }, [router, searchParams, setSavedReferrer]);
};
