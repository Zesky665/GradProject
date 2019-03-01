(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("base64-js/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "base64-js");
  (function() {
    'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = ((uint8[i] << 16) & 0xFF0000) + ((uint8[i + 1] << 8) & 0xFF00) + (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}
  })();
});

require.register("browser-resolve/empty.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "browser-resolve");
  (function() {
    
  })();
});

require.register("buffer/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "buffer");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(array)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}
  })();
});

require.register("core-util-is/lib/util.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "core-util-is");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
  })();
});

require.register("events/events.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "events");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}
  })();
});

require.register("get-browser-rtc/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "get-browser-rtc");
  (function() {
    // originally pulled out of simple-peer

module.exports = function getBrowserRTC () {
  if (typeof window === 'undefined') return null
  var wrtc = {
    RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection,
    RTCSessionDescription: window.RTCSessionDescription ||
      window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
    RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate ||
      window.webkitRTCIceCandidate
  }
  if (!wrtc.RTCPeerConnection) return null
  return wrtc
}
  })();
});

require.register("ieee754/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ieee754");
  (function() {
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}
  })();
});

require.register("inherits/inherits_browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "inherits");
  (function() {
    if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}
  })();
});

require.register("isarray/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "isarray");
  (function() {
    var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};
  })();
});

require.register("ms/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "ms");
  (function() {
    /**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}
  })();
});

require.register("phoenix/priv/static/phoenix.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix");
  (function() {
    (function (global, factory) {
typeof exports === 'object' ? factory(exports) :
typeof define === 'function' && define.amd ? define(['exports'], factory) :
factory(global.Phoenix = global.Phoenix || {});
}(this, (function (exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Phoenix Channels JavaScript client
 *
 * ## Socket Connection
 *
 * A single connection is established to the server and
 * channels are multiplexed over the connection.
 * Connect to the server using the `Socket` class:
 *
 * ```javascript
 *     let socket = new Socket("/socket", {params: {userToken: "123"}})
 *     socket.connect()
 * ```
 *
 * The `Socket` constructor takes the mount point of the socket,
 * the authentication params, as well as options that can be found in
 * the Socket docs, such as configuring the `LongPoll` transport, and
 * heartbeat.
 *
 * ## Channels
 *
 * Channels are isolated, concurrent processes on the server that
 * subscribe to topics and broker events between the client and server.
 * To join a channel, you must provide the topic, and channel params for
 * authorization. Here's an example chat room example where `"new_msg"`
 * events are listened for, messages are pushed to the server, and
 * the channel is joined with ok/error/timeout matches:
 *
 * ```javascript
 *     let channel = socket.channel("room:123", {token: roomToken})
 *     channel.on("new_msg", msg => console.log("Got message", msg) )
 *     $input.onEnter( e => {
 *       channel.push("new_msg", {body: e.target.val}, 10000)
 *        .receive("ok", (msg) => console.log("created message", msg) )
 *        .receive("error", (reasons) => console.log("create failed", reasons) )
 *        .receive("timeout", () => console.log("Networking issue...") )
 *     })
 *     channel.join()
 *       .receive("ok", ({messages}) => console.log("catching up", messages) )
 *       .receive("error", ({reason}) => console.log("failed join", reason) )
 *       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
 *```
 *
 * ## Joining
 *
 * Creating a channel with `socket.channel(topic, params)`, binds the params to
 * `channel.params`, which are sent up on `channel.join()`.
 * Subsequent rejoins will send up the modified params for
 * updating authorization params, or passing up last_message_id information.
 * Successful joins receive an "ok" status, while unsuccessful joins
 * receive "error".
 *
 * ## Duplicate Join Subscriptions
 *
 * While the client may join any number of topics on any number of channels,
 * the client may only hold a single subscription for each unique topic at any
 * given time. When attempting to create a duplicate subscription,
 * the server will close the existing channel, log a warning, and
 * spawn a new channel for the topic. The client will have their
 * `channel.onClose` callbacks fired for the existing channel, and the new
 * channel join will have its receive hooks processed as normal.
 *
 * ## Pushing Messages
 *
 * From the previous example, we can see that pushing messages to the server
 * can be done with `channel.push(eventName, payload)` and we can optionally
 * receive responses from the push. Additionally, we can use
 * `receive("timeout", callback)` to abort waiting for our other `receive` hooks
 *  and take action after some period of waiting. The default timeout is 5000ms.
 *
 *
 * ## Socket Hooks
 *
 * Lifecycle events of the multiplexed connection can be hooked into via
 * `socket.onError()` and `socket.onClose()` events, ie:
 *
 * ```javascript
 *     socket.onError( () => console.log("there was an error with the connection!") )
 *     socket.onClose( () => console.log("the connection dropped") )
 * ```
 *
 *
 * ## Channel Hooks
 *
 * For each joined channel, you can bind to `onError` and `onClose` events
 * to monitor the channel lifecycle, ie:
 *
 * ```javascript
 *     channel.onError( () => console.log("there was an error!") )
 *     channel.onClose( () => console.log("the channel has gone away gracefully") )
 * ```
 *
 * ### onError hooks
 *
 * `onError` hooks are invoked if the socket connection drops, or the channel
 * crashes on the server. In either case, a channel rejoin is attempted
 * automatically in an exponential backoff manner.
 *
 * ### onClose hooks
 *
 * `onClose` hooks are invoked only in two cases. 1) the channel explicitly
 * closed on the server, or 2). The client explicitly closed, by calling
 * `channel.leave()`
 *
 *
 * ## Presence
 *
 * The `Presence` object provides features for syncing presence information
 * from the server with the client and handling presences joining and leaving.
 *
 * ### Syncing initial state from the server
 *
 * `Presence.syncState` is used to sync the list of presences on the server
 * with the client's state. An optional `onJoin` and `onLeave` callback can
 * be provided to react to changes in the client's local presences across
 * disconnects and reconnects with the server.
 *
 * `Presence.syncDiff` is used to sync a diff of presence join and leave
 * events from the server, as they happen. Like `syncState`, `syncDiff`
 * accepts optional `onJoin` and `onLeave` callbacks to react to a user
 * joining or leaving from a device.
 *
 * ### Listing Presences
 *
 * `Presence.list` is used to return a list of presence information
 * based on the local state of metadata. By default, all presence
 * metadata is returned, but a `listBy` function can be supplied to
 * allow the client to select which metadata to use for a given presence.
 * For example, you may have a user online from different devices with
 * a metadata status of "online", but they have set themselves to "away"
 * on another device. In this case, the app may choose to use the "away"
 * status for what appears on the UI. The example below defines a `listBy`
 * function which prioritizes the first metadata which was registered for
 * each user. This could be the first tab they opened, or the first device
 * they came online from:
 *
 * ```javascript
 *     let state = {}
 *     state = Presence.syncState(state, stateFromServer)
 *     let listBy = (id, {metas: [first, ...rest]}) => {
 *       first.count = rest.length + 1 // count of this user's presences
 *       first.id = id
 *       return first
 *     }
 *     let onlineUsers = Presence.list(state, listBy)
 * ```
 *
 *
 * ### Example Usage
 *```javascript
 *     // detect if user has joined for the 1st time or from another tab/device
 *     let onJoin = (id, current, newPres) => {
 *       if(!current){
 *         console.log("user has entered for the first time", newPres)
 *       } else {
 *         console.log("user additional presence", newPres)
 *       }
 *     }
 *     // detect if user has left from all tabs/devices, or is still present
 *     let onLeave = (id, current, leftPres) => {
 *       if(current.metas.length === 0){
 *         console.log("user has left from all devices", leftPres)
 *       } else {
 *         console.log("user left from a device", leftPres)
 *       }
 *     }
 *     let presences = {} // client's initial empty presence state
 *     // receive initial presence data from server, sent after join
 *     myChannel.on("presence_state", state => {
 *       presences = Presence.syncState(presences, state, onJoin, onLeave)
 *       displayUsers(Presence.list(presences))
 *     })
 *     // receive "presence_diff" from server, containing join/leave events
 *     myChannel.on("presence_diff", diff => {
 *       presences = Presence.syncDiff(presences, diff, onJoin, onLeave)
 *       this.setState({users: Presence.list(room.presences, listBy)})
 *     })
 * ```
 * @module phoenix
 */

var VSN = "2.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var DEFAULT_TIMEOUT = 10000;
var WS_CLOSE_NORMAL = 1000;
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining",
  leaving: "leaving"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var CHANNEL_LIFECYCLE_EVENTS = [CHANNEL_EVENTS.close, CHANNEL_EVENTS.error, CHANNEL_EVENTS.join, CHANNEL_EVENTS.reply, CHANNEL_EVENTS.leave];
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

/**
 * Initializes the Push
 * @param {Channel} channel - The Channel
 * @param {string} event - The event, for example `"phx_join"`
 * @param {Object} payload - The payload, for example `{user_id: 123}`
 * @param {number} timeout - The push timeout in milliseconds
 */

var Push = function () {
  function Push(channel, event, payload, timeout) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.timeout = timeout;
    this.timeoutTimer = null;
    this.recHooks = [];
    this.sent = false;
  }

  /**
   *
   * @param {number} timeout
   */


  _createClass(Push, [{
    key: "resend",
    value: function resend(timeout) {
      this.timeout = timeout;
      this.reset();
      this.send();
    }

    /**
     *
     */

  }, {
    key: "send",
    value: function send() {
      if (this.hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref,
        join_ref: this.channel.joinRef()
      });
    }

    /**
     *
     * @param {*} status
     * @param {*} callback
     */

  }, {
    key: "receive",
    value: function receive(status, callback) {
      if (this.hasReceived(status)) {
        callback(this.receivedResp.response);
      }

      this.recHooks.push({ status: status, callback: callback });
      return this;
    }

    // private

  }, {
    key: "reset",
    value: function reset() {
      this.cancelRefEvent();
      this.ref = null;
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
    }
  }, {
    key: "matchReceive",
    value: function matchReceive(_ref) {
      var status = _ref.status,
          response = _ref.response,
          ref = _ref.ref;

      this.recHooks.filter(function (h) {
        return h.status === status;
      }).forEach(function (h) {
        return h.callback(response);
      });
    }
  }, {
    key: "cancelRefEvent",
    value: function cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel.off(this.refEvent);
    }
  }, {
    key: "cancelTimeout",
    value: function cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }, {
    key: "startTimeout",
    value: function startTimeout() {
      var _this = this;

      if (this.timeoutTimer) {
        this.cancelTimeout();
      }
      this.ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(this.ref);

      this.channel.on(this.refEvent, function (payload) {
        _this.cancelRefEvent();
        _this.cancelTimeout();
        _this.receivedResp = payload;
        _this.matchReceive(payload);
      });

      this.timeoutTimer = setTimeout(function () {
        _this.trigger("timeout", {});
      }, this.timeout);
    }
  }, {
    key: "hasReceived",
    value: function hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  }, {
    key: "trigger",
    value: function trigger(status, response) {
      this.channel.trigger(this.refEvent, { status: status, response: response });
    }
  }]);

  return Push;
}();

/**
 *
 * @param {string} topic
 * @param {Object} params
 * @param {Socket} socket
 */


var Channel = exports.Channel = function () {
  function Channel(topic, params, socket) {
    var _this2 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.timeout = this.socket.timeout;
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this2.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this2.state = CHANNEL_STATES.joined;
      _this2.rejoinTimer.reset();
      _this2.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      _this2.pushBuffer = [];
    });
    this.onClose(function () {
      _this2.rejoinTimer.reset();
      _this2.socket.log("channel", "close " + _this2.topic + " " + _this2.joinRef());
      _this2.state = CHANNEL_STATES.closed;
      _this2.socket.remove(_this2);
    });
    this.onError(function (reason) {
      if (_this2.isLeaving() || _this2.isClosed()) {
        return;
      }
      _this2.socket.log("channel", "error " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", function () {
      if (!_this2.isJoining()) {
        return;
      }
      _this2.socket.log("channel", "timeout " + _this2.topic + " (" + _this2.joinRef() + ")", _this2.joinPush.timeout);
      var leavePush = new Push(_this2, CHANNEL_EVENTS.leave, {}, _this2.timeout);
      leavePush.send();
      _this2.state = CHANNEL_STATES.errored;
      _this2.joinPush.reset();
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this2.trigger(_this2.replyEventName(ref), payload);
    });
  }

  _createClass(Channel, [{
    key: "rejoinUntilConnected",
    value: function rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this.rejoin();
      }
    }
  }, {
    key: "join",
    value: function join() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;

      if (this.joinedOnce) {
        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
      } else {
        this.joinedOnce = true;
        this.rejoin(timeout);
        return this.joinPush;
      }
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.on(CHANNEL_EVENTS.close, callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.on(CHANNEL_EVENTS.error, function (reason) {
        return callback(reason);
      });
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }
  }, {
    key: "off",
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: "canPush",
    value: function canPush() {
      return this.socket.isConnected() && this.isJoined();
    }
  }, {
    key: "push",
    value: function push(event, payload) {
      var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.timeout;

      if (!this.joinedOnce) {
        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
      }
      var pushEvent = new Push(this, event, payload, timeout);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }

      return pushEvent;
    }

    /** Leaves the channel
     *
     * Unsubscribes from server events, and
     * instructs channel to terminate on server
     *
     * Triggers onClose() hooks
     *
     * To receive leave acknowledgements, use the a `receive`
     * hook to bind to the server ack, ie:
     *
     * ```javascript
     *     channel.leave().receive("ok", () => alert("left!") )
     * ```
     */

  }, {
    key: "leave",
    value: function leave() {
      var _this3 = this;

      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;

      this.state = CHANNEL_STATES.leaving;
      var onClose = function onClose() {
        _this3.socket.log("channel", "leave " + _this3.topic);
        _this3.trigger(CHANNEL_EVENTS.close, "leave");
      };
      var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", function () {
        return onClose();
      }).receive("timeout", function () {
        return onClose();
      });
      leavePush.send();
      if (!this.canPush()) {
        leavePush.trigger("ok", {});
      }

      return leavePush;
    }

    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling
     * before dispatching to the channel callbacks.
     *
     * Must return the payload, modified or unmodified
     */

  }, {
    key: "onMessage",
    value: function onMessage(event, payload, ref) {
      return payload;
    }

    // private

  }, {
    key: "isMember",
    value: function isMember(topic, event, payload, joinRef) {
      if (this.topic !== topic) {
        return false;
      }
      var isLifecycleEvent = CHANNEL_LIFECYCLE_EVENTS.indexOf(event) >= 0;

      if (joinRef && isLifecycleEvent && joinRef !== this.joinRef()) {
        this.socket.log("channel", "dropping outdated message", { topic: topic, event: event, payload: payload, joinRef: joinRef });
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: "joinRef",
    value: function joinRef() {
      return this.joinPush.ref;
    }
  }, {
    key: "sendJoin",
    value: function sendJoin(timeout) {
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
  }, {
    key: "rejoin",
    value: function rejoin() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.timeout;
      if (this.isLeaving()) {
        return;
      }
      this.sendJoin(timeout);
    }
  }, {
    key: "trigger",
    value: function trigger(event, payload, ref, joinRef) {
      var _this4 = this;

      var handledPayload = this.onMessage(event, payload, ref, joinRef);
      if (payload && !handledPayload) {
        throw "channel onMessage callbacks must return the payload, modified or unmodified";
      }

      this.bindings.filter(function (bind) {
        return bind.event === event;
      }).map(function (bind) {
        return bind.callback(handledPayload, ref, joinRef || _this4.joinRef());
      });
    }
  }, {
    key: "replyEventName",
    value: function replyEventName(ref) {
      return "chan_reply_" + ref;
    }
  }, {
    key: "isClosed",
    value: function isClosed() {
      return this.state === CHANNEL_STATES.closed;
    }
  }, {
    key: "isErrored",
    value: function isErrored() {
      return this.state === CHANNEL_STATES.errored;
    }
  }, {
    key: "isJoined",
    value: function isJoined() {
      return this.state === CHANNEL_STATES.joined;
    }
  }, {
    key: "isJoining",
    value: function isJoining() {
      return this.state === CHANNEL_STATES.joining;
    }
  }, {
    key: "isLeaving",
    value: function isLeaving() {
      return this.state === CHANNEL_STATES.leaving;
    }
  }]);

  return Channel;
}();

var Serializer = {
  encode: function encode(msg, callback) {
    var payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
    return callback(JSON.stringify(payload));
  },
  decode: function decode(rawPayload, callback) {
    var _JSON$parse = JSON.parse(rawPayload),
        _JSON$parse2 = _slicedToArray(_JSON$parse, 5),
        join_ref = _JSON$parse2[0],
        ref = _JSON$parse2[1],
        topic = _JSON$parse2[2],
        event = _JSON$parse2[3],
        payload = _JSON$parse2[4];

    return callback({ join_ref: join_ref, ref: ref, topic: topic, event: event, payload: payload });
  }
};

/** Initializes the Socket
 *
 *
 * For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
 *
 * @param {string} endPoint - The string WebSocket endpoint, ie, `"ws://example.com/socket"`,
 *                                               `"wss://example.com"`
 *                                               `"/socket"` (inherited host & protocol)
 * @param {Object} opts - Optional configuration
 * @param {string} opts.transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
 *
 * Defaults to WebSocket with automatic LongPoll fallback.
 * @param {Function} opts.encode - The function to encode outgoing messages.
 *
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.stringify(payload))
 * ```
 *
 * @param {Function} opts.decode - The function to decode incoming messages.
 *
 * Defaults to JSON:
 *
 * ```javascript
 * (payload, callback) => callback(JSON.parse(payload))
 * ```
 *
 * @param {number} opts.timeout - The default timeout in milliseconds to trigger push timeouts.
 *
 * Defaults `DEFAULT_TIMEOUT`
 * @param {number} opts.heartbeatIntervalMs - The millisec interval to send a heartbeat message
 * @param {number} opts.reconnectAfterMs - The optional function that returns the millsec reconnect interval.
 *
 * Defaults to stepped backoff of:
 *
 * ```javascript
 *  function(tries){
 *    return [1000, 5000, 10000][tries - 1] || 10000
 *  }
 * ```
 * @param {Function} opts.logger - The optional function for specialized logging, ie:
 * ```javascript
 * logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
 * ```
 *
 * @param {number}  opts.longpollerTimeout - The maximum timeout of a long poll AJAX request.
 *
 * Defaults to 20s (double the server long poll timer).
 *
 * @param {Object}  opts.params - The optional params to pass when connecting
 *
 *
*/

var Socket = exports.Socket = function () {
  function Socket(endPoint) {
    var _this5 = this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.timeout = opts.timeout || DEFAULT_TIMEOUT;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.defaultEncoder = Serializer.encode;
    this.defaultDecoder = Serializer.decode;
    if (this.transport !== LongPoll) {
      this.encode = opts.encode || this.defaultEncoder;
      this.decode = opts.decode || this.defaultDecoder;
    } else {
      this.encode = this.defaultEncoder;
      this.decode = this.defaultDecoder;
    }
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 2000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.heartbeatTimer = null;
    this.pendingHeartbeatRef = null;
    this.reconnectTimer = new Timer(function () {
      _this5.disconnect(function () {
        return _this5.connect();
      });
    }, this.reconnectAfterMs);
  }

  _createClass(Socket, [{
    key: "protocol",
    value: function protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
  }, {
    key: "endPointURL",
    value: function endPointURL() {
      var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return this.protocol() + ":" + uri;
      }

      return this.protocol() + "://" + location.host + uri;
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback, code, reason) {
      if (this.conn) {
        this.conn.onclose = function () {}; // noop
        if (code) {
          this.conn.close(code, reason || "");
        } else {
          this.conn.close();
        }
        this.conn = null;
      }
      callback && callback();
    }

    /**
     *
     * @param {Object} params - The params to send when connecting, for example `{user_id: userToken}`
     */

  }, {
    key: "connect",
    value: function connect(params) {
      var _this6 = this;

      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = params;
      }
      if (this.conn) {
        return;
      }

      this.conn = new this.transport(this.endPointURL());
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = function () {
        return _this6.onConnOpen();
      };
      this.conn.onerror = function (error) {
        return _this6.onConnError(error);
      };
      this.conn.onmessage = function (event) {
        return _this6.onConnMessage(event);
      };
      this.conn.onclose = function (event) {
        return _this6.onConnClose(event);
      };
    }

    /**
     * Logs the message. Override `this.logger` for specialized logging. noops by default
     * @param {string} kind
     * @param {string} msg
     * @param {Object} data
     */

  }, {
    key: "log",
    value: function log(kind, msg, data) {
      this.logger(kind, msg, data);
    }

    // Registers callbacks for connection state change events
    //
    // Examples
    //
    //    socket.onError(function(error){ alert("An error occurred") })
    //

  }, {
    key: "onOpen",
    value: function onOpen(callback) {
      this.stateChangeCallbacks.open.push(callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.stateChangeCallbacks.close.push(callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.stateChangeCallbacks.error.push(callback);
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.stateChangeCallbacks.message.push(callback);
    }
  }, {
    key: "onConnOpen",
    value: function onConnOpen() {
      var _this7 = this;

      this.log("transport", "connected to " + this.endPointURL());
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (!this.conn.skipHeartbeat) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
          return _this7.sendHeartbeat();
        }, this.heartbeatIntervalMs);
      }
      this.stateChangeCallbacks.open.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: "onConnClose",
    value: function onConnClose(event) {
      this.log("transport", "close", event);
      this.triggerChanError();
      clearInterval(this.heartbeatTimer);
      this.reconnectTimer.scheduleTimeout();
      this.stateChangeCallbacks.close.forEach(function (callback) {
        return callback(event);
      });
    }
  }, {
    key: "onConnError",
    value: function onConnError(error) {
      this.log("transport", error);
      this.triggerChanError();
      this.stateChangeCallbacks.error.forEach(function (callback) {
        return callback(error);
      });
    }
  }, {
    key: "triggerChanError",
    value: function triggerChanError() {
      this.channels.forEach(function (channel) {
        return channel.trigger(CHANNEL_EVENTS.error);
      });
    }
  }, {
    key: "connectionState",
    value: function connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.connectionState() === "open";
    }
  }, {
    key: "remove",
    value: function remove(channel) {
      this.channels = this.channels.filter(function (c) {
        return c.joinRef() !== channel.joinRef();
      });
    }
  }, {
    key: "channel",
    value: function channel(topic) {
      var chanParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var chan = new Channel(topic, chanParams, this);
      this.channels.push(chan);
      return chan;
    }
  }, {
    key: "push",
    value: function push(data) {
      var _this8 = this;

      var topic = data.topic,
          event = data.event,
          payload = data.payload,
          ref = data.ref,
          join_ref = data.join_ref;

      var callback = function callback() {
        _this8.encode(data, function (result) {
          _this8.conn.send(result);
        });
      };
      this.log("push", topic + " " + event + " (" + join_ref + ", " + ref + ")", payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }

    /**
     * Return the next message ref, accounting for overflows
     */

  }, {
    key: "makeRef",
    value: function makeRef() {
      var newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }

      return this.ref.toString();
    }
  }, {
    key: "sendHeartbeat",
    value: function sendHeartbeat() {
      if (!this.isConnected()) {
        return;
      }
      if (this.pendingHeartbeatRef) {
        this.pendingHeartbeatRef = null;
        this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
        this.conn.close(WS_CLOSE_NORMAL, "hearbeat timeout");
        return;
      }
      this.pendingHeartbeatRef = this.makeRef();
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef });
    }
  }, {
    key: "flushSendBuffer",
    value: function flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach(function (callback) {
          return callback();
        });
        this.sendBuffer = [];
      }
    }
  }, {
    key: "onConnMessage",
    value: function onConnMessage(rawMessage) {
      var _this9 = this;

      this.decode(rawMessage.data, function (msg) {
        var topic = msg.topic,
            event = msg.event,
            payload = msg.payload,
            ref = msg.ref,
            join_ref = msg.join_ref;

        if (ref && ref === _this9.pendingHeartbeatRef) {
          _this9.pendingHeartbeatRef = null;
        }

        _this9.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
        _this9.channels.filter(function (channel) {
          return channel.isMember(topic, event, payload, join_ref);
        }).forEach(function (channel) {
          return channel.trigger(event, payload, ref, join_ref);
        });
        _this9.stateChangeCallbacks.message.forEach(function (callback) {
          return callback(msg);
        });
      });
    }
  }]);

  return Socket;
}();

var LongPoll = exports.LongPoll = function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  _createClass(LongPoll, [{
    key: "normalizeEndpoint",
    value: function normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
  }, {
    key: "endpointURL",
    value: function endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
  }, {
    key: "closeAndRetry",
    value: function closeAndRetry() {
      this.close();
      this.readyState = SOCKET_STATES.connecting;
    }
  }, {
    key: "ontimeout",
    value: function ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry();
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this10 = this;

      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
        return;
      }

      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
        if (resp) {
          var status = resp.status,
              token = resp.token,
              messages = resp.messages;

          _this10.token = token;
        } else {
          var status = 0;
        }

        switch (status) {
          case 200:
            messages.forEach(function (msg) {
              return _this10.onmessage({ data: msg });
            });
            _this10.poll();
            break;
          case 204:
            _this10.poll();
            break;
          case 410:
            _this10.readyState = SOCKET_STATES.open;
            _this10.onopen();
            _this10.poll();
            break;
          case 0:
          case 500:
            _this10.onerror();
            _this10.closeAndRetry();
            break;
          default:
            throw "unhandled poll status " + status;
        }
      });
    }
  }, {
    key: "send",
    value: function send(body) {
      var _this11 = this;

      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
        if (!resp || resp.status !== 200) {
          _this11.onerror(resp && resp.status);
          _this11.closeAndRetry();
        }
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      this.readyState = SOCKET_STATES.closed;
      this.onclose();
    }
  }]);

  return LongPoll;
}();

var Ajax = exports.Ajax = function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  _createClass(Ajax, null, [{
    key: "request",
    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
      if (window.XDomainRequest) {
        var req = new XDomainRequest(); // IE8, IE9
        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else {
        var _req = window.XMLHttpRequest ? new window.XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
        this.xhrRequest(_req, method, endPoint, accept, body, timeout, ontimeout, callback);
      }
    }
  }, {
    key: "xdomainRequest",
    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      var _this12 = this;

      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = function () {
        var response = _this12.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      // Work around bug in IE9 that requires an attached onprogress handler
      req.onprogress = function () {};

      req.send(body);
    }
  }, {
    key: "xhrRequest",
    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
      var _this13 = this;

      req.open(method, endPoint, true);
      req.timeout = timeout;
      req.setRequestHeader("Content-Type", accept);
      req.onerror = function () {
        callback && callback(null);
      };
      req.onreadystatechange = function () {
        if (req.readyState === _this13.states.complete && callback) {
          var response = _this13.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      req.send(body);
    }
  }, {
    key: "parseJSON",
    value: function parseJSON(resp) {
      if (!resp || resp === "") {
        return null;
      }

      try {
        return JSON.parse(resp);
      } catch (e) {
        console && console.log("failed to parse JSON response", resp);
        return null;
      }
    }
  }, {
    key: "serialize",
    value: function serialize(obj, parentKey) {
      var queryStr = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
        var paramVal = obj[key];
        if ((typeof paramVal === "undefined" ? "undefined" : _typeof(paramVal)) === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
  }, {
    key: "appendParams",
    value: function appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }

      var prefix = url.match(/\?/) ? "&" : "?";
      return "" + url + prefix + this.serialize(params);
    }
  }]);

  return Ajax;
}();

Ajax.states = { complete: 4 };

var Presence = exports.Presence = {
  syncState: function syncState(currentState, newState, onJoin, onLeave) {
    var _this14 = this;

    var state = this.clone(currentState);
    var joins = {};
    var leaves = {};

    this.map(state, function (key, presence) {
      if (!newState[key]) {
        leaves[key] = presence;
      }
    });
    this.map(newState, function (key, newPresence) {
      var currentPresence = state[key];
      if (currentPresence) {
        var newRefs = newPresence.metas.map(function (m) {
          return m.phx_ref;
        });
        var curRefs = currentPresence.metas.map(function (m) {
          return m.phx_ref;
        });
        var joinedMetas = newPresence.metas.filter(function (m) {
          return curRefs.indexOf(m.phx_ref) < 0;
        });
        var leftMetas = currentPresence.metas.filter(function (m) {
          return newRefs.indexOf(m.phx_ref) < 0;
        });
        if (joinedMetas.length > 0) {
          joins[key] = newPresence;
          joins[key].metas = joinedMetas;
        }
        if (leftMetas.length > 0) {
          leaves[key] = _this14.clone(currentPresence);
          leaves[key].metas = leftMetas;
        }
      } else {
        joins[key] = newPresence;
      }
    });
    return this.syncDiff(state, { joins: joins, leaves: leaves }, onJoin, onLeave);
  },
  syncDiff: function syncDiff(currentState, _ref2, onJoin, onLeave) {
    var joins = _ref2.joins,
        leaves = _ref2.leaves;

    var state = this.clone(currentState);
    if (!onJoin) {
      onJoin = function onJoin() {};
    }
    if (!onLeave) {
      onLeave = function onLeave() {};
    }

    this.map(joins, function (key, newPresence) {
      var currentPresence = state[key];
      state[key] = newPresence;
      if (currentPresence) {
        var _state$key$metas;

        (_state$key$metas = state[key].metas).unshift.apply(_state$key$metas, _toConsumableArray(currentPresence.metas));
      }
      onJoin(key, currentPresence, newPresence);
    });
    this.map(leaves, function (key, leftPresence) {
      var currentPresence = state[key];
      if (!currentPresence) {
        return;
      }
      var refsToRemove = leftPresence.metas.map(function (m) {
        return m.phx_ref;
      });
      currentPresence.metas = currentPresence.metas.filter(function (p) {
        return refsToRemove.indexOf(p.phx_ref) < 0;
      });
      onLeave(key, currentPresence, leftPresence);
      if (currentPresence.metas.length === 0) {
        delete state[key];
      }
    });
    return state;
  },
  list: function list(presences, chooser) {
    if (!chooser) {
      chooser = function chooser(key, pres) {
        return pres;
      };
    }

    return this.map(presences, function (key, presence) {
      return chooser(key, presence);
    });
  },


  // private

  map: function map(obj, func) {
    return Object.getOwnPropertyNames(obj).map(function (key) {
      return func(key, obj[key]);
    });
  },
  clone: function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};

/**
 *
 * Creates a timer that accepts a `timerCalc` function to perform
 * calculated timeout retries, such as exponential backoff.
 *
 * ## Examples
 *
 * ```javascript
 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *      return [1000, 5000, 10000][tries - 1] || 10000
 *    })
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 *    reconnectTimer.scheduleTimeout() // fires after 5000
 *    reconnectTimer.reset()
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 * ```
 * @param {Function} callback
 * @param {Function} timerCalc
 */

var Timer = function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  _createClass(Timer, [{
    key: "reset",
    value: function reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }

    /**
     * Cancels any previous scheduleTimeout and schedules callback
     */

  }, {
    key: "scheduleTimeout",
    value: function scheduleTimeout() {
      var _this15 = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this15.tries = _this15.tries + 1;
        _this15.callback();
      }, this.timerCalc(this.tries + 1));
    }
  }]);

  return Timer;
}();

})));
  })();
});

require.register("phoenix_html/priv/static/phoenix_html.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "phoenix_html");
  (function() {
    "use strict";

(function() {
  function buildHiddenInput(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  }

  function handleLinkClick(link) {
    var message = link.getAttribute("data-confirm");
    if(message && !window.confirm(message)) {
        return;
    }

    var to = link.getAttribute("data-to"),
        method = buildHiddenInput("_method", link.getAttribute("data-method")),
        csrf = buildHiddenInput("_csrf_token", link.getAttribute("data-csrf")),
        form = document.createElement("form");

    form.method = (link.getAttribute("data-method") === "get") ? "get" : "post";
    form.action = to;
    form.style.display = "hidden";

    form.appendChild(csrf);
    form.appendChild(method);
    document.body.appendChild(form);
    form.submit();
  }

  window.addEventListener("click", function(e) {
    var element = e.target;

    while (element && element.getAttribute) {
      if(element.getAttribute("data-method")) {
        handleLinkClick(element);
        e.preventDefault();
        return false;
      } else {
        element = element.parentNode;
      }
    }
  }, false);
})();
  })();
});

require.register("process-nextick-args/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "process-nextick-args");
  (function() {
    'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}
  })();
});

require.register("process/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "process");
  (function() {
    // shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
  })();
});

require.register("randombytes/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "randombytes");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    'use strict'

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = require('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > 65536) throw new Error('requested too many random bytes')
  // in case browserify  isn't using the Uint8Array version
  var rawBytes = new global.Uint8Array(size)

  // This will not work in older browsers.
  // See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
  if (size > 0) {  // getRandomValues fails on IE if size == 0
    crypto.getRandomValues(rawBytes)
  }

  // XXX: phantomjs doesn't like a buffer being passed here
  var bytes = Buffer.from(rawBytes.buffer)

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}
  })();
});

require.register("readable-stream/lib/_stream_duplex.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
  })();
});

require.register("readable-stream/lib/_stream_passthrough.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
  })();
});

require.register("readable-stream/lib/_stream_readable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
  })();
});

require.register("readable-stream/lib/_stream_transform.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
  })();
});

require.register("readable-stream/lib/_stream_writable.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
  })();
});

require.register("readable-stream/lib/internal/streams/BufferList.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
  })();
});

require.register("readable-stream/lib/internal/streams/destroy.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
  })();
});

require.register("readable-stream/lib/internal/streams/stream-browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    module.exports = require('events').EventEmitter;
  })();
});

require.register("readable-stream/readable-browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {"util":false}, "readable-stream");
  (function() {
    exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');
  })();
});

require.register("safe-buffer/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "safe-buffer");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    /* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}
  })();
});

require.register("simple-peer/index.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "simple-peer");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    module.exports = Peer

var debug = require('debug')('simple-peer')
var getBrowserRTC = require('get-browser-rtc')
var inherits = require('inherits')
var randombytes = require('randombytes')
var stream = require('readable-stream')

var MAX_BUFFERED_AMOUNT = 64 * 1024

inherits(Peer, stream.Duplex)

/**
 * WebRTC peer connection. Same API as node core `net.Socket`, plus a few extra methods.
 * Duplex stream.
 * @param {Object} opts
 */
function Peer (opts) {
  var self = this
  if (!(self instanceof Peer)) return new Peer(opts)

  self._id = randombytes(4).toString('hex').slice(0, 7)
  self._debug('new peer %o', opts)

  opts = Object.assign({
    allowHalfOpen: false
  }, opts)

  stream.Duplex.call(self, opts)

  self.channelName = opts.initiator
    ? opts.channelName || randombytes(20).toString('hex')
    : null

  // Needed by _transformConstraints, so set this early
  self._isChromium = typeof window !== 'undefined' && !!window.webkitRTCPeerConnection

  self.initiator = opts.initiator || false
  self.channelConfig = opts.channelConfig || Peer.channelConfig
  self.config = opts.config || Peer.config
  self.constraints = self._transformConstraints(opts.constraints || Peer.constraints)
  self.offerConstraints = self._transformConstraints(opts.offerConstraints || {})
  self.answerConstraints = self._transformConstraints(opts.answerConstraints || {})
  self.sdpTransform = opts.sdpTransform || function (sdp) { return sdp }
  self.streams = opts.streams || (opts.stream ? [opts.stream] : []) // support old "stream" option
  self.trickle = opts.trickle !== undefined ? opts.trickle : true

  self.destroyed = false
  self.connected = false

  self.remoteAddress = undefined
  self.remoteFamily = undefined
  self.remotePort = undefined
  self.localAddress = undefined
  self.localPort = undefined

  self._wrtc = (opts.wrtc && typeof opts.wrtc === 'object')
    ? opts.wrtc
    : getBrowserRTC()

  if (!self._wrtc) {
    if (typeof window === 'undefined') {
      throw makeError('No WebRTC support: Specify `opts.wrtc` option in this environment', 'ERR_WEBRTC_SUPPORT')
    } else {
      throw makeError('No WebRTC support: Not a supported browser', 'ERR_WEBRTC_SUPPORT')
    }
  }

  self._pcReady = false
  self._channelReady = false
  self._iceComplete = false // ice candidate trickle done (got null candidate)
  self._channel = null
  self._pendingCandidates = []

  self._isNegotiating = false // is this peer waiting for negotiation to complete?
  self._batchedNegotiation = false // batch synchronous negotiations
  self._queuedNegotiation = false // is there a queued negotiation request?
  self._sendersAwaitingStable = []
  self._senderMap = new WeakMap()

  self._remoteTracks = []
  self._remoteStreams = []

  self._chunk = null
  self._cb = null
  self._interval = null

  self._pc = new (self._wrtc.RTCPeerConnection)(self.config, self.constraints)

  // We prefer feature detection whenever possible, but sometimes that's not
  // possible for certain implementations.
  self._isReactNativeWebrtc = typeof self._pc._peerConnectionId === 'number'

  self._pc.oniceconnectionstatechange = function () {
    self._onIceStateChange()
  }
  self._pc.onicegatheringstatechange = function () {
    self._onIceStateChange()
  }
  self._pc.onsignalingstatechange = function () {
    self._onSignalingStateChange()
  }
  self._pc.onicecandidate = function (event) {
    self._onIceCandidate(event)
  }

  // Other spec events, unused by this implementation:
  // - onconnectionstatechange
  // - onicecandidateerror
  // - onfingerprintfailure
  // - onnegotiationneeded

  if (self.initiator) {
    self._setupData({
      channel: self._pc.createDataChannel(self.channelName, self.channelConfig)
    })
  } else {
    self._pc.ondatachannel = function (event) {
      self._setupData(event)
    }
  }

  if ('addTrack' in self._pc) {
    if (self.streams) {
      self.streams.forEach(function (stream) {
        self.addStream(stream)
      })
    }
    self._pc.ontrack = function (event) {
      self._onTrack(event)
    }
  }

  if (self.initiator) {
    self._needsNegotiation()
  }

  self._onFinishBound = function () {
    self._onFinish()
  }
  self.once('finish', self._onFinishBound)
}

Peer.WEBRTC_SUPPORT = !!getBrowserRTC()

/**
 * Expose config, constraints, and data channel config for overriding all Peer
 * instances. Otherwise, just set opts.config, opts.constraints, or opts.channelConfig
 * when constructing a Peer.
 */
Peer.config = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'stun:global.stun.twilio.com:3478?transport=udp'
    }
  ]
}
Peer.constraints = {}
Peer.channelConfig = {}

Object.defineProperty(Peer.prototype, 'bufferSize', {
  get: function () {
    var self = this
    return (self._channel && self._channel.bufferedAmount) || 0
  }
})

Peer.prototype.address = function () {
  var self = this
  return { port: self.localPort, family: 'IPv4', address: self.localAddress }
}

Peer.prototype.signal = function (data) {
  var self = this
  if (self.destroyed) throw makeError('cannot signal after peer is destroyed', 'ERR_SIGNALING')
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      data = {}
    }
  }
  self._debug('signal()')

  if (data.renegotiate) {
    self._debug('got request to renegotiate')
    self._needsNegotiation()
  }
  if (data.candidate) {
    if (self._pc.remoteDescription && self._pc.remoteDescription.type) self._addIceCandidate(data.candidate)
    else self._pendingCandidates.push(data.candidate)
  }
  if (data.sdp) {
    self._pc.setRemoteDescription(new (self._wrtc.RTCSessionDescription)(data), function () {
      if (self.destroyed) return

      self._pendingCandidates.forEach(function (candidate) {
        self._addIceCandidate(candidate)
      })
      self._pendingCandidates = []

      if (self._pc.remoteDescription.type === 'offer') self._createAnswer()
    }, function (err) { self.destroy(makeError(err, 'ERR_SET_REMOTE_DESCRIPTION')) })
  }
  if (!data.sdp && !data.candidate && !data.renegotiate) {
    self.destroy(makeError('signal() called with invalid signal data', 'ERR_SIGNALING'))
  }
}

Peer.prototype._addIceCandidate = function (candidate) {
  var self = this
  try {
    self._pc.addIceCandidate(
      new self._wrtc.RTCIceCandidate(candidate),
      noop,
      function (err) { self.destroy(makeError(err, 'ERR_ADD_ICE_CANDIDATE')) }
    )
  } catch (err) {
    self.destroy(makeError('error adding candidate: ' + err.message, 'ERR_ADD_ICE_CANDIDATE'))
  }
}

/**
 * Send text/binary data to the remote peer.
 * @param {ArrayBufferView|ArrayBuffer|Buffer|string|Blob} chunk
 */
Peer.prototype.send = function (chunk) {
  var self = this
  self._channel.send(chunk)
}

/**
 * Add a MediaStream to the connection.
 * @param {MediaStream} stream
 */
Peer.prototype.addStream = function (stream) {
  var self = this

  self._debug('addStream()')

  stream.getTracks().forEach(function (track) {
    self.addTrack(track, stream)
  })
}

/**
 * Add a MediaStreamTrack to the connection.
 * @param {MediaStreamTrack} track
 * @param {MediaStream} stream
 */
Peer.prototype.addTrack = function (track, stream) {
  var self = this

  self._debug('addTrack()')

  var sender = self._pc.addTrack(track, stream)
  var submap = self._senderMap.get(track) || new WeakMap() // nested WeakMaps map [track, stream] to sender
  submap.set(stream, sender)
  self._senderMap.set(track, submap)
  self._needsNegotiation()
}

/**
 * Remove a MediaStreamTrack from the connection.
 * @param {MediaStreamTrack} track
 * @param {MediaStream} stream
 */
Peer.prototype.removeTrack = function (track, stream) {
  var self = this

  self._debug('removeSender()')

  var submap = self._senderMap.get(track)
  var sender = submap ? submap.get(stream) : null
  if (!sender) {
    self.destroy(new Error('Cannot remove track that was never added.'))
  }
  try {
    self._pc.removeTrack(sender)
  } catch (err) {
    if (err.name === 'NS_ERROR_UNEXPECTED') {
      self._sendersAwaitingStable.push(sender) // HACK: Firefox must wait until (signalingState === stable) https://bugzilla.mozilla.org/show_bug.cgi?id=1133874
    } else {
      self.destroy(err)
    }
  }
}

/**
 * Remove a MediaStream from the connection.
 * @param {MediaStream} stream
 */
Peer.prototype.removeStream = function (stream) {
  var self = this

  self._debug('removeSenders()')

  stream.getTracks().forEach(function (track) {
    self.removeTrack(track, stream)
  })
}

Peer.prototype._needsNegotiation = function () {
  var self = this

  self._debug('_needsNegotiation')
  if (self._batchedNegotiation) return // batch synchronous renegotiations
  self._batchedNegotiation = true
  setTimeout(function () {
    self._batchedNegotiation = false
    self._debug('starting batched negotiation')
    self.negotiate()
  }, 0)
}

Peer.prototype.negotiate = function () {
  var self = this

  if (self.initiator) {
    if (self._isNegotiating) {
      self._queuedNegotiation = true
      self._debug('already negotiating, queueing')
    } else {
      self._debug('start negotiation')
      self._createOffer()
    }
  } else {
    self._debug('requesting negotiation from initiator')
    self.emit('signal', { // request initiator to renegotiate
      renegotiate: true
    })
  }
  self._isNegotiating = true
}

// TODO: Delete this method once readable-stream is updated to contain a default
// implementation of destroy() that automatically calls _destroy()
// See: https://github.com/nodejs/readable-stream/issues/283
Peer.prototype.destroy = function (err) {
  var self = this
  self._destroy(err, function () {})
}

Peer.prototype._destroy = function (err, cb) {
  var self = this
  if (self.destroyed) return

  self._debug('destroy (error: %s)', err && (err.message || err))

  self.readable = self.writable = false

  if (!self._readableState.ended) self.push(null)
  if (!self._writableState.finished) self.end()

  self.destroyed = true
  self.connected = false
  self._pcReady = false
  self._channelReady = false
  self._remoteTracks = null
  self._remoteStreams = null
  self._senderMap = null

  clearInterval(self._interval)
  self._interval = null
  self._chunk = null
  self._cb = null

  if (self._onFinishBound) self.removeListener('finish', self._onFinishBound)
  self._onFinishBound = null

  if (self._channel) {
    try {
      self._channel.close()
    } catch (err) {}

    self._channel.onmessage = null
    self._channel.onopen = null
    self._channel.onclose = null
    self._channel.onerror = null
  }
  if (self._pc) {
    try {
      self._pc.close()
    } catch (err) {}

    self._pc.oniceconnectionstatechange = null
    self._pc.onicegatheringstatechange = null
    self._pc.onsignalingstatechange = null
    self._pc.onicecandidate = null
    if ('addTrack' in self._pc) {
      self._pc.ontrack = null
    }
    self._pc.ondatachannel = null
  }
  self._pc = null
  self._channel = null

  if (err) self.emit('error', err)
  self.emit('close')
  cb()
}

Peer.prototype._setupData = function (event) {
  var self = this
  if (!event.channel) {
    // In some situations `pc.createDataChannel()` returns `undefined` (in wrtc),
    // which is invalid behavior. Handle it gracefully.
    // See: https://github.com/feross/simple-peer/issues/163
    return self.destroy(makeError('Data channel event is missing `channel` property', 'ERR_DATA_CHANNEL'))
  }

  self._channel = event.channel
  self._channel.binaryType = 'arraybuffer'

  if (typeof self._channel.bufferedAmountLowThreshold === 'number') {
    self._channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT
  }

  self.channelName = self._channel.label

  self._channel.onmessage = function (event) {
    self._onChannelMessage(event)
  }
  self._channel.onbufferedamountlow = function () {
    self._onChannelBufferedAmountLow()
  }
  self._channel.onopen = function () {
    self._onChannelOpen()
  }
  self._channel.onclose = function () {
    self._onChannelClose()
  }
  self._channel.onerror = function (err) {
    self.destroy(makeError(err, 'ERR_DATA_CHANNEL'))
  }
}

Peer.prototype._read = function () {}

Peer.prototype._write = function (chunk, encoding, cb) {
  var self = this
  if (self.destroyed) return cb(makeError('cannot write after peer is destroyed', 'ERR_DATA_CHANNEL'))

  if (self.connected) {
    try {
      self.send(chunk)
    } catch (err) {
      return self.destroy(makeError(err, 'ERR_DATA_CHANNEL'))
    }
    if (self._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
      self._debug('start backpressure: bufferedAmount %d', self._channel.bufferedAmount)
      self._cb = cb
    } else {
      cb(null)
    }
  } else {
    self._debug('write before connect')
    self._chunk = chunk
    self._cb = cb
  }
}

// When stream finishes writing, close socket. Half open connections are not
// supported.
Peer.prototype._onFinish = function () {
  var self = this
  if (self.destroyed) return

  if (self.connected) {
    destroySoon()
  } else {
    self.once('connect', destroySoon)
  }

  // Wait a bit before destroying so the socket flushes.
  // TODO: is there a more reliable way to accomplish this?
  function destroySoon () {
    setTimeout(function () {
      self.destroy()
    }, 1000)
  }
}

Peer.prototype._createOffer = function () {
  var self = this
  if (self.destroyed) return

  self._pc.createOffer(function (offer) {
    if (self.destroyed) return
    offer.sdp = self.sdpTransform(offer.sdp)
    self._pc.setLocalDescription(offer, onSuccess, onError)

    function onSuccess () {
      self._debug('createOffer success')
      if (self.destroyed) return
      if (self.trickle || self._iceComplete) sendOffer()
      else self.once('_iceComplete', sendOffer) // wait for candidates
    }

    function onError (err) {
      self.destroy(makeError(err, 'ERR_SET_LOCAL_DESCRIPTION'))
    }

    function sendOffer () {
      var signal = self._pc.localDescription || offer
      self._debug('signal')
      self.emit('signal', {
        type: signal.type,
        sdp: signal.sdp
      })
    }
  }, function (err) { self.destroy(makeError(err, 'ERR_CREATE_OFFER')) }, self.offerConstraints)
}

Peer.prototype._createAnswer = function () {
  var self = this
  if (self.destroyed) return

  self._pc.createAnswer(function (answer) {
    if (self.destroyed) return
    answer.sdp = self.sdpTransform(answer.sdp)
    self._pc.setLocalDescription(answer, onSuccess, onError)

    function onSuccess () {
      if (self.destroyed) return
      if (self.trickle || self._iceComplete) sendAnswer()
      else self.once('_iceComplete', sendAnswer)
    }

    function onError (err) {
      self.destroy(makeError(err, 'ERR_SET_LOCAL_DESCRIPTION'))
    }

    function sendAnswer () {
      var signal = self._pc.localDescription || answer
      self._debug('signal')
      self.emit('signal', {
        type: signal.type,
        sdp: signal.sdp
      })
    }
  }, function (err) { self.destroy(makeError(err, 'ERR_CREATE_ANSWER')) }, self.answerConstraints)
}

Peer.prototype._onIceStateChange = function () {
  var self = this
  if (self.destroyed) return
  var iceConnectionState = self._pc.iceConnectionState
  var iceGatheringState = self._pc.iceGatheringState

  self._debug(
    'iceStateChange (connection: %s) (gathering: %s)',
    iceConnectionState,
    iceGatheringState
  )
  self.emit('iceStateChange', iceConnectionState, iceGatheringState)

  if (iceConnectionState === 'connected' || iceConnectionState === 'completed') {
    self._pcReady = true
    self._maybeReady()
  }
  if (iceConnectionState === 'failed') {
    self.destroy(makeError('Ice connection failed.', 'ERR_ICE_CONNECTION_FAILURE'))
  }
  if (iceConnectionState === 'closed') {
    self.destroy(new Error('Ice connection closed.'))
  }
}

Peer.prototype.getStats = function (cb) {
  var self = this

  // Promise-based getStats() (standard)
  if (self._pc.getStats.length === 0) {
    self._pc.getStats().then(function (res) {
      var reports = []
      res.forEach(function (report) {
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Two-parameter callback-based getStats() (deprecated, former standard)
  } else if (self._isReactNativeWebrtc) {
    self._pc.getStats(null, function (res) {
      var reports = []
      res.forEach(function (report) {
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Single-parameter callback-based getStats() (non-standard)
  } else if (self._pc.getStats.length > 0) {
    self._pc.getStats(function (res) {
      // If we destroy connection in `connect` callback this code might happen to run when actual connection is already closed
      if (self.destroyed) return

      var reports = []
      res.result().forEach(function (result) {
        var report = {}
        result.names().forEach(function (name) {
          report[name] = result.stat(name)
        })
        report.id = result.id
        report.type = result.type
        report.timestamp = result.timestamp
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Unknown browser, skip getStats() since it's anyone's guess which style of
  // getStats() they implement.
  } else {
    cb(null, [])
  }
}

Peer.prototype._maybeReady = function () {
  var self = this
  self._debug('maybeReady pc %s channel %s', self._pcReady, self._channelReady)
  if (self.connected || self._connecting || !self._pcReady || !self._channelReady) return

  self._connecting = true

  // HACK: We can't rely on order here, for details see https://github.com/js-platform/node-webrtc/issues/339
  function findCandidatePair () {
    if (self.destroyed) return

    self.getStats(function (err, items) {
      if (self.destroyed) return

      // Treat getStats error as non-fatal. It's not essential.
      if (err) items = []

      var remoteCandidates = {}
      var localCandidates = {}
      var candidatePairs = {}
      var foundSelectedCandidatePair = false

      items.forEach(function (item) {
        // TODO: Once all browsers support the hyphenated stats report types, remove
        // the non-hypenated ones
        if (item.type === 'remotecandidate' || item.type === 'remote-candidate') {
          remoteCandidates[item.id] = item
        }
        if (item.type === 'localcandidate' || item.type === 'local-candidate') {
          localCandidates[item.id] = item
        }
        if (item.type === 'candidatepair' || item.type === 'candidate-pair') {
          candidatePairs[item.id] = item
        }
      })

      items.forEach(function (item) {
        // Spec-compliant
        if (item.type === 'transport' && item.selectedCandidatePairId) {
          setSelectedCandidatePair(candidatePairs[item.selectedCandidatePairId])
        }

        // Old implementations
        if (
          (item.type === 'googCandidatePair' && item.googActiveConnection === 'true') ||
          ((item.type === 'candidatepair' || item.type === 'candidate-pair') && item.selected)
        ) {
          setSelectedCandidatePair(item)
        }
      })

      function setSelectedCandidatePair (selectedCandidatePair) {
        foundSelectedCandidatePair = true

        var local = localCandidates[selectedCandidatePair.localCandidateId]

        if (local && local.ip) {
          // Spec
          self.localAddress = local.ip
          self.localPort = Number(local.port)
        } else if (local && local.ipAddress) {
          // Firefox
          self.localAddress = local.ipAddress
          self.localPort = Number(local.portNumber)
        } else if (typeof selectedCandidatePair.googLocalAddress === 'string') {
          // TODO: remove this once Chrome 58 is released
          local = selectedCandidatePair.googLocalAddress.split(':')
          self.localAddress = local[0]
          self.localPort = Number(local[1])
        }

        var remote = remoteCandidates[selectedCandidatePair.remoteCandidateId]

        if (remote && remote.ip) {
          // Spec
          self.remoteAddress = remote.ip
          self.remotePort = Number(remote.port)
        } else if (remote && remote.ipAddress) {
          // Firefox
          self.remoteAddress = remote.ipAddress
          self.remotePort = Number(remote.portNumber)
        } else if (typeof selectedCandidatePair.googRemoteAddress === 'string') {
          // TODO: remove this once Chrome 58 is released
          remote = selectedCandidatePair.googRemoteAddress.split(':')
          self.remoteAddress = remote[0]
          self.remotePort = Number(remote[1])
        }
        self.remoteFamily = 'IPv4'

        self._debug(
          'connect local: %s:%s remote: %s:%s',
          self.localAddress, self.localPort, self.remoteAddress, self.remotePort
        )
      }

      // Ignore candidate pair selection in browsers like Safari 11 that do not have any local or remote candidates
      // But wait until at least 1 candidate pair is available
      if (!foundSelectedCandidatePair && (!Object.keys(candidatePairs).length || Object.keys(localCandidates).length)) {
        setTimeout(findCandidatePair, 100)
        return
      } else {
        self._connecting = false
        self.connected = true
      }

      if (self._chunk) {
        try {
          self.send(self._chunk)
        } catch (err) {
          return self.destroy(makeError(err, 'ERR_DATA_CHANNEL'))
        }
        self._chunk = null
        self._debug('sent chunk from "write before connect"')

        var cb = self._cb
        self._cb = null
        cb(null)
      }

      // If `bufferedAmountLowThreshold` and 'onbufferedamountlow' are unsupported,
      // fallback to using setInterval to implement backpressure.
      if (typeof self._channel.bufferedAmountLowThreshold !== 'number') {
        self._interval = setInterval(function () { self._onInterval() }, 150)
        if (self._interval.unref) self._interval.unref()
      }

      self._debug('connect')
      self.emit('connect')
    })
  }
  findCandidatePair()
}

Peer.prototype._onInterval = function () {
  var self = this
  if (!self._cb || !self._channel || self._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
    return
  }
  self._onChannelBufferedAmountLow()
}

Peer.prototype._onSignalingStateChange = function () {
  var self = this
  if (self.destroyed) return

  if (self._pc.signalingState === 'stable') {
    self._isNegotiating = false

    // HACK: Firefox doesn't yet support removing tracks when signalingState !== 'stable'
    self._debug('flushing sender queue', self._sendersAwaitingStable)
    self._sendersAwaitingStable.forEach(function (sender) {
      self.removeTrack(sender)
      self._queuedNegotiation = true
    })
    self._sendersAwaitingStable = []

    if (self._queuedNegotiation) {
      self._debug('flushing negotiation queue')
      self._queuedNegotiation = false
      self._needsNegotiation() // negotiate again
    }

    self._debug('negotiate')
    self.emit('negotiate')
  }

  self._debug('signalingStateChange %s', self._pc.signalingState)
  self.emit('signalingStateChange', self._pc.signalingState)
}

Peer.prototype._onIceCandidate = function (event) {
  var self = this
  if (self.destroyed) return
  if (event.candidate && self.trickle) {
    self.emit('signal', {
      candidate: {
        candidate: event.candidate.candidate,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid
      }
    })
  } else if (!event.candidate) {
    self._iceComplete = true
    self.emit('_iceComplete')
  }
}

Peer.prototype._onChannelMessage = function (event) {
  var self = this
  if (self.destroyed) return
  var data = event.data
  if (data instanceof ArrayBuffer) data = Buffer.from(data)
  self.push(data)
}

Peer.prototype._onChannelBufferedAmountLow = function () {
  var self = this
  if (self.destroyed || !self._cb) return
  self._debug('ending backpressure: bufferedAmount %d', self._channel.bufferedAmount)
  var cb = self._cb
  self._cb = null
  cb(null)
}

Peer.prototype._onChannelOpen = function () {
  var self = this
  if (self.connected || self.destroyed) return
  self._debug('on channel open')
  self._channelReady = true
  self._maybeReady()
}

Peer.prototype._onChannelClose = function () {
  var self = this
  if (self.destroyed) return
  self._debug('on channel close')
  self.destroy()
}

Peer.prototype._onTrack = function (event) {
  var self = this
  if (self.destroyed) return

  event.streams.forEach(function (eventStream) {
    self._debug('on track')
    self.emit('track', event.track, eventStream)

    self._remoteTracks.push({
      track: event.track,
      stream: eventStream
    })

    if (self._remoteStreams.some(function (remoteStream) {
      return remoteStream.id === eventStream.id
    })) return // Only fire one 'stream' event, even though there may be multiple tracks per stream

    self._remoteStreams.push(eventStream)
    setTimeout(function () {
      self.emit('stream', eventStream) // ensure all tracks have been added
    }, 0)
  })
}

Peer.prototype._debug = function () {
  var self = this
  var args = [].slice.call(arguments)
  args[0] = '[' + self._id + '] ' + args[0]
  debug.apply(null, args)
}

// Transform constraints objects into the new format (unless Chromium)
// TODO: This can be removed when Chromium supports the new format
Peer.prototype._transformConstraints = function (constraints) {
  var self = this

  if (Object.keys(constraints).length === 0) {
    return constraints
  }

  if ((constraints.mandatory || constraints.optional) && !self._isChromium) {
    // convert to new format

    // Merge mandatory and optional objects, prioritizing mandatory
    var newConstraints = Object.assign({}, constraints.optional, constraints.mandatory)

    // fix casing
    if (newConstraints.OfferToReceiveVideo !== undefined) {
      newConstraints.offerToReceiveVideo = newConstraints.OfferToReceiveVideo
      delete newConstraints['OfferToReceiveVideo']
    }

    if (newConstraints.OfferToReceiveAudio !== undefined) {
      newConstraints.offerToReceiveAudio = newConstraints.OfferToReceiveAudio
      delete newConstraints['OfferToReceiveAudio']
    }

    return newConstraints
  } else if (!constraints.mandatory && !constraints.optional && self._isChromium) {
    // convert to old format

    // fix casing
    if (constraints.offerToReceiveVideo !== undefined) {
      constraints.OfferToReceiveVideo = constraints.offerToReceiveVideo
      delete constraints['offerToReceiveVideo']
    }

    if (constraints.offerToReceiveAudio !== undefined) {
      constraints.OfferToReceiveAudio = constraints.offerToReceiveAudio
      delete constraints['offerToReceiveAudio']
    }

    return {
      mandatory: constraints // NOTE: All constraints are upgraded to mandatory
    }
  }

  return constraints
}

function makeError (message, code) {
  var err = new Error(message)
  err.code = code
  return err
}

function noop () {}
  })();
});

require.register("simple-peer/node_modules/debug/src/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "simple-peer/node_modules/debug");
  (function() {
    /**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
  })();
});

require.register("simple-peer/node_modules/debug/src/debug.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "simple-peer/node_modules/debug");
  (function() {
    /**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
  })();
});

require.register("string_decoder/lib/string_decoder.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "string_decoder");
  var _Buffer = require('buffer'); var Buffer = _Buffer && _Buffer.Buffer;
(function() {
    'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
  })();
});

require.register("util-deprecate/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "util-deprecate");
  (function() {
    /**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}
  })();
});
require.register("js/app.js", function(exports, require, module) {
"use strict";

require("phoenix_html");

var _video = require("./video");

var _video2 = _interopRequireDefault(_video);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

});

;require.register("js/bundle.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _phoenix = require("phoenix");

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var socket = new _phoenix.Socket("/socket", { params: { id: window.current_user_id } });

socket.connect();
var channelCornerId = window.channelCornerId;
var userid = window.current_user_id;
var presences = {};
var init;
var offers = [];
var lps = [];
var rps = [];
var localStream;
var video1 = document.querySelector('#one');
var video2 = document.querySelector('#two');
var video3 = document.querySelector('#three');

var servers = {
  "iceServers": [{
    "url": "stun:stun.example.org"
  }]
};

function gotMedia(stream) {
  var _ref, _ref2, _ref3;

  localStream = stream;
  var L1 = new SimplePeer((_ref = { initiator: true, trickle: false, stream: stream }, _defineProperty(_ref, "trickle", false), _defineProperty(_ref, "offerConstraints", { offerToReceiveAudio: true, offerToReceiveVideo: false }), _ref));
  var L2 = new SimplePeer((_ref2 = { initiator: true, trickle: false, stream: stream }, _defineProperty(_ref2, "trickle", false), _defineProperty(_ref2, "offerConstraints", { offerToReceiveAudio: true, offerToReceiveVideo: false }), _ref2));
  var L3 = new SimplePeer((_ref3 = { initiator: true, trickle: false, stream: stream }, _defineProperty(_ref3, "trickle", false), _defineProperty(_ref3, "offerConstraints", { offerToReceiveAudio: true, offerToReceiveVideo: false }), _ref3));

  lps = [L1, L2, L3];

  L1.on('signal', function (data) {
    console.log(data);
    offers[0] = data;
  });

  L2.on('signal', function (data) {
    console.log(data);
    offers[1] = data;
  });

  L3.on('signal', function (data) {
    console.log(data);
    offers[2] = data;
  });
}

// Now that you are connected, you can join channels with a topic:

if (channelCornerId) {

  // Now that you are connected, you can join channels with a topic:
  var corner_channel = socket.channel("webrtc:", { user_id: window.current_user_id });
  var private_channel = socket.channel("private:" + userid);

  corner_channel.join().receive("ok", function (resp) {
    console.log("Joined successfully", resp);
  }).receive("error", function (resp) {
    console.log("Unable to join", resp);
  });

  private_channel.join().receive("ok", function (resp) {
    console.log("Joined successfully", resp);
  }).receive("error", function (resp) {
    console.log("Unable to join", resp);
  });

  private_channel.on("offer", function (message) {
    console.log('This works');
    getAnswer(message);
  });

  private_channel.on("answer", function (message) {
    console.log('This works');
    setAnswer(message);
  });

  corner_channel.on("corner:" + channelCornerId + ":new_message", function (message) {
    console.log("message", message);
    renderMessage(message);
  });

  corner_channel.on("presence_state", function (state) {

    presences = _phoenix.Presence.syncState(presences, state);
    console.log(state);
    var result = Object.values(presences);

    //console.log(result);
    for (var i = 0; i < Object.keys(result).length; i++) {
      var rez = result[i].metas[0].user_id;
      userid = parseInt(userid, 10);
      if (rez === userid) {
        init = result[i].metas[0].initiator;

        console.log('This users init ' + init);
        break;
      }
    };

    //console.log('peers: \n' + peers + '\npeers');
    renderOnlineUsers(state);
  });

  var setAnswer = function setAnswer(msg) {
    console.log("The local peers");
    console.log(lps);
    console.log("The remote peers");
    console.log(rps);
    switch (msg.peer) {
      case 0:
        console.log("Answer 1 applied");
        lps[0].signal(JSON.parse(msg.message));
        break;
      case 1:
        console.log("Answer 2 applied");
        lps[1].signal(JSON.parse(msg.message));
        break;
      case 2:
        console.log("Answer 3 applied");
        lps[2].signal(JSON.parse(msg.message));
        break;
      default:
        console.log("Answer X applied");
        break;
    }

    lps[0].on('connect', function () {
      console.log('CONNECT');
      //console.log('whatever' + Math.random())
      //rps[0].send('data' + Math.random());
    });

    lps[1].on('connect', function () {
      console.log('CONNECT');
      console.log('whatever' + Math.random());
      //rps[1].send('data' + Math.random());
    });

    lps[2].on('connect', function () {
      console.log('CONNECT');
      console.log('whatever' + Math.random());
      //rps[2].send('data' + Math.random());
    });
  };

  var getAnswer = function getAnswer(msg) {
    var _ref4, _ref5, _ref6;

    var R1 = new SimplePeer((_ref4 = { initiator: false, trickle: false, stream: localStream }, _defineProperty(_ref4, "trickle", false), _defineProperty(_ref4, "answerConstraints", { offerToReceiveAudio: true, offerToReceiveVideo: false }), _ref4));
    var R2 = new SimplePeer((_ref5 = { initiator: false, trickle: false, stream: localStream }, _defineProperty(_ref5, "trickle", false), _defineProperty(_ref5, "answerConstraints", { offerToReceiveAudio: true, offerToReceiveVideo: false }), _ref5));
    var R3 = new SimplePeer((_ref6 = { initiator: false, trickle: false, stream: localStream }, _defineProperty(_ref6, "trickle", false), _defineProperty(_ref6, "answerConstraints", { offerToReceiveAudio: true, offerToReceiveVideo: false }), _ref6));

    rps = [R1, R2, R3];

    switch (msg.init) {
      case 1:
        R1.signal(JSON.parse(msg.message));
        break;
      case 2:
        R2.signal(JSON.parse(msg.message));
        break;
      case 3:
        R3.signal(JSON.parse(msg.message));
        break;
      default:
        console.log('There is some problem');
        break;
    }

    R1.on('signal', function (data) {
      console.log(data);
      var message = JSON.stringify(data);
      private_channel.push('answer', { message: message, peer: msg.peer, recipient: msg.recipient, sender: msg.sender });
    });

    R2.on('signal', function (data) {
      console.log(data);
      var message = JSON.stringify(data);
      private_channel.push('answer', { message: message, peer: msg.peer, recipient: msg.recipient, sender: msg.sender });
    });

    R3.on('signal', function (data) {
      console.log(data);
      var message = JSON.stringify(data);
      private_channel.push('answer', { message: message, peer: msg.peer, recipient: msg.recipient, sender: msg.sender });
    });
  };

  document.querySelector('.connect').addEventListener('click', function (ev) {
    console.log('clicked');
    ev.preventDefault();

    navigator.getUserMedia({ video: false, audio: true }, gotMedia, function () {});

    console.log('peer offers : \n');
    //console.log(offers);
  });

  document.querySelector('.call').addEventListener('click', function (ev) {
    console.log('clicked');
    ev.preventDefault();

    var result = Object.values(presences);
    for (var i = init - 1, n = 0; i < Object.keys(result).length; i++) {
      var rec = result[Object.keys(result).length - i - 1].metas[0].user_id;
      userid = parseInt(userid, 10);
      console.log('This ' + i);
      if (rec != userid) {
        //var signal = peers[rez-1];
        //console.log('This signal ' + signal);

        console.log(offers[n]);
        var message = JSON.stringify(offers[n]);
        console.log(message);
        private_channel.push('offer', { message: message, peer: n, init: init, recipient: rec, sender: userid });
        n++;
      };
    };
  });

  var renderOnlineUsers = function renderOnlineUsers(presences) {
    var onlineUsers = _phoenix.Presence.list(presences, function (_id, _ref7) {
      var _ref7$metas = _toArray(_ref7.metas),
          user = _ref7$metas[0],
          rest = _ref7$metas.slice(1);

      return onlineUserTemplate(user);
    }).join("");
    //console.log(presences)
    document.querySelector("#online-users").innerHTML = onlineUsers;
  };

  var onlineUserTemplate = function onlineUserTemplate(user) {
    return "\n    <div id=\"online-user-" + user.user_id + "\">\n      <strong class=\"text-secondary\">" + user.username + ":" + user.initiator + "</strong>\n    </div>\n  ";
  };
};

exports.default = socket;

});

require.register("js/regular_webrtc.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _phoenix = require("phoenix");

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var socket = new _phoenix.Socket("/socket", { params: { id: window.current_user_id } });

socket.connect();
var channelCornerId = window.channelCornerId;
var userid = window.current_user_id;
var presences = {};
var init;
var peersOffers = [];
var peersAnswers = [];
var peersIce = [];
var localStream = void 0;
var localVideo = document.querySelector('#localVideo');
var video1 = document.querySelector('#one');
var video2 = document.querySelector('#two');
var video3 = document.querySelector('#three');

var servers = {
  "iceServers": [{
    "url": "stun:stun.stunprotocol.org"
  }]
};

var pc1 = new RTCPeerConnection(servers);
var pc2 = new RTCPeerConnection(servers);
var pc3 = new RTCPeerConnection(servers);

// Now that you are connected, you can join channels with a topic:

if (channelCornerId) {

  // Now that you are connected, you can join channels with a topic:
  var corner_channel = socket.channel("webrtc:", { user_id: window.current_user_id });
  var private_channel = socket.channel("private:" + userid);

  corner_channel.join().receive("ok", function (resp) {
    console.log("Joined successfully", resp);
  }).receive("error", function (resp) {
    console.log("Unable to join", resp);
  });

  private_channel.join().receive("ok", function (resp) {
    console.log("Joined successfully", resp);
  }).receive("error", function (resp) {
    console.log("Unable to join", resp);
  });

  private_channel.on("offer", function (message) {
    console.log('it works');
    console.log(message);
    getAnswer(message);
  });

  private_channel.on("answer", function (message) {
    console.log('it works too :)');
    console.log(message);
    takeAnswer(message);
  });

  private_channel.on("ice_offer", function (message) {
    console.log('ICE offer works too :)');
    console.log(message);
    takeIceCandidate(message.init, message, false);
  });

  private_channel.on("ice_answer", function (message) {
    console.log('ICE answer works too :)');
    console.log(message);
    takeIceCandidate(message.peer, message, true);
  });

  corner_channel.on("corner:" + channelCornerId + ":new_message", function (message) {
    console.log("message", message);
    renderMessage(message);
  });

  pc1.onicecandidate = function (event) {
    console.log("ICE CANDIDATE 1");
    if (event.candidate) {
      peersIce[0] = event.candidate;
    }
  };

  pc2.onicecandidate = function (event) {
    console.log("ICE CANDIDATE 2");
    if (event.candidate) {
      peersIce[1] = event.candidate;
    }
  };

  pc3.onicecandidate = function (event) {
    console.log("ICE CANDIDATE 3");
    if (event.candidate) {
      peersIce[2] = event.candidate;
    }
  };

  var takeIceCandidate = function takeIceCandidate(target, msg, type) {
    //console.log(peersIce);
    //console.log('ice 0 ' + peersIce[0]);
    //console.log('ice 1 ' + peersIce[1]);
    //console.log('ice 2 ' + peersIce[2]);
    switch (target) {
      case 1:
        console.log('This is peer 1 ice candidate ' + msg.message);
        var candidate = new RTCIceCandidate(msg.message);
        pc1.addIceCandidate(candidate);
        //console.log('This is what the ice candidate looks like : ');
        //console.log(Object.keys(peersIce[msg.peer]));
        //console.log(Object.values(peersIce[msg.peer]));
        if (type == false) {
          private_channel.push('ice_answer', { message: peersIce[msg.peer], peer: msg.peer, recipient: userid, sender: msg.sender });
        }
        break;
      case 2:
        console.log(msg.message);
        var candidate = new RTCIceCandidate(msg.message);
        pc2.addIceCandidate(candidate);
        if (type == false) {
          private_channel.push('ice_answer', { message: peersIce[msg.peer], peer: msg.peer, recipient: userid, sender: msg.sender });
        }
        break;
      case 3:
        console.log(msg.message);
        console.log(peersIce[msg.peer]);
        var candidate = new RTCIceCandidate(msg.message);
        pc3.addIceCandidate(candidate);
        if (type == false) {
          private_channel.push('ice_answer', { message: peersIce[msg.peer], peer: msg.peer, recipient: userid, sender: msg.sender });
        }
        break;
      default:
        console.log('This does not work \n');
        break;
    };
  };

  var takeAnswer = function takeAnswer(msg) {
    switch (msg.peer) {
      case 1:
        //console.log(Object.values(msg));
        //console.log(Object.keys(msg));
        console.log("This works 5 " + msg.message);
        pc1.setRemoteDescription(msg.message);
        break;
      case 2:
        console.log("This works 6 " + msg.message);
        pc2.setRemoteDescription(msg.message);
        break;
      case 3:
        console.log("This works 7 " + msg.message);
        pc3.setRemoteDescription(msg.message);
        break;
      default:
        console.log('This does not work \n');
        break;
    };
  };

  var getAnswer = function getAnswer(msg) {
    switch (msg.init) {
      case 1:
        console.log(Object.values(msg));
        console.log(Object.keys(msg));
        console.log(msg.message);
        var desc = new RTCSessionDescription(msg.message);
        pc1.setRemoteDescription(desc);
        pc1.createAnswer().then(function (answer) {
          console.log('Peers 1 : \n');
          console.log(answer);
          //console.log(peersOffers[0]);
          return pc1.setLocalDescription(answer);
        }).then(function () {
          console.log('Send Peers 1 : \n');
          private_channel.push('answer', { message: pc1.localDescription, peer: msg.peer, recipient: userid, sender: msg.sender });
        });
        break;
      case 2:
        var desc = new RTCSessionDescription(msg.message);
        pc2.setRemoteDescription(desc);
        pc2.createAnswer().then(function (answer) {
          console.log('Peers 1 : \n');
          console.log(answer);
          //console.log(peersOffers[0]);
          return pc2.setLocalDescription(answer);
        }).then(function () {
          console.log('Send Peers 2 : \n');
          private_channel.push('answer', { message: pc2.localDescription, peer: msg.peer, recipient: userid, sender: msg.sender });
        });
        break;
      case 3:
        var desc = new RTCSessionDescription(msg.message);
        pc3.setRemoteDescription(desc);
        pc3.createAnswer().then(function (answer) {
          console.log('Peers 1 : \n');
          console.log(answer);
          //console.log(peersOffers[0]);
          return pc3.setLocalDescription(answer);
        }).then(function () {
          console.log('Send Peers 3 : \n');
          private_channel.push('answer', { message: pc3.localDescription, peer: msg.peer, recipient: userid, sender: msg.sender });
        });
        break;
      default:
        console.log('This does not work \n');
        break;
    };
  };

  var createOffers = function createOffers(init) {
    peersOffers = [];
    switch (init) {
      case 1:
        pc1.createOffer().then(function (offer) {
          console.log('Peers 1 : \n');
          console.log(offer);
          //peersOffers.push(offer.sdp);
          //console.log(peersOffers[0]);
          pc1.setLocalDescription(offer);
        }).then(function () {
          console.log('Send Peers 1 : \n');
          peersOffers.push(pc1.localDescription);
        });

      case 2:
        pc2.createOffer().then(function (offer) {
          console.log('Peers 2 : \n');
          console.log(offer);
          //peersOffers.push(offer.sdp);
          pc2.setLocalDescription(offer);
        }).then(function () {
          console.log('Send Peers 2 : \n');
          peersOffers.push(pc2.localDescription);
        });

      case 3:
        pc3.createOffer().then(function (offer) {
          console.log('Peers 3 : \n');
          console.log(offer);
          //peersOffers.push(offer.sdp);
          pc3.setLocalDescription(offer);
        }).then(function () {
          console.log('Send Peers 3 : \n');
          peersOffers.push(pc3.localDescription);
        });
        break;
      default:
        console.log('This does not work \n');
        break;
    };
    return true;
  };

  corner_channel.on("presence_state", function (state) {

    presences = _phoenix.Presence.syncState(presences, state);
    console.log(state);
    var result = Object.values(presences);

    //console.log(result);
    for (var i = 0; i < Object.keys(result).length; i++) {
      var rez = result[i].metas[0].user_id;
      userid = parseInt(userid, 10);
      if (rez === userid) {
        init = result[i].metas[0].initiator;

        console.log('This users init ' + init);
        //createOffers(init);
        console.log('Done');
        break;
      }
    };

    //console.log('peers: \n' + peers + '\npeers');
    renderOnlineUsers(state);
  });

  /*corner_channel.on("presence_diff", diff => {
    private_channel.push('update', {message: "Hi"});
    //presences = Presence.syncDiff(presences, diff)
    //console.log(diff)
    //console.log(presences)
    //renderOnlineUsers(state)
  });*/

  document.querySelector('.connect').addEventListener('click', function (ev) {

    console.log('clicked');
    ev.preventDefault();

    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (localStream) {
      localVideo.srcObject = localStream;
      localStream.getTracks().forEach(function (track) {
        return pc1.addTrack(track, localStream);
      });
      localStream.getTracks().forEach(function (track) {
        return pc2.addTrack(track, localStream);
      });
      localStream.getTracks().forEach(function (track) {
        return pc3.addTrack(track, localStream);
      });
    }).then(function () {
      createOffers(init);
    });

    console.log('peer offers : \n');
    console.log(peersOffers);
    var result = Object.values(presences);
    for (var i = init - 1, n = 0; i < Object.keys(result).length; i++) {
      var rec = result[Object.keys(result).length - i - 1].metas[0].user_id;
      userid = parseInt(userid, 10);
      console.log('This ' + i);
      if (rec != userid) {
        //var signal = peers[rez-1];
        //console.log('This signal ' + signal);

        //console.log(peersOffers);
        var message = peersOffers[n];
        n++;
        private_channel.push('offer', { message: message, peer: n, init: init, recipient: rec, sender: userid });
      };
    };
  });

  document.querySelector('.call').addEventListener('click', function (ev) {
    ev.preventDefault();
    console.log(peersIce);

    var result = Object.values(presences);
    for (var i = init - 1, n = 0; i < Object.keys(result).length; i++) {
      var rec = result[Object.keys(result).length - i - 1].metas[0].user_id;
      userid = parseInt(userid, 10);
      console.log('This ice ' + i);
      console.log('This ice ' + message);
      if (rec != userid) {
        //var signal = peers[rez-1];
        //console.log('This signal ' + signal);

        //console.log(peersOffers);
        var message = peersIce[n];
        n++;
        private_channel.push('ice_offer', { message: message, peer: n, init: init, recipient: rec, sender: userid });
      };
    };
  });

  var renderOnlineUsers = function renderOnlineUsers(presences) {
    var onlineUsers = _phoenix.Presence.list(presences, function (_id, _ref) {
      var _ref$metas = _toArray(_ref.metas),
          user = _ref$metas[0],
          rest = _ref$metas.slice(1);

      return onlineUserTemplate(user);
    }).join("");
    //console.log(presences)
    document.querySelector("#online-users").innerHTML = onlineUsers;
  };

  var onlineUserTemplate = function onlineUserTemplate(user) {
    return "\n    <div id=\"online-user-" + user.user_id + "\">\n      <strong class=\"text-secondary\">" + user.username + ":" + user.initiator + "</strong>\n    </div>\n  ";
  };
};

pc1.ontrack = function (event) {
  console.log("Track 1" + event.streams[0]);
  console.log(Object.values(event.streams[0]));
  video1.srcObject = event.streams[0];
};

pc2.ontrack = function (event) {
  console.log("Track  2" + event.streams[0]);
  console.log(Object.values(event.streams[0]));
  video2.srcObject = event.streams[0];
};

pc3.ontrack = function (event) {
  console.log("Track  3" + event.streams[0]);
  console.log(Object.values(event.streams[0]));
  video3.srcObject = event.streams[0];
};

exports.default = socket;

});

require.register("js/simplepeer.min.js", function(exports, require, module) {
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (e) {
  if ("object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module) module.exports = e();else if ("function" == typeof define && define.amd) define([], e);else {
    var t;t = "undefined" == typeof window ? "undefined" == typeof global ? "undefined" == typeof self ? this : self : global : window, t.SimplePeer = e();
  }
})(function () {
  var t = Math.floor,
      n = Math.abs,
      r = Math.pow;return function () {
    function d(s, e, n) {
      function t(o, i) {
        if (!e[o]) {
          if (!s[o]) {
            var l = "function" == typeof require && require;if (!i && l) return l(o, !0);if (r) return r(o, !0);var c = new Error("Cannot find module '" + o + "'");throw c.code = "MODULE_NOT_FOUND", c;
          }var a = e[o] = { exports: {} };s[o][0].call(a.exports, function (e) {
            var r = s[o][1][e];return t(r || e);
          }, a, a.exports, d, s, e, n);
        }return e[o].exports;
      }for (var r = "function" == typeof require && require, o = 0; o < n.length; o++) {
        t(n[o]);
      }return t;
    }return d;
  }()({ 1: [function (e, t, n) {
      "use strict";
      function r(e) {
        var t = e.length;if (0 < t % 4) throw new Error("Invalid string. Length must be a multiple of 4");var n = e.indexOf("=");-1 === n && (n = t);var r = n === t ? 0 : 4 - n % 4;return [n, r];
      }function o(e, t, n) {
        return 3 * (t + n) / 4 - n;
      }function a(e) {
        for (var t, n = r(e), a = n[0], d = n[1], s = new u(o(e, a, d)), l = 0, c = 0 < d ? a - 4 : a, f = 0; f < c; f += 4) {
          t = p[e.charCodeAt(f)] << 18 | p[e.charCodeAt(f + 1)] << 12 | p[e.charCodeAt(f + 2)] << 6 | p[e.charCodeAt(f + 3)], s[l++] = 255 & t >> 16, s[l++] = 255 & t >> 8, s[l++] = 255 & t;
        }return 2 === d && (t = p[e.charCodeAt(f)] << 2 | p[e.charCodeAt(f + 1)] >> 4, s[l++] = 255 & t), 1 === d && (t = p[e.charCodeAt(f)] << 10 | p[e.charCodeAt(f + 1)] << 4 | p[e.charCodeAt(f + 2)] >> 2, s[l++] = 255 & t >> 8, s[l++] = 255 & t), s;
      }function d(e) {
        return c[63 & e >> 18] + c[63 & e >> 12] + c[63 & e >> 6] + c[63 & e];
      }function s(e, t, n) {
        for (var r, o = [], a = t; a < n; a += 3) {
          r = (16711680 & e[a] << 16) + (65280 & e[a + 1] << 8) + (255 & e[a + 2]), o.push(d(r));
        }return o.join("");
      }function l(e) {
        for (var t, n = e.length, r = n % 3, o = [], a = 16383, d = 0, l = n - r; d < l; d += a) {
          o.push(s(e, d, d + a > l ? l : d + a));
        }return 1 === r ? (t = e[n - 1], o.push(c[t >> 2] + c[63 & t << 4] + "==")) : 2 === r && (t = (e[n - 2] << 8) + e[n - 1], o.push(c[t >> 10] + c[63 & t >> 4] + c[63 & t << 2] + "=")), o.join("");
      }n.byteLength = function (e) {
        var t = r(e),
            n = t[0],
            o = t[1];return 3 * (n + o) / 4 - o;
      }, n.toByteArray = a, n.fromByteArray = l;for (var c = [], p = [], u = "undefined" == typeof Uint8Array ? Array : Uint8Array, f = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", g = 0, h = f.length; g < h; ++g) {
        c[g] = f[g], p[f.charCodeAt(g)] = g;
      }p[45] = 62, p[95] = 63;
    }, {}], 2: [function () {}, {}], 3: [function (e, t, n) {
      "use strict";
      function o(e) {
        if (2147483647 < e) throw new RangeError("Invalid typed array length");var t = new Uint8Array(e);return t.__proto__ = d.prototype, t;
      }function d(e, t, n) {
        if ("number" == typeof e) {
          if ("string" == typeof t) throw new Error("If encoding is specified then the first argument must be a string");return l(e);
        }return a(e, t, n);
      }function a(e, t, n) {
        if ("number" == typeof e) throw new TypeError("\"value\" argument must not be a number");return V(e) || e && V(e.buffer) ? u(e, t, n) : "string" == typeof e ? c(e, t) : f(e);
      }function i(e) {
        if ("number" != typeof e) throw new TypeError("\"size\" argument must be of type number");else if (0 > e) throw new RangeError("\"size\" argument must not be negative");
      }function s(e, t, n) {
        return i(e), 0 >= e ? o(e) : void 0 === t ? o(e) : "string" == typeof n ? o(e).fill(t, n) : o(e).fill(t);
      }function l(e) {
        return i(e), o(0 > e ? 0 : 0 | g(e));
      }function c(e, t) {
        if (("string" != typeof t || "" === t) && (t = "utf8"), !d.isEncoding(t)) throw new TypeError("Unknown encoding: " + t);var n = 0 | h(e, t),
            r = o(n),
            a = r.write(e, t);return a !== n && (r = r.slice(0, a)), r;
      }function p(e) {
        for (var t = 0 > e.length ? 0 : 0 | g(e.length), n = o(t), r = 0; r < t; r += 1) {
          n[r] = 255 & e[r];
        }return n;
      }function u(e, t, n) {
        if (0 > t || e.byteLength < t) throw new RangeError("\"offset\" is outside of buffer bounds");if (e.byteLength < t + (n || 0)) throw new RangeError("\"length\" is outside of buffer bounds");var r;return r = void 0 === t && void 0 === n ? new Uint8Array(e) : void 0 === n ? new Uint8Array(e, t) : new Uint8Array(e, t, n), r.__proto__ = d.prototype, r;
      }function f(e) {
        if (d.isBuffer(e)) {
          var t = 0 | g(e.length),
              n = o(t);return 0 === n.length ? n : (e.copy(n, 0, 0, t), n);
        }if (e) {
          if (ArrayBuffer.isView(e) || "length" in e) return "number" != typeof e.length || G(e.length) ? o(0) : p(e);if ("Buffer" === e.type && Array.isArray(e.data)) return p(e.data);
        }throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.");
      }function g(e) {
        if (e >= 2147483647) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + 2147483647 .toString(16) + " bytes");return 0 | e;
      }function h(e, t) {
        if (d.isBuffer(e)) return e.length;if (ArrayBuffer.isView(e) || V(e)) return e.byteLength;"string" != typeof e && (e = "" + e);var n = e.length;if (0 === n) return 0;for (var r = !1;;) {
          switch (t) {case "ascii":case "latin1":case "binary":
              return n;case "utf8":case "utf-8":case void 0:
              return U(e).length;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
              return 2 * n;case "hex":
              return n >>> 1;case "base64":
              return H(e).length;default:
              if (r) return U(e).length;t = ("" + t).toLowerCase(), r = !0;}
        }
      }function m(e, t, n) {
        var r = !1;if ((void 0 === t || 0 > t) && (t = 0), t > this.length) return "";if ((void 0 === n || n > this.length) && (n = this.length), 0 >= n) return "";if (n >>>= 0, t >>>= 0, n <= t) return "";for (e || (e = "utf8");;) {
          switch (e) {case "hex":
              return I(this, t, n);case "utf8":case "utf-8":
              return T(this, t, n);case "ascii":
              return A(this, t, n);case "latin1":case "binary":
              return L(this, t, n);case "base64":
              return k(this, t, n);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
              return B(this, t, n);default:
              if (r) throw new TypeError("Unknown encoding: " + e);e = (e + "").toLowerCase(), r = !0;}
        }
      }function _(e, t, n) {
        var r = e[t];e[t] = e[n], e[n] = r;
      }function b(e, t, n, r, o) {
        if (0 === e.length) return -1;if ("string" == typeof n ? (r = n, n = 0) : 2147483647 < n ? n = 2147483647 : -2147483648 > n && (n = -2147483648), n = +n, G(n) && (n = o ? 0 : e.length - 1), 0 > n && (n = e.length + n), n >= e.length) {
          if (o) return -1;n = e.length - 1;
        } else if (0 > n) if (o) n = 0;else return -1;if ("string" == typeof t && (t = d.from(t, r)), d.isBuffer(t)) return 0 === t.length ? -1 : y(e, t, n, r, o);if ("number" == typeof t) return t &= 255, "function" == typeof Uint8Array.prototype.indexOf ? o ? Uint8Array.prototype.indexOf.call(e, t, n) : Uint8Array.prototype.lastIndexOf.call(e, t, n) : y(e, [t], n, r, o);throw new TypeError("val must be string, number or Buffer");
      }function y(e, t, n, r, o) {
        function a(e, t) {
          return 1 === d ? e[t] : e.readUInt16BE(t * d);
        }var d = 1,
            s = e.length,
            l = t.length;if (void 0 !== r && (r = (r + "").toLowerCase(), "ucs2" === r || "ucs-2" === r || "utf16le" === r || "utf-16le" === r)) {
          if (2 > e.length || 2 > t.length) return -1;d = 2, s /= 2, l /= 2, n /= 2;
        }var c;if (o) {
          var p = -1;for (c = n; c < s; c++) {
            if (a(e, c) !== a(t, -1 === p ? 0 : c - p)) -1 !== p && (c -= c - p), p = -1;else if (-1 === p && (p = c), c - p + 1 === l) return p * d;
          }
        } else for (n + l > s && (n = s - l), c = n; 0 <= c; c--) {
          for (var u = !0, f = 0; f < l; f++) {
            if (a(e, c + f) !== a(t, f)) {
              u = !1;break;
            }
          }if (u) return c;
        }return -1;
      }function C(e, t, n, r) {
        n = +n || 0;var o = e.length - n;r ? (r = +r, r > o && (r = o)) : r = o;var a = t.length;r > a / 2 && (r = a / 2);for (var d, s = 0; s < r; ++s) {
          if (d = parseInt(t.substr(2 * s, 2), 16), G(d)) return s;e[n + s] = d;
        }return s;
      }function w(e, t, n, r) {
        return z(U(t, e.length - n), e, n, r);
      }function S(e, t, n, r) {
        return z(W(t), e, n, r);
      }function v(e, t, n, r) {
        return S(e, t, n, r);
      }function x(e, t, n, r) {
        return z(H(t), e, n, r);
      }function R(e, t, n, r) {
        return z(q(t, e.length - n), e, n, r);
      }function k(e, t, n) {
        return 0 === t && n === e.length ? J.fromByteArray(e) : J.fromByteArray(e.slice(t, n));
      }function T(e, t, n) {
        n = X(e.length, n);for (var r = [], o = t; o < n;) {
          var a = e[o],
              d = null,
              s = 239 < a ? 4 : 223 < a ? 3 : 191 < a ? 2 : 1;if (o + s <= n) {
            var l, c, p, u;1 === s ? 128 > a && (d = a) : 2 === s ? (l = e[o + 1], 128 == (192 & l) && (u = (31 & a) << 6 | 63 & l, 127 < u && (d = u))) : 3 === s ? (l = e[o + 1], c = e[o + 2], 128 == (192 & l) && 128 == (192 & c) && (u = (15 & a) << 12 | (63 & l) << 6 | 63 & c, 2047 < u && (55296 > u || 57343 < u) && (d = u))) : 4 === s ? (l = e[o + 1], c = e[o + 2], p = e[o + 3], 128 == (192 & l) && 128 == (192 & c) && 128 == (192 & p) && (u = (15 & a) << 18 | (63 & l) << 12 | (63 & c) << 6 | 63 & p, 65535 < u && 1114112 > u && (d = u))) : void 0;
          }null === d ? (d = 65533, s = 1) : 65535 < d && (d -= 65536, r.push(55296 | 1023 & d >>> 10), d = 56320 | 1023 & d), r.push(d), o += s;
        }return E(r);
      }function E(e) {
        var t = e.length;if (t <= 4096) return Y.apply(String, e);for (var n = "", r = 0; r < t;) {
          n += Y.apply(String, e.slice(r, r += 4096));
        }return n;
      }function A(e, t, n) {
        var r = "";n = X(e.length, n);for (var o = t; o < n; ++o) {
          r += Y(127 & e[o]);
        }return r;
      }function L(e, t, n) {
        var r = "";n = X(e.length, n);for (var o = t; o < n; ++o) {
          r += Y(e[o]);
        }return r;
      }function I(e, t, n) {
        var r = e.length;(!t || 0 > t) && (t = 0), (!n || 0 > n || n > r) && (n = r);for (var o = "", a = t; a < n; ++a) {
          o += O(e[a]);
        }return o;
      }function B(e, t, n) {
        for (var r = e.slice(t, n), o = "", a = 0; a < r.length; a += 2) {
          o += Y(r[a] + 256 * r[a + 1]);
        }return o;
      }function F(e, t, n) {
        if (0 != e % 1 || 0 > e) throw new RangeError("offset is not uint");if (e + t > n) throw new RangeError("Trying to access beyond buffer length");
      }function N(e, t, n, r, o, a) {
        if (!d.isBuffer(e)) throw new TypeError("\"buffer\" argument must be a Buffer instance");if (t > o || t < a) throw new RangeError("\"value\" argument is out of bounds");if (n + r > e.length) throw new RangeError("Index out of range");
      }function M(e, t, n, r) {
        if (n + r > e.length) throw new RangeError("Index out of range");if (0 > n) throw new RangeError("Index out of range");
      }function D(e, t, n, r, o) {
        return t = +t, n >>>= 0, o || M(e, t, n, 4, 34028234663852886e22, -34028234663852886e22), $.write(e, t, n, r, 23, 4), n + 4;
      }function P(e, t, n, r, o) {
        return t = +t, n >>>= 0, o || M(e, t, n, 8, 17976931348623157e292, -17976931348623157e292), $.write(e, t, n, r, 52, 8), n + 8;
      }function j(e) {
        if (e = e.split("=")[0], e = e.trim().replace(K, ""), 2 > e.length) return "";for (; 0 != e.length % 4;) {
          e += "=";
        }return e;
      }function O(e) {
        return 16 > e ? "0" + e.toString(16) : e.toString(16);
      }function U(e, t) {
        t = t || 1 / 0;for (var n, r = e.length, o = null, a = [], d = 0; d < r; ++d) {
          if (n = e.charCodeAt(d), 55295 < n && 57344 > n) {
            if (!o) {
              if (56319 < n) {
                -1 < (t -= 3) && a.push(239, 191, 189);continue;
              } else if (d + 1 === r) {
                -1 < (t -= 3) && a.push(239, 191, 189);continue;
              }o = n;continue;
            }if (56320 > n) {
              -1 < (t -= 3) && a.push(239, 191, 189), o = n;continue;
            }n = (o - 55296 << 10 | n - 56320) + 65536;
          } else o && -1 < (t -= 3) && a.push(239, 191, 189);if (o = null, 128 > n) {
            if (0 > (t -= 1)) break;a.push(n);
          } else if (2048 > n) {
            if (0 > (t -= 2)) break;a.push(192 | n >> 6, 128 | 63 & n);
          } else if (65536 > n) {
            if (0 > (t -= 3)) break;a.push(224 | n >> 12, 128 | 63 & n >> 6, 128 | 63 & n);
          } else if (1114112 > n) {
            if (0 > (t -= 4)) break;a.push(240 | n >> 18, 128 | 63 & n >> 12, 128 | 63 & n >> 6, 128 | 63 & n);
          } else throw new Error("Invalid code point");
        }return a;
      }function W(e) {
        for (var t = [], n = 0; n < e.length; ++n) {
          t.push(255 & e.charCodeAt(n));
        }return t;
      }function q(e, t) {
        for (var n, r, o, a = [], d = 0; d < e.length && !(0 > (t -= 2)); ++d) {
          n = e.charCodeAt(d), r = n >> 8, o = n % 256, a.push(o), a.push(r);
        }return a;
      }function H(e) {
        return J.toByteArray(j(e));
      }function z(e, t, n, r) {
        for (var o = 0; o < r && !(o + n >= t.length || o >= e.length); ++o) {
          t[o + n] = e[o];
        }return o;
      }function V(e) {
        return e instanceof ArrayBuffer || null != e && null != e.constructor && "ArrayBuffer" === e.constructor.name && "number" == typeof e.byteLength;
      }function G(e) {
        return e !== e;
      }var Y = String.fromCharCode,
          X = Math.min,
          J = e("base64-js"),
          $ = e("ieee754");n.Buffer = d, n.SlowBuffer = function (e) {
        return +e != e && (e = 0), d.alloc(+e);
      }, n.INSPECT_MAX_BYTES = 50;n.kMaxLength = 2147483647, d.TYPED_ARRAY_SUPPORT = function () {
        try {
          var e = new Uint8Array(1);return e.__proto__ = { __proto__: Uint8Array.prototype, foo: function foo() {
              return 42;
            } }, 42 === e.foo();
        } catch (t) {
          return !1;
        }
      }(), d.TYPED_ARRAY_SUPPORT || "undefined" == typeof console || "function" != typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), Object.defineProperty(d.prototype, "parent", { get: function get() {
          return this instanceof d ? this.buffer : void 0;
        } }), Object.defineProperty(d.prototype, "offset", { get: function get() {
          return this instanceof d ? this.byteOffset : void 0;
        } }), "undefined" != typeof Symbol && Symbol.species && d[Symbol.species] === d && Object.defineProperty(d, Symbol.species, { value: null, configurable: !0, enumerable: !1, writable: !1 }), d.poolSize = 8192, d.from = function (e, t, n) {
        return a(e, t, n);
      }, d.prototype.__proto__ = Uint8Array.prototype, d.__proto__ = Uint8Array, d.alloc = function (e, t, n) {
        return s(e, t, n);
      }, d.allocUnsafe = function (e) {
        return l(e);
      }, d.allocUnsafeSlow = function (e) {
        return l(e);
      }, d.isBuffer = function (e) {
        return null != e && !0 === e._isBuffer;
      }, d.compare = function (e, t) {
        if (!d.isBuffer(e) || !d.isBuffer(t)) throw new TypeError("Arguments must be Buffers");if (e === t) return 0;for (var n = e.length, r = t.length, o = 0, a = X(n, r); o < a; ++o) {
          if (e[o] !== t[o]) {
            n = e[o], r = t[o];break;
          }
        }return n < r ? -1 : r < n ? 1 : 0;
      }, d.isEncoding = function (e) {
        switch ((e + "").toLowerCase()) {case "hex":case "utf8":case "utf-8":case "ascii":case "latin1":case "binary":case "base64":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
            return !0;default:
            return !1;}
      }, d.concat = function (e, t) {
        if (!Array.isArray(e)) throw new TypeError("\"list\" argument must be an Array of Buffers");if (0 === e.length) return d.alloc(0);var n;if (t === void 0) for (t = 0, n = 0; n < e.length; ++n) {
          t += e[n].length;
        }var r = d.allocUnsafe(t),
            o = 0;for (n = 0; n < e.length; ++n) {
          var a = e[n];if (ArrayBuffer.isView(a) && (a = d.from(a)), !d.isBuffer(a)) throw new TypeError("\"list\" argument must be an Array of Buffers");a.copy(r, o), o += a.length;
        }return r;
      }, d.byteLength = h, d.prototype._isBuffer = !0, d.prototype.swap16 = function () {
        var e = this.length;if (0 != e % 2) throw new RangeError("Buffer size must be a multiple of 16-bits");for (var t = 0; t < e; t += 2) {
          _(this, t, t + 1);
        }return this;
      }, d.prototype.swap32 = function () {
        var e = this.length;if (0 != e % 4) throw new RangeError("Buffer size must be a multiple of 32-bits");for (var t = 0; t < e; t += 4) {
          _(this, t, t + 3), _(this, t + 1, t + 2);
        }return this;
      }, d.prototype.swap64 = function () {
        var e = this.length;if (0 != e % 8) throw new RangeError("Buffer size must be a multiple of 64-bits");for (var t = 0; t < e; t += 8) {
          _(this, t, t + 7), _(this, t + 1, t + 6), _(this, t + 2, t + 5), _(this, t + 3, t + 4);
        }return this;
      }, d.prototype.toString = function () {
        var e = this.length;return 0 === e ? "" : 0 === arguments.length ? T(this, 0, e) : m.apply(this, arguments);
      }, d.prototype.toLocaleString = d.prototype.toString, d.prototype.equals = function (e) {
        if (!d.isBuffer(e)) throw new TypeError("Argument must be a Buffer");return this === e || 0 === d.compare(this, e);
      }, d.prototype.inspect = function () {
        var e = "",
            t = n.INSPECT_MAX_BYTES;return 0 < this.length && (e = this.toString("hex", 0, t).match(/.{2}/g).join(" "), this.length > t && (e += " ... ")), "<Buffer " + e + ">";
      }, d.prototype.compare = function (e, t, n, r, o) {
        if (!d.isBuffer(e)) throw new TypeError("Argument must be a Buffer");if (void 0 === t && (t = 0), void 0 === n && (n = e ? e.length : 0), void 0 === r && (r = 0), void 0 === o && (o = this.length), 0 > t || n > e.length || 0 > r || o > this.length) throw new RangeError("out of range index");if (r >= o && t >= n) return 0;if (r >= o) return -1;if (t >= n) return 1;if (t >>>= 0, n >>>= 0, r >>>= 0, o >>>= 0, this === e) return 0;for (var a = o - r, s = n - t, l = X(a, s), c = this.slice(r, o), p = e.slice(t, n), u = 0; u < l; ++u) {
          if (c[u] !== p[u]) {
            a = c[u], s = p[u];break;
          }
        }return a < s ? -1 : s < a ? 1 : 0;
      }, d.prototype.includes = function (e, t, n) {
        return -1 !== this.indexOf(e, t, n);
      }, d.prototype.indexOf = function (e, t, n) {
        return b(this, e, t, n, !0);
      }, d.prototype.lastIndexOf = function (e, t, n) {
        return b(this, e, t, n, !1);
      }, d.prototype.write = function (e, t, n, r) {
        if (void 0 === t) r = "utf8", n = this.length, t = 0;else if (void 0 === n && "string" == typeof t) r = t, n = this.length, t = 0;else if (isFinite(t)) t >>>= 0, isFinite(n) ? (n >>>= 0, void 0 === r && (r = "utf8")) : (r = n, n = void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");var o = this.length - t;if ((void 0 === n || n > o) && (n = o), 0 < e.length && (0 > n || 0 > t) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");r || (r = "utf8");for (var a = !1;;) {
          switch (r) {case "hex":
              return C(this, e, t, n);case "utf8":case "utf-8":
              return w(this, e, t, n);case "ascii":
              return S(this, e, t, n);case "latin1":case "binary":
              return v(this, e, t, n);case "base64":
              return x(this, e, t, n);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
              return R(this, e, t, n);default:
              if (a) throw new TypeError("Unknown encoding: " + r);r = ("" + r).toLowerCase(), a = !0;}
        }
      }, d.prototype.toJSON = function () {
        return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
      };d.prototype.slice = function (e, t) {
        var n = this.length;e = ~~e, t = void 0 === t ? n : ~~t, 0 > e ? (e += n, 0 > e && (e = 0)) : e > n && (e = n), 0 > t ? (t += n, 0 > t && (t = 0)) : t > n && (t = n), t < e && (t = e);var r = this.subarray(e, t);return r.__proto__ = d.prototype, r;
      }, d.prototype.readUIntLE = function (e, t, n) {
        e >>>= 0, t >>>= 0, n || F(e, t, this.length);for (var r = this[e], o = 1, a = 0; ++a < t && (o *= 256);) {
          r += this[e + a] * o;
        }return r;
      }, d.prototype.readUIntBE = function (e, t, n) {
        e >>>= 0, t >>>= 0, n || F(e, t, this.length);for (var r = this[e + --t], o = 1; 0 < t && (o *= 256);) {
          r += this[e + --t] * o;
        }return r;
      }, d.prototype.readUInt8 = function (e, t) {
        return e >>>= 0, t || F(e, 1, this.length), this[e];
      }, d.prototype.readUInt16LE = function (e, t) {
        return e >>>= 0, t || F(e, 2, this.length), this[e] | this[e + 1] << 8;
      }, d.prototype.readUInt16BE = function (e, t) {
        return e >>>= 0, t || F(e, 2, this.length), this[e] << 8 | this[e + 1];
      }, d.prototype.readUInt32LE = function (e, t) {
        return e >>>= 0, t || F(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + 16777216 * this[e + 3];
      }, d.prototype.readUInt32BE = function (e, t) {
        return e >>>= 0, t || F(e, 4, this.length), 16777216 * this[e] + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
      }, d.prototype.readIntLE = function (e, t, n) {
        e >>>= 0, t >>>= 0, n || F(e, t, this.length);for (var o = this[e], a = 1, d = 0; ++d < t && (a *= 256);) {
          o += this[e + d] * a;
        }return a *= 128, o >= a && (o -= r(2, 8 * t)), o;
      }, d.prototype.readIntBE = function (e, t, n) {
        e >>>= 0, t >>>= 0, n || F(e, t, this.length);for (var o = t, a = 1, d = this[e + --o]; 0 < o && (a *= 256);) {
          d += this[e + --o] * a;
        }return a *= 128, d >= a && (d -= r(2, 8 * t)), d;
      }, d.prototype.readInt8 = function (e, t) {
        return e >>>= 0, t || F(e, 1, this.length), 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e];
      }, d.prototype.readInt16LE = function (e, t) {
        e >>>= 0, t || F(e, 2, this.length);var n = this[e] | this[e + 1] << 8;return 32768 & n ? 4294901760 | n : n;
      }, d.prototype.readInt16BE = function (e, t) {
        e >>>= 0, t || F(e, 2, this.length);var n = this[e + 1] | this[e] << 8;return 32768 & n ? 4294901760 | n : n;
      }, d.prototype.readInt32LE = function (e, t) {
        return e >>>= 0, t || F(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
      }, d.prototype.readInt32BE = function (e, t) {
        return e >>>= 0, t || F(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
      }, d.prototype.readFloatLE = function (e, t) {
        return e >>>= 0, t || F(e, 4, this.length), $.read(this, e, !0, 23, 4);
      }, d.prototype.readFloatBE = function (e, t) {
        return e >>>= 0, t || F(e, 4, this.length), $.read(this, e, !1, 23, 4);
      }, d.prototype.readDoubleLE = function (e, t) {
        return e >>>= 0, t || F(e, 8, this.length), $.read(this, e, !0, 52, 8);
      }, d.prototype.readDoubleBE = function (e, t) {
        return e >>>= 0, t || F(e, 8, this.length), $.read(this, e, !1, 52, 8);
      }, d.prototype.writeUIntLE = function (e, t, n, o) {
        if (e = +e, t >>>= 0, n >>>= 0, !o) {
          var a = r(2, 8 * n) - 1;N(this, e, t, n, a, 0);
        }var d = 1,
            s = 0;for (this[t] = 255 & e; ++s < n && (d *= 256);) {
          this[t + s] = 255 & e / d;
        }return t + n;
      }, d.prototype.writeUIntBE = function (e, t, n, o) {
        if (e = +e, t >>>= 0, n >>>= 0, !o) {
          var a = r(2, 8 * n) - 1;N(this, e, t, n, a, 0);
        }var d = n - 1,
            s = 1;for (this[t + d] = 255 & e; 0 <= --d && (s *= 256);) {
          this[t + d] = 255 & e / s;
        }return t + n;
      }, d.prototype.writeUInt8 = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 1, 255, 0), this[t] = 255 & e, t + 1;
      }, d.prototype.writeUInt16LE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 2, 65535, 0), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2;
      }, d.prototype.writeUInt16BE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2;
      }, d.prototype.writeUInt32LE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = 255 & e, t + 4;
      }, d.prototype.writeUInt32BE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4;
      }, d.prototype.writeIntLE = function (e, t, n, o) {
        if (e = +e, t >>>= 0, !o) {
          var a = r(2, 8 * n - 1);N(this, e, t, n, a - 1, -a);
        }var d = 0,
            s = 1,
            l = 0;for (this[t] = 255 & e; ++d < n && (s *= 256);) {
          0 > e && 0 === l && 0 !== this[t + d - 1] && (l = 1), this[t + d] = 255 & (e / s >> 0) - l;
        }return t + n;
      }, d.prototype.writeIntBE = function (e, t, n, o) {
        if (e = +e, t >>>= 0, !o) {
          var a = r(2, 8 * n - 1);N(this, e, t, n, a - 1, -a);
        }var d = n - 1,
            s = 1,
            l = 0;for (this[t + d] = 255 & e; 0 <= --d && (s *= 256);) {
          0 > e && 0 === l && 0 !== this[t + d + 1] && (l = 1), this[t + d] = 255 & (e / s >> 0) - l;
        }return t + n;
      }, d.prototype.writeInt8 = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 1, 127, -128), 0 > e && (e = 255 + e + 1), this[t] = 255 & e, t + 1;
      }, d.prototype.writeInt16LE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 2, 32767, -32768), this[t] = 255 & e, this[t + 1] = e >>> 8, t + 2;
      }, d.prototype.writeInt16BE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = 255 & e, t + 2;
      }, d.prototype.writeInt32LE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 4, 2147483647, -2147483648), this[t] = 255 & e, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
      }, d.prototype.writeInt32BE = function (e, t, n) {
        return e = +e, t >>>= 0, n || N(this, e, t, 4, 2147483647, -2147483648), 0 > e && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e, t + 4;
      }, d.prototype.writeFloatLE = function (e, t, n) {
        return D(this, e, t, !0, n);
      }, d.prototype.writeFloatBE = function (e, t, n) {
        return D(this, e, t, !1, n);
      }, d.prototype.writeDoubleLE = function (e, t, n) {
        return P(this, e, t, !0, n);
      }, d.prototype.writeDoubleBE = function (e, t, n) {
        return P(this, e, t, !1, n);
      }, d.prototype.copy = function (e, t, n, r) {
        if (!d.isBuffer(e)) throw new TypeError("argument should be a Buffer");if (n || (n = 0), r || 0 === r || (r = this.length), t >= e.length && (t = e.length), t || (t = 0), 0 < r && r < n && (r = n), r === n) return 0;if (0 === e.length || 0 === this.length) return 0;if (0 > t) throw new RangeError("targetStart out of bounds");if (0 > n || n >= this.length) throw new RangeError("Index out of range");if (0 > r) throw new RangeError("sourceEnd out of bounds");r > this.length && (r = this.length), e.length - t < r - n && (r = e.length - t + n);var o = r - n;if (this === e && "function" == typeof Uint8Array.prototype.copyWithin) this.copyWithin(t, n, r);else if (this === e && n < t && t < r) for (var a = o - 1; 0 <= a; --a) {
          e[a + t] = this[a + n];
        } else Uint8Array.prototype.set.call(e, this.subarray(n, r), t);return o;
      }, d.prototype.fill = function (e, t, n, r) {
        if ("string" == typeof e) {
          if ("string" == typeof t ? (r = t, t = 0, n = this.length) : "string" == typeof n && (r = n, n = this.length), void 0 !== r && "string" != typeof r) throw new TypeError("encoding must be a string");if ("string" == typeof r && !d.isEncoding(r)) throw new TypeError("Unknown encoding: " + r);if (1 === e.length) {
            var o = e.charCodeAt(0);("utf8" === r && 128 > o || "latin1" === r) && (e = o);
          }
        } else "number" == typeof e && (e &= 255);if (0 > t || this.length < t || this.length < n) throw new RangeError("Out of range index");if (n <= t) return this;t >>>= 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);var a;if ("number" == typeof e) for (a = t; a < n; ++a) {
          this[a] = e;
        } else {
          var s = d.isBuffer(e) ? e : new d(e, r),
              l = s.length;if (0 === l) throw new TypeError("The value \"" + e + "\" is invalid for argument \"value\"");for (a = 0; a < n - t; ++a) {
            this[a + t] = s[a % l];
          }
        }return this;
      };var K = /[^+/0-9A-Za-z-_]/g;
    }, { "base64-js": 1, ieee754: 9 }], 4: [function (e, t) {
      function n() {
        this._events && Object.prototype.hasOwnProperty.call(this, "_events") || (this._events = _(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
      }function r(e) {
        return void 0 === e._maxListeners ? n.defaultMaxListeners : e._maxListeners;
      }function a(e, t, n) {
        if (t) e.call(n);else for (var r = e.length, o = h(e, r), a = 0; a < r; ++a) {
          o[a].call(n);
        }
      }function d(e, t, n, r) {
        if (t) e.call(n, r);else for (var o = e.length, a = h(e, o), d = 0; d < o; ++d) {
          a[d].call(n, r);
        }
      }function s(e, t, n, r, o) {
        if (t) e.call(n, r, o);else for (var a = e.length, d = h(e, a), s = 0; s < a; ++s) {
          d[s].call(n, r, o);
        }
      }function l(e, t, n, r, o, a) {
        if (t) e.call(n, r, o, a);else for (var d = e.length, s = h(e, d), l = 0; l < d; ++l) {
          s[l].call(n, r, o, a);
        }
      }function c(e, t, n, r) {
        if (t) e.apply(n, r);else for (var o = e.length, a = h(e, o), d = 0; d < o; ++d) {
          a[d].apply(n, r);
        }
      }function i(e, t, n, o) {
        var a, i, d;if ("function" != typeof n) throw new TypeError("\"listener\" argument must be a function");if (i = e._events, i ? (i.newListener && (e.emit("newListener", t, n.listener ? n.listener : n), i = e._events), d = i[t]) : (i = e._events = _(null), e._eventsCount = 0), !d) d = i[t] = n, ++e._eventsCount;else if ("function" == typeof d ? d = i[t] = o ? [n, d] : [d, n] : o ? d.unshift(n) : d.push(n), !d.warned && (a = r(e), a && 0 < a && d.length > a)) {
          d.warned = !0;var s = new Error("Possible EventEmitter memory leak detected. " + d.length + " \"" + (t + "\" listeners added. Use emitter.setMaxListeners() to increase limit."));s.name = "MaxListenersExceededWarning", s.emitter = e, s.type = t, s.count = d.length, "object" == (typeof console === "undefined" ? "undefined" : _typeof(console)) && console.warn && console.warn("%s: %s", s.name, s.message);
        }return e;
      }function p() {
        if (!this.fired) switch (this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length) {case 0:
            return this.listener.call(this.target);case 1:
            return this.listener.call(this.target, arguments[0]);case 2:
            return this.listener.call(this.target, arguments[0], arguments[1]);case 3:
            return this.listener.call(this.target, arguments[0], arguments[1], arguments[2]);default:
            for (var e = Array(arguments.length), t = 0; t < e.length; ++t) {
              e[t] = arguments[t];
            }this.listener.apply(this.target, e);}
      }function u(e, t, n) {
        var r = { fired: !1, wrapFn: void 0, target: e, type: t, listener: n },
            o = y.call(p, r);return o.listener = n, r.wrapFn = o, o;
      }function f(e) {
        var t = this._events;if (t) {
          var n = t[e];if ("function" == typeof n) return 1;if (n) return n.length;
        }return 0;
      }function g(e, t) {
        for (var r = t, o = r + 1, a = e.length; o < a; r += 1, o += 1) {
          e[r] = e[o];
        }e.pop();
      }function h(e, t) {
        for (var n = Array(t), r = 0; r < t; ++r) {
          n[r] = e[r];
        }return n;
      }function m(e) {
        for (var t = Array(e.length), n = 0; n < t.length; ++n) {
          t[n] = e[n].listener || e[n];
        }return t;
      }var _ = Object.create || function (e) {
        var t = function t() {};return t.prototype = e, new t();
      },
          b = Object.keys || function (e) {
        var t = [];for (var n in e) {
          Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
        }return n;
      },
          y = Function.prototype.bind || function (e) {
        var t = this;return function () {
          return t.apply(e, arguments);
        };
      };t.exports = n, n.EventEmitter = n, n.prototype._events = void 0, n.prototype._maxListeners = void 0;var C,
          w = 10;try {
        var S = {};Object.defineProperty && Object.defineProperty(S, "x", { value: 0 }), C = 0 === S.x;
      } catch (e) {
        C = !1;
      }C ? Object.defineProperty(n, "defaultMaxListeners", { enumerable: !0, get: function get() {
          return w;
        }, set: function set(e) {
          if ("number" != typeof e || 0 > e || e !== e) throw new TypeError("\"defaultMaxListeners\" must be a positive number");w = e;
        } }) : n.defaultMaxListeners = w, n.prototype.setMaxListeners = function (e) {
        if ("number" != typeof e || 0 > e || isNaN(e)) throw new TypeError("\"n\" argument must be a positive number");return this._maxListeners = e, this;
      }, n.prototype.getMaxListeners = function () {
        return r(this);
      }, n.prototype.emit = function (e) {
        var t,
            n,
            r,
            o,
            p,
            u,
            f = "error" === e;if (u = this._events, u) f = f && null == u.error;else if (!f) return !1;if (f) {
          if (1 < arguments.length && (t = arguments[1]), t instanceof Error) throw t;else {
            var g = new Error("Unhandled \"error\" event. (" + t + ")");throw g.context = t, g;
          }return !1;
        }if (n = u[e], !n) return !1;var h = "function" == typeof n;switch (r = arguments.length, r) {case 1:
            a(n, h, this);break;case 2:
            d(n, h, this, arguments[1]);break;case 3:
            s(n, h, this, arguments[1], arguments[2]);break;case 4:
            l(n, h, this, arguments[1], arguments[2], arguments[3]);break;default:
            for (o = Array(r - 1), p = 1; p < r; p++) {
              o[p - 1] = arguments[p];
            }c(n, h, this, o);}return !0;
      }, n.prototype.addListener = function (e, t) {
        return i(this, e, t, !1);
      }, n.prototype.on = n.prototype.addListener, n.prototype.prependListener = function (e, t) {
        return i(this, e, t, !0);
      }, n.prototype.once = function (e, t) {
        if ("function" != typeof t) throw new TypeError("\"listener\" argument must be a function");return this.on(e, u(this, e, t)), this;
      }, n.prototype.prependOnceListener = function (e, t) {
        if ("function" != typeof t) throw new TypeError("\"listener\" argument must be a function");return this.prependListener(e, u(this, e, t)), this;
      }, n.prototype.removeListener = function (e, t) {
        var n, r, o, a, d;if ("function" != typeof t) throw new TypeError("\"listener\" argument must be a function");if (r = this._events, !r) return this;if (n = r[e], !n) return this;if (n === t || n.listener === t) 0 == --this._eventsCount ? this._events = _(null) : (delete r[e], r.removeListener && this.emit("removeListener", e, n.listener || t));else if ("function" != typeof n) {
          for (o = -1, a = n.length - 1; 0 <= a; a--) {
            if (n[a] === t || n[a].listener === t) {
              d = n[a].listener, o = a;break;
            }
          }if (0 > o) return this;0 === o ? n.shift() : g(n, o), 1 === n.length && (r[e] = n[0]), r.removeListener && this.emit("removeListener", e, d || t);
        }return this;
      }, n.prototype.removeAllListeners = function (e) {
        var t, n, r;if (n = this._events, !n) return this;if (!n.removeListener) return 0 === arguments.length ? (this._events = _(null), this._eventsCount = 0) : n[e] && (0 == --this._eventsCount ? this._events = _(null) : delete n[e]), this;if (0 === arguments.length) {
          var o,
              a = b(n);for (r = 0; r < a.length; ++r) {
            o = a[r], "removeListener" === o || this.removeAllListeners(o);
          }return this.removeAllListeners("removeListener"), this._events = _(null), this._eventsCount = 0, this;
        }if (t = n[e], "function" == typeof t) this.removeListener(e, t);else if (t) for (r = t.length - 1; 0 <= r; r--) {
          this.removeListener(e, t[r]);
        }return this;
      }, n.prototype.listeners = function (e) {
        var t,
            n,
            r = this._events;return r ? (t = r[e], n = t ? "function" == typeof t ? [t.listener || t] : m(t) : []) : n = [], n;
      }, n.listenerCount = function (e, t) {
        return "function" == typeof e.listenerCount ? e.listenerCount(t) : f.call(e, t);
      }, n.prototype.listenerCount = f, n.prototype.eventNames = function () {
        return 0 < this._eventsCount ? Reflect.ownKeys(this._events) : [];
      };
    }, {}], 5: [function (e, t, n) {
      (function (e) {
        function t(e) {
          return Object.prototype.toString.call(e);
        }n.isArray = function (e) {
          return Array.isArray ? Array.isArray(e) : "[object Array]" === t(e);
        }, n.isBoolean = function (e) {
          return "boolean" == typeof e;
        }, n.isNull = function (e) {
          return null === e;
        }, n.isNullOrUndefined = function (e) {
          return null == e;
        }, n.isNumber = function (e) {
          return "number" == typeof e;
        }, n.isString = function (e) {
          return "string" == typeof e;
        }, n.isSymbol = function (e) {
          return "symbol" == (typeof e === "undefined" ? "undefined" : _typeof(e));
        }, n.isUndefined = function (e) {
          return void 0 === e;
        }, n.isRegExp = function (e) {
          return "[object RegExp]" === t(e);
        }, n.isObject = function (e) {
          return "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && null !== e;
        }, n.isDate = function (e) {
          return "[object Date]" === t(e);
        }, n.isError = function (n) {
          return "[object Error]" === t(n) || n instanceof Error;
        }, n.isFunction = function (e) {
          return "function" == typeof e;
        }, n.isPrimitive = function (e) {
          return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == (typeof e === "undefined" ? "undefined" : _typeof(e)) || "undefined" == typeof e;
        }, n.isBuffer = e.isBuffer;
      }).call(this, { isBuffer: e("../../is-buffer/index.js") });
    }, { "../../is-buffer/index.js": 11 }], 6: [function (e, t, n) {
      (function (o) {
        function r(e) {
          var t = this.useColors;if (e[0] = (t ? "%c" : "") + this.namespace + (t ? " %c" : " ") + e[0] + (t ? "%c " : " ") + "+" + n.humanize(this.diff), !!t) {
            var r = "color: " + this.color;e.splice(1, 0, r, "color: inherit");var o = 0,
                a = 0;e[0].replace(/%[a-zA-Z%]/g, function (e) {
              "%%" === e || (o++, "%c" === e && (a = o));
            }), e.splice(a, 0, r);
          }
        }function a(e) {
          try {
            null == e ? n.storage.removeItem("debug") : n.storage.debug = e;
          } catch (t) {}
        }function i() {
          var e;try {
            e = n.storage.debug;
          } catch (t) {}return !e && "undefined" != typeof o && "env" in o && (e = o.env.DEBUG), e;
        }n = t.exports = e("./debug"), n.log = function () {
          return "object" == (typeof console === "undefined" ? "undefined" : _typeof(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
        }, n.formatArgs = r, n.save = a, n.load = i, n.useColors = function () {
          return !!("undefined" != typeof window && window.process && "renderer" === window.process.type) || !("undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) && ("undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && 31 <= parseInt(RegExp.$1, 10) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
        }, n.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : function () {
          try {
            return window.localStorage;
          } catch (t) {}
        }(), n.colors = ["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"], n.formatters.j = function (e) {
          try {
            return JSON.stringify(e);
          } catch (e) {
            return "[UnexpectedJSONParseError]: " + e.message;
          }
        }, n.enable(i());
      }).call(this, e("_process"));
    }, { "./debug": 7, _process: 15 }], 7: [function (e, t, r) {
      function o(e) {
        var t,
            o = 0;for (t in e) {
          o = (o << 5) - o + e.charCodeAt(t), o |= 0;
        }return r.colors[n(o) % r.colors.length];
      }function a(e) {
        function t() {
          if (t.enabled) {
            var e = t,
                o = +new Date(),
                a = o - (n || o);e.diff = a, e.prev = n, e.curr = o, n = o;for (var d = Array(arguments.length), s = 0; s < d.length; s++) {
              d[s] = arguments[s];
            }d[0] = r.coerce(d[0]), "string" != typeof d[0] && d.unshift("%O");var l = 0;d[0] = d[0].replace(/%([a-zA-Z%])/g, function (t, n) {
              if ("%%" === t) return t;l++;var o = r.formatters[n];if ("function" == typeof o) {
                var a = d[l];t = o.call(e, a), d.splice(l, 1), l--;
              }return t;
            }), r.formatArgs.call(e, d);var c = t.log || r.log || console.log.bind(console);c.apply(e, d);
          }
        }var n;return t.namespace = e, t.enabled = r.enabled(e), t.useColors = r.useColors(), t.color = o(e), t.destroy = i, "function" == typeof r.init && r.init(t), r.instances.push(t), t;
      }function i() {
        var e = r.instances.indexOf(this);return -1 !== e && (r.instances.splice(e, 1), !0);
      }function d(e) {
        r.save(e), r.names = [], r.skips = [];var t,
            n = ("string" == typeof e ? e : "").split(/[\s,]+/),
            o = n.length;for (t = 0; t < o; t++) {
          n[t] && (e = n[t].replace(/\*/g, ".*?"), "-" === e[0] ? r.skips.push(new RegExp("^" + e.substr(1) + "$")) : r.names.push(new RegExp("^" + e + "$")));
        }for (t = 0; t < r.instances.length; t++) {
          var a = r.instances[t];a.enabled = r.enabled(a.namespace);
        }
      }function s() {
        r.enable("");
      }function l(e) {
        if ("*" === e[e.length - 1]) return !0;var t, n;for (t = 0, n = r.skips.length; t < n; t++) {
          if (r.skips[t].test(e)) return !1;
        }for (t = 0, n = r.names.length; t < n; t++) {
          if (r.names[t].test(e)) return !0;
        }return !1;
      }r = t.exports = a.debug = a["default"] = a, r.coerce = function (e) {
        return e instanceof Error ? e.stack || e.message : e;
      }, r.disable = s, r.enable = d, r.enabled = l, r.humanize = e("ms"), r.instances = [], r.names = [], r.skips = [], r.formatters = {};
    }, { ms: 13 }], 8: [function (e, t) {
      t.exports = function () {
        if ("undefined" == typeof window) return null;var e = { RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection, RTCSessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription, RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate };return e.RTCPeerConnection ? e : null;
      };
    }, {}], 9: [function (e, o, a) {
      a.read = function (t, n, o, a, l) {
        var c,
            p,
            u = 8 * l - a - 1,
            f = (1 << u) - 1,
            g = f >> 1,
            h = -7,
            _ = o ? l - 1 : 0,
            b = o ? -1 : 1,
            d = t[n + _];for (_ += b, c = d & (1 << -h) - 1, d >>= -h, h += u; 0 < h; c = 256 * c + t[n + _], _ += b, h -= 8) {}for (p = c & (1 << -h) - 1, c >>= -h, h += a; 0 < h; p = 256 * p + t[n + _], _ += b, h -= 8) {}if (0 === c) c = 1 - g;else {
          if (c === f) return p ? NaN : (d ? -1 : 1) * (1 / 0);p += r(2, a), c -= g;
        }return (d ? -1 : 1) * p * r(2, c - a);
      }, a.write = function (o, a, l, p, u, f) {
        var g,
            h,
            _,
            b = 8 * f - u - 1,
            y = (1 << b) - 1,
            C = y >> 1,
            w = 23 === u ? 5.960464477539063e-8 - 6.617444900424222e-24 : 0,
            S = p ? 0 : f - 1,
            v = p ? 1 : -1,
            d = 0 > a || 0 === a && 0 > 1 / a ? 1 : 0;for (a = n(a), isNaN(a) || a === 1 / 0 ? (h = isNaN(a) ? 1 : 0, g = y) : (g = t(Math.log(a) / Math.LN2), 1 > a * (_ = r(2, -g)) && (g--, _ *= 2), a += 1 <= g + C ? w / _ : w * r(2, 1 - C), 2 <= a * _ && (g++, _ /= 2), g + C >= y ? (h = 0, g = y) : 1 <= g + C ? (h = (a * _ - 1) * r(2, u), g += C) : (h = a * r(2, C - 1) * r(2, u), g = 0)); 8 <= u; o[l + S] = 255 & h, S += v, h /= 256, u -= 8) {}for (g = g << u | h, b += u; 0 < b; o[l + S] = 255 & g, S += v, g /= 256, b -= 8) {}o[l + S - v] |= 128 * d;
      };
    }, {}], 10: [function (e, t) {
      t.exports = "function" == typeof Object.create ? function (e, t) {
        e.super_ = t, e.prototype = Object.create(t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } });
      } : function (e, t) {
        e.super_ = t;var n = function n() {};n.prototype = t.prototype, e.prototype = new n(), e.prototype.constructor = e;
      };
    }, {}], 11: [function (e, t) {
      function n(e) {
        return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e);
      }function r(e) {
        return "function" == typeof e.readFloatLE && "function" == typeof e.slice && n(e.slice(0, 0));
      }t.exports = function (e) {
        return null != e && (n(e) || r(e) || !!e._isBuffer);
      };
    }, {}], 12: [function (e, t) {
      var n = {}.toString;t.exports = Array.isArray || function (e) {
        return "[object Array]" == n.call(e);
      };
    }, {}], 13: [function (e, n) {
      function r(e) {
        if (e += "", !(100 < e.length)) {
          var t = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);if (t) {
            var r = parseFloat(t[1]),
                n = (t[2] || "ms").toLowerCase();return "years" === n || "year" === n || "yrs" === n || "yr" === n || "y" === n ? 31557600000 * r : "days" === n || "day" === n || "d" === n ? 86400000 * r : "hours" === n || "hour" === n || "hrs" === n || "hr" === n || "h" === n ? 3600000 * r : "minutes" === n || "minute" === n || "mins" === n || "min" === n || "m" === n ? 60000 * r : "seconds" === n || "second" === n || "secs" === n || "sec" === n || "s" === n ? 1000 * r : "milliseconds" === n || "millisecond" === n || "msecs" === n || "msec" === n || "ms" === n ? r : void 0;
          }
        }
      }function o(e) {
        var t = Math.round;return 86400000 <= e ? t(e / 86400000) + "d" : 3600000 <= e ? t(e / 3600000) + "h" : 60000 <= e ? t(e / 60000) + "m" : 1000 <= e ? t(e / 1000) + "s" : e + "ms";
      }function a(e) {
        return i(e, 86400000, "day") || i(e, 3600000, "hour") || i(e, 60000, "minute") || i(e, 1000, "second") || e + " ms";
      }function i(e, r, n) {
        return e < r ? void 0 : e < 1.5 * r ? t(e / r) + " " + n : Math.ceil(e / r) + " " + n + "s";
      }n.exports = function (e, t) {
        t = t || {};var n = typeof e === "undefined" ? "undefined" : _typeof(e);if ("string" == n && 0 < e.length) return r(e);if ("number" == n && !1 === isNaN(e)) return t.long ? a(e) : o(e);throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(e));
      };
    }, {}], 14: [function (e, t) {
      (function (e) {
        "use strict";
        t.exports = e.version && 0 !== e.version.indexOf("v0.") && (0 !== e.version.indexOf("v1.") || 0 === e.version.indexOf("v1.8.")) ? e : { nextTick: function nextTick(t, n, r, o) {
            if ("function" != typeof t) throw new TypeError("\"callback\" argument must be a function");var a,
                d,
                s = arguments.length;switch (s) {case 0:case 1:
                return e.nextTick(t);case 2:
                return e.nextTick(function () {
                  t.call(null, n);
                });case 3:
                return e.nextTick(function () {
                  t.call(null, n, r);
                });case 4:
                return e.nextTick(function () {
                  t.call(null, n, r, o);
                });default:
                for (a = Array(s - 1), d = 0; d < a.length;) {
                  a[d++] = arguments[d];
                }return e.nextTick(function () {
                  t.apply(null, a);
                });}
          } };
      }).call(this, e("_process"));
    }, { _process: 15 }], 15: [function (e, t) {
      function n() {
        throw new Error("setTimeout has not been defined");
      }function r() {
        throw new Error("clearTimeout has not been defined");
      }function o(t) {
        if (c === setTimeout) return setTimeout(t, 0);if ((c === n || !c) && setTimeout) return c = setTimeout, setTimeout(t, 0);try {
          return c(t, 0);
        } catch (n) {
          try {
            return c.call(null, t, 0);
          } catch (n) {
            return c.call(this, t, 0);
          }
        }
      }function a(t) {
        if (p === clearTimeout) return clearTimeout(t);if ((p === r || !p) && clearTimeout) return p = clearTimeout, clearTimeout(t);try {
          return p(t);
        } catch (n) {
          try {
            return p.call(null, t);
          } catch (n) {
            return p.call(this, t);
          }
        }
      }function i() {
        h && f && (h = !1, f.length ? g = f.concat(g) : m = -1, g.length && d());
      }function d() {
        if (!h) {
          var e = o(i);h = !0;for (var t = g.length; t;) {
            for (f = g, g = []; ++m < t;) {
              f && f[m].run();
            }m = -1, t = g.length;
          }f = null, h = !1, a(e);
        }
      }function s(e, t) {
        this.fun = e, this.array = t;
      }function l() {}var c,
          p,
          u = t.exports = {};(function () {
        try {
          c = "function" == typeof setTimeout ? setTimeout : n;
        } catch (t) {
          c = n;
        }try {
          p = "function" == typeof clearTimeout ? clearTimeout : r;
        } catch (t) {
          p = r;
        }
      })();var f,
          g = [],
          h = !1,
          m = -1;u.nextTick = function (e) {
        var t = Array(arguments.length - 1);if (1 < arguments.length) for (var n = 1; n < arguments.length; n++) {
          t[n - 1] = arguments[n];
        }g.push(new s(e, t)), 1 !== g.length || h || o(d);
      }, s.prototype.run = function () {
        this.fun.apply(null, this.array);
      }, u.title = "browser", u.browser = !0, u.env = {}, u.argv = [], u.version = "", u.versions = {}, u.on = l, u.addListener = l, u.once = l, u.off = l, u.removeListener = l, u.removeAllListeners = l, u.emit = l, u.prependListener = l, u.prependOnceListener = l, u.listeners = function () {
        return [];
      }, u.binding = function () {
        throw new Error("process.binding is not supported");
      }, u.cwd = function () {
        return "/";
      }, u.chdir = function () {
        throw new Error("process.chdir is not supported");
      }, u.umask = function () {
        return 0;
      };
    }, {}], 16: [function (e, t) {
      (function (n, r) {
        "use strict";
        var o = e("safe-buffer").Buffer,
            a = r.crypto || r.msCrypto;t.exports = a && a.getRandomValues ? function (e, t) {
          if (65536 < e) throw new Error("requested too many random bytes");var i = new r.Uint8Array(e);0 < e && a.getRandomValues(i);var d = o.from(i.buffer);return "function" == typeof t ? n.nextTick(function () {
            t(null, d);
          }) : d;
        } : function () {
          throw new Error("Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11");
        };
      }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
    }, { _process: 15, "safe-buffer": 26 }], 17: [function (e, t) {
      "use strict";
      function n(e) {
        return this instanceof n ? void (s.call(this, e), l.call(this, e), e && !1 === e.readable && (this.readable = !1), e && !1 === e.writable && (this.writable = !1), this.allowHalfOpen = !0, e && !1 === e.allowHalfOpen && (this.allowHalfOpen = !1), this.once("end", r)) : new n(e);
      }function r() {
        this.allowHalfOpen || this._writableState.ended || a.nextTick(o, this);
      }function o(e) {
        e.end();
      }var a = e("process-nextick-args"),
          i = Object.keys || function (e) {
        var t = [];for (var n in e) {
          t.push(n);
        }return t;
      };t.exports = n;var d = e("core-util-is");d.inherits = e("inherits");var s = e("./_stream_readable"),
          l = e("./_stream_writable");d.inherits(n, s);for (var c, p = i(l.prototype), u = 0; u < p.length; u++) {
        c = p[u], n.prototype[c] || (n.prototype[c] = l.prototype[c]);
      }Object.defineProperty(n.prototype, "writableHighWaterMark", { enumerable: !1, get: function get() {
          return this._writableState.highWaterMark;
        } }), Object.defineProperty(n.prototype, "destroyed", { get: function get() {
          return void 0 !== this._readableState && void 0 !== this._writableState && this._readableState.destroyed && this._writableState.destroyed;
        }, set: function set(e) {
          void 0 === this._readableState || void 0 === this._writableState || (this._readableState.destroyed = e, this._writableState.destroyed = e);
        } }), n.prototype._destroy = function (e, t) {
        this.push(null), this.end(), a.nextTick(t, e);
      };
    }, { "./_stream_readable": 19, "./_stream_writable": 21, "core-util-is": 5, inherits: 10, "process-nextick-args": 14 }], 18: [function (e, t) {
      "use strict";
      function n(e) {
        return this instanceof n ? void r.call(this, e) : new n(e);
      }t.exports = n;var r = e("./_stream_transform"),
          o = e("core-util-is");o.inherits = e("inherits"), o.inherits(n, r), n.prototype._transform = function (e, t, n) {
        n(null, e);
      };
    }, { "./_stream_transform": 20, "core-util-is": 5, inherits: 10 }], 19: [function (e, n) {
      (function (r, o) {
        "use strict";
        function a(e) {
          return O.from(e);
        }function i(e) {
          return O.isBuffer(e) || e instanceof U;
        }function d(e, t, n) {
          return "function" == typeof e.prependListener ? e.prependListener(t, n) : void (e._events && e._events[t] ? M(e._events[t]) ? e._events[t].unshift(n) : e._events[t] = [n, e._events[t]] : e.on(t, n));
        }function s(n, r) {
          N = N || e("./_stream_duplex"), n = n || {};var o = r instanceof N;this.objectMode = !!n.objectMode, o && (this.objectMode = this.objectMode || !!n.readableObjectMode);var a = n.highWaterMark,
              i = n.readableHighWaterMark,
              d = this.objectMode ? 16 : 16384;this.highWaterMark = a || 0 === a ? a : o && (i || 0 === i) ? i : d, this.highWaterMark = t(this.highWaterMark), this.buffer = new V(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = n.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, n.encoding && (!z && (z = e("string_decoder/").StringDecoder), this.decoder = new z(n.encoding), this.encoding = n.encoding);
        }function l(t) {
          return N = N || e("./_stream_duplex"), this instanceof l ? void (this._readableState = new s(t, this), this.readable = !0, t && ("function" == typeof t.read && (this._read = t.read), "function" == typeof t.destroy && (this._destroy = t.destroy)), j.call(this)) : new l(t);
        }function c(e, t, n, r, o) {
          var i = e._readableState;if (null === t) i.reading = !1, m(e, i);else {
            var d;o || (d = u(i, t)), d ? e.emit("error", d) : i.objectMode || t && 0 < t.length ? ("string" != typeof t && !i.objectMode && Object.getPrototypeOf(t) !== O.prototype && (t = a(t)), r ? i.endEmitted ? e.emit("error", new Error("stream.unshift() after end event")) : p(e, i, t, !0) : i.ended ? e.emit("error", new Error("stream.push() after EOF")) : (i.reading = !1, i.decoder && !n ? (t = i.decoder.write(t), i.objectMode || 0 !== t.length ? p(e, i, t, !1) : y(e, i)) : p(e, i, t, !1))) : !r && (i.reading = !1);
          }return f(i);
        }function p(e, t, n, r) {
          t.flowing && 0 === t.length && !t.sync ? (e.emit("data", n), e.read(0)) : (t.length += t.objectMode ? 1 : n.length, r ? t.buffer.unshift(n) : t.buffer.push(n), t.needReadable && _(e)), y(e, t);
        }function u(e, t) {
          var n;return i(t) || "string" == typeof t || void 0 === t || e.objectMode || (n = new TypeError("Invalid non-string/buffer chunk")), n;
        }function f(e) {
          return !e.ended && (e.needReadable || e.length < e.highWaterMark || 0 === e.length);
        }function g(e) {
          return 8388608 <= e ? e = 8388608 : (e--, e |= e >>> 1, e |= e >>> 2, e |= e >>> 4, e |= e >>> 8, e |= e >>> 16, e++), e;
        }function h(e, t) {
          return 0 >= e || 0 === t.length && t.ended ? 0 : t.objectMode ? 1 : e === e ? (e > t.highWaterMark && (t.highWaterMark = g(e)), e <= t.length ? e : t.ended ? t.length : (t.needReadable = !0, 0)) : t.flowing && t.length ? t.buffer.head.data.length : t.length;
        }function m(e, t) {
          if (!t.ended) {
            if (t.decoder) {
              var n = t.decoder.end();n && n.length && (t.buffer.push(n), t.length += t.objectMode ? 1 : n.length);
            }t.ended = !0, _(e);
          }
        }function _(e) {
          var t = e._readableState;t.needReadable = !1, t.emittedReadable || (H("emitReadable", t.flowing), t.emittedReadable = !0, t.sync ? F.nextTick(b, e) : b(e));
        }function b(e) {
          H("emit readable"), e.emit("readable"), R(e);
        }function y(e, t) {
          t.readingMore || (t.readingMore = !0, F.nextTick(C, e, t));
        }function C(e, t) {
          for (var n = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (H("maybeReadMore read 0"), e.read(0), n !== t.length);) {
            n = t.length;
          }t.readingMore = !1;
        }function w(e) {
          return function () {
            var t = e._readableState;H("pipeOnDrain", t.awaitDrain), t.awaitDrain && t.awaitDrain--, 0 === t.awaitDrain && P(e, "data") && (t.flowing = !0, R(e));
          };
        }function S(e) {
          H("readable nexttick read 0"), e.read(0);
        }function v(e, t) {
          t.resumeScheduled || (t.resumeScheduled = !0, F.nextTick(x, e, t));
        }function x(e, t) {
          t.reading || (H("resume read 0"), e.read(0)), t.resumeScheduled = !1, t.awaitDrain = 0, e.emit("resume"), R(e), t.flowing && !t.reading && e.read(0);
        }function R(e) {
          var t = e._readableState;for (H("flow", t.flowing); t.flowing && null !== e.read();) {}
        }function k(e, t) {
          if (0 === t.length) return null;var n;return t.objectMode ? n = t.buffer.shift() : !e || e >= t.length ? (n = t.decoder ? t.buffer.join("") : 1 === t.buffer.length ? t.buffer.head.data : t.buffer.concat(t.length), t.buffer.clear()) : n = T(e, t.buffer, t.decoder), n;
        }function T(e, t, n) {
          var r;return e < t.head.data.length ? (r = t.head.data.slice(0, e), t.head.data = t.head.data.slice(e)) : e === t.head.data.length ? r = t.shift() : r = n ? E(e, t) : A(e, t), r;
        }function E(e, t) {
          var r = t.head,
              o = 1,
              a = r.data;for (e -= a.length; r = r.next;) {
            var i = r.data,
                d = e > i.length ? i.length : e;if (a += d === i.length ? i : i.slice(0, e), e -= d, 0 === e) {
              d === i.length ? (++o, t.head = r.next ? r.next : t.tail = null) : (t.head = r, r.data = i.slice(d));break;
            }++o;
          }return t.length -= o, a;
        }function A(e, t) {
          var r = O.allocUnsafe(e),
              o = t.head,
              a = 1;for (o.data.copy(r), e -= o.data.length; o = o.next;) {
            var i = o.data,
                d = e > i.length ? i.length : e;if (i.copy(r, r.length - e, 0, d), e -= d, 0 === e) {
              d === i.length ? (++a, t.head = o.next ? o.next : t.tail = null) : (t.head = o, o.data = i.slice(d));break;
            }++a;
          }return t.length -= a, r;
        }function L(e) {
          var t = e._readableState;if (0 < t.length) throw new Error("\"endReadable()\" called on non-empty stream");t.endEmitted || (t.ended = !0, F.nextTick(I, t, e));
        }function I(e, t) {
          e.endEmitted || 0 !== e.length || (e.endEmitted = !0, t.readable = !1, t.emit("end"));
        }function B(e, t) {
          for (var n = 0, r = e.length; n < r; n++) {
            if (e[n] === t) return n;
          }return -1;
        }var F = e("process-nextick-args");n.exports = l;var N,
            M = e("isarray");l.ReadableState = s;var D = e("events").EventEmitter,
            P = function P(e, t) {
          return e.listeners(t).length;
        },
            j = e("./internal/streams/stream"),
            O = e("safe-buffer").Buffer,
            U = o.Uint8Array || function () {},
            W = e("core-util-is");W.inherits = e("inherits");var q = e("util"),
            H = void 0;H = q && q.debuglog ? q.debuglog("stream") : function () {};var z,
            V = e("./internal/streams/BufferList"),
            G = e("./internal/streams/destroy");W.inherits(l, j);var Y = ["error", "close", "destroy", "pause", "resume"];Object.defineProperty(l.prototype, "destroyed", { get: function get() {
            return void 0 !== this._readableState && this._readableState.destroyed;
          }, set: function set(e) {
            this._readableState && (this._readableState.destroyed = e);
          } }), l.prototype.destroy = G.destroy, l.prototype._undestroy = G.undestroy, l.prototype._destroy = function (e, t) {
          this.push(null), t(e);
        }, l.prototype.push = function (e, t) {
          var n,
              r = this._readableState;return r.objectMode ? n = !0 : "string" == typeof e && (t = t || r.defaultEncoding, t !== r.encoding && (e = O.from(e, t), t = ""), n = !0), c(this, e, t, !1, n);
        }, l.prototype.unshift = function (e) {
          return c(this, e, null, !0, !1);
        }, l.prototype.isPaused = function () {
          return !1 === this._readableState.flowing;
        }, l.prototype.setEncoding = function (t) {
          return z || (z = e("string_decoder/").StringDecoder), this._readableState.decoder = new z(t), this._readableState.encoding = t, this;
        };l.prototype.read = function (e) {
          H("read", e), e = parseInt(e, 10);var t = this._readableState,
              r = e;if (0 !== e && (t.emittedReadable = !1), 0 === e && t.needReadable && (t.length >= t.highWaterMark || t.ended)) return H("read: emitReadable", t.length, t.ended), 0 === t.length && t.ended ? L(this) : _(this), null;if (e = h(e, t), 0 === e && t.ended) return 0 === t.length && L(this), null;var o = t.needReadable;H("need readable", o), (0 === t.length || t.length - e < t.highWaterMark) && (o = !0, H("length less than watermark", o)), t.ended || t.reading ? (o = !1, H("reading or ended", o)) : o && (H("do read"), t.reading = !0, t.sync = !0, 0 === t.length && (t.needReadable = !0), this._read(t.highWaterMark), t.sync = !1, !t.reading && (e = h(r, t)));var a;return a = 0 < e ? k(e, t) : null, null === a ? (t.needReadable = !0, e = 0) : t.length -= e, 0 === t.length && (!t.ended && (t.needReadable = !0), r !== e && t.ended && L(this)), null !== a && this.emit("data", a), a;
        }, l.prototype._read = function () {
          this.emit("error", new Error("_read() is not implemented"));
        }, l.prototype.pipe = function (e, t) {
          function n(e, t) {
            H("onunpipe"), e === u && t && !1 === t.hasUnpiped && (t.hasUnpiped = !0, a());
          }function o() {
            H("onend"), e.end();
          }function a() {
            H("cleanup"), e.removeListener("close", l), e.removeListener("finish", c), e.removeListener("drain", m), e.removeListener("error", s), e.removeListener("unpipe", n), u.removeListener("end", o), u.removeListener("end", p), u.removeListener("data", i), _ = !0, f.awaitDrain && (!e._writableState || e._writableState.needDrain) && m();
          }function i(t) {
            H("ondata"), b = !1;var n = e.write(t);!1 !== n || b || ((1 === f.pipesCount && f.pipes === e || 1 < f.pipesCount && -1 !== B(f.pipes, e)) && !_ && (H("false write response, pause", u._readableState.awaitDrain), u._readableState.awaitDrain++, b = !0), u.pause());
          }function s(t) {
            H("onerror", t), p(), e.removeListener("error", s), 0 === P(e, "error") && e.emit("error", t);
          }function l() {
            e.removeListener("finish", c), p();
          }function c() {
            H("onfinish"), e.removeListener("close", l), p();
          }function p() {
            H("unpipe"), u.unpipe(e);
          }var u = this,
              f = this._readableState;switch (f.pipesCount) {case 0:
              f.pipes = e;break;case 1:
              f.pipes = [f.pipes, e];break;default:
              f.pipes.push(e);}f.pipesCount += 1, H("pipe count=%d opts=%j", f.pipesCount, t);var g = (!t || !1 !== t.end) && e !== r.stdout && e !== r.stderr,
              h = g ? o : p;f.endEmitted ? F.nextTick(h) : u.once("end", h), e.on("unpipe", n);var m = w(u);e.on("drain", m);var _ = !1,
              b = !1;return u.on("data", i), d(e, "error", s), e.once("close", l), e.once("finish", c), e.emit("pipe", u), f.flowing || (H("pipe resume"), u.resume()), e;
        }, l.prototype.unpipe = function (e) {
          var t = this._readableState,
              n = { hasUnpiped: !1 };if (0 === t.pipesCount) return this;if (1 === t.pipesCount) return e && e !== t.pipes ? this : (e || (e = t.pipes), t.pipes = null, t.pipesCount = 0, t.flowing = !1, e && e.emit("unpipe", this, n), this);if (!e) {
            var r = t.pipes,
                o = t.pipesCount;t.pipes = null, t.pipesCount = 0, t.flowing = !1;for (var a = 0; a < o; a++) {
              r[a].emit("unpipe", this, n);
            }return this;
          }var d = B(t.pipes, e);return -1 === d ? this : (t.pipes.splice(d, 1), t.pipesCount -= 1, 1 === t.pipesCount && (t.pipes = t.pipes[0]), e.emit("unpipe", this, n), this);
        }, l.prototype.on = function (e, t) {
          var n = j.prototype.on.call(this, e, t);if ("data" === e) !1 !== this._readableState.flowing && this.resume();else if ("readable" === e) {
            var r = this._readableState;r.endEmitted || r.readableListening || (r.readableListening = r.needReadable = !0, r.emittedReadable = !1, r.reading ? r.length && _(this) : F.nextTick(S, this));
          }return n;
        }, l.prototype.addListener = l.prototype.on, l.prototype.resume = function () {
          var e = this._readableState;return e.flowing || (H("resume"), e.flowing = !0, v(this, e)), this;
        }, l.prototype.pause = function () {
          return H("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (H("pause"), this._readableState.flowing = !1, this.emit("pause")), this;
        }, l.prototype.wrap = function (e) {
          var t = this,
              r = this._readableState,
              o = !1;for (var a in e.on("end", function () {
            if (H("wrapped end"), r.decoder && !r.ended) {
              var e = r.decoder.end();e && e.length && t.push(e);
            }t.push(null);
          }), e.on("data", function (n) {
            if ((H("wrapped data"), r.decoder && (n = r.decoder.write(n)), !(r.objectMode && (null === n || void 0 === n))) && (r.objectMode || n && n.length)) {
              var a = t.push(n);a || (o = !0, e.pause());
            }
          }), e) {
            void 0 === this[a] && "function" == typeof e[a] && (this[a] = function (t) {
              return function () {
                return e[t].apply(e, arguments);
              };
            }(a));
          }for (var i = 0; i < Y.length; i++) {
            e.on(Y[i], this.emit.bind(this, Y[i]));
          }return this._read = function (t) {
            H("wrapped _read", t), o && (o = !1, e.resume());
          }, this;
        }, Object.defineProperty(l.prototype, "readableHighWaterMark", { enumerable: !1, get: function get() {
            return this._readableState.highWaterMark;
          } }), l._fromList = k;
      }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
    }, { "./_stream_duplex": 17, "./internal/streams/BufferList": 22, "./internal/streams/destroy": 23, "./internal/streams/stream": 24, _process: 15, "core-util-is": 5, events: 4, inherits: 10, isarray: 12, "process-nextick-args": 14, "safe-buffer": 26, "string_decoder/": 27, util: 2 }], 20: [function (e, t) {
      "use strict";
      function n(e, t) {
        var n = this._transformState;n.transforming = !1;var r = n.writecb;if (!r) return this.emit("error", new Error("write callback called multiple times"));n.writechunk = null, n.writecb = null, null != t && this.push(t), r(e);var o = this._readableState;o.reading = !1, (o.needReadable || o.length < o.highWaterMark) && this._read(o.highWaterMark);
      }function r(e) {
        return this instanceof r ? void (i.call(this, e), this._transformState = { afterTransform: n.bind(this), needTransform: !1, transforming: !1, writecb: null, writechunk: null, writeencoding: null }, this._readableState.needReadable = !0, this._readableState.sync = !1, e && ("function" == typeof e.transform && (this._transform = e.transform), "function" == typeof e.flush && (this._flush = e.flush)), this.on("prefinish", o)) : new r(e);
      }function o() {
        var e = this;"function" == typeof this._flush ? this._flush(function (t, n) {
          a(e, t, n);
        }) : a(this, null, null);
      }function a(e, t, n) {
        if (t) return e.emit("error", t);if (null != n && e.push(n), e._writableState.length) throw new Error("Calling transform done when ws.length != 0");if (e._transformState.transforming) throw new Error("Calling transform done when still transforming");return e.push(null);
      }t.exports = r;var i = e("./_stream_duplex"),
          d = e("core-util-is");d.inherits = e("inherits"), d.inherits(r, i), r.prototype.push = function (e, t) {
        return this._transformState.needTransform = !1, i.prototype.push.call(this, e, t);
      }, r.prototype._transform = function () {
        throw new Error("_transform() is not implemented");
      }, r.prototype._write = function (e, t, n) {
        var r = this._transformState;if (r.writecb = n, r.writechunk = e, r.writeencoding = t, !r.transforming) {
          var o = this._readableState;(r.needTransform || o.needReadable || o.length < o.highWaterMark) && this._read(o.highWaterMark);
        }
      }, r.prototype._read = function () {
        var e = this._transformState;null !== e.writechunk && e.writecb && !e.transforming ? (e.transforming = !0, this._transform(e.writechunk, e.writeencoding, e.afterTransform)) : e.needTransform = !0;
      }, r.prototype._destroy = function (e, t) {
        var n = this;i.prototype._destroy.call(this, e, function (e) {
          t(e), n.emit("close");
        });
      };
    }, { "./_stream_duplex": 17, "core-util-is": 5, inherits: 10 }], 21: [function (e, n) {
      (function (r, o, a) {
        "use strict";
        function i(e) {
          var t = this;this.next = null, this.entry = null, this.finish = function () {
            E(t, e);
          };
        }function d(e) {
          return M.from(e);
        }function s(e) {
          return M.isBuffer(e) || e instanceof D;
        }function l() {}function c(n, r) {
          L = L || e("./_stream_duplex"), n = n || {};var o = r instanceof L;this.objectMode = !!n.objectMode, o && (this.objectMode = this.objectMode || !!n.writableObjectMode);var a = n.highWaterMark,
              d = n.writableHighWaterMark,
              s = this.objectMode ? 16 : 16384;this.highWaterMark = a || 0 === a ? a : o && (d || 0 === d) ? d : s, this.highWaterMark = t(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;var l = !1 === n.decodeStrings;this.decodeStrings = !l, this.defaultEncoding = n.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function (e) {
            y(r, e);
          }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new i(this);
        }function p(t) {
          return L = L || e("./_stream_duplex"), j.call(p, this) || this instanceof L ? void (this._writableState = new c(t, this), this.writable = !0, t && ("function" == typeof t.write && (this._write = t.write), "function" == typeof t.writev && (this._writev = t.writev), "function" == typeof t.destroy && (this._destroy = t.destroy), "function" == typeof t.final && (this._final = t.final)), N.call(this)) : new p(t);
        }function u(e, t) {
          var n = new Error("write after end");e.emit("error", n), A.nextTick(t, n);
        }function f(e, t, n, r) {
          var o = !0,
              a = !1;return null === n ? a = new TypeError("May not write null values to stream") : "string" != typeof n && void 0 !== n && !t.objectMode && (a = new TypeError("Invalid non-string/buffer chunk")), a && (e.emit("error", a), A.nextTick(r, a), o = !1), o;
        }function g(e, t, n) {
          return e.objectMode || !1 === e.decodeStrings || "string" != typeof t || (t = M.from(t, n)), t;
        }function h(e, t, n, r, o, a) {
          if (!n) {
            var i = g(t, r, o);r !== i && (n = !0, o = "buffer", r = i);
          }var d = t.objectMode ? 1 : r.length;t.length += d;var s = t.length < t.highWaterMark;if (s || (t.needDrain = !0), t.writing || t.corked) {
            var l = t.lastBufferedRequest;t.lastBufferedRequest = { chunk: r, encoding: o, isBuf: n, callback: a, next: null }, l ? l.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest, t.bufferedRequestCount += 1;
          } else m(e, t, !1, d, r, o, a);return s;
        }function m(e, t, n, r, o, a, i) {
          t.writelen = r, t.writecb = i, t.writing = !0, t.sync = !0, n ? e._writev(o, t.onwrite) : e._write(o, a, t.onwrite), t.sync = !1;
        }function _(e, t, n, r, o) {
          --t.pendingcb, n ? (A.nextTick(o, r), A.nextTick(k, e, t), e._writableState.errorEmitted = !0, e.emit("error", r)) : (o(r), e._writableState.errorEmitted = !0, e.emit("error", r), k(e, t));
        }function b(e) {
          e.writing = !1, e.writecb = null, e.length -= e.writelen, e.writelen = 0;
        }function y(e, t) {
          var n = e._writableState,
              r = n.sync,
              o = n.writecb;if (b(n), t) _(e, n, r, t, o);else {
            var a = v(n);a || n.corked || n.bufferProcessing || !n.bufferedRequest || S(e, n), r ? I(C, e, n, a, o) : C(e, n, a, o);
          }
        }function C(e, t, n, r) {
          n || w(e, t), t.pendingcb--, r(), k(e, t);
        }function w(e, t) {
          0 === t.length && t.needDrain && (t.needDrain = !1, e.emit("drain"));
        }function S(e, t) {
          t.bufferProcessing = !0;var n = t.bufferedRequest;if (e._writev && n && n.next) {
            var r = t.bufferedRequestCount,
                o = Array(r),
                a = t.corkedRequestsFree;a.entry = n;for (var d = 0, s = !0; n;) {
              o[d] = n, n.isBuf || (s = !1), n = n.next, d += 1;
            }o.allBuffers = s, m(e, t, !0, t.length, o, "", a.finish), t.pendingcb++, t.lastBufferedRequest = null, a.next ? (t.corkedRequestsFree = a.next, a.next = null) : t.corkedRequestsFree = new i(t), t.bufferedRequestCount = 0;
          } else {
            for (; n;) {
              var l = n.chunk,
                  c = n.encoding,
                  p = n.callback,
                  u = t.objectMode ? 1 : l.length;if (m(e, t, !1, u, l, c, p), n = n.next, t.bufferedRequestCount--, t.writing) break;
            }null === n && (t.lastBufferedRequest = null);
          }t.bufferedRequest = n, t.bufferProcessing = !1;
        }function v(e) {
          return e.ending && 0 === e.length && null === e.bufferedRequest && !e.finished && !e.writing;
        }function x(e, t) {
          e._final(function (n) {
            t.pendingcb--, n && e.emit("error", n), t.prefinished = !0, e.emit("prefinish"), k(e, t);
          });
        }function R(e, t) {
          t.prefinished || t.finalCalled || ("function" == typeof e._final ? (t.pendingcb++, t.finalCalled = !0, A.nextTick(x, e, t)) : (t.prefinished = !0, e.emit("prefinish")));
        }function k(e, t) {
          var n = v(t);return n && (R(e, t), 0 === t.pendingcb && (t.finished = !0, e.emit("finish"))), n;
        }function T(e, t, n) {
          t.ending = !0, k(e, t), n && (t.finished ? A.nextTick(n) : e.once("finish", n)), t.ended = !0, e.writable = !1;
        }function E(e, t, n) {
          var r = e.entry;for (e.entry = null; r;) {
            var o = r.callback;t.pendingcb--, o(n), r = r.next;
          }t.corkedRequestsFree ? t.corkedRequestsFree.next = e : t.corkedRequestsFree = e;
        }var A = e("process-nextick-args");n.exports = p;var L,
            I = !r.browser && -1 < ["v0.10", "v0.9."].indexOf(r.version.slice(0, 5)) ? a : A.nextTick;p.WritableState = c;var B = e("core-util-is");B.inherits = e("inherits");var F = { deprecate: e("util-deprecate") },
            N = e("./internal/streams/stream"),
            M = e("safe-buffer").Buffer,
            D = o.Uint8Array || function () {},
            P = e("./internal/streams/destroy");B.inherits(p, N), c.prototype.getBuffer = function () {
          for (var e = this.bufferedRequest, t = []; e;) {
            t.push(e), e = e.next;
          }return t;
        }, function () {
          try {
            Object.defineProperty(c.prototype, "buffer", { get: F.deprecate(function () {
                return this.getBuffer();
              }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003") });
          } catch (e) {}
        }();var j;"function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (j = Function.prototype[Symbol.hasInstance], Object.defineProperty(p, Symbol.hasInstance, { value: function value(e) {
            return !!j.call(this, e) || !(this !== p) && e && e._writableState instanceof c;
          } })) : j = function j(e) {
          return e instanceof this;
        }, p.prototype.pipe = function () {
          this.emit("error", new Error("Cannot pipe, not readable"));
        }, p.prototype.write = function (e, t, n) {
          var r = this._writableState,
              o = !1,
              a = !r.objectMode && s(e);return a && !M.isBuffer(e) && (e = d(e)), "function" == typeof t && (n = t, t = null), a ? t = "buffer" : !t && (t = r.defaultEncoding), "function" != typeof n && (n = l), r.ended ? u(this, n) : (a || f(this, r, e, n)) && (r.pendingcb++, o = h(this, r, a, e, t, n)), o;
        }, p.prototype.cork = function () {
          var e = this._writableState;e.corked++;
        }, p.prototype.uncork = function () {
          var e = this._writableState;e.corked && (e.corked--, !e.writing && !e.corked && !e.finished && !e.bufferProcessing && e.bufferedRequest && S(this, e));
        }, p.prototype.setDefaultEncoding = function (e) {
          if ("string" == typeof e && (e = e.toLowerCase()), !(-1 < ["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e + "").toLowerCase()))) throw new TypeError("Unknown encoding: " + e);return this._writableState.defaultEncoding = e, this;
        }, Object.defineProperty(p.prototype, "writableHighWaterMark", { enumerable: !1, get: function get() {
            return this._writableState.highWaterMark;
          } }), p.prototype._write = function (e, t, n) {
          n(new Error("_write() is not implemented"));
        }, p.prototype._writev = null, p.prototype.end = function (e, t, n) {
          var r = this._writableState;"function" == typeof e ? (n = e, e = null, t = null) : "function" == typeof t && (n = t, t = null), null !== e && e !== void 0 && this.write(e, t), r.corked && (r.corked = 1, this.uncork()), r.ending || r.finished || T(this, r, n);
        }, Object.defineProperty(p.prototype, "destroyed", { get: function get() {
            return void 0 !== this._writableState && this._writableState.destroyed;
          }, set: function set(e) {
            this._writableState && (this._writableState.destroyed = e);
          } }), p.prototype.destroy = P.destroy, p.prototype._undestroy = P.undestroy, p.prototype._destroy = function (e, t) {
          this.end(), t(e);
        };
      }).call(this, e("_process"), "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global, e("timers").setImmediate);
    }, { "./_stream_duplex": 17, "./internal/streams/destroy": 23, "./internal/streams/stream": 24, _process: 15, "core-util-is": 5, inherits: 10, "process-nextick-args": 14, "safe-buffer": 26, timers: 28, "util-deprecate": 29 }], 22: [function (e, t) {
      "use strict";
      function n(e, t) {
        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
      }function r(e, t, n) {
        e.copy(t, n);
      }var o = e("safe-buffer").Buffer,
          a = e("util");t.exports = function () {
        function e() {
          n(this, e), this.head = null, this.tail = null, this.length = 0;
        }return e.prototype.push = function (e) {
          var t = { data: e, next: null };0 < this.length ? this.tail.next = t : this.head = t, this.tail = t, ++this.length;
        }, e.prototype.unshift = function (e) {
          var t = { data: e, next: this.head };0 === this.length && (this.tail = t), this.head = t, ++this.length;
        }, e.prototype.shift = function () {
          if (0 !== this.length) {
            var e = this.head.data;return this.head = 1 === this.length ? this.tail = null : this.head.next, --this.length, e;
          }
        }, e.prototype.clear = function () {
          this.head = this.tail = null, this.length = 0;
        }, e.prototype.join = function (e) {
          if (0 === this.length) return "";for (var t = this.head, n = "" + t.data; t = t.next;) {
            n += e + t.data;
          }return n;
        }, e.prototype.concat = function (e) {
          if (0 === this.length) return o.alloc(0);if (1 === this.length) return this.head.data;for (var t = o.allocUnsafe(e >>> 0), n = this.head, a = 0; n;) {
            r(n.data, t, a), a += n.data.length, n = n.next;
          }return t;
        }, e;
      }(), a && a.inspect && a.inspect.custom && (t.exports.prototype[a.inspect.custom] = function () {
        var e = a.inspect({ length: this.length });return this.constructor.name + " " + e;
      });
    }, { "safe-buffer": 26, util: 2 }], 23: [function (e, t) {
      "use strict";
      function n(e, t) {
        e.emit("error", t);
      }var r = e("process-nextick-args");t.exports = { destroy: function destroy(e, t) {
          var o = this,
              a = this._readableState && this._readableState.destroyed,
              i = this._writableState && this._writableState.destroyed;return a || i ? (t ? t(e) : e && (!this._writableState || !this._writableState.errorEmitted) && r.nextTick(n, this, e), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(e || null, function (e) {
            !t && e ? (r.nextTick(n, o, e), o._writableState && (o._writableState.errorEmitted = !0)) : t && t(e);
          }), this);
        }, undestroy: function undestroy() {
          this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
        } };
    }, { "process-nextick-args": 14 }], 24: [function (e, t) {
      t.exports = e("events").EventEmitter;
    }, { events: 4 }], 25: [function (e, t, n) {
      n = t.exports = e("./lib/_stream_readable.js"), n.Stream = n, n.Readable = n, n.Writable = e("./lib/_stream_writable.js"), n.Duplex = e("./lib/_stream_duplex.js"), n.Transform = e("./lib/_stream_transform.js"), n.PassThrough = e("./lib/_stream_passthrough.js");
    }, { "./lib/_stream_duplex.js": 17, "./lib/_stream_passthrough.js": 18, "./lib/_stream_readable.js": 19, "./lib/_stream_transform.js": 20, "./lib/_stream_writable.js": 21 }], 26: [function (e, t, n) {
      function r(e, t) {
        for (var n in e) {
          t[n] = e[n];
        }
      }function o(e, t, n) {
        return i(e, t, n);
      }var a = e("buffer"),
          i = a.Buffer;i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? t.exports = a : (r(a, n), n.Buffer = o), r(i, o), o.from = function (e, t, n) {
        if ("number" == typeof e) throw new TypeError("Argument must not be a number");return i(e, t, n);
      }, o.alloc = function (e, t, n) {
        if ("number" != typeof e) throw new TypeError("Argument must be a number");var r = i(e);return void 0 === t ? r.fill(0) : "string" == typeof n ? r.fill(t, n) : r.fill(t), r;
      }, o.allocUnsafe = function (e) {
        if ("number" != typeof e) throw new TypeError("Argument must be a number");return i(e);
      }, o.allocUnsafeSlow = function (e) {
        if ("number" != typeof e) throw new TypeError("Argument must be a number");return a.SlowBuffer(e);
      };
    }, { buffer: 3 }], 27: [function (e, t, n) {
      "use strict";
      function r(e) {
        if (!e) return "utf8";for (var t;;) {
          switch (e) {case "utf8":case "utf-8":
              return "utf8";case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
              return "utf16le";case "latin1":case "binary":
              return "latin1";case "base64":case "ascii":case "hex":
              return e;default:
              if (t) return;e = ("" + e).toLowerCase(), t = !0;}
        }
      }function o(e) {
        var t = r(e);if ("string" != typeof t && (m.isEncoding === _ || !_(e))) throw new Error("Unknown encoding: " + e);return t || e;
      }function a(e) {
        this.encoding = o(e);var t;switch (this.encoding) {case "utf16le":
            this.text = c, this.end = p, t = 4;break;case "utf8":
            this.fillLast = l, t = 4;break;case "base64":
            this.text = u, this.end = f, t = 3;break;default:
            return this.write = g, void (this.end = h);}this.lastNeed = 0, this.lastTotal = 0, this.lastChar = m.allocUnsafe(t);
      }function d(e) {
        if (127 >= e) return 0;return 6 == e >> 5 ? 2 : 14 == e >> 4 ? 3 : 30 == e >> 3 ? 4 : 2 == e >> 6 ? -1 : -2;
      }function s(e, t, n) {
        var r = t.length - 1;if (r < n) return 0;var o = d(t[r]);return 0 <= o ? (0 < o && (e.lastNeed = o - 1), o) : --r < n || -2 === o ? 0 : (o = d(t[r]), 0 <= o) ? (0 < o && (e.lastNeed = o - 2), o) : --r < n || -2 === o ? 0 : (o = d(t[r]), 0 <= o ? (0 < o && (2 === o ? o = 0 : e.lastNeed = o - 3), o) : 0);
      }function i(e, t) {
        if (128 != (192 & t[0])) return e.lastNeed = 0, "\uFFFD";if (1 < e.lastNeed && 1 < t.length) {
          if (128 != (192 & t[1])) return e.lastNeed = 1, "\uFFFD";if (2 < e.lastNeed && 2 < t.length && 128 != (192 & t[2])) return e.lastNeed = 2, "\uFFFD";
        }
      }function l(e) {
        var t = this.lastTotal - this.lastNeed,
            n = i(this, e, t);return void 0 === n ? this.lastNeed <= e.length ? (e.copy(this.lastChar, t, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : void (e.copy(this.lastChar, t, 0, e.length), this.lastNeed -= e.length) : n;
      }function c(e, t) {
        if (0 == (e.length - t) % 2) {
          var n = e.toString("utf16le", t);if (n) {
            var r = n.charCodeAt(n.length - 1);if (55296 <= r && 56319 >= r) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1], n.slice(0, -1);
          }return n;
        }return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = e[e.length - 1], e.toString("utf16le", t, e.length - 1);
      }function p(e) {
        var t = e && e.length ? this.write(e) : "";if (this.lastNeed) {
          var n = this.lastTotal - this.lastNeed;return t + this.lastChar.toString("utf16le", 0, n);
        }return t;
      }function u(e, t) {
        var r = (e.length - t) % 3;return 0 == r ? e.toString("base64", t) : (this.lastNeed = 3 - r, this.lastTotal = 3, 1 == r ? this.lastChar[0] = e[e.length - 1] : (this.lastChar[0] = e[e.length - 2], this.lastChar[1] = e[e.length - 1]), e.toString("base64", t, e.length - r));
      }function f(e) {
        var t = e && e.length ? this.write(e) : "";return this.lastNeed ? t + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : t;
      }function g(e) {
        return e.toString(this.encoding);
      }function h(e) {
        return e && e.length ? this.write(e) : "";
      }var m = e("safe-buffer").Buffer,
          _ = m.isEncoding || function (e) {
        switch (e = "" + e, e && e.toLowerCase()) {case "hex":case "utf8":case "utf-8":case "ascii":case "binary":case "base64":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":case "raw":
            return !0;default:
            return !1;}
      };n.StringDecoder = a, a.prototype.write = function (e) {
        if (0 === e.length) return "";var t, n;if (this.lastNeed) {
          if (t = this.fillLast(e), void 0 === t) return "";n = this.lastNeed, this.lastNeed = 0;
        } else n = 0;return n < e.length ? t ? t + this.text(e, n) : this.text(e, n) : t || "";
      }, a.prototype.end = function (e) {
        var t = e && e.length ? this.write(e) : "";return this.lastNeed ? t + "\uFFFD" : t;
      }, a.prototype.text = function (e, t) {
        var n = s(this, e, t);if (!this.lastNeed) return e.toString("utf8", t);this.lastTotal = n;var r = e.length - (n - this.lastNeed);return e.copy(this.lastChar, 0, r), e.toString("utf8", t, r);
      }, a.prototype.fillLast = function (e) {
        return this.lastNeed <= e.length ? (e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : void (e.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, e.length), this.lastNeed -= e.length);
      };
    }, { "safe-buffer": 26 }], 28: [function (e, t, n) {
      (function (t, r) {
        function o(e, t) {
          this._id = e, this._clearFn = t;
        }var a = e("process/browser.js").nextTick,
            i = Function.prototype.apply,
            d = Array.prototype.slice,
            s = {},
            l = 0;n.setTimeout = function () {
          return new o(i.call(setTimeout, window, arguments), clearTimeout);
        }, n.setInterval = function () {
          return new o(i.call(setInterval, window, arguments), clearInterval);
        }, n.clearTimeout = n.clearInterval = function (e) {
          e.close();
        }, o.prototype.unref = o.prototype.ref = function () {}, o.prototype.close = function () {
          this._clearFn.call(window, this._id);
        }, n.enroll = function (e, t) {
          clearTimeout(e._idleTimeoutId), e._idleTimeout = t;
        }, n.unenroll = function (e) {
          clearTimeout(e._idleTimeoutId), e._idleTimeout = -1;
        }, n._unrefActive = n.active = function (e) {
          clearTimeout(e._idleTimeoutId);var t = e._idleTimeout;0 <= t && (e._idleTimeoutId = setTimeout(function () {
            e._onTimeout && e._onTimeout();
          }, t));
        }, n.setImmediate = "function" == typeof t ? t : function (e) {
          var t = l++,
              r = !(2 > arguments.length) && d.call(arguments, 1);return s[t] = !0, a(function () {
            s[t] && (r ? e.apply(null, r) : e.call(null), n.clearImmediate(t));
          }), t;
        }, n.clearImmediate = "function" == typeof r ? r : function (e) {
          delete s[e];
        };
      }).call(this, e("timers").setImmediate, e("timers").clearImmediate);
    }, { "process/browser.js": 15, timers: 28 }], 29: [function (e, t) {
      (function (e) {
        function n(t) {
          try {
            if (!e.localStorage) return !1;
          } catch (e) {
            return !1;
          }var n = e.localStorage[t];return null != n && "true" === (n + "").toLowerCase();
        }t.exports = function (e, t) {
          function r() {
            if (!o) {
              if (n("throwDeprecation")) throw new Error(t);else n("traceDeprecation") ? console.trace(t) : console.warn(t);o = !0;
            }return e.apply(this, arguments);
          }if (n("noDeprecation")) return e;var o = !1;return r;
        };
      }).call(this, "undefined" == typeof global ? "undefined" == typeof self ? "undefined" == typeof window ? {} : window : self : global);
    }, {}], "/": [function (e, t) {
      (function (n) {
        function r(e) {
          var t = this;if (!(t instanceof r)) return new r(e);if (t._id = l(4).toString("hex").slice(0, 7), t._debug("new peer %o", e), e = Object.assign({ allowHalfOpen: !1 }, e), c.Duplex.call(t, e), t.channelName = e.initiator ? e.channelName || l(20).toString("hex") : null, t._isChromium = "undefined" != typeof window && !!window.webkitRTCPeerConnection, t.initiator = e.initiator || !1, t.channelConfig = e.channelConfig || r.channelConfig, t.config = e.config || r.config, t.constraints = t._transformConstraints(e.constraints || r.constraints), t.offerConstraints = t._transformConstraints(e.offerConstraints || {}), t.answerConstraints = t._transformConstraints(e.answerConstraints || {}), t.sdpTransform = e.sdpTransform || function (e) {
            return e;
          }, t.streams = e.streams || (e.stream ? [e.stream] : []), t.trickle = void 0 === e.trickle || e.trickle, t.destroyed = !1, t.connected = !1, t.remoteAddress = void 0, t.remoteFamily = void 0, t.remotePort = void 0, t.localAddress = void 0, t.localPort = void 0, t._wrtc = e.wrtc && "object" == _typeof(e.wrtc) ? e.wrtc : d(), !t._wrtc) if ("undefined" == typeof window) throw o("No WebRTC support: Specify `opts.wrtc` option in this environment", "ERR_WEBRTC_SUPPORT");else throw o("No WebRTC support: Not a supported browser", "ERR_WEBRTC_SUPPORT");t._pcReady = !1, t._channelReady = !1, t._iceComplete = !1, t._channel = null, t._pendingCandidates = [], t._isNegotiating = !1, t._batchedNegotiation = !1, t._queuedNegotiation = !1, t._sendersAwaitingStable = [], t._senderMap = new WeakMap(), t._remoteTracks = [], t._remoteStreams = [], t._chunk = null, t._cb = null, t._interval = null, t._pc = new t._wrtc.RTCPeerConnection(t.config, t.constraints), t._isReactNativeWebrtc = "number" == typeof t._pc._peerConnectionId, t._pc.oniceconnectionstatechange = function () {
            t._onIceStateChange();
          }, t._pc.onicegatheringstatechange = function () {
            t._onIceStateChange();
          }, t._pc.onsignalingstatechange = function () {
            t._onSignalingStateChange();
          }, t._pc.onicecandidate = function (e) {
            t._onIceCandidate(e);
          }, t.initiator ? t._setupData({ channel: t._pc.createDataChannel(t.channelName, t.channelConfig) }) : t._pc.ondatachannel = function (e) {
            t._setupData(e);
          }, "addTrack" in t._pc && (t.streams && t.streams.forEach(function (e) {
            t.addStream(e);
          }), t._pc.ontrack = function (e) {
            t._onTrack(e);
          }), t.initiator && t._needsNegotiation(), t._onFinishBound = function () {
            t._onFinish();
          }, t.once("finish", t._onFinishBound);
        }function o(e, t) {
          var n = new Error(e);return n.code = t, n;
        }function a() {}t.exports = r;var i = e("debug")("simple-peer"),
            d = e("get-browser-rtc"),
            s = e("inherits"),
            l = e("randombytes"),
            c = e("readable-stream"),
            p = 65536;s(r, c.Duplex), r.WEBRTC_SUPPORT = !!d(), r.config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478?transport=udp" }] }, r.constraints = {}, r.channelConfig = {}, Object.defineProperty(r.prototype, "bufferSize", { get: function get() {
            var e = this;return e._channel && e._channel.bufferedAmount || 0;
          } }), r.prototype.address = function () {
          var e = this;return { port: e.localPort, family: "IPv4", address: e.localAddress };
        }, r.prototype.signal = function (e) {
          var t = this;if (t.destroyed) throw o("cannot signal after peer is destroyed", "ERR_SIGNALING");if ("string" == typeof e) try {
            e = JSON.parse(e);
          } catch (t) {
            e = {};
          }t._debug("signal()"), e.renegotiate && (t._debug("got request to renegotiate"), t._needsNegotiation()), e.candidate && (t._pc.remoteDescription && t._pc.remoteDescription.type ? t._addIceCandidate(e.candidate) : t._pendingCandidates.push(e.candidate)), e.sdp && t._pc.setRemoteDescription(new t._wrtc.RTCSessionDescription(e), function () {
            t.destroyed || (t._pendingCandidates.forEach(function (e) {
              t._addIceCandidate(e);
            }), t._pendingCandidates = [], "offer" === t._pc.remoteDescription.type && t._createAnswer());
          }, function (e) {
            t.destroy(o(e, "ERR_SET_REMOTE_DESCRIPTION"));
          }), e.sdp || e.candidate || e.renegotiate || t.destroy(o("signal() called with invalid signal data", "ERR_SIGNALING"));
        }, r.prototype._addIceCandidate = function (e) {
          var t = this;try {
            t._pc.addIceCandidate(new t._wrtc.RTCIceCandidate(e), a, function (e) {
              t.destroy(o(e, "ERR_ADD_ICE_CANDIDATE"));
            });
          } catch (e) {
            t.destroy(o("error adding candidate: " + e.message, "ERR_ADD_ICE_CANDIDATE"));
          }
        }, r.prototype.send = function (e) {
          var t = this;t._channel.send(e);
        }, r.prototype.addStream = function (e) {
          var t = this;t._debug("addStream()"), e.getTracks().forEach(function (n) {
            t.addTrack(n, e);
          });
        }, r.prototype.addTrack = function (e, t) {
          var n = this;n._debug("addTrack()");var r = n._pc.addTrack(e, t),
              o = n._senderMap.get(e) || new WeakMap();o.set(t, r), n._senderMap.set(e, o), n._needsNegotiation();
        }, r.prototype.removeTrack = function (e, t) {
          var n = this;n._debug("removeSender()");var r = n._senderMap.get(e),
              o = r ? r.get(t) : null;o || n.destroy(new Error("Cannot remove track that was never added."));try {
            n._pc.removeTrack(o);
          } catch (e) {
            "NS_ERROR_UNEXPECTED" === e.name ? n._sendersAwaitingStable.push(o) : n.destroy(e);
          }
        }, r.prototype.removeStream = function (e) {
          var t = this;t._debug("removeSenders()"), e.getTracks().forEach(function (n) {
            t.removeTrack(n, e);
          });
        }, r.prototype._needsNegotiation = function () {
          var e = this;e._debug("_needsNegotiation"), e._batchedNegotiation || (e._batchedNegotiation = !0, setTimeout(function () {
            e._batchedNegotiation = !1, e._debug("starting batched negotiation"), e.negotiate();
          }, 0));
        }, r.prototype.negotiate = function () {
          var e = this;e.initiator ? e._isNegotiating ? (e._queuedNegotiation = !0, e._debug("already negotiating, queueing")) : (e._debug("start negotiation"), e._createOffer()) : (e._debug("requesting negotiation from initiator"), e.emit("signal", { renegotiate: !0 })), e._isNegotiating = !0;
        }, r.prototype.destroy = function (e) {
          var t = this;t._destroy(e, function () {});
        }, r.prototype._destroy = function (e, t) {
          var n = this;if (!n.destroyed) {
            if (n._debug("destroy (error: %s)", e && (e.message || e)), n.readable = n.writable = !1, n._readableState.ended || n.push(null), n._writableState.finished || n.end(), n.destroyed = !0, n.connected = !1, n._pcReady = !1, n._channelReady = !1, n._remoteTracks = null, n._remoteStreams = null, n._senderMap = null, clearInterval(n._interval), n._interval = null, n._chunk = null, n._cb = null, n._onFinishBound && n.removeListener("finish", n._onFinishBound), n._onFinishBound = null, n._channel) {
              try {
                n._channel.close();
              } catch (e) {}n._channel.onmessage = null, n._channel.onopen = null, n._channel.onclose = null, n._channel.onerror = null;
            }if (n._pc) {
              try {
                n._pc.close();
              } catch (e) {}n._pc.oniceconnectionstatechange = null, n._pc.onicegatheringstatechange = null, n._pc.onsignalingstatechange = null, n._pc.onicecandidate = null, "addTrack" in n._pc && (n._pc.ontrack = null), n._pc.ondatachannel = null;
            }n._pc = null, n._channel = null, e && n.emit("error", e), n.emit("close"), t();
          }
        }, r.prototype._setupData = function (e) {
          var t = this;return e.channel ? void (t._channel = e.channel, t._channel.binaryType = "arraybuffer", "number" == typeof t._channel.bufferedAmountLowThreshold && (t._channel.bufferedAmountLowThreshold = p), t.channelName = t._channel.label, t._channel.onmessage = function (e) {
            t._onChannelMessage(e);
          }, t._channel.onbufferedamountlow = function () {
            t._onChannelBufferedAmountLow();
          }, t._channel.onopen = function () {
            t._onChannelOpen();
          }, t._channel.onclose = function () {
            t._onChannelClose();
          }, t._channel.onerror = function (e) {
            t.destroy(o(e, "ERR_DATA_CHANNEL"));
          }) : t.destroy(o("Data channel event is missing `channel` property", "ERR_DATA_CHANNEL"));
        }, r.prototype._read = function () {}, r.prototype._write = function (e, t, n) {
          var r = this;if (r.destroyed) return n(o("cannot write after peer is destroyed", "ERR_DATA_CHANNEL"));if (r.connected) {
            try {
              r.send(e);
            } catch (e) {
              return r.destroy(o(e, "ERR_DATA_CHANNEL"));
            }r._channel.bufferedAmount > p ? (r._debug("start backpressure: bufferedAmount %d", r._channel.bufferedAmount), r._cb = n) : n(null);
          } else r._debug("write before connect"), r._chunk = e, r._cb = n;
        }, r.prototype._onFinish = function () {
          function e() {
            setTimeout(function () {
              t.destroy();
            }, 1e3);
          }var t = this;t.destroyed || (t.connected ? e() : t.once("connect", e));
        }, r.prototype._createOffer = function () {
          var e = this;e.destroyed || e._pc.createOffer(function (t) {
            function n() {
              var n = e._pc.localDescription || t;e._debug("signal"), e.emit("signal", { type: n.type, sdp: n.sdp });
            }e.destroyed || (t.sdp = e.sdpTransform(t.sdp), e._pc.setLocalDescription(t, function () {
              e._debug("createOffer success"), e.destroyed || (e.trickle || e._iceComplete ? n() : e.once("_iceComplete", n));
            }, function (t) {
              e.destroy(o(t, "ERR_SET_LOCAL_DESCRIPTION"));
            }));
          }, function (t) {
            e.destroy(o(t, "ERR_CREATE_OFFER"));
          }, e.offerConstraints);
        }, r.prototype._createAnswer = function () {
          var e = this;e.destroyed || e._pc.createAnswer(function (t) {
            function n() {
              var n = e._pc.localDescription || t;e._debug("signal"), e.emit("signal", { type: n.type, sdp: n.sdp });
            }e.destroyed || (t.sdp = e.sdpTransform(t.sdp), e._pc.setLocalDescription(t, function () {
              e.destroyed || (e.trickle || e._iceComplete ? n() : e.once("_iceComplete", n));
            }, function (t) {
              e.destroy(o(t, "ERR_SET_LOCAL_DESCRIPTION"));
            }));
          }, function (t) {
            e.destroy(o(t, "ERR_CREATE_ANSWER"));
          }, e.answerConstraints);
        }, r.prototype._onIceStateChange = function () {
          var e = this;if (!e.destroyed) {
            var t = e._pc.iceConnectionState,
                n = e._pc.iceGatheringState;e._debug("iceStateChange (connection: %s) (gathering: %s)", t, n), e.emit("iceStateChange", t, n), ("connected" === t || "completed" === t) && (e._pcReady = !0, e._maybeReady()), "failed" === t && e.destroy(o("Ice connection failed.", "ERR_ICE_CONNECTION_FAILURE")), "closed" === t && e.destroy(new Error("Ice connection closed."));
          }
        }, r.prototype.getStats = function (e) {
          var t = this;0 === t._pc.getStats.length ? t._pc.getStats().then(function (t) {
            var n = [];t.forEach(function (e) {
              n.push(e);
            }), e(null, n);
          }, function (t) {
            e(t);
          }) : t._isReactNativeWebrtc ? t._pc.getStats(null, function (t) {
            var n = [];t.forEach(function (e) {
              n.push(e);
            }), e(null, n);
          }, function (t) {
            e(t);
          }) : 0 < t._pc.getStats.length ? t._pc.getStats(function (n) {
            if (!t.destroyed) {
              var r = [];n.result().forEach(function (e) {
                var t = {};e.names().forEach(function (n) {
                  t[n] = e.stat(n);
                }), t.id = e.id, t.type = e.type, t.timestamp = e.timestamp, r.push(t);
              }), e(null, r);
            }
          }, function (t) {
            e(t);
          }) : e(null, []);
        }, r.prototype._maybeReady = function () {
          function e() {
            t.destroyed || t.getStats(function (n, r) {
              function a(e) {
                l = !0;var n = d[e.localCandidateId];n && n.ip ? (t.localAddress = n.ip, t.localPort = +n.port) : n && n.ipAddress ? (t.localAddress = n.ipAddress, t.localPort = +n.portNumber) : "string" == typeof e.googLocalAddress && (n = e.googLocalAddress.split(":"), t.localAddress = n[0], t.localPort = +n[1]);var r = i[e.remoteCandidateId];r && r.ip ? (t.remoteAddress = r.ip, t.remotePort = +r.port) : r && r.ipAddress ? (t.remoteAddress = r.ipAddress, t.remotePort = +r.portNumber) : "string" == typeof e.googRemoteAddress && (r = e.googRemoteAddress.split(":"), t.remoteAddress = r[0], t.remotePort = +r[1]), t.remoteFamily = "IPv4", t._debug("connect local: %s:%s remote: %s:%s", t.localAddress, t.localPort, t.remoteAddress, t.remotePort);
              }if (!t.destroyed) {
                n && (r = []);var i = {},
                    d = {},
                    s = {},
                    l = !1;if (r.forEach(function (e) {
                  ("remotecandidate" === e.type || "remote-candidate" === e.type) && (i[e.id] = e), ("localcandidate" === e.type || "local-candidate" === e.type) && (d[e.id] = e), ("candidatepair" === e.type || "candidate-pair" === e.type) && (s[e.id] = e);
                }), r.forEach(function (e) {
                  "transport" === e.type && e.selectedCandidatePairId && a(s[e.selectedCandidatePairId]), ("googCandidatePair" === e.type && "true" === e.googActiveConnection || ("candidatepair" === e.type || "candidate-pair" === e.type) && e.selected) && a(e);
                }), !l && (!Object.keys(s).length || Object.keys(d).length)) return void setTimeout(e, 100);if (t._connecting = !1, t.connected = !0, t._chunk) {
                  try {
                    t.send(t._chunk);
                  } catch (e) {
                    return t.destroy(o(e, "ERR_DATA_CHANNEL"));
                  }t._chunk = null, t._debug("sent chunk from \"write before connect\"");var c = t._cb;t._cb = null, c(null);
                }"number" != typeof t._channel.bufferedAmountLowThreshold && (t._interval = setInterval(function () {
                  t._onInterval();
                }, 150), t._interval.unref && t._interval.unref()), t._debug("connect"), t.emit("connect");
              }
            });
          }var t = this;t._debug("maybeReady pc %s channel %s", t._pcReady, t._channelReady), t.connected || t._connecting || !t._pcReady || !t._channelReady || (t._connecting = !0, e());
        }, r.prototype._onInterval = function () {
          var e = this;e._cb && e._channel && !(e._channel.bufferedAmount > p) && e._onChannelBufferedAmountLow();
        }, r.prototype._onSignalingStateChange = function () {
          var e = this;e.destroyed || ("stable" === e._pc.signalingState && (e._isNegotiating = !1, e._debug("flushing sender queue", e._sendersAwaitingStable), e._sendersAwaitingStable.forEach(function (t) {
            e.removeTrack(t), e._queuedNegotiation = !0;
          }), e._sendersAwaitingStable = [], e._queuedNegotiation && (e._debug("flushing negotiation queue"), e._queuedNegotiation = !1, e._needsNegotiation()), e._debug("negotiate"), e.emit("negotiate")), e._debug("signalingStateChange %s", e._pc.signalingState), e.emit("signalingStateChange", e._pc.signalingState));
        }, r.prototype._onIceCandidate = function (e) {
          var t = this;t.destroyed || (e.candidate && t.trickle ? t.emit("signal", { candidate: { candidate: e.candidate.candidate, sdpMLineIndex: e.candidate.sdpMLineIndex, sdpMid: e.candidate.sdpMid } }) : !e.candidate && (t._iceComplete = !0, t.emit("_iceComplete")));
        }, r.prototype._onChannelMessage = function (e) {
          var t = this;if (!t.destroyed) {
            var r = e.data;r instanceof ArrayBuffer && (r = n.from(r)), t.push(r);
          }
        }, r.prototype._onChannelBufferedAmountLow = function () {
          var e = this;if (!e.destroyed && e._cb) {
            e._debug("ending backpressure: bufferedAmount %d", e._channel.bufferedAmount);var t = e._cb;e._cb = null, t(null);
          }
        }, r.prototype._onChannelOpen = function () {
          var e = this;e.connected || e.destroyed || (e._debug("on channel open"), e._channelReady = !0, e._maybeReady());
        }, r.prototype._onChannelClose = function () {
          var e = this;e.destroyed || (e._debug("on channel close"), e.destroy());
        }, r.prototype._onTrack = function (e) {
          var t = this;t.destroyed || e.streams.forEach(function (n) {
            t._debug("on track"), t.emit("track", e.track, n), t._remoteTracks.push({ track: e.track, stream: n }), t._remoteStreams.some(function (e) {
              return e.id === n.id;
            }) || (t._remoteStreams.push(n), setTimeout(function () {
              t.emit("stream", n);
            }, 0));
          });
        }, r.prototype._debug = function () {
          var e = this,
              t = [].slice.call(arguments);t[0] = "[" + e._id + "] " + t[0], i.apply(null, t);
        }, r.prototype._transformConstraints = function (e) {
          var t = this;if (0 === Object.keys(e).length) return e;if ((e.mandatory || e.optional) && !t._isChromium) {
            var n = Object.assign({}, e.optional, e.mandatory);return void 0 !== n.OfferToReceiveVideo && (n.offerToReceiveVideo = n.OfferToReceiveVideo, delete n.OfferToReceiveVideo), void 0 !== n.OfferToReceiveAudio && (n.offerToReceiveAudio = n.OfferToReceiveAudio, delete n.OfferToReceiveAudio), n;
          }return e.mandatory || e.optional || !t._isChromium ? e : (void 0 !== e.offerToReceiveVideo && (e.OfferToReceiveVideo = e.offerToReceiveVideo, delete e.offerToReceiveVideo), void 0 !== e.offerToReceiveAudio && (e.OfferToReceiveAudio = e.offerToReceiveAudio, delete e.offerToReceiveAudio), { mandatory: e });
        };
      }).call(this, e("buffer").Buffer);
    }, { buffer: 3, debug: 6, "get-browser-rtc": 8, inherits: 10, randombytes: 16, "readable-stream": 25 }] }, {}, [])("/");
});

});

require.register("js/subs.js", function(exports, require, module) {
"use strict";

console.log("This works");

subs = document.getElementById("subs").innerHTML;

subs_input = document.getElementById("subs_input");
subs_form = document.getElementById("subs_form");
users_list = document.getElementById("users_list");

window.onload = fill_input();

function fill_input() {
    //console.log("this works")
    subs_str = subs.replace(/"/g, '');
    subs_form.setAttribute('value', subs_str);
};

function exists(list, entry) {
    entry = entry;
    if (list.search(entry) != -1) {
        return true;
    } else {
        return false;
    }
};

function add_sub() {
    console.log(subs_form.value);
    if (subs_form.value == '') {
        //console.log(subs)
        subs_str = subs.replace(/"/g, '');
        subs_form.setAttribute('value', subs_str);
    } else {
        subs_form_value = subs_form.getAttribute('value');
        subs_input_value = subs_input.value;
        entry = ", " + subs_input_value;

        if (exists(subs_form_value, entry)) {
            alert("already exists");
        } else {

            users_list.innerHTML += '<li class="list-group-item" id="' + subs_input_value + '"> <a href="/user/' + subs_input_value + '" >' + subs_input_value + ' - pending </a> <span class="btn btn-danger" onclick="remove_sub(' + subs_input_value + ')">X</span> </li>';

            subs_form.setAttribute('value', subs_form_value + entry);
        };
    };
    //here
    subs_input.value = '';
};

function remove_sub(entry_id) {
    subs_form_value = subs_form.getAttribute('value');

    subs_str = subs_form_value.replace(', ' + entry_id, '');
    console.log(subs_str);
    subs_form.setAttribute('value', subs_str);
    var node = document.getElementById(entry_id);
    node.remove();
};

});

require.register("js/video.js", function(exports, require, module) {
"use strict";

});

require.alias("buffer/index.js", "buffer");
require.alias("core-util-is/lib/util.js", "core-util-is");
require.alias("events/events.js", "events");
require.alias("inherits/inherits_browser.js", "inherits");
require.alias("phoenix/priv/static/phoenix.js", "phoenix");
require.alias("phoenix_html/priv/static/phoenix_html.js", "phoenix_html");
require.alias("process/browser.js", "process");
require.alias("randombytes/browser.js", "randombytes");
require.alias("readable-stream/readable-browser.js", "readable-stream");
require.alias("readable-stream/lib/internal/streams/stream-browser.js", "readable-stream/lib/internal/streams/stream");
require.alias("readable-stream/lib/internal/streams/stream-browser.js", "readable-stream/lib/internal/streams/stream.js");
require.alias("readable-stream/readable-browser.js", "readable-stream/readable");
require.alias("readable-stream/readable-browser.js", "readable-stream/readable.js");
require.alias("simple-peer/node_modules/debug/src/browser.js", "simple-peer/node_modules/debug");
require.alias("string_decoder/lib/string_decoder.js", "string_decoder");
require.alias("util-deprecate/browser.js", "util-deprecate");process = require('process');require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.Peer = require("simple-peer");


});})();require('___globals___');

require('js/app');
//# sourceMappingURL=app.js.map