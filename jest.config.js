module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
