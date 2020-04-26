const defTSOverrides = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': 'error',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'quotes': 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    'require-await': 'off',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-for-in-array': 'error',
  }
}

module.exports = {
  env: {
    es6: true,
    browser: true,
    mocha: true,
    commonjs: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  rules: {
    'quotes': ['error', 'single'],
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      ...defTSOverrides,
      parserOptions: {
        ...defTSOverrides.parserOptions,
        project: './tsconfig.json',
      }
    },
    {
      files: ['test/**/*.ts'],
      ...defTSOverrides,
      parserOptions: {
        ...defTSOverrides.parserOptions,
        project: './test/tsconfig.json',
      }
    }
  ]
}
