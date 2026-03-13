/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testRegex: '.*\\.test\\.tsx?$',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', module: 'CommonJS' } }]
  }
};
