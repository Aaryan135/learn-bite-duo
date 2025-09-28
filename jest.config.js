module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
