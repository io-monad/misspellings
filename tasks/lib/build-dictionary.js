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

import _ from "lodash";
import gutil from "gulp-util";
import through from "through2";
import path from "path";
import RegexTrie from "regex-trie";
import parseWikipedia from "./parse-wikipedia";

const PLUGIN_NAME = "build-dictionary";

/**
 * gulp plugin for building dictionary from Wikipedia page
 */
export default function buildDictionary(options) {
  options = _.extend({
    dictFile:          "dictionary.json",
    lowerCaseDictFile: "lc-dictionary.json",
    regexpFile:        "regexp.json"
  }, options);

  let firstFile = null;
  let csDictionary = {};
  let ciDictionary = {};

  function parse(contents) {
    try {
      contents = String(contents);
      if (contents[0] === "{") {
        return JSON.parse(contents);
      } else {
        return parseWikipedia(contents);
      }
    } catch (e) {
      this.emit("error", new gutil.PluginError(PLUGIN_NAME, e.message));
    }
  }

  function eachFile(file, enc, done) {
    if (file.isNull()) return;
    firstFile = firstFile || file;

    const dict = file.dictionary || parse.call(this, file.contents);
    _.extend(csDictionary, dict);

    // Covert to lower case
    _.each(dict, (val, key) => {
      const misspell = key.toLowerCase();
      const corrects = val.split(",").filter(s => s !== misspell).join(",");
      if (corrects !== "") {
        ciDictionary[misspell] = corrects;
      }
    });

    done();
  }

  function file(name, contents) {
    if (typeof contents !== "string") contents = JSON.stringify(contents, null, 2);
    return new gutil.File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base || ".", name),
      contents: new Buffer(contents)
    });
  }

  function cleanup(done) {
    if (!firstFile) {
      this.emit("error", new gutil.PluginError(PLUGIN_NAME, `There is no input file on stream`));
    }
    if (_.isEmpty(csDictionary)) {
      this.emit("error", new gutil.PluginError(PLUGIN_NAME, `There was no items found`));
    }

    this.push(file(options.dictFile, csDictionary));
    this.push(file(options.lowerCaseDictFile, ciDictionary));

    const trie = new RegexTrie();
    _.each(csDictionary, (v, k) => trie.add(k));
    this.push(file(options.regexpFile, { "regexp": `\\b${trie.toString()}\\b` }));

    gutil.log(
      gutil.colors.green("Built dictionary files with"),
      gutil.colors.magenta(_.size(csDictionary)),
      gutil.colors.green("items")
    );
    done();
  }

  return through.obj(eachFile, cleanup);
}
