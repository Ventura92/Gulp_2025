import gulp, { src } from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import notify from 'gulp-notify';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import browserSync from 'browser-sync';
import ttf2woff2 from 'gulp-ttf2woff2';
import uglify from 'gulp-uglify';
import fileInclude from 'gulp-file-include';
import typograf from 'gulp-typograf';
import svgSprite from 'gulp-svg-sprite';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import {deleteAsync} from 'del';
import tinify from 'gulp-tinify';
import htmlMin from 'gulp-htmlmin';
import webp from 'gulp-webp';
import avif from 'gulp-avif';

export const html = () =>{
  return gulp.src(['./src/*.html'])
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(typograf({
      locale: ['ru', 'en-US']
    }))
    .pipe(gulp.dest('./app'))
    .pipe(browserSync.stream())
}

export const styles = () =>{
  return gulp.src('./src/scss/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'extended',
  }).on('error',notify.onError()))
  .pipe(rename({
    suffix:'.min',
  }))
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cleanCSS())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./app/css'))
  .pipe(browserSync.stream())
}

export const scripts = () =>{
  return gulp.src('./src/js/main.js')
    .pipe(webpackStream({
      output:{
        filename: 'main.js',
      },
      module: {
        rules: [
          {
            test: /\.(?:js|mjs|cjs)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                targets: "defaults",
                presets: [
                  ['@babel/preset-env']
                ]
              }
            }
          }
        ]
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify().on("error",notify.onError()))
    .pipe(rename({
      suffix: '.min'
      }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./app/js'))
    .pipe(browserSync.stream())
}

export const delApp = () =>{
  return deleteAsync(['./app/*'])
}

export const fonts = () =>{
  return  gulp.src(['src/fonts/*.ttf',],
    {encoding: false, 
    removeBOM: false,
    })
    .pipe(ttf2woff2())
    .pipe(gulp.dest('./app/fonts'))
}

export const woff2ToApp = () =>{
  return gulp.src('src/fonts/*.woff2')
  .pipe(gulp.dest('./app/fonts'))
}

export const imgToApp = () =>{
  return gulp.src(['./src/img/**.jpg','./src/img/**.jpeg',
  './src/img/**.png'],{ encoding: false })
  .pipe(gulp.dest('./app/img'))
}

export const svgToSprite = () =>{
return gulp.src('./src/img/svg/**.svg')
  .pipe(svgSprite({
    mode:{
      stack: {
        sprite: '../sprite.svg'
      } 
    }
  }))
  .pipe(gulp.dest('./app/img/svg'))
}

export const webImages = () =>{
  return gulp.src(['./src/img/**.jpg','./src/img/**.jpeg',
    './src/img/**.png'],{ encoding: false })
  .pipe(webp())
  .pipe(gulp.dest('./app/img'))
}

export const avifImages = () =>{
  return gulp.src(['./src/img/**.jpg','./src/img/**.jpeg',
    './src/img/**.png'],{ encoding: false })
    .pipe(avif())
    .pipe(gulp.dest('./app/img'))
}

export const moveToExtra = () =>{
  return gulp.src('./src/extra')
  .pipe(gulp.dest('./app'))
}

export const watcher = () =>{
  browserSync.init({
    server:{
      baseDir: "./app"
    },
    browser: 'google chrome',
    notify: false
  });
}

gulp.watch('./src/*.html',html);
gulp.watch('./src/pages/*.html',html);
gulp.watch('./src/scss/**/*.scss',styles);
gulp.watch('./src/js/*.js',scripts);
gulp.watch('./src/img/**.jpg',imgToApp,webImages,avifImages);
gulp.watch('./src/img/**.jpeg',imgToApp,webImages,avifImages);
gulp.watch('./src/img/**.png',imgToApp,webImages,avifImages);
gulp.watch('./src/img/**.svg',svgToSprite);
gulp.watch('./src/extra/**',moveToExtra);

export default
  gulp.series(delApp,gulp.parallel(
    html,fonts,woff2ToApp,imgToApp,svgToSprite,webImages,avifImages,moveToExtra,styles,scripts),watcher);

// build version

export const minimizePictures = () =>{
  return gulp.src('src/img/**/*',{ encoding: false })
  .pipe(tinify('vlhvLvsp6Jt6JwJdCJJ79HCg3ZH1mL8p'))
  .pipe(gulp.dest('./app/img/'))
}

export const htmlMinify = () =>{
  return src('app/**/*.html')
  .pipe(htmlMin({
    collapseWhitespace: true
  }))
  .pipe(gulp.dest('app'))
}

export const stylesBuild = () =>{
  return gulp.src('./src/scss/**/*.scss')
  .pipe(sass({
    outputStyle: 'extended',
  }).on('error',notify.onError()))
  .pipe(rename({
    suffix:'.min',
  }))
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cleanCSS())
  .pipe(gulp.dest('./app/css'))
}

export const scriptsBuild = () =>{
  return gulp.src('./src/js/main.js')
    .pipe(webpackStream({
      output:{
        filename: 'main.js',
      },
      module: {
        rules: [
          {
            test: /\.(?:js|mjs|cjs)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                targets: "defaults",
                presets: [
                  ['@babel/preset-env']
                ]
              }
            }
          }
        ]
      }
    }))
    .pipe(uglify().on("error",notify.onError()))
    .pipe(rename({
      suffix: '.min'
      }))
    .pipe(gulp.dest('./app/js'))
}

export const build = gulp.series
(delApp,gulp.parallel
  (
    html,fonts,imgToApp,svgToSprite,moveToExtra,stylesBuild,scriptsBuild,htmlMinify
  ),minimizePictures
);