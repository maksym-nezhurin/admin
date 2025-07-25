import { Group, SimpleGrid, Image, Text, CloseButton, Box } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import type { DropzoneProps } from '@mantine/dropzone';

export function FilePicker({
  value = [],
  onDrop,
  ...props
}: Partial<DropzoneProps> & { value?: File[] | undefined; onDrop?: (files: File[]) => void | undefined}) {
  const files = value;

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onDrop?.(updated);
  };

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Box key={index} style={{ position: 'relative', width: 100 }}>
        <Image
          src={imageUrl}
          imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
          width={100}
          height={80}
          radius="md"
          alt={file.name}
          style={{ objectFit: 'cover' }}
        />
        <CloseButton
          size="xs"
          style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}
          onClick={() => handleRemove(index)}
          title="Remove"
        />
      </Box>
    );
  });

  return (
    <>
      <Dropzone
        onDrop={(files) => onDrop?.(files)}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        {...props}
      >
        <Group mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag images here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>

      <SimpleGrid
        cols={4}
        breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
        mt={previews.length > 0 ? 'xl' : 0}
      >
        {previews}
      </SimpleGrid>
    </>
  );
}