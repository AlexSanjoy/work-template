var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    ftp = require('vinyl-ftp'),
    notify = require("gulp-notify"),
    rsync = require('gulp-rsync');

// Пользовательские скрипты проекта

gulp.task('main-js', function() {
    return gulp.src([
        'src/js/main.js',
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/js'));
});

gulp.task('js', ['main-js'], function() {
    return gulp.src([
        'src/js/jquery.min.js',
        'src/js/bootstrap.min.js',
        'src/js/main.min.js'
    ])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify()) // Минимизировать весь js (на выбор)
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    });
});

gulp.task('sass', function() {
    return gulp.src('src/sass/**/*.sass')
        .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('css-libs', function() {
    return gulp.src([
        'src/css/bootstrap.min.css'
    ])
        .pipe(concat('libs.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('src/css'));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
    gulp.watch('src/sass/**/*.sass', ['sass']);
    gulp.watch('src/js/main.js', ['js']);
    gulp.watch('src/*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
    return gulp.src('src/img/**/*')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'css-libs', 'js'], function() {

    var buildFiles = gulp.src([
        'src/*.html',
        'src/config.json'
    ]).pipe(gulp.dest('dist'));

    var buildCss = gulp.src([
        'src/css/libs.min.css',
        'src/css/style.min.css'
    ]).pipe(gulp.dest('dist/css'));

    var buildJs = gulp.src([
        'src/js/scripts.min.js'
    ]).pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src([
        'src/fonts/**/*',
    ]).pipe(gulp.dest('dist/fonts'));

    var buildVideo = gulp.src([
        'src/video/**/*',
    ]).pipe(gulp.dest('dist/video'));

});

gulp.task('deploy', function() {

    var conn = ftp.create({
        host: 'hostname.com',
        user: 'username',
        password: 'userpassword',
        parallel: 10,
        log: gutil.log
    });

    var globs = [
        'dist/**',
        'dist/.htaccess',
    ];
    return gulp.src(globs, { buffer: false })
        .pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('rsync', function() {
    return gulp.src('dist/**')
        .pipe(rsync({
            root: 'dist/',
            hostname: 'username@yousite.com',
            destination: 'yousite/public_html/',
            archive: true,
            silent: false,
            compress: true
        }));
});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function() { return cache.clearAll(); });

gulp.task('default', ['watch']);