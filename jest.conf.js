/* eslint-disable flowtype/require-valid-file-annotation */

module.exports = {
  rootDir: 'src',
  collectCoverageFrom: [
    '*.js',
    '**/*.js',
    '!**/flowtypes.js',
    '!**/modules/utils/index.js', // excluded because it's just exporting
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  setupFiles: ['../scripts/setup-jest.js'],
};
