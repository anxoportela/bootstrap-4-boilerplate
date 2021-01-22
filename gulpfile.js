"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const del = require("del");
const babel = require('gulp-babel');
const cleanCSS = require("gulp-clean-css");
const merge = require("merge-stream");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();


// Clean task
gulp.task("clean", () => del(["dist", "assets/css", "assets/scss/bootstrap", "assets/scss/tmp", "assets/js/vendor", "assets/fonts"]));

// Copiar librerías js desde node_modules a /vendor
gulp.task("vendor:js", () => gulp
  .src([
    "./node_modules/bootstrap/dist/js/*",
    "./node_modules/jquery/dist/*",
    "!./node_modules/jquery/dist/core.js",
    "./node_modules/popper.js/dist/umd/popper.*"
  ])
  .pipe(gulp.dest("./assets/js/vendor")));

// Copiar font-awesome desde node_modules a /fonts
gulp.task("vendor:fonts", () => gulp
  .src([
    "./node_modules/@fortawesome/fontawesome-free/**/*",
    "!./node_modules/@fortawesome/fontawesome-free/{less,less/*}",
    "!./node_modules/@fortawesome/fontawesome-free/{scss,scss/*}",
    "!./node_modules/@fortawesome/fontawesome-free/.*",
    "!./node_modules/@fortawesome/fontawesome-free/*.{txt,json,md}"
  ])
  .pipe(gulp.dest("./assets/fonts/font-awesome")));

// vendor task
gulp.task("vendor", gulp.parallel("vendor:fonts", "vendor:js"));

// Copiar js/vendor a /dist
gulp.task("vendor:build", () => {
  const jsStream = gulp
    .src([
      "./assets/js/vendor/bootstrap.min.js",
      "./assets/js/vendor/jquery.min.js",
      "./assets/js/vendor/popper.min.js"
    ])
    .pipe(gulp.dest("./dist/assets/js/vendor"));
  const fontStream = gulp
    .src(["./assets/fonts/font-awesome/**/*.*"])
    .pipe(gulp.dest("./dist/assets/fonts/font-awesome"));
  return merge(jsStream, fontStream);
});

// Copiar Bootstrap SCSS(SASS) desde node_modules a /assets/scss/bootstrap
gulp.task("bootstrap:scss", () => gulp
  .src(["./node_modules/bootstrap/scss/**/*"])
  .pipe(gulp.dest("./assets/scss/bootstrap")));

// Compilar archivos SCSS(SASS)
gulp.task(
  "scss",
  gulp.series("bootstrap:scss", function compileScss() {
    return gulp
      .src(["./assets/scss/*.scss"])
      .pipe(
        sass
          .sync({
            outputStyle: "expanded"
          })
          .on("error", sass.logError)
      )
      .pipe(autoprefixer())
      .pipe(gulp.dest("./assets/css"));
  })
);

// Minify CSS
gulp.task(
  "css:minify",
  gulp.series("scss", function cssMinify() {
    return gulp
      .src("./assets/css/app.css")
      .pipe(cleanCSS())
      .pipe(gulp.dest("./dist/assets/css"))
      .pipe(browserSync.stream());
  })
);

// Minify JS
gulp.task("js:minify", () => gulp
  .src(["./assets/js/*.js"])
  .pipe(babel({ presets: ['minify'] }))
  .pipe(gulp.dest("./dist/assets/js"))
  .pipe(browserSync.stream()));

// Minify Modules
gulp.task("js:modules", () => gulp
  .src(["./assets/js/modules/**/*.js"])
  .pipe(babel({ presets: ['minify'] }))
  .pipe(gulp.dest("./dist/assets/js/modules")));

// Configurar browserSync con live-updates
gulp.task("watch", function browserDev(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  gulp.watch(
    [
      "assets/scss/*.scss",
      "assets/scss/**/*.scss",
      "!assets/scss/bootstrap/**",
      "!assets/scss/jquery-ui/**"
    ],
    gulp.series("css:minify", function cssBrowserReload(done) {
      browserSync.reload();
      done();
    })
  );
  gulp.watch(
    ["assets/js/**/*.js",
      "!assets/js/vendor/**"
    ],
    gulp.series("js:minify", function jsBrowserReload(done) {
      browserSync.reload();
      done();
    })
  );
  gulp.watch([
    "*.html",
    "assets/js/modules/**/*.html"
  ])
    .on("change", browserSync.reload);
  done();
});

// Build task
gulp.task(
  "build",
  gulp.series(
    gulp.parallel("css:minify", "js:minify", "js:modules", "vendor"),
    "vendor:build",
    function copyAssets() {
      return gulp
        .src(["*.html", "favicon.ico", "assets/img/**", "assets/js/modules/**/*.html"], { base: "./" })
        .pipe(gulp.dest("dist"));
    }
  )
);

// Default task
gulp.task("default", gulp.series("clean", "build", "watch"));
