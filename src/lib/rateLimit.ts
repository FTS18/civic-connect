// Rate limiting utility to prevent spam
const rateLimitStore: { [key: string]: number[] } = {};

export const checkRateLimit = (
  userId: string,
  action: string,
  maxAttempts: number = 3,
  windowMs: number = 60000 // 1 minute
): boolean => {
  const key = `${userId}_${action}`;
  const now = Date.now();
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = [];
  }
  
  // Remove old attempts outside the window
  rateLimitStore[key] = rateLimitStore[key].filter(
    (timestamp) => now - timestamp < windowMs
  );
  
  // Check if limit exceeded
  if (rateLimitStore[key].length >= maxAttempts) {
    return false;
  }
  
  // Add current attempt
  rateLimitStore[key].push(now);
  return true;
};

export const getRemainingTime = (
  userId: string,
  action: string,
  windowMs: number = 60000
): number => {
  const key = `${userId}_${action}`;
  if (!rateLimitStore[key] || rateLimitStore[key].length === 0) {
    return 0;
  }
  
  const oldestAttempt = rateLimitStore[key][0];
  const elapsed = Date.now() - oldestAttempt;
  return Math.max(0, windowMs - elapsed);
};
