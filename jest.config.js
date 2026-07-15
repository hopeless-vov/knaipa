module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true } }],
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock all native/RN modules
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/react-native-gesture-handler.js',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '^react-native-maps$': '<rootDir>/__mocks__/react-native-maps.js',
    '^@react-navigation/.*$': '<rootDir>/__mocks__/react-navigation.js',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.js',
    '^@supabase/supabase-js$': '<rootDir>/__mocks__/supabase.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.js',
  },
  testEnvironment: 'node',
};
