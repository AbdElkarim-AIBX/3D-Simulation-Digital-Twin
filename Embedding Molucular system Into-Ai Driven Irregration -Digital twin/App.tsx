import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Leaf, Droplets, Activity, Cpu, Network, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import { MoleculeDiagram } from './components/MoleculeDiagram';
import { WaterScarcityChart } from './components/WaterScarcityChart';

const MotionDiv = motion.div as any;
const MotionA = motion.a as any;

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </MotionDiv>
);

export default function App() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [activeSection, setActiveSection] = useState(0);

  // Background Particles
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-white/20 rounded-full';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.top = Math.random() * 100 + 'vh';
      particle.style.animation = `float ${Math.random() * 5 + 5}s linear infinite`;
      document.getElementById('particle-container')?.appendChild(particle);
    };
    for(let i=0; i<50; i++) createParticle();
  }, []);

  return (
    <div className="relative font-sans text-gray-100 bg-[#0d120f] selection:bg-deep-green selection:text-white">
      
      {/* --- Fixed Background & Particles --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E5631]/20 to-[#0d120f]" />
        <div id="particle-container" className="absolute inset-0" />
      </div>

      {/* --- Section 1: Hero --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <MotionDiv style={{ y: yParallax }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?auto=format&fit=crop&q=80&w=2000" 
            alt="Smart Farm" 
            className="w-full h-full object-cover opacity-40 scale-110"
          />
        </MotionDiv>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex justify-center mb-6">
              <Leaf className="w-16 h-16 text-soft-green-start animate-float" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-soft-green-start to-white">
              Embedding Molecular Intelligence <br /> into AI-Driven Irrigation
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-3xl mx-auto">
              Towards Smart Farming and Sustainable Food Security
            </p>
          </MotionDiv>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowRight className="w-6 h-6 rotate-90 text-white/50" />
        </div>
      </section>

      {/* --- Section 2: The Global Challenge --- */}
      <section className="py-24 relative z-10 bg-[#0d120f]/90">
        <div className="container mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl font-display font-bold text-soft-green-end mb-4">The Global Challenge</h2>
            <p className="text-2xl text-gray-400 mb-12">Water Scarcity in Agriculture</p>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg leading-relaxed text-gray-300 mb-6">
                  Severe limitations on wheat productivity in semi-arid and Mediterranean regions. 
                  <span className="text-red-400"> Drought conditions</span> increasingly threaten sustainability 
                  and food security for millions.
                </p>
                <div className="flex gap-4">
                  <div className="p-4 bg-deep-green/30 rounded-lg border border-deep-green/50">
                    <h3 className="text-3xl font-bold text-white">40%</h3>
                    <p className="text-sm text-gray-400">Yield Loss</p>
                  </div>
                  <div className="p-4 bg-deep-green/30 rounded-lg border border-deep-green/50">
                    <h3 className="text-3xl font-bold text-white">70%</h3>
                    <p className="text-sm text-gray-400">Water Waste</p>
                  </div>
                </div>
              </div>
              <WaterScarcityChart />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Section 3: Limitations --- */}
      <section className="py-24 relative z-10 bg-deep-green/10">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-white mb-4">Limitations of Current Systems</h2>
              <p className="text-xl text-gray-400">Why reactive is not enough</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Activity className="text-red-400" /> Reactive</h3>
                <p className="text-gray-300">Sensors detect dry soil only <strong>after</strong> the plant has already suffered stress. Irreversible damage often occurs before irrigation triggers.</p>
              </div>
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50" />
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Globe className="text-yellow-400" /> External Only</h3>
                <p className="text-gray-300">Relying solely on environmental sensors (soil, air) ignores the plant's internal biological state and needs.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Section 4: Scientific Breakthrough --- */}
      <section className="py-24 relative z-10 bg-[#0d120f]">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-display font-bold text-soft-green-start mb-6">Scientific Breakthrough</h2>
                <h3 className="text-2xl text-white mb-6">Plant Molecular Intelligence</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-tech-accent" />
                    <span><strong>Internal Signaling:</strong> Plants have evolved complex gene networks to monitor internal water deficits.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-2 rounded-full bg-tech-accent" />
                    <span><strong>Early Warning:</strong> Genes express stress signals (Aquaporins & ABA pathways) <em>before</em> visible wilting.</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <MoleculeDiagram />
                <p className="text-center text-xs text-gray-500 mt-4 font-mono">FIG 1. Aquaporin Channel Dynamics</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Section 5: Phyto-Sense Innovation --- */}
      <section className="py-24 relative z-10 bg-gradient-to-b from-[#0d120f] to-deep-green/20">
        <div className="container mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl font-display font-bold text-white mb-12">Phyto-Sense Innovation</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-left">
              
              {/* Step 1 */}
              <div className="w-64 p-6 glass-panel rounded-xl border-t-4 border-soft-green-start">
                <Leaf className="w-10 h-10 text-soft-green-start mb-4" />
                <h4 className="font-bold text-lg mb-2">Plant Data</h4>
                <p className="text-sm text-gray-400">Molecular signals and gene expression data captured.</p>
              </div>

              <ArrowRight className="hidden md:block text-gray-600" />

              {/* Step 2 */}
              <div className="w-64 p-6 glass-panel rounded-xl border-t-4 border-tech-accent">
                <Cpu className="w-10 h-10 text-tech-accent mb-4" />
                <h4 className="font-bold text-lg mb-2">AI Model</h4>
                <p className="text-sm text-gray-400">Trained on molecular data to predict stress from affordable sensors.</p>
              </div>

              <ArrowRight className="hidden md:block text-gray-600" />

              {/* Step 3 */}
              <div className="w-64 p-6 glass-panel rounded-xl border-t-4 border-blue-400">
                <Droplets className="w-10 h-10 text-blue-400 mb-4" />
                <h4 className="font-bold text-lg mb-2">Smart Irrigation</h4>
                <p className="text-sm text-gray-400">Proactive water delivery exactly when biology demands it.</p>
              </div>

            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Section 6: System Architecture --- */}
      <section className="py-24 relative z-10 bg-[#0d120f]">
        <div className="container mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl font-display font-bold text-white mb-16 text-center">System Architecture</h2>
            <div className="relative max-w-5xl mx-auto min-h-[500px] h-auto border border-white/10 rounded-3xl bg-[#050806] overflow-hidden p-8 flex items-center justify-center">
              {/* Decorative Lines */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10 w-full">
                {/* Input Layer */}
                <div className="space-y-6 flex flex-col justify-center">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
                    <Activity className="text-soft-green-start shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Soil Sensors</div>
                      <div className="text-xs text-gray-500">Moisture, Temp</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
                    <Globe className="text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">Climate Data</div>
                      <div className="text-xs text-gray-500">Humidity, Radiation</div>
                    </div>
                  </div>
                </div>

                {/* Processing Layer */}
                <div className="flex items-center justify-center py-4 md:py-0">
                   <div className="w-40 h-40 rounded-full bg-deep-green/20 border-2 border-tech-accent flex flex-col items-center justify-center animate-pulse-slow relative z-20 bg-[#050806]">
                      <div className="absolute inset-0 rounded-full border border-tech-accent/30 animate-spin-slow"></div>
                      <Network className="w-12 h-12 text-tech-accent mb-2" />
                      <div className="font-bold text-center">Inference<br/>Engine</div>
                   </div>
                </div>

                {/* Output Layer */}
                <div className="flex items-center justify-center">
                  <div className="p-6 bg-blue-900/20 rounded-xl border border-blue-500/50 w-full text-center max-w-[250px] md:max-w-none mx-auto">
                    <Droplets className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold">Precision Output</h4>
                    <p className="text-xs text-gray-400 mt-2">Valve Control & Alerts</p>
                  </div>
                </div>
              </div>

              {/* Connecting Lines (CSS) - Desktop Only */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block">
                 <line x1="25%" y1="50%" x2="40%" y2="50%" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
                 <line x1="60%" y1="50%" x2="75%" y2="50%" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
              </svg>

            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Section 7: Benefits & Impact --- */}
      <section className="py-24 relative z-10 bg-deep-green">
        <div className="container mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl font-display font-bold text-white mb-12 text-center">Impact & Benefits</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: 'Water Efficiency', val: '+35%', icon: Droplets },
                { title: 'Crop Resilience', val: 'High', icon: Leaf },
                { title: 'Scalability', val: 'Global', icon: Globe },
                { title: 'Cost', val: 'Low', icon: Activity }
              ].map((item, idx) => (
                <MotionDiv 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center"
                >
                  <item.icon className="w-8 h-8 mx-auto mb-4 text-tech-accent" />
                  <div className="text-3xl font-bold text-white mb-2">{item.val}</div>
                  <div className="text-sm text-gray-200">{item.title}</div>
                </MotionDiv>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Section 8: Sustainability Vision --- */}
      <section className="py-24 relative z-10 bg-[#0d120f]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
           <div className="md:w-1/2">
             <FadeIn>
               <h2 className="text-4xl font-display font-bold text-soft-green-end mb-6">A Bridge Between Biology & AI</h2>
               <p className="text-lg text-gray-400 leading-relaxed mb-6">
                 Phyto-Sense is not just a sensor; it is a catalyst for future-proof agriculture. 
                 By translating the silent language of plants into actionable data, we empower farmers to 
                 work <em>with</em> nature, not just on it.
               </p>
             </FadeIn>
           </div>
           <div className="md:w-1/2 h-64 md:h-96 relative rounded-2xl overflow-hidden">
             <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1000" alt="Future Vision" className="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
           </div>
        </div>
      </section>

      {/* --- Section 9 & 10: Call to Action & Link --- */}
      <section className="py-32 relative z-10 bg-gradient-to-t from-deep-green/40 to-[#0d120f] text-center">
        <div className="container mx-auto px-6">
          <FadeIn>
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-8">
              Let’s innovate for a <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-soft-green-start to-tech-accent">sustainable future</span>
            </h2>
            
            <MotionA 
              href="https://phyto-sense-n5mw.vercel.app" 
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-white text-deep-green px-8 py-4 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(76,175,80,0.6)] transition-all"
            >
              Explore Live Project <ExternalLink className="w-5 h-5" />
            </MotionA>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}