import { Layout } from './components/layout/Layout';
import { InputSection } from './components/input/InputSection';
import { ClaimsExtractor } from './components/analysis/ClaimsExtractor';
import { LogicFlow } from './components/analysis/LogicFlow';

function App() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Panel: Input Console */}
        <div className="lg:col-span-5 h-full flex flex-col">
          <div className="glass-panel rounded-2xl p-1 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="bg-black/40 backdrop-blur-sm flex-1 rounded-xl p-6 border border-white/5 flex flex-col">
              <InputSection />
            </div>
          </div>
        </div>

        {/* Right Panel: Visualization & Analysis */}
        <div className="lg:col-span-7 h-full flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 min-h-[600px] relative overflow-hidden">
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

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                <ClaimsExtractor />
                <LogicFlow />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
