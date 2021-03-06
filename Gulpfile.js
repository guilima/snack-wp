'use strict';

// Gulp Plugins
var gulp 		= require('gulp'),
    plugins     = require('gulp-load-plugins')({    // Load all gulp plugins automatically
        rename: {
            'gulp-ruby-sass': 'sass'
        }
    }),
    stylish     = require('jshint-stylish'),        // jshint
    pngquant    = require('imagemin-pngquant'),     // Png compress
    browserSync = require('browser-sync').create(), // BrowserSync
    reload      = browserSync.reload,               // Reload
    pkg         = require('./package.json'),        // Package.json include directories
    dirs        = pkg['configs'].directories,

    // General files
	_files		= ['*.php', '*.html', 'build/**/*', 'build/in/*.php', 'styleguide/**', 'styleguide/**/**', 'styleguide/**/**/'];

    // COPY --------------------------------------------------------------

        gulp.task('copy:jquery', function () {
            return gulp.src(dirs._components+"/jquery/jquery.js")
                        .pipe(plugins.replace('/*!', '/*'))
                        .pipe(plugins.rename({suffix: ".min"}))
                        .pipe(plugins.uglify())
                        .pipe(gulp.dest(dirs._build+'/js/libs/'));
        });

        gulp.task('copy:html5shiv', function () {
            return gulp.src(dirs._components+"/html5shiv/dist/html5shiv.js")
                        .pipe(plugins.replace('/*!', '/*'))
                        .pipe(plugins.rename({suffix: ".min"}))
                        .pipe(plugins.uglify())
                        .pipe(gulp.dest(dirs._build+'/js/libs/'));
        });

        gulp.task('copy:respond', function () {
            return gulp.src(dirs._components+"/respond/src/respond.js")
                        .pipe(plugins.replace('/*!', '/*'))
                        .pipe(plugins.rename({suffix: ".min"}))
                        .pipe(plugins.uglify())
                        .pipe(gulp.dest(dirs._build+'/js/libs/'));
        });

        gulp.task('copy:normalize', function () {
            return gulp.src(dirs._components+'/normalize.css/normalize.css')
                        .pipe(plugins.replace('/*!', '/*'))
                        .pipe(plugins.rename('normalize.scss'))
                        .pipe(gulp.dest(dirs._assets+'/scss/3.generic'));
        });

        gulp.task('copy:font-awesome', function () {
            gulp.src(dirs._components+'/font-awesome/fonts/*')
                        .pipe(gulp.dest(dirs._build+'/fonts/font-awesome/'));

            gulp.src(dirs._components+'/font-awesome/css/font-awesome.css')
                        .pipe(plugins.replace('/*!', '/*'))
                        .pipe(plugins.replace('../fonts/', '../../build/fonts/font-awesome/'))
                        .pipe(plugins.rename('font-awesome.scss'))
                        .pipe(gulp.dest(dirs._assets+'/scss/6.plugins/'));
        });

    // IMAGES ------------------------------------------------------------

		//Imagemin
		gulp.task('imagemin', function () {
		    return gulp.src(dirs._assets+'/img/*')
		        .pipe(plugins.imagemin({
		            progressive: true,
		            interlaced:  true,
		            use:         [pngquant()]
		        }))
		        .pipe(gulp.dest(dirs._build+'/img'));
		});

		//Sprite
		gulp.task('sprite', function () {
			var spriteData = gulp.src(dirs._assets+'/img/sprite/*.png').pipe(plugins.spritesmith({
				imgName: 'sprite.png',
				cssName: 'icons.scss',
				cssFormat: 'scss',
				algorithm: 'binary-tree',
                cssVarMap: function (sprite) {
                    if(sprite.name.indexOf('-hover') !== -1){
                        sprite.name = 'a:hover .ico-'+sprite.name;
                    } else {
                        sprite.name = '.ico-'+sprite.name;
                    }
                },
				cssTemplate: dirs._assets+'/scss/5.objects/icons.mustache'
			}));
			spriteData.img.pipe(gulp.dest(dirs._build+'/img/sprite/'));
			spriteData.css.pipe(gulp.dest(dirs._assets+'/scss/5.objects/'));
		});

	// STYLES ------------------------------------------------------------

        //main.min.css
        gulp.task('sass', function () {

    	    return gulp.src(dirs._assets+'/scss/main.scss')
                .pipe(plugins.rename({suffix: ".min"}))
                .pipe(plugins.sass({
                    trace: true,
                    noCache: true,
                    style: "compressed"
                }))
                .on('error', function (err) { console.log(err.message); })
                .pipe(gulp.dest(dirs._build+"/css"))
                .pipe(plugins.livereload())
                .pipe(reload({stream:true}));
    	});

        //Style Guide
        gulp.task('sass_styleguide', function () {

            return gulp.src(dirs._sg_assets+'/css/main.scss')
                .pipe(plugins.rename({suffix: ".min"}))
                .pipe(plugins.sass({
                    trace: true,
                    noCache: true,
                    style: "compressed"
                }))
                .on('error', function (err) { console.log(err.message); })
                .pipe(gulp.dest(dirs._sg_build+'/css/'))
                .pipe(plugins.livereload())
                .pipe(reload({stream:true}));
        });

	// SCRIPTS  ----------------------------------------------------------

		// JShint
		gulp.task('lint', ['concat'], function() {
			return gulp.src(dirs._assets+'/js/*.js')
                .pipe(plugins.jshint())
                .pipe(plugins.jshint.reporter(stylish))
                .pipe(plugins.jshint.reporter('default'));
		});

		// Concat
		gulp.task('concat', function() {

			// scripts.min.js
			gulp.src([
    				dirs._assets+'/js/scripts.js'
				])
    		    .pipe(plugins.concat('scripts.js'))
    		    .pipe(gulp.dest(dirs._build+"/js"))
    		    .pipe(plugins.rename({suffix: ".min"}))
    		    .pipe(plugins.uglify())
    		    .pipe(gulp.dest(dirs._build+"/js"))
                .pipe(plugins.livereload())
    		    .pipe(reload({stream:true}));

            // scripts.full.min.js
            gulp.src([
                    dirs._build+'/js/libs/jquery.min.js', // jQuery Lib
                    dirs._assets+'/js/scripts.js'
                ])
                .pipe(plugins.concat('scripts.full.js'))
                .pipe(gulp.dest(dirs._build+"/js"))
                .pipe(plugins.rename({suffix: ".min"}))
                .pipe(plugins.uglify())
                .pipe(gulp.dest(dirs._build+"/js"))
                .pipe(plugins.livereload())
                .pipe(reload({stream:true}));

            // Styleguide js
            gulp.src([
                    dirs._components+"/angular/angular.min.js", // AngularJS
                    dirs._build+'/js/libs/jquery.min.js', // jQuery Lib
                    dirs._components+'/rainbow/dist/rainbow.min.js', // Rainbow custom
                    dirs._sg_assets+'/js/app.js',  // App
                    dirs._sg_assets+'/js/scripts.js', // Scripts
                ])
                .pipe(plugins.concat('scripts.js'))
                .pipe(gulp.dest(dirs._sg_build+"/js"))
                .pipe(plugins.rename({suffix: ".min"}))
                .pipe(plugins.uglify())
                .pipe(gulp.dest(dirs._sg_build+"/js"))
                .pipe(plugins.livereload())
                .pipe(reload({stream:true}));
		});

        // Rename IE8 / IE7 support js
        gulp.task('rename:html5shiv-respond', function () {
            return gulp.src([
                    dirs._components+"/html5shiv/dist/html5shiv.js", // html5shiv
                    dirs._components+"/respond/src/respond.js"       // Respond
                ])
                .pipe(plugins.concat('html5shiv-respond.js'))
                .pipe(plugins.rename({suffix: ".min"}))
                .pipe(plugins.uglify())
                .pipe(gulp.dest(dirs._build+"/js/libs/"));
        });

	// BROWSER SYNC ------------------------------------------------------
    	gulp.task('browser-sync', function() {
            browserSync.init({
                proxy: "local.wordpress"
            });
    	});

	// WATCH -------------------------------------------------------------
    	gulp.task('watch', function() {

            // Livereload
            plugins.livereload.listen();

            // watch Files
            gulp.watch('*.php').on('change', function(){
                plugins.livereload.changed('/*.php');
            });

    		// watch JS
            gulp.watch([dirs._assets+'/js/*.js', dirs._sg_assets+'/js/*.js'], ['lint']);

    		// watch CSS
            gulp.watch(dirs._assets+'/scss/**/*.scss', ['sass']);
    		gulp.watch(dirs._sg_assets+'/css/*.scss', ['sass_styleguide']);

    		// watch IMAGES
    		gulp.watch([dirs._assets+'/img/*'], ['imagemin']);
    		gulp.watch([dirs._assets+'/img/sprite/*.png'], ['sprite']);

    	});

	// RUN TASKS ---------------------------------------------------------
    	gulp.task('default', 	['watch', 'copy']);
    	gulp.task('images',		['sprite', 'imagemin']);
    	gulp.task('sync', 		['watch', 'browser-sync']);
    	gulp.task('css', 		['sass']);
        gulp.task('js',         ['lint', 'concat']);
        gulp.task('copy',       [
                                    'copy:jquery',
                                    'copy:html5shiv',
                                    'copy:respond',
                                    'copy:normalize',
                                    'copy:font-awesome',
                                    'rename:html5shiv-respond'
                                ]);
