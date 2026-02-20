import { FileTreeConverter } from '@/lib/file-tree-converter';
import { bootContainer } from './instance';

export const startProject = async (aiCode: any) => {
  if (!aiCode) return;
  const webcontainer = await bootContainer();

  const formatedFileTree = FileTreeConverter(aiCode);

  await webcontainer.mount(formatedFileTree);

  //   This are going to be from the terminal agent
  // Install dependencies
  const installProcess = await webcontainer.spawn('npm', ['install']);
  await installProcess.exit;

  // Start dev server
  const startProcess = await webcontainer.spawn('npm', ['start']);

  startProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log('WebContainer log:', data);
      },
    }),
  );

  // Wait for server-ready
  webcontainer.on('server-ready', (port, url) => {
    console.log('Live preview ready at URL:', url);

    // Option 1: Open in iframe
    const iframe = document.getElementById('preview') as HTMLIFrameElement;
    if (iframe) iframe.src = url;
  });

  return webcontainer;
};
