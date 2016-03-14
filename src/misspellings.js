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

const dictCache = {};
let patternCache;

module.exports = {
  dict: dict,
  pattern: pattern,
  regexp: regexp,
  correctWordsFor: correctWordsFor,
  correct: correct,
};

/**
 * Getter for the dictionary of misspellings.
 *
 * This getter lazy-loads the dictionary file and caches it internally.
 *
 * @param {Object} [options] Options.
 * @param {Boolean} [options.lowerCase=false]
 *   If `true`, returns a dictionary with all keys in lower-case.
 * @return {Object}  Dictionary object.
 *   The key is misspelled word, and the value is a string of comma-separated
 *   list of correct words.
 */
function dict(options = {}) {
  if (options.lowerCase) {
    return dictCache[0] || (dictCache[0] = require("../dict/lc-dictionary.json"));
  } else {
    return dictCache[1] || (dictCache[1] = require("../dict/dictionary.json"));
  }
}

/**
 * Getter for a string of RegExp pattern for finding misspellings.
 *
 * This getter lazy-loads the source file and caches it internally.
 *
 * @return {string}  RegExp pattern string.
 *   It is optimized by using `trie-regexp`.
 */
function pattern() {
  return patternCache || (patternCache = require("../dict/regexp.json").regexp);
}

/**
 * Get a RegExp object for finding misspellings.
 *
 * This method does NOT cache RegExp object, so if you use RegExp object
 * repeatedly, you should cache it by yourself.
 *
 * @param {string} [flags]  `flags` parameter for `new RegExp()`.
 * @return {RegExp}  RegExp object that matches misspellings.
 */
function regexp(flags) {
  return new RegExp(pattern(), flags);
}

/**
 * Get correct words from misspelling.
 *
 * It is case-insensitive by default.
 * Set `caseSensitive` to `true` if you need.
 *
 * @param {string} word  Misspelled word.
 * @param {Object} options  Options.
 * @param {Boolean} [options.caseSensitive=false]
 *   If `true`, do case-sensitive search.
 * @return {string[]}  An array of correct words.
 *   If there are no correct words for `word`, returns an empty array.
 */
function correctWordsFor(word, options = {}) {
  word = String(word || "");
  const found = (options.caseSensitive ?
    dict()[word] :
    dict({ lowerCase: true })[word.toLowerCase()]
  );
  return found ? found.split(",") : [];
}

/**
 * Correct all misspellings in a string.
 *
 * It is case-insensitive by default, but it tries to keep cases
 * (upper to upper, lower to lower) after misspellings corrected.
 *
 * You can skip options and call in `correct(str, callback)` form.
 *
 * @param {string} str  A target string.
 * @param {Object} [options]  Options.
 * @param {Boolean} [options.caseSensitive=false]
 *   If `true`, do case-sensitive search for misspellings.
 * @param {Boolean} [options.overrideCases=false]
 *   If `true`, skip mapping cases and always use an exact word
 *   in the dictionary.
 * @param {correct~correctCallback} [callback]
 *   A callback function to be called each time misspellings found.
 * @return {string}
 *   Corrected string
 */
function correct(str, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  const {caseSensitive, overrideCases} = options || {};

  str = String(str || "");
  const dic = dict({ lowerCase: true });
  const re  = regexp(caseSensitive ? "g" : "ig");
  return str.replace(re, (misspell) => {
    const csv = dic[misspell.toLowerCase()];
    if (!csv) return misspell;

    const corrects = csv.split(",");
    let corrected;
    if (callback) {
      corrected = callback(misspell, corrects);
      if (typeof corrected === "undefined" || corrected === null) return misspell;
      corrected = String(corrected);
    } else {
      corrected = corrects[0];
    }

    if (!overrideCases) {
      corrected = mapCases(misspell, corrected);
    }

    return corrected;
  });
}

/**
 * A callback function to be called each time misspellings found.
 *
 * @callback correct~correctCallback
 * @param {string}   misspell  Found misspelling word to be replaced.
 * @param {string[]} corrects  An array of correct words.
 * @return {string|null|undefined}
 *   A replacement string for the misspelling.
 *   If `null` or `undefined` returned, it wouldn't replace misspellings.
 */

/**
 * @private
 */
function mapCases(source, dest) {
  const mapped = new Array(dest.length);
  for (let i = 0, l = dest.length; i < l; i++) {
    const sc = source.charCodeAt(i);  // becomes NaN when i exceeds source.length
    const dc = dest.charCodeAt(i);

    // If source is upper-case and dest is lower-case
    if (sc >= 0x41 && sc <= 0x5A && dc >= 0x61 && dc <= 0x7A) {
      // Make dest character upper-case
      mapped[i] = dc - 0x20;
    } else {
      mapped[i] = dc;
    }
  }
  return String.fromCharCode.apply(String, mapped);
}
