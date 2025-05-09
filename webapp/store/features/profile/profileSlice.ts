import { accountService } from "@/services/account-service";
import { assetService } from "@/services/asset-service";
import { NFTItem } from "@/services/blockchain";
import { RootState } from '@/store';
import { erc20Abi } from "@/utils/erc20Abi";
import { ChainName } from '@0xfutbol/constants';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define profile related types
export interface AssetItem {
  chain: ChainName;
  image: string;
  name: string;
  tokenId: string;
}

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
  assetsError: string | null;
  assetsLoading: boolean;
  assets: Record<string, AssetItem[]>;
  discordAccount: string | null;
  msuBalance: string;
  referralCount: number;
  selectedTab: string;
  tokenVestingBalance: string;
  tokensError: string | null;
  tokensLoading: boolean;
  tokens: TokenItem[];
  ultrasError: string | null;
  ultrasLoading: boolean;
  ultrasNFTs: NFTData[];
  ultras: Record<string, any>;
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
};

// Helper to convert NFTItem from service to AssetItem for the store
function convertNFTItemToAssetItem(nft: NFTItem): AssetItem {
  return {
    chain: nft.chain,
    name: nft.name,
    image: nft.image,
    tokenId: nft.tokenId,
  };
}

// Fetch account info thunk
export const fetchAccountInfo = createAsyncThunk(
  'profile/fetchAccountInfo',
  async (_, { rejectWithValue }) => {
    try {
      const info = await accountService.getInfo();
      return {
        discordAccount: info.discord?.info?.username ?? null,
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
      const result: Record<string, AssetItem[]> = {};
      
      Object.entries(assets).forEach(([key, items]) => {
        result[key] = items.map(convertNFTItemToAssetItem);
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
  async ({ address, newContract }: { address: string | undefined, newContract: any }, { rejectWithValue }) => {
    if (!address || !newContract) return rejectWithValue('No address or contract provided');
    
    try {
      const msuContract = newContract("polygon", "0xe8377A076adAbb3F9838afB77Bee96Eac101ffB1", erc20Abi);
      const msaContract = newContract("polygon", "0x02aea6F7742Fb098b4EEF3B4C4C1FeB1d3426f1B", erc20Abi);
      const futbolContract = newContract("base", "0x3D45987F1C8812913a80Efbe3aCdd91DA8676E9c", erc20Abi);
      const futbolXdcContract = newContract("xdc", "0x1a0D723F5B077d02C12A0348d410C1704FBBE211", erc20Abi);
      // vestingContract is undefined

      // Fetch balances with error handling for each contract call
      const getMsuBalance = async () => {
        try {
          return await msuContract.balanceOf(address);
        } catch (error) {
          console.error("Failed to fetch MSU balance:", error);
          return "0";
        }
      };

      const getMsaBalance = async () => {
        try {
          return await msaContract.balanceOf(address);
        } catch (error) {
          console.error("Failed to fetch MSA balance:", error);
          return "0";
        }
      };

      const getFutbolBalance = async () => {
        try {
          return await futbolContract.balanceOf(address);
        } catch (error) {
          console.error("Failed to fetch FUTBOL (Base) balance:", error);
          return "0";
        }
      };

      const getFutbolXdcBalance = async () => {
        try {
          return await futbolXdcContract.balanceOf(address);
        } catch (error) {
          console.error("Failed to fetch FUTBOL (XDC) balance:", error);
          return "0";
        }
      };

      const [msuBal, msaBal, futbolBal, futbolXdcBal] = await Promise.all([
        getMsuBalance(),
        getMsaBalance(),
        getFutbolBalance(),
        getFutbolXdcBalance()
      ]);
      
      const vestingBal = "0";

      const formatBalance = (balance: string) => {
        // Convert from wei to ether (divide by 10^18)
        const etherValue = Number(balance || "0") / 1e18;
        return etherValue.toFixed(etherValue % 1 === 0 ? 0 : 2);
      };

      return {
        tokens: [
          { address: "0xe8377A076adAbb3F9838afB77Bee96Eac101ffB1", symbol: "MSU", balance: formatBalance(msuBal.toString()), chain: "polygon" as ChainName },
          { address: "0x02aea6F7742Fb098b4EEF3B4C4C1FeB1d3426f1B", symbol: "MSA", balance: formatBalance(msaBal.toString()), chain: "polygon" as ChainName },
          { address: "0x3D45987F1C8812913a80Efbe3aCdd91DA8676E9c", symbol: "FUTBOL (Base)", balance: formatBalance(futbolBal.toString()), chain: "base" as ChainName },
          { address: "0x2C8b1699170135E486C4dB52F46f439B4967b4c9", symbol: "FUTBOL (XDC)", balance: formatBalance(futbolXdcBal.toString()), chain: "xdc" as ChainName },
        ],
        msuBalance: (Number(msuBal.toString()) / 1e18).toString(),
        tokenVestingBalance: (Number(vestingBal.toString()) / 1e18).toString()
      };
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

      // Process NFTs into asset items
      const ultrasTokens: AssetItem[] = nfts.map(convertNFTItemToAssetItem);

      return {
        ultrasNFTs: transformedNFTs,
        ultras: ultrasTokens
      };
    } catch (error: any) {
      return rejectWithValue(error.message ?? 'Failed to fetch Ultras NFTs');
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
export const selectTokenVestingBalance = (state: RootState) => state.profile.tokenVestingBalance;
export const selectTokensError = (state: RootState) => state.profile.tokensError;
export const selectTokensLoading = (state: RootState) => state.profile.tokensLoading;
export const selectUltras = (state: RootState) => state.profile.ultras;
export const selectUltrasNFTs = (state: RootState) => state.profile.ultrasNFTs;
export const selectUltrasError = (state: RootState) => state.profile.ultrasError;
export const selectUltrasLoading = (state: RootState) => state.profile.ultrasLoading;

// Export reducer
export default profileSlice.reducer; 