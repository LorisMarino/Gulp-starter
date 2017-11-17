// Import Gulp

import gulp from 'gulp'

// Import elements to compile es6

import babelify from 'babelify'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import watchify from 'watchify'

// Import and create Browser-sync

import
{
	create as bsCreate
}
from 'browser-sync';
const browserSync = bsCreate();

// Import and create plugins loader

import plugins from 'gulp-load-plugins';
const $ = plugins();


const config = {
	src: '../src/',
	dist: '../dist/'
}

// Server and automatic page update

gulp.task('server', ['styles', 'scripts'], () =>
{
	browserSync.init(
	{
		server: config.src,
		//browser: "google chrome canary" /* Delete the comment if you have chrome canary */
	})
	gulp.watch(`${config.src}styles.scss`, ['styles'])
	gulp.watch(`${config.src}*.html`).on('change', browserSync.reload)
})

/**********
 
 * CSS
 
 *********/

// SCSS compiled, code reorganization and CSS minifcation

gulp.task('styles', () =>
{
	return gulp.src(`${config.src}scss/styles.scss`)
		.pipe($.sourcemaps.init())
		.pipe($.sass())
		.on("error", $.notify.onError(
		{
			title: 'Compile SASS : ',
			message: '<%= error.message %>',
			sound: 'beep'
		}))
		.pipe($.autoprefixer(
		{
			browsers: ['last 3 versions'],
			cascade: false
		}))

		.pipe($.sourcemaps.write('./'))
		.pipe(gulp.dest(`${config.src}css`))
		.pipe(browserSync.stream())
		.pipe($.notify(
		{
			title: 'Compile SASS: ',
			message: 'success',
			sound: 'beep'
		}))
});

// Reorganization of SCSS

gulp.task('sassProper', () =>
{
	return gulp.src(`${config.src}scss/**/*.scss`)
		.pipe($.csscomb())
		.pipe(gulp.dest(`${config.src}scss`))
})

/**********
 
 * JS
 
 *********/

// Compile ES6 to ES5
let bundler = null
const bundle = () =>
{
	bundler.bundle()
		.on("error", $.notify.onError(
		{
			title: 'Compile ES6: ',
			message: '<%= error.message %>',
			sound: 'beep'
		}))
		.pipe(source('bundle.js'))
		.pipe(buffer())

		.pipe(gulp.dest(`${config.src}js`))
		.pipe(browserSync.stream())
		.pipe($.notify(
		{
			title: 'Compile ES6: ',
			message: 'success',
			sound: 'beep'
		}))
}

gulp.task('scripts', function()
{
	// Create bundler
	bundler = browserify(
		{
			entries: `${config.src}js/app.js`,
			debug: true,
			paths: ['./node_modules', `${config.src}js`]
		})
		.transform('babelify',
		{
			presets: ['babel-preset-env'].map(require.resolve)
		})

	// Watch
	bundler.plugin(watchify)

	// Listen to bundler update
	bundler.on('update', bundle)

	// Bundle
	bundle()
})

// Reorganization of JS

gulp.task('jsProper', function()
{
	return gulp.src(`${config.src}js/**/*.js`)
		.pipe($.jsbeautifier())
		.pipe(gulp.dest(`${config.src}js`))
});

/**********
 
 * PROD
 
 *********/

// Minify CSS

gulp.task('minCss', () =>
{
	return gulp.src(`${config.src}css/styles.css`)
		.pipe($.cssnano())
		.on("error", $.notify.onError(
		{
			title: 'Minfiy CSS: ',
			message: '<%= error.message %>',
			sound: 'beep'
		}))
		.pipe(gulp.dest(`${config.dist}css`))
		.pipe($.notify(
		{
			title: 'Minify CSS: ',
			message: 'success',
			sound: 'beep'
		}))
});

// Minify JS

gulp.task('minJs', () =>
{
	return gulp.src(`${config.src}js/bundle.js`)
		.pipe($.uglify())
		.on("error", $.notify.onError(
		{
			title: 'Minfiy JS: ',
			message: '<%= error.message %>',
			sound: 'beep'
		}))
		.pipe(gulp.dest(`${config.dist}js`))
		.pipe($.notify(
		{
			title: 'Minify JS: ',
			message: 'success',
			sound: 'beep'
		}))
});

// Minify images

gulp.task('minImages', () =>
{
	return gulp.src(`${config.src}img/**/*.+(png|jpg|jpeg|gif|svg)`)
		.pipe($.imagemin())
		.on("error", $.notify.onError(
		{
			title: 'Minfiy images: ',
			message: '<%= error.message %>',
			sound: 'beep'
		}))
		.pipe(gulp.dest(`${config.dist}img`))
		.pipe($.notify(
		{
			title: 'Minify images: ',
			message: 'success',
			sound: 'beep'
		}))
});

/**********
 
 * MOVE
 
 *********/

// Move pages

gulp.task('movePages', () =>
{
	return gulp.src(`${config.src}*.html`)
		.pipe(gulp.dest(`${config.dist}`))
		.pipe($.notify(
		{
			title: 'Move HTML: ',
			message: 'success',
			sound: 'beep'
		}))
});

/**********

RUN

**********/

gulp.task('default', ['server'])
gulp.task('autoIndent', ['sassProper', 'jsProper']);
gulp.task('prod', ['minCss', 'minJs', 'minImages', 'movePages'])