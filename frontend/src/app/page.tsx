'use client';

import { useState } from 'react';
import Link from 'next/link';
import { tools } from '@/lib/tools';

const mdIcons: Record<string, string> = {
  'merge': 'library_add',
  'split': 'content_cut',
  'compress': 'compress',
  'pdf-to-word': 'description',
  'word-to-pdf': 'history_edu',
  'jpg-to-pdf': 'image',
  'pdf-to-jpg': 'photo_library',
  'rotate': 'rotate_right',
  'watermark': 'branding_watermark',
  'page-numbers': 'format_list_numbered',
};

const toolColors: Record<string, { bg: string; text: string; bgSoft: string }> = {
  'merge': { bg: 'bg-primary', text: 'text-primary', bgSoft: 'bg-primary/10' },
  'split': { bg: 'bg-secondary', text: 'text-secondary', bgSoft: 'bg-secondary/10' },
  'compress': { bg: 'bg-tertiary-container', text: 'text-tertiary-container', bgSoft: 'bg-tertiary-container/10' },
  'pdf-to-word': { bg: 'bg-blue-600', text: 'text-blue-600', bgSoft: 'bg-blue-50 dark:bg-blue-900/30' },
  'word-to-pdf': { bg: 'bg-indigo-600', text: 'text-indigo-600', bgSoft: 'bg-indigo-50 dark:bg-indigo-900/30' },
  'jpg-to-pdf': { bg: 'bg-purple-600', text: 'text-purple-600', bgSoft: 'bg-purple-50 dark:bg-purple-900/30' },
  'pdf-to-jpg': { bg: 'bg-orange-600', text: 'text-orange-600', bgSoft: 'bg-orange-50 dark:bg-orange-900/30' },
  'rotate': { bg: 'bg-cyan-600', text: 'text-cyan-600', bgSoft: 'bg-cyan-50 dark:bg-cyan-900/30' },
  'watermark': { bg: 'bg-fuchsia-600', text: 'text-fuchsia-600', bgSoft: 'bg-fuchsia-50 dark:bg-fuchsia-900/30' },
  'page-numbers': { bg: 'bg-emerald-600', text: 'text-emerald-600', bgSoft: 'bg-emerald-50 dark:bg-emerald-900/30' },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('All');
  const categories = ['All', 'Organize', 'Convert', 'Edit'];

  const filteredTools = tools.filter(tool => {
    if (activeTab === 'All') return true;
    return tool.category === activeTab;
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-secondary-container/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block py-1 px-3 mb-6 rounded-full bg-surface-container-high text-primary text-xs font-bold tracking-widest uppercase">
            Streamlined Productivity
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-8 max-w-4xl mx-auto leading-[1.1]">
            All Your File Tools in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">One Place</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
            Merge, split, compress, and convert your documents with precision. The architectural standard for file management, designed for modern workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#tools" className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary rounded-full font-semibold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 text-center">
              Explore All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Tool Grid Section */}
      <section id="tools" className="py-24 px-8 bg-surface-container-low min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 animate-fade-in">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-4">Essential File Toolkit</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Fast, secure, and entirely cloud-based. Select a category below to filter tools by function.
              </p>
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none animate-fade-in">
             {categories.map((cat) => (
                <button
                   key={cat}
                   onClick={() => setActiveTab(cat)}
                   className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                     activeTab === cat 
                     ? 'bg-primary text-on-primary shadow-md' 
                     : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'
                   }`}
                >
                   {cat}
                </button>
             ))}
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in transition-all">
            {filteredTools.map((tool, index) => {
              const isLarge = index === 0 && activeTab === 'All'; // Only big feature card if on 'All' tab
              const icon = mdIcons[tool.id] || 'build';
              const colors = toolColors[tool.id] || { bg: 'bg-primary', text: 'text-primary', bgSoft: 'bg-primary/10' };
              
              if (isLarge) {
                return (
                  <Link key={tool.id} href={`/${tool.id}`} className="md:col-span-8 group relative overflow-hidden bg-surface-container-lowest rounded-3xl p-8 transition-all duration-500 border border-transparent hover:border-primary/20 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,74,198,0.08)] hover:scale-[1.01] block">
                    <div className="flex flex-col h-full">
                      <div className="mb-auto">
                        <div className={`w-14 h-14 ${colors.bgSoft} rounded-2xl flex items-center justify-center ${colors.text} mb-6`}>
                          <span className="material-symbols-outlined text-3xl" data-icon={icon}>{icon}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-on-surface mb-3">{tool.name}</h3>
                        <p className="text-on-surface-variant max-w-md">{tool.description}</p>
                      </div>
                      <div className="mt-8 flex items-center justify-between relative z-10">
                        <span className="text-xs font-bold tracking-widest uppercase text-outline">Most Popular</span>
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                  </Link>
                );
              }

              return (
                <Link key={tool.id} href={`/${tool.id}`} className="md:col-span-4 group bg-surface-container-lowest rounded-3xl p-8 transition-all duration-500 border border-transparent hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:border-outline-variant/20 block">
                  <div className={`w-14 h-14 ${colors.bgSoft} rounded-2xl flex items-center justify-center ${colors.text} mb-6`}>
                    <span className="material-symbols-outlined text-3xl" data-icon={icon}>{icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-3">{tool.name}</h3>
                  <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{tool.description}</p>
                  <div className={`flex items-center ${colors.text} font-medium text-sm group-hover:underline underline-offset-4 mt-auto`}>
                    Launch Tool <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-8 overflow-hidden bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block py-1 px-3 mb-4 rounded-full bg-surface-container text-secondary text-xs font-bold tracking-widest uppercase">
            Platform Benefits
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-6 leading-tight">Why Choose FileSphere?</h2>
          <p className="text-on-surface-variant text-lg mb-16 opacity-90 max-w-2xl mx-auto">
            We provide an architectural-grade suite of tools designed to ensure your document handling is fast, secure, and flawlessly precise.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Feature 1 */}
            <div className="p-10 rounded-[2.5rem] bg-surface border border-outline-variant/30 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 group">
              <div className="w-16 h-16 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-2xl flex items-center justify-center text-primary mb-8">
                <span className="material-symbols-outlined text-4xl">bolt</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">Lightning Fast</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Our optimized processing engine ensures your complex PDFs convert and compress in milliseconds without heavy server delays. Efficiency at scale.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-10 rounded-[2.5rem] bg-surface border border-outline-variant/30 hover:shadow-xl hover:-translate-y-2 hover:border-secondary/20 transition-all duration-500 group">
              <div className="w-16 h-16 bg-secondary/10 group-hover:bg-secondary/20 transition-colors rounded-2xl flex items-center justify-center text-secondary mb-8">
                <span className="material-symbols-outlined text-4xl">shield_locked</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">Military-Grade Security</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Your data is exclusively yours. Files are securely transmitted via 256-bit SSL and are automatically, permanently deleted immediately after processing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-10 rounded-[2.5rem] bg-surface border border-outline-variant/30 hover:shadow-xl hover:-translate-y-2 hover:border-tertiary-container/20 transition-all duration-500 group">
              <div className="w-16 h-16 bg-tertiary-container/10 group-hover:bg-tertiary-container/20 transition-colors rounded-2xl flex items-center justify-center text-tertiary-container mb-8">
                <span className="material-symbols-outlined text-4xl">verified</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4">Uncompromised Quality</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Whether you compress a simple brochure or convert a complex technical blueprint, our advanced algorithms preserve layout fidelity flawlessly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
