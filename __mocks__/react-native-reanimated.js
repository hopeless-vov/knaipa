const Reanimated = {
  useSharedValue: jest.fn((val) => ({ value: val })),
  useAnimatedStyle: jest.fn((fn) => ({})),
  withSpring: jest.fn((val) => val),
  withTiming: jest.fn((val) => val),
  runOnJS: jest.fn((fn) => fn),
  interpolate: jest.fn((val, inputRange, outputRange) => outputRange[0]),
  Extrapolate: { CLAMP: 'CLAMP' },
  default: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
  },
};

module.exports = Reanimated;
