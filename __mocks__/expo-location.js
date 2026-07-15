module.exports = {
  requestForegroundPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => ({
    coords: { latitude: 51.505, longitude: -0.09 },
  })),
};
