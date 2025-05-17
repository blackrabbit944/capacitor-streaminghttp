import { registerPlugin } from '@capacitor/core';

import type { StreamingHttpPlugin } from './definitions';

const StreamingHttp = registerPlugin<StreamingHttpPlugin>('StreamingHttp', {
  web: () => import('./web').then((m) => new m.StreamingHttpWeb()),
});

export * from './definitions';
export { StreamingHttp };
