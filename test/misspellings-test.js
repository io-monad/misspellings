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
import assert from "./assert-customize";
import misspellings from "../src/misspellings";

describe("misspellings", () => {

  describe("#dict()", () => {
    let dict;
    let options;

    beforeEach(() => {
      dict = misspellings.dict(options);
    })

    context("with default options", () => {
      before(() => {
        options = undefined;
      })

      it("returns an Object", () => {
        assert(_.isObject(dict));
      })

      it("is not empty", () => {
        assert(!_.isEmpty(dict));
      })

      it("has `mispelling` for `misspelling`", () => {
        assert(dict["mispelling"] === "misspelling");
      })
    })

    context("with non-lowerCase", () => {
      before(() => {
        options = { lowerCase: false };
      })

      it("has `Amercia` for `America`", () => {
        assert(dict["Amercia"] === "America");
      })

      it("has no `amercia`", () => {
        assert(!dict.hasOwnProperty("amercia"));
      })

      it("always returns the same instance", () => {
        assert(dict === misspellings.dict(options));
      })
    })

    context("with lowerCase", () => {
      before(() => {
        options = { lowerCase: true };
      })

      it("has `amercia` for `America`", () => {
        assert(dict["amercia"] === "America");
      })

      it("has no `Amercia`", () => {
        assert(!dict.hasOwnProperty("Amercia"));
      })

      it("always returns the same instance", () => {
        assert(dict === misspellings.dict(options));
      })
    })
  })

  describe("#pattern()", () => {
    let pattern;
    beforeEach(() => {
      pattern = misspellings.pattern();
    })

    it("returns a String", () => {
      assert(_.isString(pattern));
    })

    it("is not empty", () => {
      assert(pattern !== "");
    })

    it("can be passed to RegExp constructor", () => {
      assert.doesNotThrow(() => { new RegExp(pattern) });
    })
  })

  describe("#regexp()", () => {
    let regexp;
    beforeEach(() => {
      regexp = misspellings.regexp();
    })

    it("returns a RegExp object", () => {
      assert(regexp instanceof RegExp);
    })

    it("matches to `mispelling`", () => {
      assert(regexp.test("mispelling"));
    })

    it("sets given flags to RegExp", () => {
      const re = misspellings.regexp("ig");
      assert(re.ignoreCase === true);
      assert(re.global === true);
      assert(re.multiline === false);
    })
  })

  describe("#correctWordsFor()", () => {
    let options;
    function given(target) {
      return misspellings.correctWordsFor(target, options);
    }

    context("with default options", () => {
      before(() => {
        options = undefined;
      })
      it("returns an empty Array for correct word", () => {
        assert.deepStrictEqual(given("misspelling"), []);
      })
      it("returns an Array of correct word for misspelled word", () => {
        assert.deepStrictEqual(given("mispelling"), ["misspelling"]);
      })
      it("returns an Array of all correct words for many correct words", () => {
        assert.deepStrictEqual(given("buring"), ["burying", "burning", "burin", "during"]);
      })
      it("returns `America` for `amercia`", () => {
        assert.deepStrictEqual(given("amercia"), ["America"]);
      })
    })

    context("with case-insensitive", () => {
      before(() => {
        options = { caseSensitive: false };
      })
      it("returns `America` for `amercia`", () => {
        assert.deepStrictEqual(given("amercia"), ["America"]);
      })
      it("returns `America` for `Amercia`", () => {
        assert.deepStrictEqual(given("Amercia"), ["America"]);
      })
    })

    context("with case-sensitive", () => {
      before(() => {
        options = { caseSensitive: true };
      })
      it("returns an empty Array for `amercia`", () => {
        assert.deepStrictEqual(given("amercia"), []);
      })
      it("returns `America` for `Amercia`", () => {
        assert.deepStrictEqual(given("Amercia"), ["America"]);
      })
    })
  })

  describe("#correct()", () => {
    let options;
    function given(source, callback) {
      return misspellings.correct(source, options, callback);
    }

    context("with default options", () => {
      before(() => {
        options = undefined;
      })
      it("corrects misspellings in a string", () => {
        assert(given("mispelling is mispelled") === "misspelling is misspelled")
      })
      it("ignores cases and keeps cases", () => {
        assert(given("Mispelling is Mispelled") === "Misspelling is Misspelled")
      })
    })

    context("with case-sensitive", () => {
      before(() => {
        options = { caseSensitive: true };
      })
      it("cares cases and keeps cases", () => {
        assert(given("Mispelling is mispelled") === "Mispelling is misspelled")
      })
    })

    context("with case-insensitive", () => {
      before(() => {
        options = { caseSensitive: false };
      })
      it("ignores cases and keeps cases", () => {
        assert(given("Mispelling is mispelled") === "Misspelling is misspelled")
      })
    })

    context("with overriding cases", () => {
      before(() => {
        options = { overrideCases: true };
      })
      it("ignores cases and overrides cases", () => {
        assert(given("Mispelling is mispelled") === "misspelling is misspelled")
      })
    })

    context("with no overriding cases", () => {
      before(() => {
        options = { overrideCases: false };
      })
      it("ignores cases and keeps cases", () => {
        assert(given("Mispelling is mispelled") === "Misspelling is misspelled")
      })
    })

    context("with callback", () => {
      before(() => {
        options = undefined;
      })
      it("calls callback", () => {
        let called = false, callback = () => { called = true };
        given("mispelling is mispelled", callback);
        assert(called);
      })
      it("uses replacement strings returned by callback", () => {
        const callback = () => { return "TEST" };
        assert(given("mispelling is mispelled", callback) === "TEST is TEST");
      })
      it("passes found misspelling and corrrect words", () => {
        const args = [];
        const callback = (misspell, corrects) => {
          args.push([misspell, corrects]);
        };
        given("Mispelling is mispelled", callback);
        assert.deepStrictEqual(args, [
          ["Mispelling", ["misspelling"]],
          ["mispelled", ["misspelled"]],
        ]);
      })
    })
  })

})
