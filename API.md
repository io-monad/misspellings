## Functions

<dl>
<dt><a href="#dict">dict([options])</a> ⇒ <code>Object</code></dt>
<dd><p>Getter for the dictionary of misspellings.</p>
<p>This getter lazy-loads the dictionary file and caches it internally.</p>
</dd>
<dt><a href="#pattern">pattern()</a> ⇒ <code>string</code></dt>
<dd><p>Getter for a string of RegExp pattern for finding misspellings.</p>
<p>This getter lazy-loads the source file and caches it internally.</p>
</dd>
<dt><a href="#regexp">regexp([flags])</a> ⇒ <code>RegExp</code></dt>
<dd><p>Get a RegExp object for finding misspellings.</p>
<p>This method does NOT cache RegExp object, so if you use RegExp object
repeatedly, you should cache it by yourself.</p>
</dd>
<dt><a href="#correctWordsFor">correctWordsFor(word, options)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Get correct words from misspelling.</p>
<p>It is case-insensitive by default.
Set <code>caseSensitive</code> to <code>true</code> if you need.</p>
</dd>
<dt><a href="#correct">correct(str, [options], [callback])</a> ⇒ <code>string</code></dt>
<dd><p>Correct all misspellings in a string.</p>
<p>It is case-insensitive by default, but it tries to keep cases
(upper to upper, lower to lower) after misspellings corrected.</p>
<p>You can skip options and call in <code>correct(str, callback)</code> form.</p>
</dd>
</dl>

<a name="dict"></a>
## dict([options]) ⇒ <code>Object</code>
Getter for the dictionary of misspellings.

This getter lazy-loads the dictionary file and caches it internally.

**Kind**: global function  
**Returns**: <code>Object</code> - Dictionary object.
  The key is misspelled word, and the value is a string of comma-separated
  list of correct words.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> |  | Options. |
| [options.lowerCase] | <code>Boolean</code> | <code>false</code> | If `true`, returns a dictionary with all keys in lower-case. |

<a name="pattern"></a>
## pattern() ⇒ <code>string</code>
Getter for a string of RegExp pattern for finding misspellings.

This getter lazy-loads the source file and caches it internally.

**Kind**: global function  
**Returns**: <code>string</code> - RegExp pattern string.
  It is optimized by using `trie-regexp`.  
<a name="regexp"></a>
## regexp([flags]) ⇒ <code>RegExp</code>
Get a RegExp object for finding misspellings.

This method does NOT cache RegExp object, so if you use RegExp object
repeatedly, you should cache it by yourself.

**Kind**: global function  
**Returns**: <code>RegExp</code> - RegExp object that matches misspellings.  

| Param | Type | Description |
| --- | --- | --- |
| [flags] | <code>string</code> | `flags` parameter for `new RegExp()`. |

<a name="correctWordsFor"></a>
## correctWordsFor(word, options) ⇒ <code>Array.&lt;string&gt;</code>
Get correct words from misspelling.

It is case-insensitive by default.
Set `caseSensitive` to `true` if you need.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - An array of correct words.
  If there are no correct words for `word`, returns an empty array.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| word | <code>string</code> |  | Misspelled word. |
| options | <code>Object</code> |  | Options. |
| [options.caseSensitive] | <code>Boolean</code> | <code>false</code> | If `true`, do case-sensitive search. |

<a name="correct"></a>
## correct(str, [options], [callback]) ⇒ <code>string</code>
Correct all misspellings in a string.

It is case-insensitive by default, but it tries to keep cases
(upper to upper, lower to lower) after misspellings corrected.

You can skip options and call in `correct(str, callback)` form.

**Kind**: global function  
**Returns**: <code>string</code> - Corrected string  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| str | <code>string</code> |  | A target string. |
| [options] | <code>Object</code> |  | Options. |
| [options.caseSensitive] | <code>Boolean</code> | <code>false</code> | If `true`, do case-sensitive search for misspellings. |
| [options.overrideCases] | <code>Boolean</code> | <code>false</code> | If `true`, skip mapping cases and always use an exact word   in the dictionary. |
| [callback] | <code>[correctCallback](#correct..correctCallback)</code> |  | A callback function to be called each time misspellings found. |

<a name="correct..correctCallback"></a>
### correct~correctCallback ⇒ <code>string</code> &#124; <code>null</code> &#124; <code>undefined</code>
A callback function to be called each time misspellings found.

**Kind**: inner typedef of <code>[correct](#correct)</code>  
**Returns**: <code>string</code> &#124; <code>null</code> &#124; <code>undefined</code> - A replacement string for the misspelling.
  If `null` or `undefined` returned, it wouldn't replace misspellings.  

| Param | Type | Description |
| --- | --- | --- |
| misspell | <code>string</code> | Found misspelling word to be replaced. |
| corrects | <code>Array.&lt;string&gt;</code> | An array of correct words. |

