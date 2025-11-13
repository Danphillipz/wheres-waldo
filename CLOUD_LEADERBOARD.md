# Cloud Leaderboard Setup Guide

The game includes support for cloud-based leaderboard persistence, allowing scores to be shared across different devices and users. By default, the leaderboard uses localStorage (device-only), but you can enable cloud persistence with a backend API.

## Quick Start

### Option 1: Firebase Realtime Database (Recommended)

Firebase offers a free tier that's perfect for this use case.

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database

2. **Install Firebase SDK:**
   ```bash
   npm install firebase
   ```

3. **Create a Firebase config file** (`apps/waldo-app/src/firebase-config.ts`):
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getDatabase } from 'firebase/database';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const database = getDatabase(app);
   ```

4. **Create Firebase leaderboard service** (`apps/waldo-app/src/app/utils/firebaseLeaderboard.ts`):
   ```typescript
   import { ref, set, get, onValue } from 'firebase/database';
   import { database } from '../../firebase-config';
   import { LeaderboardEntry } from './leaderboard';

   const LEADERBOARD_REF = 'leaderboard';

   export async function getFirebaseLeaderboard(): Promise<LeaderboardEntry[]> {
     const leaderboardRef = ref(database, LEADERBOARD_REF);
     const snapshot = await get(leaderboardRef);
     if (snapshot.exists()) {
       return snapshot.val() || [];
     }
     return [];
   }

   export async function updateFirebaseLeaderboard(
     entries: LeaderboardEntry[]
   ): Promise<void> {
     const leaderboardRef = ref(database, LEADERBOARD_REF);
     await set(leaderboardRef, entries);
   }

   export function subscribeToLeaderboard(
     callback: (entries: LeaderboardEntry[]) => void
   ): () => void {
     const leaderboardRef = ref(database, LEADERBOARD_REF);
     const unsubscribe = onValue(leaderboardRef, (snapshot) => {
       callback(snapshot.val() || []);
     });
     return unsubscribe;
   }
   ```

5. **Update GameBoard.tsx** to use Firebase:
   ```typescript
   import { getFirebaseLeaderboard, updateFirebaseLeaderboard } from '../../utils/firebaseLeaderboard';
   
   // In GameBoard component, replace:
   // const [leaderboardEntries, setLeaderboardEntries] = useState(getLeaderboard());
   
   // With:
   const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
   
   useEffect(() => {
     // Load initial data
     getFirebaseLeaderboard().then(setLeaderboardEntries);
   }, []);
   
   // When updating score:
   useEffect(() => {
     if (state.isComplete && playerName && !scoreAdded) {
       const updatedEntries = updateLeaderboardScore(
         leaderboardEntries, 
         playerName, 
         state.attempts, 
         state.foundImages.size
       );
       setLeaderboardEntries(updatedEntries);
       updateFirebaseLeaderboard(updatedEntries);
       setScoreAdded(true);
     }
   }, [state.isComplete, playerName, state.attempts, state.foundImages.size, scoreAdded]);
   ```

### Option 2: Supabase (Alternative)

Supabase provides a PostgreSQL database with real-time subscriptions.

1. **Create a Supabase project:**
   - Go to [Supabase](https://supabase.com/)
   - Create a new project

2. **Create a leaderboard table:**
   ```sql
   CREATE TABLE leaderboard (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     score INTEGER NOT NULL,
     found_images INTEGER NOT NULL,
     timestamp BIGINT NOT NULL,
     UNIQUE(name)
   );

   -- Create index for better query performance
   CREATE INDEX idx_leaderboard_score ON leaderboard(found_images DESC, score ASC);
   ```

3. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Create Supabase client** (`apps/waldo-app/src/supabase-client.ts`):
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

   export const supabase = createClient(supabaseUrl, supabaseKey);
   ```

5. **Create Supabase leaderboard service:**
   ```typescript
   import { supabase } from '../../supabase-client';
   import { LeaderboardEntry } from './leaderboard';

   export async function getSupabaseLeaderboard(): Promise<LeaderboardEntry[]> {
     const { data, error } = await supabase
       .from('leaderboard')
       .select('*')
       .order('found_images', { ascending: false })
       .order('score', { ascending: true })
       .limit(10);

     if (error) {
       console.error('Error fetching leaderboard:', error);
       return [];
     }

     return data.map(row => ({
       name: row.name,
       score: row.score,
       foundImages: row.found_images,
       timestamp: row.timestamp,
     }));
   }

   export async function updateSupabaseLeaderboard(
     playerName: string,
     score: number,
     foundImages: number
   ): Promise<void> {
     const { error } = await supabase
       .from('leaderboard')
       .upsert({
         name: playerName,
         score: score,
         found_images: foundImages,
         timestamp: Date.now(),
       });

     if (error) {
       console.error('Error updating leaderboard:', error);
     }
   }
   ```

### Option 3: Simple Express API

For full control, create your own backend.

1. **Create a simple Express server:**

   ```bash
   # In a new directory
   mkdir waldo-api
   cd waldo-api
   npm init -y
   npm install express cors
   ```

2. **Create server.js:**
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const app = express();

   app.use(cors());
   app.use(express.json());

   let leaderboard = [];

   app.get('/api/leaderboard', (req, res) => {
     res.json(leaderboard);
   });

   app.put('/api/leaderboard', (req, res) => {
     leaderboard = req.body;
     res.json({ success: true });
   });

   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

3. **Deploy to:**
   - [Heroku](https://www.heroku.com/)
   - [Railway](https://railway.app/)
   - [Render](https://render.com/)
   - [Fly.io](https://fly.io/)

4. **Use the cloudLeaderboard utility:**
   ```typescript
   import { enableCloudLeaderboard, getCloudLeaderboard, updateCloudLeaderboardScore } from './utils/cloudLeaderboard';

   // In App.tsx or main.tsx
   enableCloudLeaderboard('https://your-api.herokuapp.com/api/leaderboard');

   // In GameBoard.tsx
   const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);

   useEffect(() => {
     getCloudLeaderboard().then(setLeaderboardEntries);
   }, []);

   useEffect(() => {
     if (state.isComplete && playerName && !scoreAdded) {
       updateCloudLeaderboardScore(
         playerName,
         state.attempts,
         state.foundImages.size
       ).then(() => {
         getCloudLeaderboard().then(setLeaderboardEntries);
       });
       setScoreAdded(true);
     }
   }, [state.isComplete, playerName, state.attempts, state.foundImages.size, scoreAdded]);
   ```

## Security Considerations

1. **Rate Limiting:** Implement rate limiting on your API to prevent abuse
2. **Validation:** Validate all incoming data on the server
3. **Authentication:** Consider adding authentication for score submissions
4. **CORS:** Configure CORS properly to only allow requests from your domain

## Testing

To test cloud leaderboard locally:

1. Start your backend server
2. Enable cloud leaderboard in the app
3. Play the game and submit scores
4. Open the app in a different browser/device and verify scores appear

## Troubleshooting

- **CORS errors:** Ensure your backend allows requests from your frontend domain
- **Scores not syncing:** Check browser console for error messages
- **Duplicate entries:** Implement proper upsert logic on the backend
- **Slow loading:** Add caching and optimize database queries

## Cost Estimates

- **Firebase Realtime Database:** Free tier (1 GB stored, 10 GB/month downloaded)
- **Supabase:** Free tier (500 MB database, 2 GB bandwidth)
- **Express API on Heroku:** Free tier available (with limitations)

For a wedding game with limited users, the free tiers should be more than sufficient.
