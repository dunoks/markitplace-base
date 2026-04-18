import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, X, Sparkles, Loader2, Play, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { VeoService } from '../services/veoService';

interface PromotionalVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'idle' | 'key_required' | 'generating' | 'success' | 'error';
  setStatus: (status: 'idle' | 'key_required' | 'generating' | 'success' | 'error') => void;
  videoUrl: string | null;
  setVideoUrl: (url: string | null) => void;
  currentLabel: string;
  setCurrentLabel: (label: string) => void;
  nft: {
    name: string;
    image: string;
    description?: string;
    collection: string;
  };
}

export const PromotionalVideoModal: React.FC<PromotionalVideoModalProps> = ({ 
  isOpen, 
  onClose, 
  status, 
  setStatus,
  videoUrl,
  setVideoUrl,
  currentLabel,
  setCurrentLabel,
  nft 
}) => {
  const [error, setError] = useState<string | null>(null);

  const startGeneration = async () => {
    const hasKey = await VeoService.hasKey();
    if (!hasKey) {
      setStatus('key_required');
      return;
    }

    try {
      setStatus('generating');
      setError(null);
      
      const prompt = `A cinematic, high-energy promotional video for an NFT artwork named "${nft.name}" from the "${nft.collection}" collection. The style is futuristic, holographic, and immersive, with swirling aether energy, neon glimmers, and dynamic camera movements that highlight the artwork's intricate details. The mood is epic and premium.`;
      
      // We need to fetch the image to convert to base64 for the API
      // Since it's from a URL (picsum or internal), we can't easily do it if CORS is an issue, 
      // but typically AI Studio env handles these.
      // For this demo, we'll try to fetch it.
      const response = await fetch(nft.image);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64 = await base64Promise;

      const url = await VeoService.generateVideo(prompt, base64);
      setVideoUrl(url);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_EXPIRED') {
        setStatus('key_required');
      } else {
        setError(err.message || 'Generation failed. High traffic detected in the Aether Stream.');
        setStatus('error');
      }
    }
  };

  const handleSelectKey = async () => {
    await VeoService.selectKey();
    startGeneration();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#050508] border border-white/10 rounded-[44px] overflow-hidden shadow-[0_0_100px_rgba(0,210,255,0.1)]"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff] border border-[#00d2ff]/30">
                  <Video size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Veo Promo Engine</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Generative Cinematic Preview Protocol</p>
                </div>
              </div>

              {status === 'idle' && (
                <div className="space-y-8">
                  <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Initialize the **Veo 3.1 Prototype** to synthesize a localized promotional video for **{nft.name}**. 
                      This process uses generative motion diffusion to create a 5-second cinematic highlight.
                    </p>
                    <div className="flex gap-4">
                       <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                        <Sparkles size={14} className="text-[#00d2ff]" />
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">1080p Cinematic</span>
                       </div>
                       <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                        <Play size={14} className="text-[#9d50bb]" />
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">5s High Velocity</span>
                       </div>
                    </div>
                  </div>
                  <button 
                    onClick={startGeneration}
                    className="w-full bg-[#00d2ff] text-black py-6 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                  >
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    Synthesize Promotion
                  </button>
                </div>
              )}

              {status === 'key_required' && (
                <div className="space-y-8 text-center py-8">
                  <div className="w-20 h-20 bg-yellow-500/20 rounded-3xl flex items-center justify-center text-yellow-500 mx-auto mb-6 border border-yellow-500/30">
                    <AlertTriangle size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-4">API Authentication Required</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                      Veo Video Generation requires a valid paid Google Cloud API Key. Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[#00d2ff] underline">billing documentation</a> for setup.
                    </p>
                  </div>
                  <button 
                    onClick={handleSelectKey}
                    className="w-full bg-white text-black py-6 rounded-[28px] font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Configure API Key
                  </button>
                </div>
              )}

              {status === 'generating' && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[#00d2ff]/20 blur-3xl animate-pulse" />
                    <Loader2 size={80} className="text-[#00d2ff] animate-spin relative" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{currentLabel}</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Estimated Latency: 45-60 Seconds</p>
                </div>
              )}

              {status === 'success' && videoUrl && (
                <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                  <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black">
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-4">
                    <a 
                      href={videoUrl} 
                      download={`${nft.name}-promo.mp4`}
                      className="flex-1 bg-white text-black py-5 rounded-[22px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center"
                    >
                      <Download size={18} /> Download Relic
                    </a>
                    <button 
                       onClick={() => setStatus('idle')}
                       className="px-8 py-5 rounded-[22px] bg-white/5 text-white border border-white/10 font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-8 text-center py-8">
                  <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/30">
                    <AlertTriangle size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Protocol Rejection</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">{error}</p>
                  </div>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="w-full bg-white/5 text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Resynchronize
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
