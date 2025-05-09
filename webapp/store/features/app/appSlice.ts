import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define app related types
interface AppState {
  isMounted: boolean;
}

// Initial state
const initialState: AppState = {
  isMounted: false,
};

// Create the slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setMounted: (state, action: PayloadAction<boolean>) => {
      state.isMounted = action.payload;
    },
  },
});

// Export actions
export const { setMounted } = appSlice.actions;

// Export selectors
export const selectIsMounted = (state: RootState) => state.app.isMounted;

// Export reducer
export default appSlice.reducer; 