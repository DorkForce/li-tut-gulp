const {src, dest, series, parallel, watch} = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();

const sass = require('gulp-sass');
const babel = require('gulp-babel');
const concatenate = require('gulp-concat');

sass.compiler = require('node-sass');

let origin = {
    root: 'src'
};
origin = {
    ...origin,
    templates: [`${origin.root}/**/*.html`],
    styles: [
        `${origin.root}/**/*.scss`,
        `${origin.root}/**/*.css`
    ],
    scripts: [
        `${origin.root}/**/*.js`,
        `${origin.root}/**/*.ts`
    ]    
};

const destination = 'build';

async function clean(cb) {
    await del(destination);
}

function templates(cb) {
    src(origin.templates).pipe(dest(destination));
    cb();
}

function styles(cb) {
    src(origin.styles)
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(concatenate('styles/index.css'))
        .pipe(dest(destination));
    cb();
}

function scripts(cb) {
    src(origin.scripts)
        .pipe(babel({
            compact: false,
            presets: ['@babel/preset-env']
        }))
        .pipe(concatenate('scripts/index.js'))
        .pipe(dest(destination));
    cb();
}

function watcher(cb) {
    watch(origin.templates).on('change', series(templates, browserSync.reload))
    watch(origin.styles).on('change', series(styles, browserSync.reload))
    watch(origin.scripts).on('change', series(scripts, browserSync.reload))
    cb();
}

function server(cb) {
    browserSync.init({
        notify: false,
        open: false,
        server: {
            baseDir: destination
        }
    });
    cb();
}

exports.default = series(clean, parallel(templates, styles, scripts), server, watcher);