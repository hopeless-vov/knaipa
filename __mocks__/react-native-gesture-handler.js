module.exports = {
  GestureDetector: 'GestureDetector',
  Gesture: {
    Pan: jest.fn(() => ({
      enabled: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
    })),
    Tap: jest.fn(() => ({
      onEnd: jest.fn().mockReturnThis(),
    })),
    Race: jest.fn(),
  },
  PanGestureHandler: 'PanGestureHandler',
  State: {},
};
