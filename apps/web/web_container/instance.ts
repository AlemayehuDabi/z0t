import { WebContainer } from '@webcontainer/api';

// Call only once
export const webcontainerInstance = await WebContainer.boot();
