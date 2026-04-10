import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 mt-24 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                ♾
              </div>
              <span className="text-white font-bold text-xl">
                File<span className="text-violet-400">Sphere</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              A powerful suite of PDF tools to help you work smarter. Free, fast, and secure.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Tools</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {['Merge PDF', 'Split PDF', 'Compress PDF', 'PDF to Word', 'Word to PDF'].map((t) => (
                <li key={t}>
                  <Link href="/" className="hover:text-violet-400 transition-colors">{t}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">More</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {['JPG to PDF', 'PDF to JPG', 'Rotate PDF', 'Add Watermark', 'Page Numbers'].map((t) => (
                <li key={t}>
                  <Link href="/" className="hover:text-violet-400 transition-colors">{t}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="text-slate-500 text-sm">
            © {year} FileSphere Clone. Built with Next.js & Node.js.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
