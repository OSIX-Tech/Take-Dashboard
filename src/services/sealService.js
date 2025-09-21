import { rewardsService } from './rewardsService';

/**
 * Service for managing seal-based rewards logic
 * Handles progressive reward unlocking based on lifetime seals
 */
export const sealService = {
  /**
   * Get all rewards that a user can currently redeem based on their lifetime seals
   * @param {number} lifetimeSeals - Total historical seals accumulated by user
   * @returns {Promise<Array>} Array of available rewards sorted by required seals
   */
  async getAvailableRewards(lifetimeSeals) {
    try {

      // Get all rewards from the rewards service
      const allRewards = await rewardsService.getRewards();

      // Filter rewards based on lifetime seals
      const availableRewards = allRewards
        .filter(reward => {
          const requiredSeals = Number(reward.required_seals);
          return requiredSeals > 0 && requiredSeals <= lifetimeSeals;
        })
        .sort((a, b) => Number(a.required_seals) - Number(b.required_seals));

      return availableRewards;
    } catch (error) {
      
      return [];
    }
  },

  /**
   * Get rewards that were newly unlocked after a seal transaction
   * @param {number} previousLifetimeSeals - Lifetime seals before transaction
   * @param {number} newLifetimeSeals - Lifetime seals after transaction
   * @returns {Promise<Array>} Array of newly unlocked rewards
   */
  async getNewlyUnlockedRewards(previousLifetimeSeals, newLifetimeSeals) {
    try {

      if (previousLifetimeSeals >= newLifetimeSeals) {
        
        return [];
      }
      
      // Get all rewards
      const allRewards = await rewardsService.getRewards();
      
      // Find rewards that were unlocked between previous and new seal counts
      const newlyUnlocked = allRewards.filter(reward => {
        const requiredSeals = Number(reward.required_seals);
        return requiredSeals > previousLifetimeSeals && requiredSeals <= newLifetimeSeals;
      }).sort((a, b) => Number(a.required_seals) - Number(b.required_seals));

      if (newlyUnlocked.length > 0) {
        // Newly unlocked rewards found
      }
      
      return newlyUnlocked;
    } catch (error) {
      
      return [];
    }
  },

  /**
   * Get the next reward milestone for a user
   * @param {number} lifetimeSeals - Current lifetime seals
   * @returns {Promise<Object|null>} Next reward to unlock or null if all unlocked
   */
  async getNextRewardMilestone(lifetimeSeals) {
    try {
      const allRewards = await rewardsService.getRewards();
      
      // Find the next reward that hasn't been unlocked yet
      const nextReward = allRewards
        .filter(reward => Number(reward.required_seals) > lifetimeSeals)
        .sort((a, b) => Number(a.required_seals) - Number(b.required_seals))[0];
      
      if (nextReward) {
        const sealsNeeded = Number(nextReward.required_seals) - lifetimeSeals;
        
        return {
          ...nextReward,
          seals_needed: sealsNeeded
        };
      }

      return null;
    } catch (error) {
      
      return null;
    }
  },

  /**
   * Calculate reward progress percentage
   * @param {number} lifetimeSeals - Current lifetime seals
   * @param {number} targetSeals - Target seals for next reward
   * @returns {number} Progress percentage (0-100)
   */
  calculateRewardProgress(lifetimeSeals, targetSeals) {
    if (targetSeals <= 0) return 100;
    if (lifetimeSeals >= targetSeals) return 100;
    return Math.round((lifetimeSeals / targetSeals) * 100);
  },

  /**
   * Format reward unlock message
   * @param {Array} newlyUnlockedRewards - Array of newly unlocked rewards
   * @returns {string} Formatted message for display
   */
  formatUnlockMessage(newlyUnlockedRewards) {
    if (!newlyUnlockedRewards || newlyUnlockedRewards.length === 0) {
      return null;
    }

    if (newlyUnlockedRewards.length === 1) {
      const reward = newlyUnlockedRewards[0];
      return `🎉 ¡Nueva recompensa desbloqueada! ${reward.name}`;
    }

    return `🎉 ¡${newlyUnlockedRewards.length} nuevas recompensas desbloqueadas!`;
  },

  /**
   * Group rewards by unlock status
   * @param {Array} allRewards - All available rewards
   * @param {number} lifetimeSeals - User's lifetime seals
   * @returns {Object} Rewards grouped by locked/unlocked status
   */
  groupRewardsByStatus(allRewards, lifetimeSeals) {
    const unlocked = [];
    const locked = [];
    
    allRewards.forEach(reward => {
      const requiredSeals = Number(reward.required_seals);
      if (requiredSeals <= lifetimeSeals) {
        unlocked.push(reward);
      } else {
        locked.push({
          ...reward,
          seals_needed: requiredSeals - lifetimeSeals
        });
      }
    });
    
    return {
      unlocked: unlocked.sort((a, b) => Number(b.required_seals) - Number(a.required_seals)),
      locked: locked.sort((a, b) => Number(a.required_seals) - Number(b.required_seals))
    };
  }
};

export default sealService;