import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const USER_ID = 'user_123';

interface WatchlistState {
  watchlist: string[];
  isFavFilter: boolean;
  setFavFilter: (v: boolean) => void;
  fetchWatchlist: () => Promise<void>;
  toggleWatchlist: (assetId: string) => Promise<void>;
  isFavorite: (assetId: string) => boolean;
  // purane code ke liye alias
  toggle: (assetId: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      isFavFilter: false,
      setFavFilter: (v) => set({ isFavFilter: v }),

      fetchWatchlist: async () => {
        try {
          const res = await fetch(`/api/users/${USER_ID}/watchlist`);
          if (res.ok) {
            const data = await res.json();
            const ids = Array.isArray(data) ? data.map((a: any) => typeof a === 'string' ? a : a.id) : [];
            if (ids.length > 0) set({ watchlist: ids });
          }
        } catch {
          console.log('watchlist fetch failed, using localStorage');
        }
      },

      toggleWatchlist: async (assetId) => {
        const { watchlist } = get();
        const isFav = watchlist.includes(assetId);
        
        // pehle UI update (optimistic)
        set({ watchlist: isFav ? watchlist.filter(id => id !== assetId) : [...watchlist, assetId] });

        try {
          if (isFav) {
            await fetch(`/api/users/${USER_ID}/watchlist/${assetId}`, { method: 'DELETE' });
          } else {
            const res = await fetch(`/api/users/${USER_ID}/watchlist/${assetId}`, { method: 'POST' });
            if (res.status === 409) return;
          }
        } catch {
          // backend nahi hai to localStorage me hi rahega
        }
      },

      isFavorite: (assetId) => get().watchlist.includes(assetId),
      
      // alias taki purana code na tute
      toggle: async (assetId: string) => {
        return get().toggleWatchlist(assetId);
      },
    }),
    {
      name: 'watchlist-store',
    }
  )
);