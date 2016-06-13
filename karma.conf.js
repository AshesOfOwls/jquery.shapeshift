module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'node_modules/jquery/dist/jquery.js',
      'core/**/*.js'
    ],

    exclude: [
      'core/vendor/**/*.js'
    ],

    preprocessors: {
    },

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['PhantomJS'],

    singleRun: true,

    concurrency: Infinity
  })
}
