import { notFound } from 'next/navigation';
import { getToolById, tools } from '@/lib/tools';
import ToolPageWrapper from '@/components/ToolPageWrapper';
import type { Metadata } from 'next';

interface ToolPageProps {
  params: Promise<{ tool: string }>;
}

export async function generateStaticParams() {
  return tools.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { tool: toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} — FileSphere | Free Online PDF Tool`,
    description: `${tool.description} No signup required. Free, fast and secure.`,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { tool: toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool) notFound();

  return <ToolPageWrapper tool={tool!} />;
}
