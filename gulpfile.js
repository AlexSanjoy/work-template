let gulp = require('gulp'),
    // sass = require('gulp-sass'),
    browsersync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer');

// Работа с Sass
// gulp.task('sass', function(){ // Создаем таск Sass
//     return gulp.src(['src/sass/**/*.sass']) // Берем источник
//         .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
//         .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
//         .pipe(rename({suffix: '.min'}))
//         .pipe(gulp.dest('src/css')) // Выгружаем результаты в папку src/css
//         .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
// });

// Browsersync
gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'src' // Директория для сервера - src
        },
        notify: false // Отключаем уведомления
    });
});

// Работа с JS
gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/bxslider/dist/jquery.bxslider.min.js',
        'node_modules/slick-carousel/slick/slick.min.js',
        'node_modules/animate/animate-css.js',
        'node_modules/page-scroll-to-id/jquery.malihu.PageScroll2id.js'
    ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('src/js')) // Выгружаем в папку src/js
        .pipe(browsersync.reload({
            stream: true
        }));
});

// Работа с CSS
gulp.task('css-libs', function() {
    return gulp.src([ // Выбираем файлы для минификации
        'css/normalize.css',
        'node_modules/bootstrap-grid/bootstrap-grid.min.css',
        'node_modules/bxslider/dist/jquery.bxslider.css',
        'node_modules/slick-carousel/slick/slick.css',
        'node_modules/slick-carousel/slick/slick-theme.css',
        'node_modules/animate/animate.min.css'
    ])
        .pipe(concat('libs.min.css')) // Собираем их в кучу в новом файле libs.min.css
        .pipe(cssnano()) // Сжимаем
        .pipe(gulp.dest('src/css')); // Выгружаем в папку src/css
});

// Слежение
gulp.task('watch', ['browsersync', 'css-libs', 'scripts'], function() {
    gulp.watch('src/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('src/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('src/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

// Очистка папки сборки
gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

// Оптимизация изображений
gulp.task('img', function() {
    return gulp.src('src/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем в dist
});

// Сборка проекта

gulp.task('build', ['clean', 'img', 'css-libs', 'scripts'], function() {
    let buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'src/css/main.css',
        'src/css/libs.min.css'
    ])
        .pipe(gulp.dest('dist/css'));

    let buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'));

    let buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'));

    let buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));
});

// Очистка кеша
gulp.task('clear', function(callback) {
    return cache.clearAll();
});

// Дефолтный таск
gulp.task('default', ['watch']);
