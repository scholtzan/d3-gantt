module.exports = function(grunt) {
  var sourceDir = "src/";
  var targetDir = "dist/";
  var libDir = "lib/";
  var docDir = "doc/";
  var styleDir = "style/";


  //--- jshint ------------------------------------------------------------

  var jshintConfig = {
    all: ["Gruntfile.js", "src/*.js"]
  };


  //--- concat ------------------------------------------------------------

  var concatConfig = {
    js: {
      src: [sourceDir + "*.js"],
      dest: targetDir + "d3-gantt.js"
    }
  };


  //--- jsdoc ------------------------------------------------------------

  var jsDocConfig = {
      dist : {
          src: [sourceDir + '/*.js'],
          options: {
              destination: docDir
          }
      }
  };

  //--- copy --------------------------------------------------------------

  var copyConfig = {
      target: {
          files: [
            { expand: true, cwd: styleDir, src: '*.css', dest: targetDir }
          ]
      }
  };

  //--- grunt -------------------------------------------------------------

  var gruntConfig = { pkg: grunt.file.readJSON("package.json") };
  gruntConfig.jshint = jshintConfig;
  gruntConfig.concat = concatConfig;
  gruntConfig.jsdoc = jsDocConfig;
  gruntConfig.copy = copyConfig;

  grunt.initConfig(gruntConfig);


  //=== load grunt tasks ======================================================

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsdoc');

  //=== register grunt tasks ==================================================

  grunt.registerTask("default", [
    "jshint",
    "concat",
    "copy",
    "jsdoc"
  ]);
};
