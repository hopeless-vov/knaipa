export const SWIPE_THRESHOLD = 80; // px of horizontal travel to commit
export const SWIPE_VELOCITY = 800; // px/s fling to commit regardless of distance

export type SwipeOutcome = 'like' | 'pass' | 'none';

/**
 * Decides a swipe gesture's result from its final translation/velocity.
 * Pure so the boundary logic is testable without driving the gesture handler.
 */
export function resolveSwipeOutcome(translationX: number, velocityX: number): SwipeOutcome {
  if (translationX > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY) return 'like';
  if (translationX < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY) return 'pass';
  return 'none';
}
