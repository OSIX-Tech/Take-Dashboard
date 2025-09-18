# Frontend Changes for Period Rewards System

## Overview
The reward system has been updated so that rewards are now assigned to the **period** instead of individual winners. This means all winners of a period will receive the same reward configured for that period.

## Database Changes
- Added `reward_id` field to `leaderboard_periods` table
- Winners automatically inherit the reward from their period

---

## Admin Frontend Changes

### 1. Create Period Form

#### Endpoint
`POST /api/high_score/periods`

#### Request Body Changes
```javascript
// OLD
{
  "gameId": "uuid",
  "durationDays": 7,
  "autoRestart": true
}

// NEW - Add rewardId field
{
  "game_id": "uuid",
  "durationDays": 7,
  "autoRestart": true,
  "rewardId": "uuid-of-reward"  // Optional, can be null
}
```

#### UI Component Example
```jsx
// Add reward selector to your create period form
const CreatePeriodForm = () => {
  const [gameId, setGameId] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [autoRestart, setAutoRestart] = useState(true);
  const [rewardId, setRewardId] = useState(''); // NEW STATE

  // Fetch available rewards
  const { data: rewards } = useQuery('/api/reward/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPeriod({
      gameId,
      durationDays,
      autoRestart,
      rewardId: rewardId || null  // NEW FIELD
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing fields */}

      {/* NEW: Reward selector */}
      <div className="form-group">
        <label>Reward for Winners</label>
        <select
          value={rewardId}
          onChange={(e) => setRewardId(e.target.value)}
          className="form-control"
        >
          <option value="">No reward</option>
          {rewards?.map(reward => (
            <option key={reward.id} value={reward.id}>
              {reward.name} ({reward.required_seals} seals)
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Create Period</button>
    </form>
  );
};
```

---

### 2. Edit Period Form

#### Endpoint
`PUT /api/high_score/periods/:id`

#### Request Body Changes
```javascript
// Now you can update the reward
{
  "duration_days": 7,        // Optional
  "auto_restart": false,     // Optional
  "reward_id": "uuid"        // Optional - NEW FIELD
}
```

#### UI Component Example
```jsx
const EditPeriodForm = ({ periodId }) => {
  const [updates, setUpdates] = useState({});
  const [rewardId, setRewardId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updatePeriod(periodId, {
      ...updates,
      reward_id: rewardId || undefined  // Only send if changed
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other fields */}

      <div className="form-group">
        <label>Change Reward</label>
        <select
          value={rewardId}
          onChange={(e) => setRewardId(e.target.value)}
        >
          <option value="">Keep current</option>
          <option value="null">Remove reward</option>
          {rewards?.map(reward => (
            <option key={reward.id} value={reward.id}>
              {reward.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Update Period</button>
    </form>
  );
};
```

---

### 3. Periods List/Table

#### Response Structure Change
```javascript
// GET /api/high_score/periods
{
  "success": true,
  "data": [
    {
      "id": "period-uuid",
      "game_id": "game-uuid",
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-01-07T23:59:59Z",
      "duration_days": 7,
      "is_active": true,
      "auto_restart": true,
      "reward_id": "reward-uuid",
      "games": {
        "name": "Game Name"
      },
      // NEW: Nested reward object
      "rewards": {
        "id": "reward-uuid",
        "name": "Free Coffee",
        "description": "One free coffee",
        "image_url": "https://..."
      }
    }
  ]
}
```

#### UI Component Example
```jsx
const PeriodsTable = () => {
  const { data: periods } = useQuery('/api/high_score/periods');

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Game</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Reward</th> {/* NEW COLUMN */}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {periods?.data?.map(period => (
          <tr key={period.id}>
            <td>{period.games?.name}</td>
            <td>{formatDate(period.start_date)}</td>
            <td>{formatDate(period.end_date)}</td>
            <td>
              {period.is_active ? (
                <span className="badge badge-success">Active</span>
              ) : (
                <span className="badge badge-secondary">Closed</span>
              )}
            </td>
            {/* NEW: Display reward */}
            <td>
              {period.rewards ? (
                <div className="d-flex align-items-center">
                  {period.rewards.image_url && (
                    <img
                      src={period.rewards.image_url}
                      alt={period.rewards.name}
                      style={{ width: 30, height: 30, marginRight: 8 }}
                    />
                  )}
                  <span>{period.rewards.name}</span>
                </div>
              ) : (
                <span className="text-muted">No reward</span>
              )}
            </td>
            <td>
              <button onClick={() => editPeriod(period.id)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

### 4. Winners Management

#### No Changes Needed for Winners Display
The winners will automatically show the reward from their period. The existing endpoints work the same:

```javascript
// GET /api/high_score/winners
// Response already includes reward info from the period
{
  "data": [
    {
      "id": "winner-id",
      "position": 1,
      "final_score": 1000,
      "claimed": false,
      "rewards": {  // This now comes from the period
        "name": "Free Coffee",
        "description": "One free coffee"
      }
    }
  ]
}
```

---

## Mobile App Changes

### No Changes Required! ✅

The mobile app doesn't need any changes because:
1. Winners automatically receive the period's reward
2. The `/api/high_score/my-rewards` endpoint returns the same structure
3. Rewards are assigned automatically when a period closes

---

## Implementation Checklist

### Admin Frontend
- [ ] Add reward selector to Create Period form
- [ ] Add `rewardId` field to create period API call
- [ ] Add reward selector to Edit Period form
- [ ] Add `reward_id` field to update period API call
- [ ] Update periods table to show reward column
- [ ] Display reward image/name in periods list
- [ ] Test creating period with reward
- [ ] Test editing period reward
- [ ] Test periods with no reward (null)

### Mobile App
- [x] No changes needed - works automatically

---

## Benefits of This Change

1. **Simplified Management**: Set reward once per period instead of per winner
2. **Consistency**: All winners of a period get the same reward
3. **Automation**: No manual assignment needed after period closes
4. **Inheritance**: Auto-restarted periods inherit the reward from previous period
5. **Flexibility**: Can still have periods without rewards (null)

---

## Example Workflow

1. **Admin creates a new period**
   - Selects game
   - Sets duration (7 days)
   - **Selects reward: "Free Coffee"**
   - Enables auto-restart

2. **Period runs for 7 days**
   - Players compete
   - Scores are tracked

3. **Period closes automatically**
   - Top 3 winners are selected
   - **All 3 winners automatically receive "Free Coffee" reward**
   - No manual intervention needed

4. **New period starts** (if auto-restart enabled)
   - **Inherits "Free Coffee" as the reward**
   - Cycle continues

---

## Questions?

If you need help implementing these changes:
1. Check the backend code in `/src/controllers/high_scoreController.js`
2. Review the model changes in `/src/models/leaderboardPeriods.js`
3. Test endpoints with Postman/Insomnia first
4. Contact backend team for any API clarifications