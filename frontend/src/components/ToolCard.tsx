import Link from 'next/link';
import { Tool } from '@/lib/tools';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/${tool.id}`} className="tool-card group block">
      <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden">
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />

        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {tool.icon}
        </div>

        {/* Content */}
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-violet-300 transition-colors">
          {tool.name}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
          {tool.description}
        </p>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center gap-1 text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-8px] group-hover:translate-x-0 transition-transform duration-300">
          <span>Use tool</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
