/* misspellings - List of common misspellings from Wikipedia
 * Copyright (C) 2016  IRIDE Monad <iride.monad@gmail.com>
 *
 * This file is part of `misspellings`.
 *
 * `misspellings` is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * `misspellings` is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with `misspellings`.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

import gulp from "gulp";
import gulpLoadPlugins from "gulp-load-plugins";
import del from "del";
import buildDictionary from "./tasks/lib/build-dictionary";
import "espower-babel/guess";

const DICT_SOURCE_URL = "https://en.wikipedia.org/wiki/Wikipedia:Lists_of_common_misspellings/For_machines";
const $ = gulpLoadPlugins();

gulp.task("default", ["build"]);
gulp.task("update", ["dict", "docs", "build"]);

gulp.task("clean", (cb) => {
  del(["lib"], cb);
});

gulp.task("build", () => {
  return gulp.src("src/**/*.js")
    .pipe($.babel())
    .pipe(gulp.dest("lib"))
});

gulp.task("dict", () => {
  return $.download(DICT_SOURCE_URL)
    .pipe(buildDictionary())
    .pipe(gulp.dest("dict"))
});

gulp.task("test", () => {
  return gulp.src("test/**/*-test.js")
    .pipe($.mocha())
});

gulp.task("docs", (cb) => {
  return gulp.src("src/**/*.js")
    .pipe($.jsdocToMarkdown())
    .pipe($.rename((p) => {
      p.basename = "API";
      p.extname = ".md";
    }))
    .pipe(gulp.dest("."))
});
