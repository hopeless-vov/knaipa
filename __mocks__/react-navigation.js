module.exports = {
  useNavigation: jest.fn(() => ({ navigate: jest.fn(), goBack: jest.fn() })),
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: 'Stack.Navigator',
    Screen: 'Stack.Screen',
  })),
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: 'Tab.Navigator',
    Screen: 'Tab.Screen',
  })),
  NavigationContainer: ({ children }) => children,
};
