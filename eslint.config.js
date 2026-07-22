// Flat ESLint config built on Expo's recommended rules.
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = [
  ...expoConfig,
  {
    ignores: ['node_modules/**', 'coverage/**', '.expo/**', 'babel.config.js', 'eslint.config.js'],
  },
  {
    rules: {
      // These React-Compiler-era rules fight idiomatic classic-RN Animated code
      // (interpolating an Animated.Value ref during render) and our deliberate
      // crossfade (setState in an animation-completion effect). Off by design.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Jest globals for the test suite and native-module mocks.
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', '__mocks__/**'],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node },
    },
    rules: {
      // Tests and CommonJS mocks legitimately use require().
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
