module.exports = (config) => {
  config.set({
    basePath: '.',
    frameworks: ['mocha', 'karma-typescript'],
    files: [
      'src/**/*.ts',
      'test/**/*.ts'
    ],
    exclude: [],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    karmaTypescriptConfig: {
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
        constants: {
          'process.env.NODE_ENV': JSON.stringify('production')
        }
      },
      coverageOptions: {
        exclude: /test(\\|\/).*\.ts$/i
      },
      reports: {
        'lcov': './coverage',
        'text': null
      }
    },
    reporters: ['mocha', 'karma-typescript'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  })
}
