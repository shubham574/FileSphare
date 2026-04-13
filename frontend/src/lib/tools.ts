// Tool definitions for the iLovePDF clone
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  category: 'Organize' | 'Convert' | 'Edit' | 'Security' | 'Image' | 'Video';
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
    category: 'Organize',
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
    category: 'Organize',
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
    category: 'Organize',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/compress',
    options: [
      {
        key: 'level',
        label: 'Compression Level',
        type: 'select',
        defaultValue: 'medium',
        options: [
          { label: 'Low (Better Quality, Less Compression)', value: 'low' },
          { label: 'Medium (Balanced)', value: 'medium' },
          { label: 'Extreme (Lowest Quality, Max Compression)', value: 'high' },
        ],
      },
    ],
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files.',
    icon: '📄',
    gradient: 'from-blue-500 to-indigo-600',
    category: 'Convert',
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
    category: 'Convert',
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
    category: 'Convert',
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
    category: 'Convert',
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
    category: 'Organize',
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
    category: 'Edit',
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
    category: 'Edit',
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
  {
    id: 'header-footer',
    name: 'Header & Footer',
    description: 'Add customizable text headers or footers to your PDF pages.',
    icon: '🖋️',
    gradient: 'from-pink-500 to-rose-600',
    category: 'Edit',
    acceptedFiles: '.pdf',
    multiple: false,
    endpoint: '/api/header-footer',
    options: [
      {
        key: 'headerText',
        label: 'Header Text',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'headerPosition',
        label: 'Header Position',
        type: 'select',
        defaultValue: 'top-center',
        options: [
          { label: 'Top Left', value: 'top-left' },
          { label: 'Top Center', value: 'top-center' },
          { label: 'Top Right', value: 'top-right' },
        ],
      },
      {
        key: 'footerText',
        label: 'Footer Text',
        type: 'text',
        defaultValue: '',
      },
      {
        key: 'footerPosition',
        label: 'Footer Position',
        type: 'select',
        defaultValue: 'bottom-center',
        options: [
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Bottom Right', value: 'bottom-right' },
        ],
      },
      {
        key: 'pages',
        label: 'Pages (e.g. 1, 3-5 or all)',
        type: 'text',
        defaultValue: 'all',
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        type: 'number',
        defaultValue: 12,
        min: 6,
        max: 72,
      },
      {
        key: 'color',
        label: 'Color (Hex)',
        type: 'text',
        defaultValue: '#000000',
      },
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'range',
        defaultValue: 1.0,
        min: 0.1,
        max: 1.0,
      },
      {
        key: 'margin',
        label: 'Margin (points)',
        type: 'number',
        defaultValue: 36,
        min: 0,
        max: 200,
      },
    ],
  },
  {
    id: 'image-compress',
    name: 'Compress Image',
    description: 'Reduce image file size while maintaining visual quality.',
    icon: '🖼️',
    gradient: 'from-orange-400 to-red-500',
    category: 'Image',
    acceptedFiles: 'image/*,.jpg,.jpeg,.png,.webp,.avif',
    multiple: false,
    endpoint: '/api/image/compress',
    options: [
      {
        key: 'quality',
        label: 'Quality (1-100)',
        type: 'range',
        defaultValue: 80,
        min: 1,
        max: 100,
      },
    ],
  },
  {
    id: 'image-convert',
    name: 'Image Converter',
    description: 'Convert images to JPG, PNG, WebP, or AVIF formats.',
    icon: '🔄',
    gradient: 'from-blue-400 to-indigo-500',
    category: 'Image',
    acceptedFiles: 'image/*,.jpg,.jpeg,.png,.webp,.avif,.tiff,.gif',
    multiple: false,
    endpoint: '/api/image/convert',
    options: [
      {
        key: 'targetFormat',
        label: 'Target Format',
        type: 'select',
        defaultValue: 'webp',
        options: [
          { label: 'WebP', value: 'webp' },
          { label: 'JPEG', value: 'jpeg' },
          { label: 'PNG', value: 'png' },
          { label: 'AVIF', value: 'avif' },
        ],
      },
    ],
  },
  {
    id: 'video-compress',
    name: 'Compress Video',
    description: 'Reduce video size with professional-grade compression settings.',
    icon: '📹',
    gradient: 'from-purple-400 to-pink-600',
    category: 'Video',
    acceptedFiles: 'video/*,.mp4,.webm,.mov,.avi,.mkv',
    multiple: false,
    endpoint: '/api/video/compress',
    options: [
      {
        key: 'quality',
        label: 'Quality Preset',
        type: 'select',
        defaultValue: 'balanced',
        options: [
          { label: 'Best Quality (Bigger Size)', value: 'best' },
          { label: 'Balanced', value: 'balanced' },
          { label: 'Small File (Lower Quality)', value: 'small' },
        ],
      },
    ],
  },
  {
    id: 'video-convert',
    name: 'Video Converter',
    description: 'Transform videos into MP4 or WebM formats.',
    icon: '🎬',
    gradient: 'from-teal-400 to-emerald-600',
    category: 'Video',
    acceptedFiles: 'video/*,.mp4,.webm,.mov,.avi,.mkv',
    multiple: false,
    endpoint: '/api/video/convert',
    options: [
      {
        key: 'targetFormat',
        label: 'Target Format',
        type: 'select',
        defaultValue: 'mp4',
        options: [
          { label: 'MP4 (Standard)', value: 'mp4' },
          { label: 'WebM (Web Optimized)', value: 'webm' },
          { label: 'MOV (Apple Display)', value: 'mov' },
          { label: 'AVI (Legacy)', value: 'avi' },
          { label: 'MKV (High Definition)', value: 'mkv' },
          { label: 'GIF (Animated Image)', value: 'gif' },
        ],
      },
    ],
  },
];

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}
