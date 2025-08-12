'use strict';

const gulp = require('gulp');
const fs = require('fs');
const path = require('path');

// Load package.json for banner
const pkg = require('./package.json');
const { exec } = require('child_process');

// Create banner with package information
const banner = `/**
 * ${pkg.name} - ${pkg.description}
 * @version ${pkg.version}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 */
`;

// Copy icon files for each node (SVG and PNG)
gulp.task('build:icons', function () {
  // Copy all icon files from all node directories to their respective dist directories
  return gulp.src(['src/nodes/**/*.svg', 'src/nodes/**/*.png'])
    .pipe(gulp.dest(function(file) {
      // Recreate the same directory structure in dist
      const relativePath = path.relative(path.join(process.cwd(), 'src/nodes'), path.dirname(file.path));
      return path.join('dist/nodes', relativePath);
    }));
});

// Default task
gulp.task('default', gulp.series('build:icons'));

// Watch for changes
gulp.task('watch', function() {
  gulp.watch(['src/**/*.ts'], gulp.series('build'));
});
