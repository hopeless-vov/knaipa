import { resolveSwipeOutcome, SWIPE_THRESHOLD, SWIPE_VELOCITY } from '../utils/swipe';

describe('resolveSwipeOutcome', () => {
  it('likes when dragged right past the threshold', () => {
    expect(resolveSwipeOutcome(SWIPE_THRESHOLD + 1, 0)).toBe('like');
  });

  it('passes when dragged left past the threshold', () => {
    expect(resolveSwipeOutcome(-SWIPE_THRESHOLD - 1, 0)).toBe('pass');
  });

  it('likes on a fast right fling regardless of distance', () => {
    expect(resolveSwipeOutcome(5, SWIPE_VELOCITY + 1)).toBe('like');
  });

  it('passes on a fast left fling regardless of distance', () => {
    expect(resolveSwipeOutcome(-5, -SWIPE_VELOCITY - 1)).toBe('pass');
  });

  it('returns none within the threshold and below fling velocity', () => {
    expect(resolveSwipeOutcome(SWIPE_THRESHOLD, 100)).toBe('none');
    expect(resolveSwipeOutcome(0, 0)).toBe('none');
  });
});
