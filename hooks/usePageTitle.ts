'use client';

import { useEffect } from 'react';
import { useCMS } from '@/context/CMSContext';

export function usePageTitle(title: string) {
  const { getSetting } = useCMS();
  const siteName = getSetting('site_name') || 'My Store';
  const trimmedTitle = title?.trim();

  useEffect(() => {
    if (trimmedTitle && trimmedTitle !== siteName) {
      document.title = `${trimmedTitle} | ${siteName}`;
      return;
    }
    document.title = siteName;
  }, [trimmedTitle, siteName]);
}
