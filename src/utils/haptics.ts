/* istanbul ignore file -- thin native wrapper, no logic to unit-test */
import * as Haptics from 'expo-haptics';

/** Fired when a place is liked — a slightly firmer tap than a pass. */
export function hapticLike(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Fired when a place is passed — a light tap. */
export function hapticPass(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
