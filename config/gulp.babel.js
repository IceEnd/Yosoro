import path from 'path';
import fs from 'fs';
import htmlreplace from 'gulp-html-replace';
import gulp from 'gulp';
import gutil from 'gulp-util';
import del from 'del';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import webpack from 'webpack';
import webpackWeb from './webpack.config.dist.babel';
import webpackElectron from './webpack.config.electron.babel';

gulp.task('clean:web', () => {
  del.sync([
    path.join(__dirname, '../lib/index*'),
    path.join(__dirname, '../lib/vendor*'),
    path.join(__dirname, '../lib/assets-map.json'),
  ]);
});

gulp.task('clean:electron', () => {
  del.sync([
    path.join(__dirname, '../lib/main.js'),
    path.join(__dirname, '../lib/main.js.map'),
    path.join(__dirname, '../lib/resource'),
    path.join(__dirname, '../lib/assets'),
  ]);
});

gulp.task('webpack:web', ['clean:web'], (cb) => {
  webpack(webpackWeb, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:web', err);
    }
    gutil.log('[webpack:web]', stats.toString({
      colors: true,
    }));
    cb(null);
  });
});

/**
 * @description electron 主进程
 */
gulp.task('webpack:electron', ['clean:electron'], (cb) => {
  webpack(webpackElectron, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:electron', err);
    }
    gutil.log('[webpack:electron]', stats.toString({
      colors: true,
    }));
    cb(null);
  });
});

/**
 * @description electron 主进程静态资源
 */
gulp.task('electron:resource', () => {
  gulp.src(path.join(__dirname, '../app/main/resource/**'))
    .pipe(gulp.dest(path.join(__dirname, '../lib/resource')));
  gulp.src(path.join(__dirname, '../app/packager-model.json'))
    .pipe(rename('package.json'))
    .pipe(gulp.dest(path.join(__dirname, '../lib')));
  gulp.src(path.join(__dirname, '../LICENSE'))
    .pipe(gulp.dest(path.join(__dirname, '../lib')));
  gulp.src(path.join(__dirname, ('../assets/**')))
    .pipe(gulp.dest(path.join(__dirname, '../lib/assets')));
});

gulp.task('css:clean', ['webpack:web'], () =>
  gulp.src(path.join(__dirname, './lib/*.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.join(__dirname, './lib')))
);

/**
 * @description 定义打包渲染进程任务，同时设置index.html
 */
gulp.task('build:web', ['css:clean'], () => {
  const fileContent = fs.readFileSync(path.join(__dirname, '../lib/assets-map.json'));
  const assetsJson = JSON.parse(fileContent);
  const cssName = /index_\S*css$/ig.exec(assetsJson.index.css)[0];
  gulp.src(path.join(__dirname, '../app/main/index.html'))
    .pipe(htmlreplace({
      js: [`./${assetsJson.vendor.js}`, `./${assetsJson.index.js}`],
      css: [`./${cssName}`],
    }))
    .pipe(gulp.dest(path.join(__dirname, '../lib')));
});

gulp.task('build:electron', ['webpack:electron', 'electron:resource']);

const index = process.argv.findIndex(value => value === '--mode');
let taskArr = ['clean', 'webpack:web'];
if (index === -1) {
  taskArr = ['clean', 'build:web', 'build:electron'];
} else {
  const mode = process.argv[index + 1];
  switch (mode) {
    case 'all':
      taskArr = ['build:web', 'build:electron'];
      break;
    case 'web':
      taskArr = ['build:web'];
      break;
    case 'electron':
      taskArr = ['build:electron'];
      break;
    default:
      taskArr = ['build:web', 'build:electron'];
      break;
  }
}

gulp.task('default', taskArr);
