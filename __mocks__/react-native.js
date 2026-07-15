const RN = jest.genMockFromModule('react-native');

RN.StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  absoluteFillObject: {},
};

RN.Animated = {
  Value: jest.fn(() => ({
    interpolate: jest.fn(() => ({})),
    setValue: jest.fn(),
  })),
  timing: jest.fn(() => ({ start: jest.fn() })),
  spring: jest.fn(() => ({ start: jest.fn() })),
  View: 'Animated.View',
  Text: 'Animated.Text',
};

RN.Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
};

RN.Platform = { OS: 'ios', select: (obj) => obj.ios };

RN.Linking = { openURL: jest.fn(() => Promise.resolve()) };
RN.Share = { share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })) };

module.exports = RN;
