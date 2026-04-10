// Tool definitions for the iLovePDF clone
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  acceptedFiles: string;
  multiple: boolean;
  endpoint: string;
  options?: ToolOption[];
}

export interface ToolOption {
  key: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'range';
  defaultValue: string | number;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

export const tools: Tool[] = [
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one seamless document.',
    icon: '🔗',
    gradient: 'from-violet-500 to-purple-600',
    acceptedFiles: '.pdf',
    multiple: true,
    endpoint: '/api/merge',
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Separate PDF pages into individual files.',
    icon: '✂️',
    gradient: 'from-orange-500 to-red-500',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/split',
    options: [
      {
        key: 'mode',
        label: 'Split Mode',
        type: 'select',
        defaultValue: 'all',
        options: [
          { label: 'Extract all pages', value: 'all' },
          { label: 'By page ranges', value: 'range' },
          { label: 'Fixed intervals', value: 'fixed' },
        ],
      },
      {
        key: 'ranges',
        label: 'Page Ranges (e.g. 1-3,5,7-9)',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'fixedPages',
        label: 'Pages per split',
        type: 'number',
        defaultValue: 1,
        min: 1,
      },
    ],
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality.',
    icon: '🗜️',
    gradient: 'from-emerald-500 to-teal-600',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/compress',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files.',
    icon: '📄',
    gradient: 'from-blue-500 to-indigo-600',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/pdf-to-word',
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Transform Word documents into professional PDFs.',
    icon: '📝',
    gradient: 'from-indigo-500 to-purple-600',
    acceptedFiles: '.docx',
    multiple: false,
    endpoint: '/api/word-to-pdf',
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert JPG images and photos to PDF.',
    icon: '🖼️',
    gradient: 'from-pink-500 to-rose-500',
    acceptedFiles: '.jpg,.jpeg,.png,.webp',
    multiple: true,
    endpoint: '/api/jpg-to-pdf',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Extract PDF pages as high-quality JPG images.',
    icon: '🖼️',
    gradient: 'from-yellow-500 to-orange-500',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/pdf-to-jpg',
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages by 90, 180, or 270 degrees.',
    icon: '🔄',
    gradient: 'from-cyan-500 to-blue-500',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/rotate',
    options: [
      {
        key: 'degrees',
        label: 'Rotation',
        type: 'select',
        defaultValue: '90',
        options: [
          { label: '90° Clockwise', value: '90' },
          { label: '180°', value: '180' },
          { label: '90° Counter-Clockwise', value: '270' },
        ],
      },
    ],
  },
  {
    id: 'watermark',
    name: 'Add Watermark',
    description: 'Stamp text or image watermarks on your PDF.',
    icon: '💧',
    gradient: 'from-violet-500 to-fuchsia-600',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/watermark',
    options: [
      {
        key: 'text',
        label: 'Watermark Text',
        type: 'text',
        defaultValue: 'CONFIDENTIAL',
      },
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'range',
        defaultValue: 0.2,
        min: 0.05,
        max: 1.0,
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        type: 'number',
        defaultValue: 60,
        min: 20,
        max: 150,
      },
      {
        key: 'rotation',
        label: 'Rotation (degrees)',
        type: 'number',
        defaultValue: 45,
        min: 0,
        max: 360,
      },
    ],
  },
  {
    id: 'page-numbers',
    name: 'Page Numbers',
    description: 'Add automatic page numbers to your PDF.',
    icon: '🔢',
    gradient: 'from-green-500 to-emerald-600',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/page-numbers',
    options: [
      {
        key: 'position',
        label: 'Position',
        type: 'select',
        defaultValue: 'bottom-center',
        options: [
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Top Center', value: 'top-center' },
          { label: 'Top Right', value: 'top-right' },
          { label: 'Top Left', value: 'top-left' },
        ],
      },
      {
        key: 'format',
        label: 'Number Format',
        type: 'select',
        defaultValue: 'Page n',
        options: [
          { label: '1, 2, 3...', value: 'n' },
          { label: 'Page 1, Page 2...', value: 'Page n' },
          { label: '1 of 10, 2 of 10...', value: 'n of total' },
        ],
      },
      {
        key: 'startNumber',
        label: 'Start Number',
        type: 'number',
        defaultValue: 1,
        min: 1,
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        type: 'number',
        defaultValue: 12,
        min: 8,
        max: 24,
      },
    ],
  },
];

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}
