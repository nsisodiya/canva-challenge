module.exports = function (configuration) {
  configuration.set({
    autoWatch: true,
    basePath: '',
    browsers: ['Chrome'],
    colors: true,
    exclude: [],
    files: [
      '../../client/common/define.js',
      '../../client/common/chainPromise.js',
      '../../client/common/parallelExec.js',
      '../../client/common/sequentialExec.js',
      '../../client/logic/Tournament.js',
      '../../test/karma/**/*_test.js'
    ],
    frameworks: [
      'mocha',
      'sinon-chai'
    ],
    reporters: ['progress'],
    port: 9876,
    singleRun: false
  })
}
