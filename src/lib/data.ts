export interface NFT {
  id: string;
  name: string;
  collection: string;
  collectionId: string;
  image: string;
  price: number;
  lastSale?: number;
  owner: string;
  rarity?: string;
  isAuction?: boolean;
  auctionEnd?: string; // ISO string
  minBid?: number;
  currentBid?: number;
  highestBidder?: string;
  bidsCount?: number;
  isVerified?: boolean;
  isLazy?: boolean;
  mintVoucher?: {
    signature: string;
    creator: string;
    price: string; // in wei or ETH string
    nonce: string;
  };
}

export interface Collection {
  id: string;
  name: string;
  banner: string;
  logo: string;
  floorPrice: number;
  volume: number;
  items: number;
  owners: number;
  description: string;
  isVerified?: boolean;
}

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'base-apes',
    name: 'Base Apes Club',
    banner: 'https://picsum.photos/seed/apes/1200/400',
    logo: 'https://picsum.photos/seed/ape-logo/400/400',
    floorPrice: 0.25,
    volume: 1250,
    items: 10000,
    owners: 4500,
    description: 'The premier ape collection on the Base network. High utility, legendary community.',
    isVerified: true
  },
  {
    id: 'eth-realms',
    name: 'Ether Realms',
    banner: 'https://picsum.photos/seed/realms/1200/400',
    logo: 'https://picsum.photos/seed/realm-logo/400/400',
    floorPrice: 1.5,
    volume: 8900,
    items: 5000,
    owners: 2100,
    description: 'Procedural landscapes stored entirely on-chain. Explore the vastness of the digital realm.',
    isVerified: true
  },
  {
    id: 'cyber-runners',
    name: 'Cyber Runners',
    banner: 'https://picsum.photos/seed/cyber/1200/400',
    logo: 'https://picsum.photos/seed/cyber-logo/400/400',
    floorPrice: 0.12,
    volume: 450,
    items: 8888,
    owners: 3200,
    description: 'Neon-infused avatars for the next generation of the internet.'
  }
];

export interface Activity {
  id: string;
  type: 'sale' | 'transfer' | 'list' | 'bid';
  nftName: string;
  nftImage: string;
  price?: number;
  from: string;
  to?: string;
  timestamp: string;
}

export const MOCK_ACTIVITY: Activity[] = [
  {
    id: 'a1',
    type: 'sale',
    nftName: 'Base Ape #5521',
    nftImage: 'https://picsum.photos/seed/ape1/200/200',
    price: 0.22,
    from: '0x123...456',
    to: '0xYou',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'a2',
    type: 'list',
    nftName: 'Realm #104',
    nftImage: 'https://picsum.photos/seed/realm1/200/200',
    price: 1.75,
    from: '0xABC...DEF',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'a3',
    type: 'bid',
    nftName: 'Base Ape #12',
    nftImage: 'https://picsum.photos/seed/ape2/200/200',
    price: 0.75,
    from: '0xYou',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

export const MOCK_NFTS: NFT[] = [
  {
    id: '1',
    name: 'Base Ape #5521',
    collection: 'Base Apes Club',
    collectionId: 'base-apes',
    image: 'https://picsum.photos/seed/ape1/800/800',
    price: 0.28,
    lastSale: 0.22,
    owner: '0x123...456',
    rarity: 'Rare',
    isAuction: true,
    auctionEnd: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4h from now
    currentBid: 0.25,
    minBid: 0.2,
    bidsCount: 12,
    highestBidder: '0x789...abc',
    isVerified: true
  },
  {
    id: '2',
    name: 'Realm #104',
    collection: 'Ether Realms',
    collectionId: 'eth-realms',
    image: 'https://picsum.photos/seed/realm1/800/800',
    price: 1.75,
    lastSale: 1.5,
    owner: '0xABC...DEF',
    rarity: 'Epic',
    isAuction: true,
    auctionEnd: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h from now
    currentBid: 1.62,
    minBid: 1.1,
    bidsCount: 5,
    highestBidder: '0xdef...ghi',
    isVerified: true
  },
  {
    id: '3',
    name: 'Runner #99',
    collection: 'Cyber Runners',
    collectionId: 'cyber-runners',
    image: 'https://picsum.photos/seed/cyber1/800/800',
    price: 0.15,
    owner: '0x789...012'
  },
  {
    id: '4',
    name: 'Base Ape #12',
    collection: 'Base Apes Club',
    collectionId: 'base-apes',
    image: 'https://picsum.photos/seed/ape2/800/800',
    price: 0.85,
    lastSale: 0.5,
    owner: '0x456...789',
    rarity: 'Legendary',
    isAuction: true,
    auctionEnd: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30m from now
    currentBid: 0.82,
    minBid: 0.5,
    bidsCount: 28,
    highestBidder: '0x123...999'
  },
  {
    id: '5',
    name: 'Realm #502',
    collection: 'Ether Realms',
    collectionId: 'eth-realms',
    image: 'https://picsum.photos/seed/realm2/800/800',
    price: 2.1,
    owner: '0xdef...abc'
  },
  {
    id: '6',
    name: 'Runner #442',
    collection: 'Cyber Runners',
    collectionId: 'cyber-runners',
    image: 'https://picsum.photos/seed/cyber2/800/800',
    price: 0.18,
    lastSale: 0.12,
    owner: '0x321...654'
  }
];
