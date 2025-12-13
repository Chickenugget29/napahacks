import { Layout } from './components/layout/Layout';
import { InputSection } from './components/input/InputSection';
import { ClaimsExtractor } from './components/analysis/ClaimsExtractor';
import { LogicFlow } from './components/analysis/LogicFlow';

function App() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Panel: Input */}
        <div className="border border-white/10 rounded-xl p-6 bg-card/30 backdrop-blur-sm min-h-[600px] flex flex-col gap-4">
          {/* Removed header here as it's inside InputSection or can be managed there */}
          <InputSection />
        </div>

        {/* Right Panel: Analysis */}
        <div className="border border-white/10 rounded-xl p-6 bg-card/30 backdrop-blur-sm min-h-[600px] flex flex-col">
          <h2 className="text-xl font-semibold text-white/90 mb-6">Logic Analysis</h2>
          <ClaimsExtractor />
          <LogicFlow />
        </div>
      </div>
    </Layout>
  );
}

export default App;
