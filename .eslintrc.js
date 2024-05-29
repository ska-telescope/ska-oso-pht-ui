module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb',
    'prettier',
    'plugin:cypress/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['prettier', 'cypress'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    '@typescript-eslint/comma-dangle': 1,
    'class-methods-use-this': 'off',
    'comma-dangle': 0,
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/order': 1,
    'import/prefer-default-export': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'max-len': 'off',
    'no-console': 2,
    'no-param-reassign': 'off',
    'no-plusplus': 0,
    'no-return-assign': 'off',
    'no-restricted-imports': [
      'error',
      {
        name: 'prop-types',
        message: 'Please add TypeScript typings to props instead.'
      }
    ],
    'import/extensions': 'off',
    'object-curly-newline': 'off',
    'prefer-destructuring': 'off',
    'react/prop-types': 'off',
    'react/forbid-prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-no-useless-fragment': 'off', // TAS : disabled for now
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 1,
    'react/function-component-definition': 'off',
    'react/display-name': 'off',
    'consistent-return': 1,
    'guard-for-in': 'off', // TAS : disabled for now
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/no-array-index-key': 'off', // TAS : disabled for now
    'react/no-unstable-nested-components': 'off', // TAS : disabled for now
    'react/require-default-props': 'off', // TAS : disabled for now
    'no-case-declarations': 'off', // TAS : disabled for now
    'no-restricted-syntax': 'off', // TAS : disabled for now
    'no-shadow': 'off',
    'no-unsafe-optional-chaining': 'off', // TAS : disabled for now
    'no-use-before-define': 'off', // TAS : disabled for now
    '@typescript-eslint/no-shadow': ['warn'], // TAS : changed from Error
    'no-bitwise': 'off',
    'no-new': 'off', // TAS : disabled for now
    'no-prototype-builtins': 'off', // TAS : disabled for now
    radix: 'off', // TAS : disabled for now
    '@typescript-eslint/ban-types': 'off', //  Should re-introduce at some point
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off' // TAS : disabled for now
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};
