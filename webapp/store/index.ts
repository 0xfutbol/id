import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers from features
import { appReducer } from './features/app';
import { authReducer } from './features/auth';
import { profileReducer } from './features/profile';
import { userReducer } from './features/user';

// Root reducer combining all feature reducers
const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  profile: profileReducer,
  user: userReducer,
  // Add more reducers here as they are created
});

// Configuration for Redux Persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'auth', 'profile'], // Add reducers to whitelist for persistence
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persisted store
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 