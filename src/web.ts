import { WebPlugin } from '@capacitor/core';

import type { StreamingHttpPlugin } from './definitions';

export class StreamingHttpWeb extends WebPlugin implements StreamingHttpPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
