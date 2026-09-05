import express from 'express';
const router = express.Router();

// Mock DB - agar tere paas models hai toh waha se import karna
const userWatchlists = {};

// GET /api/users/:userId/watchlist
router.get('/:userId/watchlist', (req, res) => {
  const { userId } = req.params;
  const list = userWatchlists[userId] || [];
  res.json(list);
});

// POST /api/users/:userId/watchlist/:assetId
router.post('/:userId/watchlist/:assetId', (req, res) => {
  const { userId, assetId } = req.params;
  if (!userWatchlists[userId]) userWatchlists[userId] = [];

  if (userWatchlists[userId].includes(assetId)) {
    return res.status(409).json({ error: 'Already in watchlist' });
  }
  userWatchlists[userId].push(assetId);
  res.json({ success: true, watchlist: userWatchlists[userId] });
});

// DELETE /api/users/:userId/watchlist/:assetId
router.delete('/:userId/watchlist/:assetId', (req, res) => {
  const { userId, assetId } = req.params;
  if (!userWatchlists[userId]) return res.status(404).json({ error: 'User not found' });

  userWatchlists[userId] = userWatchlists[userId].filter(id => id!== assetId);
  res.json({ success: true, watchlist: userWatchlists[userId] });
});

export default router;