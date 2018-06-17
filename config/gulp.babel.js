import path from 'path';
import gulp from 'gulp';
import gutil from 'gulp-util';
import del from 'del';
import webpack from 'webpack';
import webpackWeb from './webpack.config.renderer.prod.babel';
import webpackElectron from './webpack.config.electron.babel';

gulp.task('clean:web', () => {
  del.sync([
    path.join(__dirname, '../lib/css/**'),
    path.join(__dirname, '../lib/vendor*'),
    path.join(__dirname, '../lib/*.html'),
    path.join(__dirname, '../lib/index*'),
    path.join(__dirname, '../lib/images/**'),
    path.join(__dirname, '../lib/webview/**'),
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
  gulp.src(path.join(__dirname, '../app/main/package.json'))
    .pipe(gulp.dest(path.join(__dirname, '../lib')));
  gulp.src(path.join(__dirname, '../LICENSE'))
    .pipe(gulp.dest(path.join(__dirname, '../lib')));
  gulp.src(path.join(__dirname, ('../assets/**')))
    .pipe(gulp.dest(path.join(__dirname, '../lib/assets')));
});

// 渲染进程打包
gulp.task('build:web', ['webpack:web']);

// 主进程打包任务
gulp.task('build:electron', ['webpack:electron', 'electron:resource']);

const index = process.argv.findIndex(value => value === '--mode');
let taskArr = ['clean', 'webpack:web'];
if (index === -1) {
  taskArr = ['clean', 'build:web'];
} else {
  const mode = process.argv[index + 1];
  switch (mode) {
    case 'renderer':
      taskArr = ['build:web'];
      break;
    case 'main':
      taskArr = ['build:electron'];
      break;
    default:
      taskArr = ['build:web'];
      break;
  }
}

gulp.task('default', taskArr);
