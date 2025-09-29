'use client';

import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider as DefaultCacheProvider } from '@emotion/react';
import type { EmotionCache, Options as EmotionCacheOptions } from '@emotion/cache';

export type NextAppDirEmotionCacheProviderProps = {
  children: React.ReactNode;
};

const EmotionCache = ({ children }: NextAppDirEmotionCacheProviderProps) => {
  // El cache se crea ahora dentro del componente, en el cliente
  const [emotionCache] = React.useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const serialized = emotionCache.key + '-' + emotionCache.sheet.tags.join(' ');
    if (!serialized) {
      return null;
    }

    const styles = emotionCache.sheet.tags.map((tag) => tag.outerHTML).join('');

    return (
      <style
        data-emotion={`${emotionCache.key} ${emotionCache.sheet.tags}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <DefaultCacheProvider value={emotionCache}>{children}</DefaultCacheProvider>;
};

export default EmotionCache;