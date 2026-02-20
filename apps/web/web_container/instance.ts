import { WebContainer } from '@webcontainer/api';

let webcontainer: WebContainer;

export async function bootContainer() {
  webcontainer = await WebContainer.boot();
  return webcontainer;
}
