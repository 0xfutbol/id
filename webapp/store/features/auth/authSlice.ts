import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define auth related types
interface AuthState {
  username: string;
}

// Initial state
const initialState: AuthState = {
  username: '',
};

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    clearAuthState: (state) => {
      state.username = '';
    },
  },
});

// Export actions
export const { setUsername, clearAuthState } = authSlice.actions;

// Export selectors
export const selectUsername = (state: RootState) => state.auth.username;

// Export reducer
export default authSlice.reducer; 