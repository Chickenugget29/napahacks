import { useRef, type RefObject } from 'react';
import { Layout } from './components/layout/Layout';
import { InputSection } from './components/input/InputSection';
import { ClaimsExtractor } from './components/analysis/ClaimsExtractor';
import { LogicFlow } from './components/analysis/LogicFlow';

function App() {
  const rulesRef = useRef<HTMLDivElement | null>(null);
  const promptsRef = useRef<HTMLDivElement | null>(null);
  const experimentRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (ref: RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        {/* Left Panel: Input Console */}
        <div className="lg:col-span-5 flex flex-col lg:self-start lg:h-[calc(100vh-160px)]">
          <div className="lg:sticky lg:top-28 lg:h-full">
            <div className="glass-panel rounded-2xl p-1 flex flex-col relative overflow-hidden group lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="bg-black/40 backdrop-blur-sm flex-1 rounded-xl p-6 border border-white/5 flex flex-col">
                <InputSection />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Visualization & Analysis */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-wrap gap-3 sticky top-28 z-20 self-start bg-black/40 border border-white/10 rounded-full px-4 py-2 shadow-lg shadow-black/40 backdrop-blur-lg mb-4">
            <button
              onClick={() => scrollToSection(rulesRef)}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/30 border border-white/10 text-white/80 hover:bg-cyan-500/20 hover:text-white transition-colors"
            >
              Symbolic Rules
            </button>
            <button
              onClick={() => scrollToSection(promptsRef)}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/30 border border-white/10 text-white/80 hover:bg-cyan-500/20 hover:text-white transition-colors"
            >
              Prompts & Metrics
            </button>
            <button
              onClick={() => scrollToSection(experimentRef)}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-full bg-black/30 border border-white/10 text-white/80 hover:bg-cyan-500/20 hover:text-white transition-colors"
            >
              Experiment Results
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            {/* Decorator Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-transparent opacity-50" />

            <div className="flex flex-col h-full">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Logic Analysis Engine
                </h2>
                <div className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
                  STATUS: ONLINE
                </div>
              </div>

              <div className="space-y-8">
                <div ref={rulesRef}>
                  <ClaimsExtractor />
                </div>
                <div ref={promptsRef}>
                  <LogicFlow />
                </div>
                <div ref={experimentRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
