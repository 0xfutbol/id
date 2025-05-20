import { NFTItem } from "@/app/me/types";
import { accountService } from "@/modules/account/account-service";
import { assetService } from "@/modules/asset/asset-service";
import { RootState } from '@/store';
import { ChainName } from '@0xfutbol/constants';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TokenItem {
  symbol: string;
  balance: string;
  address: string;
  chain: ChainName;
}

export interface NFTData {
  id: string;
  metadata: {
    image?: string;
    name?: string;
  };
}

// Define the state structure for this slice
interface ProfileState {
  assets: Record<string, NFTItem[]>;
  assetsError: string | null;
  assetsLoading: boolean;
  discordAccount: string | null;
  msuBalance: string;
  pip: string | null;
  packs: NFTItem[];
  packsError: string | null;
  packsLoading: boolean;
  referralCount: number;
  selectedTab: string;
  tokens: TokenItem[];
  tokensError: string | null;
  tokensLoading: boolean;
  tokenVestingBalance: string;
  ultras: Record<string, any>;
  ultrasError: string | null;
  ultrasLoading: boolean;
  ultrasNFTs: NFTData[];
}

// Initial state
const initialState: ProfileState = {
  assetsError: null,
  assetsLoading: false,
  assets: {
    lands: [],
    players: [],
    scouts: [],
  },
  discordAccount: null,
  msuBalance: '0',
  pip: null,
  referralCount: 0,
  selectedTab: "achievements",
  tokenVestingBalance: '0',
  tokensError: null,
  tokensLoading: false,
  tokens: [],
  ultrasError: null,
  ultrasLoading: false,
  ultrasNFTs: [],
  ultras: {},
  packsError: null,
  packsLoading: false,
  packs: [],
};

// Fetch account info thunk
export const fetchAccountInfo = createAsyncThunk(
  'profile/fetchAccountInfo',
  async (_, { rejectWithValue }) => {
    try {
      const info = await accountService.getInfo();
      return {
        discordAccount: info.discord?.info?.username ?? null,
        pip: info.pip ?? null,
        referralCount: info.referralCount ?? 0
      };
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to fetch account info');
    }
  }
);

// Fetch assets thunk
export const fetchAssets = createAsyncThunk(
  'profile/fetchAssets',
  async (address: string | undefined, { rejectWithValue }) => {
    if (!address) return rejectWithValue('No address provided');
    
    try {
      // Use the asset service to fetch all assets
      const assets = await assetService.getAllAssets(address);
      
      // Convert service NFTItems to store AssetItems
      const result: Record<string, NFTItem[]> = {};
      
      Object.entries(assets).forEach(([key, items]) => {
        result[key] = items;
      });
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to fetch assets');
    }
  }
);

// Fetch token balances thunk
export const fetchTokenBalances = createAsyncThunk(
  'profile/fetchTokenBalances',
  async (address: string | undefined, { rejectWithValue }) => {
    if (!address) return rejectWithValue('No address provided');
    
    try {
      return await assetService.getTokenBalances(address);
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to fetch token balances');
    }
  }
);

// Fetch Ultras NFTs thunk
export const fetchUltrasNFTs = createAsyncThunk(
  'profile/fetchUltrasNFTs',
  async (address: string | undefined, { rejectWithValue }) => {
    if (!address) return rejectWithValue('No address provided');
    
    try {
      // Use the asset service to fetch ultras NFTs
      const nfts = await assetService.getUltrasNFTs(address);
      
      // Transform service NFT data to match Redux store format
      const transformedNFTs: NFTData[] = nfts.map((nft) => ({
        id: nft.tokenId,
        metadata: {
          name: nft.name,
          image: nft.image,
        }
      }));

      return {
        ultrasNFTs: transformedNFTs,
        ultras: nfts
      };
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to fetch Ultras NFTs');
    }
  }
);

// Fetch packs thunk
export const fetchPacks = createAsyncThunk(
  'profile/fetchPacks',
  async (address: string | undefined, { rejectWithValue }) => {
    if (!address) return rejectWithValue('No address provided');

    try {
      return {
        packs: await assetService.getPacks(address)
      };
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to fetch packs');
    }
  }
);

// Create the slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setSelectedTab: (state, action: PayloadAction<string>) => {
      state.selectedTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Account info
    builder
      .addCase(fetchAccountInfo.pending, (state) => {
        // No loading state for account info currently
      })
      .addCase(fetchAccountInfo.fulfilled, (state, action) => {
        state.discordAccount = action.payload.discordAccount;
        state.pip = action.payload.pip;
        state.referralCount = action.payload.referralCount;
      })
      .addCase(fetchAccountInfo.rejected, (state, action) => {
        console.error('Failed to fetch account info:', action.payload);
      });
    
    // Assets
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.assetsLoading = true;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.assets = action.payload;
        state.assetsError = null;
        state.assetsLoading = false;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.assetsError = action.payload as string;
        state.assetsLoading = false;
      });
    
    // Token balances
    builder
      .addCase(fetchTokenBalances.pending, (state) => {
        state.tokensLoading = true;
      })
      .addCase(fetchTokenBalances.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        state.msuBalance = action.payload.msuBalance;
        state.tokenVestingBalance = action.payload.tokenVestingBalance;
        state.tokensError = null;
        state.tokensLoading = false;
      })
      .addCase(fetchTokenBalances.rejected, (state, action) => {
        state.tokensError = action.payload as string;
        state.tokensLoading = false;
      });
    
    // Ultras NFTs
    builder
      .addCase(fetchUltrasNFTs.pending, (state) => {
        state.ultrasLoading = true;
      })
      .addCase(fetchUltrasNFTs.fulfilled, (state, action) => {
        state.ultrasNFTs = action.payload.ultrasNFTs;
        state.ultras = action.payload.ultras;
        state.ultrasError = null;
        state.ultrasLoading = false;
      })
      .addCase(fetchUltrasNFTs.rejected, (state, action) => {
        state.ultrasError = action.payload as string;
        state.ultrasLoading = false;
      });

    // Packs
    builder
      .addCase(fetchPacks.pending, (state) => {
        state.packsLoading = true;
        state.packsError = null;
      })
      .addCase(fetchPacks.fulfilled, (state, action) => {
        state.packsLoading = false;
        state.packs = action.payload.packs;
      })
      .addCase(fetchPacks.rejected, (state, action) => {
        state.packsLoading = false;
        state.packsError = action.payload as string;
      });
  },
});

// Export actions
export const { setSelectedTab } = profileSlice.actions;

// Export selectors
export const selectSelectedTab = (state: RootState) => state.profile.selectedTab;
export const selectDiscordAccount = (state: RootState) => state.profile.discordAccount;
export const selectReferralCount = (state: RootState) => state.profile.referralCount;
export const selectAssets = (state: RootState) => state.profile.assets;
export const selectAssetsError = (state: RootState) => state.profile.assetsError;
export const selectAssetsLoading = (state: RootState) => state.profile.assetsLoading;
export const selectTokens = (state: RootState) => state.profile.tokens;
export const selectMsuBalance = (state: RootState) => state.profile.msuBalance;
export const selectPip = (state: RootState) => state.profile.pip;
export const selectTokenVestingBalance = (state: RootState) => state.profile.tokenVestingBalance;
export const selectTokensError = (state: RootState) => state.profile.tokensError;
export const selectTokensLoading = (state: RootState) => state.profile.tokensLoading;
export const selectUltras = (state: RootState) => state.profile.ultras;
export const selectUltrasNFTs = (state: RootState) => state.profile.ultrasNFTs;
export const selectUltrasError = (state: RootState) => state.profile.ultrasError;
export const selectUltrasLoading = (state: RootState) => state.profile.ultrasLoading;
export const selectPacks = (state: RootState) => state.profile.packs;
export const selectPacksError = (state: RootState) => state.profile.packsError;
export const selectPacksLoading = (state: RootState) => state.profile.packsLoading;

// Export reducer
export default profileSlice.reducer; 