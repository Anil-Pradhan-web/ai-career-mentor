module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unescaped-entities': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/set-state-in-effect': 'off',
  },
  ignorePatterns: [
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ],
};