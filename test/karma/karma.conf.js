// Karma configuration
// Generated on Thu Dec 11 2014 10:39:16 GMT+0000 (GMT)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['qunit'],

        // list of files / patterns to load in the browser
        files: [
            'vendor/assets/javascripts/jquery.js',
            'vendor/assets/javascripts/modernizr.js',
            'vendor/assets/javascripts/handlebars-v1.3.0.js',
            'vendor/assets/javascripts/ember-1.7.0.js',
            'vendor/assets/javascripts/ember-data-1.0.0-beta5.js',
            'vendor/assets/javascripts/qunit-ember.js',
            'app/assets/javascripts/test_application.js',
            'app/assets/javascripts/routes.js',
            'app/assets/javascripts/compoundRoutes.js',
            'app/assets/javascripts/targetRoutes.js',
            'app/assets/javascripts/treeRoutes.js',
            'app/assets/javascripts/pathwayRoutes.js',
            'app/assets/javascripts/diseaseRoutes.js',
            'app/assets/javascripts/favouritesRoutes.js',
            'app/assets/javascripts/store.js',
            'app/assets/javascripts/controllers/*',
            'app/assets/javascripts/models/searchresult.js',
            'app/assets/javascripts/models/compoundStructure.js',
            'app/assets/javascripts/models/compound.js',
            'app/assets/javascripts/models/target.js',
            'app/assets/javascripts/models/compoundPharmacology.js',
            'app/assets/javascripts/models/targetPharmacology.js',
            'app/assets/javascripts/models/tree.js',
            'app/assets/javascripts/models/treePharmacology.js',
            'app/assets/javascripts/models/pathway.js',
            'app/assets/javascripts/models/structure.js',
            'app/assets/javascripts/models/disease.js',
            'app/assets/javascripts/tests/controllers/*'
        ],


        // list of files to exclude
        exclude: [
            'app/assets/javascripts/application.js',
            'app/assets/javascripts/models/array.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {

        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
