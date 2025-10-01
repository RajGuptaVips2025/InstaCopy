import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';  // defaults to localStorage for web
import userDetailReducer from '../features/userDetail/userDetailsSlice';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['socket'],  // Exclude socket from persistence
  // Custom serialize and deserialize
  serialize: (state) => {
    const clonedState = { ...state };
    delete clonedState.socket; // Exclude socket from serialization
    return JSON.stringify(clonedState);
  },
  deserialize: (state) => JSON.parse(state),
};

const persistedReducer = persistReducer(persistConfig, userDetailReducer);

const store = configureStore({
  reducer: {
    counter: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Combine everything in a single array for ignoredActions
        ignoredActions: [
          'socket/setSocket',
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
        // Combine all ignored paths in a single array
        ignoredPaths: ['counter.socket', 'socket'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;