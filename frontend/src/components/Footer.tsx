export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-lg font-bold text-slate-900 dark:text-white">FileSphere</div>
          <p className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-400">© 2024 FileSphere Inc. All rights reserved.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          <a href="#" className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-400 opacity-80 hover:opacity-100 transition-opacity hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-400 opacity-80 hover:opacity-100 transition-opacity hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline">
            Terms of Service
          </a>
          <a href="#" className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-400 opacity-80 hover:opacity-100 transition-opacity hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline">
            Security
          </a>
          <a href="#" className="font-inter text-xs leading-relaxed text-slate-500 dark:text-slate-400 opacity-80 hover:opacity-100 transition-opacity hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline">
            Help Center
          </a>
        </div>
        
        <div className="flex gap-4">
          <button title="Language" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-slate-600 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">public</span>
          </button>
          <button title="Contact" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-slate-600 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-lg">mail</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
