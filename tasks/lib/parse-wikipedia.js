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

const EXTRACT_REGEXP = /<pre>((?:.|\n)+?)<\/pre>/;
const BLANK_REGEXP = /^\s*$/;
const SCAN_REGEXP = /^([^,]+?)\s*-&gt;\s*([^,]+?(?:\s*,\s*[^,]+?)*)\s*$/;

/**
 * Parse Wikipedia "Lists of common misspellings" page.
 */
export default function parseWikipedia(html) {
  // Extract list from page content
  const matches = String(html).match(EXTRACT_REGEXP);
  if (!matches) {
    throw new Error("No list of common misspellings found");
  }

  // Build a dictionary
  const lines = matches[1].split(/\n/);
  const dict = {};
  lines.forEach((line, lineno) => {
    if (BLANK_REGEXP.test(line)) return;

    const scanned = line.match(SCAN_REGEXP);
    if (!scanned) {
      throw new Error(`Unknown format at line ${lineno}: ${line}`);
    }

    const misspell = scanned[1];
    const correct  = scanned[2].replace(/\s*,\s*/g, ",");
    if (dict[misspell]) {
      if (dict[misspell].split(",").indexOf(correct) !== -1) {
        throw new Error(`Duplicated "${misspell}" found at line ${lineno}: ${line}`);
      }
      dict[misspell] += `,${correct}`
    } else {
      dict[misspell] = correct;
    }
  });

  return dict;
}
