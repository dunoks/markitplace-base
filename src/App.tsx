import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useParams,
  useSearchParams
} from 'react-router-dom';
import { 
  WagmiProvider, 
  createConfig, 
  http,
  useAccount,
  useConnect,
  useDisconnect
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { mainnet, base } from 'wagmi/chains';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Compass, 
  BarChart3, 
  PlusSquare,
  Wallet,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Gavel,
  Clock,
  Sparkles,
  Zap,
  Filter
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { MOCK_NFTS, MOCK_COLLECTIONS, MOCK_ACTIVITY } from './lib/data';

import { formatAddress } from './lib/utils';

// Wagmi Config
const config = createConfig({
  chains: [mainnet, base],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

// --- Price Simulation Hook ---
const useLivePrice = (id: string, basePrice: number) => {
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const [lastDirection, setLastDirection] = useState<'up' | 'down' | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Random interval between 4 and 10 seconds
    const interval = setInterval(() => {
      const change = (Math.random() * 0.04 - 0.02); // +/- 2% max change
      const newPrice = Math.max(0.01, basePrice + (basePrice * change));
      
      setLastDirection(newPrice > currentPrice ? 'up' : 'down');
      setCurrentPrice(parseFloat(newPrice.toFixed(3)));
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    }, 4000 + Math.random() * 6000);

    return () => clearInterval(interval);
  }, [id, basePrice, currentPrice]);

  return { currentPrice, lastDirection, pulse };
};

const Countdown = ({ end }: { end: string }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(end).getTime() - Date.now();
      if (diff <= 0) return null;
      
      return {
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => {
      const res = calculate();
      setTimeLeft(res);
      if (!res) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [end]);

  if (!timeLeft) return <span className="text-red-500 font-black">EXPIRED</span>;

  return (
    <div className="flex gap-1 font-mono">
      <span>{String(timeLeft.h).padStart(2, '0')}h</span>
      <span className="animate-pulse">:</span>
      <span>{String(timeLeft.m).padStart(2, '0')}m</span>
      <span className="animate-pulse">:</span>
      <span>{String(timeLeft.s).padStart(2, '0')}s</span>
    </div>
  );
};

// Page Components (Defined below for simplicity in this turn)
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled ? "bg-black/60 backdrop-blur-lg py-3 border-white/5 shadow-xl" : "bg-transparent py-5 border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00d2ff] to-[#9d50bb] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <ShoppingBag size={22} />
          </div>
          <span className="text-2xl font-black tracking-widest text-gradient hidden sm:block">AETHER</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00d2ff] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full bg-white/5 border border-white/10 group-focus-within:border-[#00d2ff]/40 rounded-2xl py-2.5 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600 focus:bg-white/10"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/explore" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Explore</Link>
          <Link to="/stats" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Stats</Link>
          <Link to="/create" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Create</Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <Link to={`/profile/${address}`} className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-xl border border-white/10 transition-all">
                <User size={18} />
              </Link>
              <button 
                onClick={() => disconnect()}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold border border-white/10 transition-all"
              >
                <div className="w-2 h-2 bg-[#00d2ff] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,210,255,1)]" />
                <span className="font-mono text-sm">{formatAddress(address!)}</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="flex items-center gap-2 bg-[#00d2ff] hover:bg-[#00b0d6] text-black px-6 py-2.5 rounded-xl font-black tracking-tight shadow-lg shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Wallet size={18} />
              <span className="hidden sm:inline">Connect</span>
            </button>
          )}

          <button 
            className="lg:hidden p-2.5 text-gray-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-6 flex flex-col gap-4 lg:hidden shadow-xl"
          >
             <Link to="/explore" className="text-lg font-medium p-2 border-b border-gray-50 flex justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Explore <ChevronRight size={18} className="text-gray-400" />
             </Link>
             <Link to="/stats" className="text-lg font-medium p-2 border-b border-gray-50 flex justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Stats <ChevronRight size={18} className="text-gray-400" />
             </Link>
             <Link to="/create" className="text-lg font-medium p-2 border-b border-gray-50 flex justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Create <ChevronRight size={18} className="text-gray-400" />
             </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface NFTCardProps {
  nft: typeof MOCK_NFTS[0];
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  const { currentPrice, lastDirection, pulse } = useLivePrice(nft.id, nft.price);
  
  return (
    <Link to={`/nft/${nft.id}`}>
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="group bg-white/5 rounded-[32px] overflow-hidden border border-white/10 shadow-lg hover:shadow-[#00d2ff]/10 hover:border-[#00d2ff]/30 transition-all duration-500 h-full backdrop-blur-md"
      >
        <div className="aspect-square overflow-hidden relative">
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 bg-[#9d50bb]/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 flex items-center gap-2">
            {nft.isAuction ? (
              <>
                <Gavel size={12} /> Auction
              </>
            ) : (
              'Listed'
            )}
          </div>
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#00d2ff] border border-white/10">
            {nft.rarity || 'Common'}
          </div>
          {nft.isAuction && nft.auctionEnd && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10 flex justify-between items-center">
              <span className="text-gray-400">Ends in</span>
              <Countdown end={nft.auctionEnd} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
            <div className="w-full bg-[#00d2ff] text-black py-3 rounded-2xl font-black text-sm tracking-tighter shadow-xl text-center">
              View Details
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-white group-hover:text-[#00d2ff] transition-colors truncate">{nft.name}</h3>
            <div className={cn(
              "flex items-center gap-1 transition-colors duration-500",
              pulse ? (lastDirection === 'up' ? 'text-green-400' : 'text-red-400') : 'text-[#00d2ff]'
            )}>
              <span className="font-black text-xl">
                {nft.isAuction ? nft.currentBid : currentPrice}
              </span>
              <span className="text-[10px] font-bold text-gray-500">ETH</span>
              {!nft.isAuction && pulse && (
                <AnimatePresence>
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {lastDirection === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{nft.collection}</p>
            <p className="text-[10px] text-gray-500 font-mono">
              {nft.isAuction ? `Bids: ${nft.bidsCount}` : `L.S: ${nft.lastSale ?? '--'} ETH`}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const Explore = () => {
  const [searchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection');

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>(collectionParam || 'all');

  // Search & AI States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof MOCK_NFTS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    if (collectionParam) {
      setSelectedCollection(collectionParam);
    }
  }, [collectionParam]);

  // Auto-suggestions logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const matches = MOCK_NFTS.filter(nft => 
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse this NFT search query: "${searchQuery}". 
        Available Collections: ${MOCK_COLLECTIONS.map(c => `${c.id} (${c.name})`).join(', ')}.
        Available Rarities: Common, Rare, Epic, Legendary.
        Return JSON format with: minPrice (number or null), maxPrice (number or null), collectionId (string or "all"), rarities (array of strings).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              minPrice: { type: Type.NUMBER },
              maxPrice: { type: Type.NUMBER },
              collectionId: { type: Type.STRING },
              rarities: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text);
      if (result.minPrice !== undefined) setMinPrice(result.minPrice?.toString() || '');
      if (result.maxPrice !== undefined) setMaxPrice(result.maxPrice?.toString() || '');
      if (result.collectionId) setSelectedCollection(result.collectionId);
      if (result.rarities) setSelectedRarity(result.rarities);
      
      setShowSuggestions(false);
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];

  const filteredNfts = MOCK_NFTS.filter(nft => {
    const priceMatch = (!minPrice || nft.price >= parseFloat(minPrice)) && 
                      (!maxPrice || nft.price <= parseFloat(maxPrice));
    const rarityMatch = selectedRarity.length === 0 || (nft.rarity && selectedRarity.includes(nft.rarity)) || (!nft.rarity && selectedRarity.includes('Common'));
    const collectionMatch = selectedCollection === 'all' || nft.collectionId === selectedCollection;
    const queryMatch = !searchQuery || 
                      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      nft.collection.toLowerCase().includes(searchQuery.toLowerCase());
    return priceMatch && rarityMatch && collectionMatch && queryMatch;
  });

  const toggleRarity = (rarity: string) => {
    setSelectedRarity(prev => 
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
  };

  return (
    <div className="pt-32 max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex flex-col gap-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-6 flex items-center gap-2">
              <Compass size={20} className="text-[#00d2ff]" /> Filters
            </h2>
            
            <div className="space-y-8">
              {/* Collection Filter */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Collection</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00d2ff]/40 transition-all font-bold"
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                >
                  <option value="all" className="bg-[#14141e]">All Collections</option>
                  {MOCK_COLLECTIONS.map(col => (
                    <option key={col.id} value={col.id} className="bg-[#14141e]">{col.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Price Range (ETH)</label>
                <div className="flex gap-3 items-center">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00d2ff]/40"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-gray-600">to</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00d2ff]/40"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Rarity Filter */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Rarity</label>
                <div className="grid grid-cols-2 gap-2">
                  {rarities.map(rarity => (
                    <button
                      key={rarity}
                      onClick={() => toggleRarity(rarity)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                        selectedRarity.includes(rarity) 
                          ? "bg-[#00d2ff] text-black border-[#00d2ff]" 
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                      )}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setSelectedRarity([]);
                  setSelectedCollection('all');
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-[#9d50bb] transition-all rounded-xl border border-white/5"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Enhanced Search Header */}
          <div className="mb-12 relative">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
              <div className="relative flex-1 group w-full">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d2ff] transition-colors">
                  <Search size={22} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search assets, collections, or AI queries (e.g. 'Epic apes under 1 ETH')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full bg-white/5 border border-white/10 rounded-[32px] py-6 pl-14 pr-6 text-lg text-white font-medium outline-none focus:border-[#00d2ff]/40 focus:bg-white/[0.07] transition-all shadow-2xl"
                />
                
                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-4 glass rounded-[36px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden backdrop-blur-3xl"
                    >
                      <div className="p-3">
                        <div className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 mb-2">Registry Matches</div>
                        {suggestions.map(nft => (
                          <button
                            key={nft.id}
                            onClick={() => {
                              setSearchQuery(nft.name);
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-5 p-4 hover:bg-white/5 rounded-2xl transition-all text-left group/item"
                          >
                            <img src={nft.image} alt="" className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover/item:border-[#00d2ff]/40 transition-colors" />
                            <div>
                              <div className="font-bold text-white mb-0.5 text-lg">{nft.name}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-[#9d50bb]">{nft.collection}</div>
                            </div>
                            <div className="ml-auto flex flex-col items-end">
                              <div className="flex items-center gap-1.5 text-[#00d2ff]">
                                <span className="font-black text-xl">{nft.price}</span>
                                <span className="text-[10px] font-bold">ETH</span>
                              </div>
                              <span className="text-[10px] text-gray-600 font-mono capitalize">{nft.rarity || 'Common'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={handleAiSearch}
                disabled={isAiSearching || !searchQuery}
                className="bg-gradient-to-r from-[#9d50bb] to-[#6e48aa] hover:from-[#ab5cc9] hover:to-[#7b53c0] text-white px-10 py-6 rounded-[32px] font-black tracking-tight flex items-center gap-3 shadow-[0_10px_30px_rgba(157,80,187,0.3)] transition-all disabled:opacity-50 active:scale-95 shrink-0 w-full md:w-auto overflow-hidden relative group"
              >
                {isAiSearching ? (
                  <>
                    <Zap size={20} className="animate-spin" /> Analyzing Syntax...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> AI Parse
                  </>
                )}
                {isAiSearching && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
              </button>
            </div>

            <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <h1 className="text-6xl font-black text-white tracking-tighter mb-3 leading-none">Explore Assets</h1>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#00d2ff] rounded-full shadow-[0_0_8px_rgba(0,210,255,1)]" />
                    Registry status: Active
                  </span>
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#9d50bb] rounded-full shadow-[0_0_8px_rgba(157,80,187,1)]" />
                    AI Engine: v3.1 Flash
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-black text-white tracking-tighter">{filteredNfts.length}</span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Results</span>
              </div>
            </div>
          </div>
          
          {filteredNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
            </div>
          ) : (
            <div className="h-[400px] glass rounded-[40px] flex flex-col items-center justify-center text-center p-12">
              <Compass size={48} className="text-gray-600 mb-6 animate-pulse" />
              <h3 className="text-2xl font-black mb-2">No matches found</h3>
              <p className="text-gray-500 max-w-xs">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CollectionPage = () => {
  const { id } = useParams();
  const collection = MOCK_COLLECTIONS.find(c => c.id === id);
  const nfts = MOCK_NFTS.filter(n => n.collectionId === id);

  if (!collection) return <div className="pt-32 text-center h-screen">Collection not found</div>;

  return (
    <div className="pt-20">
      {/* Collection Hero */}
      <div className="h-[400px] w-full relative">
        <img src={collection.banner} alt={collection.name} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10 mb-20">
        <div className="flex flex-col md:flex-row gap-12 items-end">
          <img src={collection.logo} alt={collection.name} className="w-48 h-48 rounded-[40px] border-8 border-[#050508] shadow-2xl shadow-black/50" referrerPolicy="no-referrer" />
          <div className="flex-1 pb-4">
            <h1 className="text-7xl font-black text-white tracking-tighter mb-8 leading-none">{collection.name}</h1>
            <div className="flex flex-wrap gap-12 glass p-8 rounded-[32px] w-fit">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">Assets</span>
                <span className="text-2xl font-black text-white tracking-tight">{collection.items.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">Owners</span>
                <span className="text-2xl font-black text-white tracking-tight">{collection.owners.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">Floor Price</span>
                <span className="text-2xl font-black text-[#00d2ff] tracking-tight">{collection.floorPrice} <span className="text-gray-600 text-sm">ETH</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">Total Volume</span>
                <span className="text-2xl font-black text-white tracking-tight">{collection.volume.toLocaleString()} <span className="text-gray-600 text-sm">ETH</span></span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-12 text-gray-400 max-w-3xl leading-[1.8] text-lg font-medium italic">
          "{collection.description}"
        </p>
      </div>

      {/* Collection Items */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
        <div className="border-b border-white/5 mb-14 pb-4 flex items-center justify-between">
          <div className="flex gap-12">
            <button className="text-xs font-black uppercase tracking-[0.3em] text-[#00d2ff] border-b-2 border-[#00d2ff] pb-4">Nexus Items</button>
            <button className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors pb-4">Log History</button>
          </div>
          <Link 
            to={`/explore?collection=${collection.id}`}
            className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-white/5 hover:bg-[#00d2ff] hover:text-black rounded-xl border border-white/10 transition-all flex items-center gap-2 mb-4"
          >
            View All Items <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {nfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
        </div>
      </div>
    </div>
  );
};

const NFTPage = () => {
  const { id } = useParams();
  const nft = MOCK_NFTS.find(n => n.id === id);
  const [isConfirming, setIsConfirming] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  
  // Auction states
  const [bidAmount, setBidAmount] = useState<string>('');
  const [currentHighestBid, setCurrentHighestBid] = useState(nft?.currentBid || 0);
  const [bidsCount, setBidsCount] = useState(nft?.bidsCount || 0);
  const [bidder, setBidder] = useState(nft?.highestBidder || 'None');

  const { currentPrice, lastDirection, pulse } = useLivePrice(nft?.id || '0', nft?.price || 0);

  if (!nft) return <div className="pt-32 text-center h-screen">NFT not found</div>;

  const handlePurchase = () => {
    setPurchaseStatus('pending');
    setTimeout(() => {
      setPurchaseStatus('success');
      setTimeout(() => setPurchaseStatus('idle'), 3000);
      setIsConfirming(false);
    }, 2000);
  };

  const handlePlaceBid = () => {
    const bidValue = parseFloat(bidAmount);
    if (!bidValue || bidValue <= currentHighestBid) return;

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setPurchaseStatus('pending');
    setTimeout(() => {
      setPurchaseStatus('success');
      setCurrentHighestBid(bidValue);
      setBidsCount(prev => prev + 1);
      setBidder('0xYou (Current)');
      setBidAmount('');
      setTimeout(() => setPurchaseStatus('idle'), 3000);
      setIsConfirming(false);
    }, 1500);
  };

  return (
    <div className="pt-32 max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Image */}
        <div className="sticky top-32 h-fit">
          <motion.div 
            layoutId={`nft-${nft.id}`}
            className="rounded-[44px] overflow-hidden border border-white/10 shadow-2xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <img src={nft.image} alt={nft.name} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
            
            {nft.isAuction && nft.auctionEnd && (
              <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-[32px] border-white/20 flex flex-col gap-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  <span>Vault Access Required</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00d2ff] block mb-1">Time Remaining</span>
                    <div className="text-3xl font-black text-white">
                      <Countdown end={nft.auctionEnd} />
                    </div>
                  </div>
                  <Gavel className="text-white/20" size={48} />
                </div>
              </div>
            )}
          </motion.div>
          
          <div className="mt-8 glass rounded-[32px] p-8">
            <h3 className="font-black text-white mb-4 uppercase tracking-[0.2em] text-xs flex items-center gap-2">
              <Compass size={18} className="text-[#00d2ff]" /> Description
            </h3>
            <p className="text-gray-400 text-base leading-[1.8] font-medium">
              This digital relic is a masterwork of generative art from the {nft.collection} universe. 
              As an owner, you hold a piece of the original digital genesis, granting you prioritized access to future drops in the Aether ecosystem.
            </p>
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-10">
          <div>
            <Link to={`/collection/${nft.collectionId}`} className="text-[#00d2ff] font-black uppercase tracking-widest text-xs hover:underline mb-4 block">
              {nft.collection}
            </Link>
            <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">{nft.name}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Registry Holder</span>
                <span className="text-[#9d50bb] font-black font-mono text-sm">{nft.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Protocol Synchronized</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-[40px] p-10 relative overflow-hidden ring-1 ring-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00d2ff]/10 to-transparent rounded-bl-[100px]" />
            
            <div className="mb-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] block">
                  {nft.isAuction ? 'CURRENT HIGHEST BID' : 'FIXED MARKET PRICE'}
                </span>
                {nft.isAuction && (
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                    {bidsCount} Protocol Bids
                  </span>
                )}
                {!nft.isAuction && (
                  <AnimatePresence mode="wait">
                    {pulse && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={cn(
                          "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
                          lastDirection === 'up' ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {lastDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        Ticker Update
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
              <div className="flex items-baseline gap-3">
                <motion.span 
                  animate={{ color: !nft.isAuction && pulse ? (lastDirection === 'up' ? '#4ade80' : '#f87171') : '#ffffff' }}
                  className="text-6xl font-black tracking-tighter"
                >
                  {nft.isAuction ? currentHighestBid : currentPrice}
                </motion.span>
                <span className="text-2xl font-black text-gray-500 tracking-tighter">ETH</span>
                <span className="text-gray-400 font-bold ml-4 font-mono text-sm">
                  ~ ${((nft.isAuction ? currentHighestBid : currentPrice) * 3200).toLocaleString()} USD
                </span>
              </div>
              {nft.isAuction && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
                  <span>Highest Bidder:</span>
                  <span className="text-white font-mono">{bidder}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              {purchaseStatus === 'success' ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-500/20 border border-green-500/30 py-5 rounded-3xl flex items-center justify-center gap-3 text-green-400 font-black text-xl shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                >
                  {nft.isAuction ? 'Bid Submitted' : 'Purchase Confirmed!'}
                </motion.div>
              ) : nft.isAuction ? (
                <div className="flex flex-col gap-4">
                  {isConfirming ? (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-2">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Bid Review</span>
                          <span className="text-[#00d2ff] font-black text-[10px] uppercase">Aether Verified</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-gray-500 font-bold text-sm">Your Proposal:</span>
                          <span className="text-3xl font-black text-white">{bidAmount} ETH</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-600">Protocol Fee:</span>
                          <span className="text-gray-400">0.00 ETH (Free)</span>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={handlePlaceBid}
                          disabled={purchaseStatus === 'pending'}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-black rounded-2xl py-5 font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {purchaseStatus === 'pending' ? 'Broadcasting...' : 'Confirm Bid'}
                        </button>
                        <button 
                          onClick={() => setIsConfirming(false)}
                          className="px-8 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="relative group">
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder={`Min bid: ${(currentHighestBid + 0.01).toFixed(2)} ETH`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 group-focus-within:border-[#00d2ff]/50 rounded-2xl py-6 px-6 text-xl text-white font-black outline-none transition-all placeholder:text-gray-700"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#00d2ff] font-black">ETH</div>
                      </div>
                      <button 
                        onClick={handlePlaceBid}
                        disabled={purchaseStatus === 'pending' || !bidAmount || parseFloat(bidAmount) <= currentHighestBid}
                        className="w-full bg-[#00d2ff] hover:bg-[#00c0e5] text-black rounded-2xl py-5 font-black text-2xl shadow-[0_0_25px_rgba(0,210,255,0.3)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                      >
                        <Gavel /> {purchaseStatus === 'pending' ? 'Broadcasting...' : 'Review Protocol Bid'}
                      </button>
                    </>
                  )}
                </div>
              ) : isConfirming ? (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex flex-col gap-4"
                >
                  <p className="text-center text-sm font-bold text-gray-400 mb-2">Are you sure you want to purchase this asset at <span className="text-white font-black">{currentPrice} ETH</span>?</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={handlePurchase}
                      disabled={purchaseStatus === 'pending'}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-black rounded-2xl py-5 font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {purchaseStatus === 'pending' ? 'Processing...' : 'Yes, Buy Now'}
                    </button>
                    <button 
                      onClick={() => setIsConfirming(false)}
                      className="px-8 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button 
                  onClick={() => setIsConfirming(true)}
                  className="w-full bg-[#00d2ff] hover:bg-[#00c0e5] text-black rounded-2xl py-5 font-black text-2xl shadow-[0_0_25px_rgba(0,210,255,0.3)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <ShoppingBag /> Buy Now
                </button>
              )}
            </div>
          </div>

          <div className="glass rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-black text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#00d2ff]" /> Analytics
              </h3>
              <div className="flex gap-2">
                {['1D', '7D', '30D'].map(t => (
                  <button key={t} className="text-[10px] font-black text-gray-500 hover:text-white px-2 py-1 rounded-md transition-all">{t}</button>
                ))}
              </div>
            </div>
            <div className="p-16 text-center text-gray-600 italic font-mono text-sm tracking-tighter">
              [ QUANTUM MARKET DATA FEED LOADING... ]
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-6 rounded-[28px] border-l-2 border-l-[#00d2ff]">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-2">Rarity Power</span>
              <span className="text-2xl font-black text-white tracking-tighter">#{Math.floor(Math.random() * 1000)} <span className="text-gray-600 text-lg">/ {nft.rarity || 'Common'}</span></span>
            </div>
            <div className="glass p-6 rounded-[28px] border-l-2 border-l-[#9d50bb]">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-2">Collection Class</span>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">Alpha</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24 relative overflow-hidden rounded-[48px] bg-[#0a0a0f] border border-white/5 py-24 md:py-40">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/aether-hero/1920/1080?blur=4" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20 scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-2xl px-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/20 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-8 shadow-[0_0_15px_rgba(0,210,255,0.1)]">
              Base Chain Protocols Active
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.85] mb-10 tracking-tighter">
              The Future of Digital <br /> <span className="text-[#00d2ff]">Revenues.</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-lg leading-relaxed font-medium">
              Dive into Aether, the premier immersive marketplace for Base and Ethereum assets.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/explore" className="bg-[#00d2ff] hover:bg-[#00c0e5] text-black px-10 py-5 rounded-[22px] font-black text-xl shadow-[0_10px_30px_rgba(0,210,255,0.2)] transition-all active:scale-95">
                Explore Items
              </Link>
              <button className="bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-[22px] font-black text-xl transition-all active:scale-95">
                Mint Now
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Float */}
        <div className="absolute top-20 right-20 hidden lg:block">
           <motion.div 
             animate={{ y: [0, -20, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="w-64 h-80 glass rounded-[44px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col gap-4"
           >
             <div className="w-full h-48 bg-gradient-to-br from-[#00d2ff] to-[#9d50bb] rounded-[32px] opacity-80" />
             <div>
               <div className="h-4 bg-white/10 rounded-full w-2/3 mb-2" />
               <div className="h-4 bg-white/10 rounded-full w-1/3" />
             </div>
           </motion.div>
        </div>
      </section>

      {/* Stats Quick Look */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-32 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Volume', value: '1,248.5 ETH', accent: '#00d2ff' },
          { label: 'Active Wallets', value: '12,490', accent: '#9d50bb' },
          { label: 'Minted Items', value: '84,201', accent: '#00ff88' },
          { label: 'Protocols', value: 'Base / ETH', accent: '#ffffff' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass p-8 rounded-[32px] border-b-4"
            style={{ borderBottomColor: stat.accent }}
          >
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">{stat.label}</span>
            <span className="text-2xl font-black text-white tracking-tighter">{stat.value}</span>
          </motion.div>
        ))}
      </section>

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-32">
        <div className="flex justify-between items-end mb-14">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Trending Vaults</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronized datasets from Base Chain</p>
          </div>
          <Link to="/explore" className="text-[#00d2ff] font-black flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-xs">
            See all <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_COLLECTIONS.map((col, idx) => (
            <Link key={col.id} to={`/collection/${col.id}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative h-96 rounded-[44px] overflow-hidden shadow-2xl border border-white/5"
              >
                <img src={col.banner} alt={col.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/20 to-transparent opacity-90" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-col gap-6">
                    <img src={col.logo} alt={col.name} className="w-20 h-20 rounded-3xl border border-white/20 shadow-[-10px_10px_20px_rgba(0,0,0,0.5)]" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="text-3xl font-black text-white mb-3 tracking-tighter group-hover:text-[#00d2ff] transition-colors">{col.name}</h3>
                      <div className="flex gap-8">
                        <div>
                          <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-1">Floor</span>
                          <span className="text-lg font-black text-white">{col.floorPrice} <span className="text-gray-600 text-sm">ETH</span></span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-1">Volume</span>
                          <span className="text-lg font-black text-white">{col.volume} <span className="text-gray-600 text-sm">ETH</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Notable Items */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Market Snapshot</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Real-time assets currently trading on Base</p>
          </div>
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {['All', 'Art', 'Gaming', 'PFPs'].map(tab => (
              <button key={tab} className={cn(
                "px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all",
                tab === 'All' ? "bg-[#00d2ff] text-black shadow-[0_0_15px_rgba(0,210,255,0.3)]" : "text-gray-500 hover:text-white"
              )}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_NFTS.map((nft, idx) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      </section>
    </div>
  );
};

const Profile = () => {
  const { address } = useParams();
  const { address: currentAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<'assets' | 'activity'>('assets');

  const profileAddress = address || currentAddress;
  const ownedNfts = MOCK_NFTS.filter(n => n.owner === profileAddress || (profileAddress === currentAddress && n.owner.includes('You')));
  const activities = MOCK_ACTIVITY.filter(a => a.from === profileAddress || a.to === profileAddress || (profileAddress === currentAddress && (a.from.includes('You') || a.to?.includes('You'))));

  if (!profileAddress) return <div className="pt-32 text-center h-screen">Please connect your wallet to view profile</div>;

  const stats = [
    { label: 'Total Items', value: ownedNfts.length },
    { label: 'Total Value', value: `${ownedNfts.reduce((acc, n) => acc + (n.isAuction ? n.currentBid || 0 : n.price), 0).toFixed(2)} ETH` },
    { label: 'Collections', value: new Set(ownedNfts.map(n => n.collectionId)).size },
    { label: 'Avg Floor', value: '0.45 ETH' },
  ];

  return (
    <div className="pt-32 max-w-7xl mx-auto px-4 md:px-8 pb-32">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-10 mb-20">
        <div className="w-40 h-40 rounded-[48px] bg-gradient-to-br from-[#00d2ff] to-[#9d50bb] p-1 shadow-2xl">
          <div className="w-full h-full rounded-[44px] bg-[#050508] flex items-center justify-center overflow-hidden">
            <User size={80} className="text-white/20" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            {profileAddress === currentAddress ? 'Your Nexus Profile' : 'Operator Archive'}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
            <span className="font-mono text-gray-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-sm">
              {profileAddress}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass p-6 rounded-[24px] border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">{stat.label}</span>
                <span className="text-xl font-black text-white tracking-tight">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5 mb-12 flex gap-12">
        <button 
          onClick={() => setActiveTab('assets')}
          className={cn(
            "text-xs font-black uppercase tracking-[0.3em] pb-4 transition-all",
            activeTab === 'assets' ? "text-[#00d2ff] border-b-2 border-[#00d2ff]" : "text-gray-500 hover:text-white"
          )}
        >
          Owned Assets
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={cn(
            "text-xs font-black uppercase tracking-[0.3em] pb-4 transition-all",
            activeTab === 'activity' ? "text-[#00d2ff] border-b-2 border-[#00d2ff]" : "text-gray-500 hover:text-white"
          )}
        >
          Protocol Activity
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'assets' ? (
          <motion.div 
            key="assets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {ownedNfts.length > 0 ? (
              ownedNfts.map(nft => <NFTCard key={nft.id} nft={nft} />)
            ) : (
              <div className="col-span-full h-80 glass rounded-[40px] flex flex-col items-center justify-center text-gray-500">
                <ShoppingBag size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs">No assets detected in sector</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-4"
          >
            {activities.length > 0 ? (
              activities.map(activity => (
                <div key={activity.id} className="glass p-6 rounded-[24px] flex items-center gap-6 group hover:border-[#00d2ff]/30 transition-all">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={activity.nftImage} alt={activity.nftName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        activity.type === 'sale' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                        activity.type === 'bid' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                        "bg-white/5 border-white/10 text-gray-400"
                      )}>
                        {activity.type}
                      </span>
                      <span className="text-[10px] font-mono text-gray-600">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-white truncate">{activity.nftName}</h4>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-lg font-black text-white">{activity.price ? `${activity.price} ETH` : '--'}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Value Transferred</div>
                  </div>
                  <div className="flex flex-col gap-1 items-end text-[10px] font-mono whitespace-nowrap">
                    <div className="flex gap-2">
                      <span className="text-gray-600">FROM:</span>
                      <span className="text-[#00d2ff]">{activity.from}</span>
                    </div>
                    {activity.to && (
                      <div className="flex gap-2">
                        <span className="text-gray-600">TO:</span>
                        <span className="text-[#9d50bb]">{activity.to}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-80 glass rounded-[40px] flex flex-col items-center justify-center text-gray-500">
                <BarChart3 size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs">No protocol logs found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-[#00d2ff]/30 selection:text-white">
      <div className="atmosphere" />
      <Navbar />
      <main>{children}</main>
      <footer className="bg-black/40 border-t border-white/5 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d2ff] to-[#9d50bb] rounded-xl flex items-center justify-center text-white">
                <ShoppingBag size={22} />
              </div>
              <span className="text-2xl font-black tracking-widest text-gradient">AETHER</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs font-medium">
              The premier immersive marketplace for digital collectibles on the Base network. Built for performance, designed for discovery.
            </p>
          </div>
          
          <div>
            <h4 className="font-black text-white text-xs uppercase tracking-[0.3em] mb-8">Protocol</h4>
            <ul className="flex flex-col gap-5 text-gray-500 text-sm font-bold italic">
              <li className="hover:text-[#00d2ff] cursor-pointer transition-colors">Marketplace</li>
              <li className="hover:text-[#00d2ff] cursor-pointer transition-colors">Drops</li>
              <li className="hover:text-[#00d2ff] cursor-pointer transition-colors">Stats</li>
              <li className="hover:text-[#00d2ff] cursor-pointer transition-colors">Activity</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black text-white text-xs uppercase tracking-[0.3em] mb-8">Resources</h4>
            <ul className="flex flex-col gap-5 text-gray-500 text-sm font-bold italic">
              <li className="hover:text-[#00d2ff] cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-[#00d2ff] cursor-pointer transition-colors">API Docs</li>
              <li className="hover:text-[#00d2ff] cursor-pointer transition-colors">Partner Program</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black text-white text-xs uppercase tracking-[0.3em] mb-8">Subscribe</h4>
            <p className="text-gray-500 text-xs mb-6 font-medium leading-relaxed">Join the Aether dispatch to receive intel on upcoming drops and protocol updates.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="0x..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#00d2ff] transition-all" />
              <button className="bg-[#00d2ff] text-black px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-blue-500/20">JOIN</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-24 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            <span>© 2026 AETHER PROTOCOL. BUILT ON BASE.</span>
            <div className="flex gap-12">
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Nexus</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Buffer</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/collection/:id" element={<CollectionPage />} />
              <Route path="/nft/:id" element={<NFTPage />} />
              <Route path="/profile/:address" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/stats" element={<div className="pt-32 text-center h-screen text-4xl font-black">Stats are booming</div>} />
              <Route path="/create" element={<div className="pt-32 text-center h-screen">Mint your masterpiece</div>} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
