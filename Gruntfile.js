module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'less:dev']);

  var appConfig = {
    src: 'src',
    dist: 'dist'
  };

  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, keepalive: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    appConfig: appConfig,
    karma: {
      unit: {
        options: testConfig('test/test.conf.js')
      }
    },
    jshint: {
      files: ['<%= appConfig.src %>/**/*.js', 'test/**/*.js', 'demo/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    less: {
      src: ['<%= appConfig.src %>/**/*.less'],
      dev: {
        files: {
          '<%= appConfig.src %>/ui-moment.css': '<%= less.src %>'
        }
      },
      dist: {
        options: {
          compress: true
        },
        files: {
          '<%= appConfig.dist %>/ui-moment.css': '<%= less.src %>'
        }
      }
    },
    watch: {
      dev: {
          files: [
              '<%= jshint.files %>',
              '<%= less.src %>'
          ],
          tasks: ['default'],
          options: {
              interrupt: true,
              spawn: false
          }
      }
    }
  });
};
