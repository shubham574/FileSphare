import { tools } from '@/lib/tools';
import ToolCard from '@/components/ToolCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FileSphere — Free Online PDF Tools | Merge, Split, Compress & More',
  description:
    'The complete online PDF toolkit. Merge, split, compress, rotate, convert, watermark, and add page numbers to your PDFs for free.',
};

export default function HomePage() {
  return (
    <>
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[300px] -translate-x-1/2 bg-gradient-to-t from-violet-900/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            10 PDF Tools — Free Forever
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Every PDF tool<br />
            <span className="gradient-text">you&apos;ll ever need</span>
          </h1>

          <p className="text-slate-400 text-xl leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Merge, split, compress, convert and edit your PDFs online — fast, secure, and always free. No signup required.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '10+', label: 'PDF Tools' },
              { value: '100MB', label: 'Max File Size' },
              { value: '100%', label: 'Free & Secure' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tool Grid ────────────────────────────────────────────────────── */}
      <section className="px-4 pb-20 max-w-7xl mx-auto" id="tools">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Choose your tool</h2>
          <p className="text-slate-400">Pick a tool below and get started in seconds</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-5">
          {tools.map((tool, i) => (
            <div
              key={tool.id}
              className="animate-fade-in"
              style={{ animationDelay: `${0.05 * i}s`, animationFillMode: 'both' }}
            >
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────── */}
      <section className="px-4 py-20 border-t border-white/5" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Why FileSphere?</h2>
            <p className="text-slate-400">Built for speed, security, and simplicity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Async queue-based processing so your browser never hangs. Get results in seconds.',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Files are deleted automatically after 1 hour. We never store your content.',
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                icon: '🌍',
                title: 'Works Everywhere',
                description: 'Runs entirely in your browser. No installs, no plugins, no nonsense.',
                gradient: 'from-blue-500 to-cyan-500',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
