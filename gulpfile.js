var config = {
  build: 'dist',
  destination: '../my/wordpress/install/location'
}

var gulp = require( 'gulp' ),
  del = require('del');
  gulpUtil = require('gulp-util');
  scss = require( 'gulp-sass' ),
  concat = require( 'gulp-concat' ),
  autoprefixer = require( 'gulp-autoprefixer' ),
  pug = require( 'gulp-pug' ),
  browserSync = require( 'browser-sync' ),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require("gulp-rename"),
  uglify = require('gulp-uglify'),
  imagemin = require( 'gulp-imagemin' ),
  addsrc = require('gulp-add-src')
  babel = require("gulp-babel"),
  runSeq = require('run-sequence');


gulp.task('clean', function(){
  return del([config.build]); // can't delete folders outside project. Please do that manually :(
});

/*gulp.slurped = false;
gulp.task( 'browser-sync', function () {
  if ( !gulp.slurped ) {
    gulp.slurped = true;
    browserSync( {
      port: 8080,
      server: {
        baseDir: config.build
      }
    } );
  }
} );*/


gulp.task( 'php', function () {
  gulp.src( 'src/php/**/*.php')
    .pipe( gulp.dest( config.build).on('error', gulpUtil.log))
} );

gulp.task( 'scss', function () {
  gulp.src( 'src/scss/**/[^_]*.?(s)css' )
    .pipe( scss.sync().on('error', gulpUtil.log) )
    .pipe( autoprefixer({browsers: ['last 2 versions'], cascade: true }))
    .pipe(addsrc.prepend('./bower_components/font-awesome/css/font-awesome.min.css'))
    .pipe( sourcemaps.write('./'))
    .pipe( gulp.dest( config.build ) )
    // .pipe( browserSync.stream() )
} );
 
gulp.task( 'pug', function () {
  gulp.src( 'src/pug/**/*.pug' )
    .pipe( pug().on('error', gulpUtil.log) )
    .pipe( gulp.dest( config.build ) )
    // .pipe( browserSync.stream() )
} );

gulp.task( 'images', function () {
  gulp.src( './src/images/**/*.{gif,png,ico,jpg}' )
    .pipe(plumber())
    .pipe(newer('./dist/images'))
    .pipe( imagemin( {
      use: [ pngquant({speed:1, quality:'20-80'}), mozjpeg() ]
    } ) )
    .pipe( gulp.dest( './dist/images' ) )
    // .pipe( browserSync.stream() );
} );

gulp.task('deploy', function () {
  // gulp.src('dist/**/*')
    // .pipe(gulp.dest(config.destination));
});
gulp.task('compress', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    // .pipe(addsrc.prepend('./bower_components/font-awesome/src/uncompressed/TweenMax.js'))
    .pipe( concat( 'global.min.js' ) )
    .pipe(uglify().on('error', gulpUtil.log))
    .pipe(gulp.dest('dist/js'));
});

gulp.task("watch", function() {
  // if ( !gulp.slurped ) {
    gulp.watch('src/php/**/*.php', ['php', 'deploy']);
    gulp.watch('src/scss/**/*.scss', ['scss', 'deploy']);
    gulp.watch('src/pug/**/*.pug', ['pug', 'deploy']);
    // gulp.watch(["src/js/**/*.jsx"], ["compile"]);  // compile react
    gulp.watch(["src/js/**/*.js"], ["compress", 'deploy']);
    // gulp.watch('dist/**/*', ['deploy']);
  // }
});
// gulp.task("watch", function() {
//   if ( !gulp.slurped ) {
//     gulp.watch('src/php/**/*.php', function(){runSeq('php', 'deploy')});
//     gulp.watch('src/scss/**/*.scss', function(){runSeq('scss', 'deploy')});
//     gulp.watch('src/pug/**/*.pug', function(){runSeq('pug', 'deploy')});
//     gulp.watch(["src/js/**/*.js"], function(){runSeq('compress', 'deploy')});
//   }
// });


gulp.task( 'build', [ 'scss', 'pug', 'compress', 'php', 'deploy']);
gulp.task( 'default', [ 'build', 'watch'/*,'browser-sync'*/]);
