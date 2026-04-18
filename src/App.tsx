import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useParams
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
  ChevronRight
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { MOCK_NFTS, MOCK_COLLECTIONS } from './lib/data';

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
      isScrolled ? "bg-white/80 backdrop-blur-md py-3 border-gray-200 shadow-sm" : "bg-transparent py-5 border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShoppingBag size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-gray-900 hidden sm:block">BaseSea</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search items, collections, and accounts" 
            className="w-full bg-gray-100/50 group-focus-within:bg-white border border-transparent group-focus-within:border-blue-600/30 rounded-2xl py-2.5 pl-12 pr-4 outline-none transition-all"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/explore" className="text-font-medium text-gray-600 hover:text-blue-600 transition-colors font-semibold">Explore</Link>
          <Link to="/stats" className="text-font-medium text-gray-600 hover:text-blue-600 transition-colors font-semibold">Stats</Link>
          <Link to="/create" className="text-font-medium text-gray-600 hover:text-blue-600 transition-colors font-semibold">Create</Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => disconnect()}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-5 py-2.5 rounded-xl font-bold transition-all"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {formatAddress(address!)}
              </button>
              <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors hidden sm:block">
                <User size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-100 transition-all active:scale-95"
            >
              <Wallet size={18} />
              <span className="hidden sm:inline">Connect Wallet</span>
            </button>
          )}
          
          <button 
            className="lg:hidden p-2.5 text-gray-600"
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

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => (
  <Link to={`/nft/${nft.id}`}>
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={nft.image} 
          alt={nft.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
          {nft.rarity || 'Common'}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold shadow-lg text-center">
            View Details
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 truncate">{nft.name}</h3>
          <div className="flex items-center gap-1 text-blue-600">
            <span className="font-bold">{nft.price}</span>
            <span className="text-xs uppercase font-black tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">ETH</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 font-medium">{nft.collection}</p>
          <p className="text-xs text-gray-400">Last sale: {nft.lastSale ?? '--'} ETH</p>
        </div>
      </div>
    </motion.div>
  </Link>
);

const Explore = () => {
  return (
    <div className="pt-32 max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-8">Explore NFTs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_NFTS.map(nft => <NFTCard key={nft.id} nft={nft} />)}
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
      <div className="h-[300px] w-full relative">
        <img src={collection.banner} alt={collection.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10 mb-20">
        <div className="flex flex-col md:flex-row gap-8 items-end">
          <img src={collection.logo} alt={collection.name} className="w-40 h-40 rounded-3xl border-4 border-white shadow-2xl" referrerPolicy="no-referrer" />
          <div className="flex-1 pb-4">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">{collection.name}</h1>
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-gray-400">Items</span>
                <span className="text-xl font-bold">{collection.items.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-gray-400">Owners</span>
                <span className="text-xl font-bold">{collection.owners.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-gray-400">Floor Price</span>
                <span className="text-xl font-bold">{collection.floorPrice} ETH</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-gray-400">Vol. Traded</span>
                <span className="text-xl font-bold">{collection.volume.toLocaleString()} ETH</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-gray-600 max-w-3xl leading-relaxed text-lg font-medium">
          {collection.description}
        </p>
      </div>

      {/* Collection Items */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="border-b border-gray-100 mb-10 pb-4 flex gap-8">
          <button className="text-lg font-bold border-b-2 border-blue-600 pb-4">Items</button>
          <button className="text-lg font-bold text-gray-400 hover:text-gray-600 transition-colors pb-4">Activity</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
        </div>
      </div>
    </div>
  );
};

const NFTPage = () => {
  const { id } = useParams();
  const nft = MOCK_NFTS.find(n => n.id === id);

  if (!nft) return <div className="pt-32 text-center h-screen">NFT not found</div>;

  return (
    <div className="pt-32 max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image */}
        <div className="sticky top-32 h-fit">
          <motion.div 
            layoutId={`nft-${nft.id}`}
            className="rounded-[40px] overflow-hidden border border-gray-100 shadow-2xl"
          >
            <img src={nft.image} alt={nft.name} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          
          <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Compass size={20} className="text-blue-600" /> Description
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              This unique digital asset is part of the {nft.collection} collection. 
              Ownership of this NFT grants access to exclusive community features and future drops.
            </p>
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-8">
          <div>
            <Link to={`/collection/${nft.collectionId}`} className="text-blue-600 font-bold hover:underline mb-2 block">
              {nft.collection}
            </Link>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">{nft.name}</h1>
            <p className="text-gray-500">Owned by <span className="text-blue-600 font-medium">{nft.owner}</span></p>
          </div>

          <div className="bg-gray-50 rounded-[32px] border border-gray-100 p-8">
            <div className="mb-6">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-2">Current Price</span>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-gray-900">{nft.price}</span>
                <span className="text-2xl font-black text-gray-400 mb-1">ETH</span>
                <span className="text-gray-400 mb-1 ml-2 font-medium">(${(nft.price * 3200).toLocaleString()})</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-5 font-black text-xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3">
                <ShoppingBag /> Buy Now
              </button>
              <button className="flex-1 bg-white border border-gray-200 hover:border-blue-600 rounded-2xl py-5 font-black text-xl transition-all flex items-center justify-center gap-3">
                <PlusSquare /> Make Offer
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" /> Price History
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">All Time</span>
            </div>
            <div className="p-12 text-center text-gray-400 italic">
              Chart data would go here...
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">Rarity Rank</span>
              <span className="text-xl font-bold text-blue-900">#{Math.floor(Math.random() * 1000)}</span>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block mb-1">Category</span>
              <span className="text-xl font-bold text-purple-900">Collectibles</span>
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
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-20 relative overflow-hidden rounded-[40px] bg-gray-900 py-24 md:py-32">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/hero/1920/1080?blur=4" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
              Exclusive Base Drops
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] mb-8 tracking-tighter">
              Discover, collect, and sell extraordinary <span className="text-blue-500">NFTs</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              BaseSea is the world's first and largest NFT marketplace on the Base network.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/25 transition-all">
                Explore Items
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
                Create NFT
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Notable Drops</h2>
            <p className="text-gray-500 font-medium">Curated collections just for you on Base</p>
          </div>
          <button className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View All <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_COLLECTIONS.map((col, idx) => (
            <Link key={col.id} to={`/collection/${col.id}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-80 rounded-[32px] overflow-hidden shadow-lg"
              >
                <img src={col.banner} alt={col.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-4">
                    <img src={col.logo} alt={col.name} className="w-16 h-16 rounded-2xl border-2 border-white/40 shadow-xl" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1">{col.name}</h3>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-300">Floor</span>
                          <span className="text-sm font-bold text-white">{col.floorPrice} ETH</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-300">Volume</span>
                          <span className="text-sm font-bold text-white">{col.volume} ETH</span>
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

      {/* Trending Items */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Trending Right Now</h2>
            <p className="text-gray-500 font-medium">Items that are getting the most attention in the last 24h</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            {['All', 'Art', 'Gaming', 'PFPs'].map(tab => (
              <button key={tab} className={cn(
                "px-6 py-2.5 rounded-xl font-bold transition-all",
                tab === 'All' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_NFTS.map((nft, idx) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      </section>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main>{children}</main>
      <footer className="bg-gray-50 border-t border-gray-100 py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <ShoppingBag size={18} />
              </div>
              <span className="text-xl font-bold tracking-tighter text-gray-900">BaseSea</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              The world's first and largest digital marketplace for crypto collectibles and non-fungible tokens on the Base network. Buy, sell, and discover exclusive digital items.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Marketplace</h4>
            <ul className="flex flex-col gap-4 text-gray-500 text-sm font-medium">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">All NFTs</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Art</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Gaming</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Memberships</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">PFPs</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Stats</h4>
            <ul className="flex flex-col gap-4 text-gray-500 text-sm font-medium">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Rankings</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Activity</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Stay in the loop</h4>
            <p className="text-gray-500 text-sm mb-4">Join our mailing list to stay in the loop with our newest feature releases, NFT drops, and tips and tricks for navigating BaseSea.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email" className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-blue-600 transition-colors" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm">Sign Up</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
            <span>© 2026 BaseSea, Inc</span>
            <div className="flex gap-8">
              <span className="hover:text-blue-600 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-blue-600 cursor-pointer">Terms of Service</span>
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
              <Route path="/stats" element={<div className="pt-32 text-center h-screen text-4xl font-black">Stats are booming</div>} />
              <Route path="/create" element={<div className="pt-32 text-center h-screen">Mint your masterpiece</div>} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
