// Mock Owode client until backend is ready
export const owodeClient = {
  createSavingsGoal: (name, target) => {
    console.log("[Owode] Created goal:", { name, target });
    return { id: Date.now(), name, target, balance: 0 };
  },
  transfer: (goalId, amount) => {
    console.log("[Owode] Transferred ₦", amount, "to goal", goalId);
    return true;
  },
  projectionOneYear: (weeklyAmount) => {
    return weeklyAmount * 52;
  },
};