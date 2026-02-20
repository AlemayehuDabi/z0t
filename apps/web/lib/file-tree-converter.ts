export const FileTreeConverter = (fileTree: Record<string, string>) => {
  const result: any = {};

  Object.values(fileTree.data).forEach((file: any) => {
    const normalizedPath = file.path.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');

    let current = result;

    parts.forEach((part: string, index: number) => {
      const isLast = index === parts.length - 1;

      if (isLast) {
        current[part] = {
          file: {
            content: file.content,
          },
        };
      } else {
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        current = current[part].directory;
      }
    });
  });

  return result;
};
