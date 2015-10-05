(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

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
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  function Foo () {}
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    arr.constructor = Foo
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Foo && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

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

  if (typeof ArrayBuffer !== 'undefined' && object.buffer instanceof ArrayBuffer) {
    return fromTypedArray(that, object)
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

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
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
  } else if (list.length === 1) {
    return list[0]
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

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

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

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
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
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
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
    newBuf = Buffer._augment(this.subarray(start, end))
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
  this[offset] = value
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
    this[offset] = value
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
    this[offset + 1] = value
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
    this[offset] = value
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
    this[offset + 3] = value
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
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
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
    this[offset + 1] = value
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
    this[offset] = value
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
    this[offset + 3] = value
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

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
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

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

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
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

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
    } else if (codePoint < 0x200000) {
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

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":2,"ieee754":3,"is-array":4}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
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
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
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
        setTimeout(drainQueue, 0);
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

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
(function (process,Buffer){
var req = require('request')

module.exports = Nets

function Nets (opts, cb) {
  if (typeof opts === 'string') opts = { uri: opts }

  // in node, if encoding === null then response will be a Buffer. we want this to be the default
  if (!opts.hasOwnProperty('encoding')) opts.encoding = null

  // in browser, we should by default convert the arraybuffer into a Buffer
  if (process.browser && !opts.hasOwnProperty('json') && opts.encoding === null) {
    opts.responseType = 'arraybuffer'
    var originalCb = cb
    cb = bufferify
  }

  function bufferify (err, resp, body) {
    if (body) body = new Buffer(new Uint8Array(body))
    originalCb(err, resp, body)
  }

  return req(opts, cb)
}

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":5,"buffer":1,"request":7}],7:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var parseHeaders = require("parse-headers")


var XHR = window.XMLHttpRequest || noop
var XDR = "withCredentials" in (new XHR()) ? XHR : window.XDomainRequest

module.exports = createXHR

function createXHR(options, callback) {
    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }
    
    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }
    
    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "unknown") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        clearTimeout(timeoutTimer)
        
        var status = (xhr.status === 1223 ? 204 : xhr.status)
        var response = failureResponse
        var err = null
        
        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)
        
    }
    
    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new XDR()
        }else{
            xhr = new XHR()
        }
    }

    var key
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["Content-Type"] = "application/json"
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync)
    //has to be after open
    xhr.withCredentials = !!options.withCredentials
    
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            xhr.abort("timeout");
        }, options.timeout+2 );
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }
    
    if ("beforeSend" in options && 
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}


function noop() {}

},{"global/window":8,"once":9,"parse-headers":13}],8:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],10:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":11}],11:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],12:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],13:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":10,"trim":12}],14:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
ActivitySearch = function ActivitySearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

ActivitySearch.prototype.getTypes = function(activityUnit, page, pageSize, orderBy, lens, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    activityUnit ? params['activity_unit'] = activityUnit : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pharmacology/filters/activities?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ActivitySearch.prototype.getUnits = function(activityType, lens, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    lens ? params['_lens'] = lens : '';
    var unitsURL = null;
    activityType != null ? unitsURL = '/pharmacology/filters/units/' + activityType : unitsURL = '/pharmacology/filters/units';
    nets({
        url: this.baseURL + unitsURL + '?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ActivitySearch.prototype.getAllUnits = function(page, pageSize, orderBy, lens, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    nets({
        url: this.baseURL + '/pharmacology/filters/units?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

ActivitySearch.prototype.parseTypes = function(response) {
    var activityTypes = [];
	    Utils.arrayify(response.items).forEach(function(item, i) {
          activityTypes.push({uri: item["_about"], label: item.label});
	    });
	return activityTypes;
}

ActivitySearch.prototype.parseUnits = function(response) {
    var units = [];
	response.primaryTopic.unit.forEach(function(type, i) {
            units.push({uri: type["_about"], label: type.label});
	});
	return units;
}

ActivitySearch.prototype.parseAllUnits = function(response) {
    var units = [];
	response.items.forEach(function(item, i) {
            units.push({uri: item["_about"], label: item.label});
	});
	return units;
}

exports.ActivitySearch = ActivitySearch;

},{"./Constants":17,"./Utils":27,"nets":6}],15:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
CompoundSearch = function CompoundSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the compound represented by the URI provided.
 * @param {string} URI - The URI for the compound of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var compoundResult = searcher.parseCompoundResponse(response);
 * };
 * searcher.fetchCompound('http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', null, callback);
 */
CompoundSearch.prototype.fetchCompound = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/compound?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch the compounds matching the list of URIs provided.
 * @param {Array} URIList - An array of URIs for the compounds of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var compoundResults = searcher.parseCompoundBatchResponse(response);
 * };
 * searcher.fetchCompoundBatch(['http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', 'http://www.conceptwiki.org/concept/dd758846-1dac-4f0d-a329-06af9a7fa413'], null, callback);
 */
CompoundSearch.prototype.fetchCompoundBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/compound/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Count the number of compounds classified with the class represented by the URI provided.
 * @param {string} URI - The URI for the class of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var result = searcher.parseCompoundClassMembersCountResponse(response);
 * };
 * searcher.compoundClassMembersCount('http://purl.obolibrary.org/obo/CHEBI_24431', null, callback);
 */
CompoundSearch.prototype.compoundClassMembersCount = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/compound/members/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch compounds for the class represented by the URI provided.
 * @param {string} URI - The URI for the compound class of interest
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var classMembersResult == searcher.parseCompoundClassMembersResponse(response);
 * };
 * searcher.compoundClassMembers('http://purl.obolibrary.org/obo/CHEBI_24431', 1, 20, null, null, callback);
 */
CompoundSearch.prototype.compoundClassMembers = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';

    nets({
        url: this.baseURL + '/compound/members/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch pharmacology records for the compound represented by the URI provided.
 * @param {string} URI - The URI for the compound of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseCompoundPharmacologyResponse(response);
 * };
 * searcher.compoundPharmacology('http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 20, null, null, callback);
 */
CompoundSearch.prototype.compoundPharmacology = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';

    nets({
        url: this.baseURL + '/compound/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch a count of the pharmacology records belonging to the compound represented by the URI provided.
 * @param {string} URI - The URI for the compound of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new CompoundSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseCompoundPharmacologyCountResponse(response);
 * };
 * searcher.compoundPharmacologyCount('http://www.conceptwiki.org/concept/38932552-111f-4a4e-a46a-4ed1d7bdf9d5', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, callback);
 */
CompoundSearch.prototype.compoundPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    lens ? params['_lens'] = lens : '';

    nets({
        url: this.baseURL + '/compound/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * The classes the given compound URI has been classified with eg ChEBI
 * @param {string} URI - The URI for the compound of interest
 * @param {string} tree - Restrict results by hierarchy eg chebi
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 */
CompoundSearch.prototype.compoundClassifications = function(URI, tree, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    params['tree'] = tree;

    nets({
        url: this.baseURL + '/compound/classifications?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Parse the results from {@link CompoundSearch#fetchCompound}
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompound}
 * @returns {FetchCompoundResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundResponse = function(response) {
    var constants = new Constants();
    var drugbankData = {},
        chemspiderData = {},
        chemblData = {},
        conceptWikiData = {};
    var URI = response.primaryTopic[constants.ABOUT];
    var id = URI.split("/").pop();
    var me = this;
    if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'drugbankValue') {
        drugbankData = me.parseDrugbankBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'chemspiderValue') {
        chemspiderData = me.parseChemspiderBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'chemblValue') {
        chemblData = me.parseChemblBlock(response.primaryTopic);
        //TODO more than 1 chembl block possible?
        //chemblItems.push(chemblBlock);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'conceptWikiValue') {
        conceptWikiData = me.parseConceptwikiBlock(response.primaryTopic);
    }
    Utils.arrayify(response.primaryTopic.exactMatch).forEach(function(match, i, allValues) {
        var src = match[constants.IN_DATASET];
        if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
            drugbankData = me.parseDrugbankBlock(match);
        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
            chemspiderData = me.parseChemspiderBlock(match);
        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemblValue') {
            chemblData = me.parseChemblBlock(match);
        } else if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
            conceptWikiData = me.parseConceptwikiBlock(match);
        }
    });
    return {
        "id": id,
        "cwURI": conceptWikiData.URI != null ? conceptWikiData.URI : null,
        "prefLabel": conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : null,
        "URI": URI,
        "description": drugbankData.description != null ? drugbankData.description : null,
        "biotransformationItem": drugbankData.biotransformationItem != null ? drugbankData.description : null,
        "toxicity": drugbankData.toxicity != null ? drugbankData.toxicity : null,
        "proteinBinding": drugbankData.proteinBinding != null ? drugbankData.proteinBinding : null,
        "drugbankURI": drugbankData.URI != null ? drugbankData.URI : null,
        "csURI": chemspiderData.URI != null ? chemspiderData.URI : null,
        "hba": chemspiderData.hba != null ? chemspiderData.hba : null,
        "hbd": chemspiderData.hbd != null ? chemspiderData.hbd : null,
        "inchi": chemspiderData.inchi != null ? chemspiderData.inchi : null,
        "logp": chemspiderData.logp != null ? chemspiderData.logp : null,
        "psa": chemspiderData.psa != null ? chemspiderData.psa : null,
        "ro5Violations": chemspiderData.ro5Violations != null ? chemspiderData.ro5Violations : null,
        "smiles": chemspiderData.smiles != null ? chemspiderData.smiles : null,
        "rtb": chemspiderData.rtb != null ? chemspiderData.rtb : null,
        "inchiKey": chemspiderData.inchiKey != null ? chemspiderData.inchiKey : null,
        "fullMWT": chemspiderData.fullMWT != null ? chemspiderData.fullMWT : null,
        "molform": chemspiderData.molform != null ? chemspiderData.molform : null,
        "chemblURI": chemblData.URI != null ? chemblData.URI : null,
        "mwFreebase": chemblData.mwFreebase != null ? chemblData.mwFreebase : null,

        "drugbankProvenance": drugbankData.drugbankProvenance != null ? drugbankData.drugbankProvenance : null,
        "chemspiderProvenance": chemspiderData.chemspiderProvenance != null ? chemspiderData.chemspiderProvenance : null,
        "chemblProvenance": chemblData.chemblProvenance != null ? chemblData.chemblProvenance : null,
        "conceptWikiProvenance": conceptWikiData.conceptwikiProvenance != null ? conceptWikiData.conceptwikiProvenance : null
    };
}

/**
 * Parse the results from {@link CompoundSearch#fetchCompound} which have a lens applied
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompound}
 * @returns {FetchCompoundLensResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundLensResponse = function(response) {
    var constants = new Constants();
    var drugbankData, chemspiderData, chemblData, conceptWikiData;

    // There will be many different compounds due to the lens but at this stage there is no way of connecting
    // all the exactMatch blocks together. Later on we can use mapURI to link them
    var lensChemspider = [];
    var lensDrugbank = [];
    var lensCW = [];
    var lensChembl = [];
    var topLevelResponse = response.primaryTopic[constants.IN_DATASET];
    if (constants.SRC_CLS_MAPPINGS[topLevelResponse] === 'chemspiderValue') {
        var prefLabel = null,
            cwURI = null,
            description = null,
            biotransformationItem = null,
            toxicity = null,
            proteinBinding = null,
            csURI = null,
            hba = null,
            hbd = null,
            inchi = null,
            logp = null,
            psa = null,
            ro5Violations = null,
            smiles = null,
            chemblURI = null,
            fullMWT = null,
            molform = null,
            mwFreebase = null,
            rtb = null,
            inchiKey = null,
            drugbankURI = null,
            molweight = null,
            molformula = null;

        csURI = response.primaryTopic["_about"] !== null ? response.primaryTopic["_about"] : csURI;
        hba = response.primaryTopic.hba != null ? response.primaryTopic.hba : hba;
        hbd = response.primaryTopic.hbd != null ? response.primaryTopic.hbd : hbd;
        inchi = response.primaryTopic.inchi != null ? response.primaryTopic.inchi : inchi;
        logp = response.primaryTopic.logp != null ? response.primaryTopic.logp : logp;
        psa = response.primaryTopic.psa != null ? response.primaryTopic.psa : psa;
        ro5Violations = response.primaryTopic.ro5_violations != null ? response.primaryTopic.ro5_violations : ro5Violations;
        smiles = response.primaryTopic.smiles != null ? response.primaryTopic.smiles : smiles;
        inchiKey = response.primaryTopic.inchikey != null ? response.primaryTopic.inchikey : inchikey;
        rtb = response.primaryTopic.rtb != null ? response.primaryTopic.rtb : rtb;
        fullMWT = response.primaryTopic.molweight != null ? response.primaryTopic.molweight : molweight;
        molform = response.primaryTopic.molformula != null ? response.primaryTopic.molformula : molformula;

        // provenance 
        chemspiderLinkOut = csURI;
        chemspiderProvenance = {};
        chemspiderProvenance['source'] = 'chemspider';
        chemspiderProvenance['hba'] = chemspiderLinkOut;
        chemspiderProvenance['hbd'] = chemspiderLinkOut;
        chemspiderProvenance['inchi'] = chemspiderLinkOut;
        chemspiderProvenance['logp'] = chemspiderLinkOut;
        chemspiderProvenance['psa'] = chemspiderLinkOut;
        chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
        chemspiderProvenance['smiles'] = chemspiderLinkOut;
        chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
        chemspiderProvenance['molform'] = chemspiderLinkOut;
        lensChemspider.push({
            "csURI": csURI,
            "hba": hba,
            "hbd": hbd,
            "inchi": inchi,
            "logp": logp,
            "psa": psa,
            "ro5Violations": ro5Violations,
            "smiles": smiles,
            "fullMWT": fullMWT,
            "molform": molform,
            "rtb": rtb,
            "inchiKey": inchiKey,
            "chemspiderProvenance": chemspiderProvenance
        })

    }
    response.primaryTopic.exactMatch.forEach(function(match, i, allMatches) {
        var src = match[constants.IN_DATASET];
        var prefLabel = null,
            cwURI = null,
            description = null,
            biotransformationItem = null,
            toxicity = null,
            proteinBinding = null,
            csURI = null,
            hba = null,
            hbd = null,
            inchi = null,
            logp = null,
            psa = null,
            ro5Violations = null,
            smiles = null,
            chemblURI = null,
            fullMWT = null,
            molform = null,
            mwFreebase = null,
            rtb = null,
            inchiKey = null,
            drugbankURI = null,
            molweight = null,
            molformula = null;

        if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
            drugbankData = match;
            description = drugbankData.description != null ? drugbankData.description : description;
            biotransformationItem = drugbankData.biotransformation != null ? drugbankData.biotransformation : biotransformationItem;
            toxicity = drugbankData.toxicity != null ? drugbankData.toxicity : toxicity;
            proteinBinding = drugbankData.proteinBinding != null ? drugbankData.proteinBinding : proteinBinding;
            drugbankURI = drugbankData[constants.ABOUT] != null ? drugbankData[constants.ABOUT] : drugbankURI;

            // provenance
            drugbankLinkout = drugbankURI;
            drugbankProvenance = {};
            drugbankProvenance['source'] = 'drugbank';
            drugbankProvenance['description'] = drugbankLinkout;
            drugbankProvenance['biotransformation'] = drugbankLinkout;
            drugbankProvenance['toxicity'] = drugbankLinkout;
            drugbankProvenance['proteinBinding'] = drugbankLinkout;
            lensDrugbank.push({
                "description": description,
                "biotransformationItem": biotransformationItem,
                "toxicity": toxicity,
                "proteinBinding": proteinBinding,
                "drugbankURI": drugbankURI,
                "drugbankProvenance": drugbankProvenance
            });

        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
            chemspiderData = match;
            csURI = chemspiderData["_about"] !== null ? chemspiderData["_about"] : csURI;
            hba = chemspiderData.hba != null ? chemspiderData.hba : hba;
            hbd = chemspiderData.hbd != null ? chemspiderData.hbd : hbd;
            inchi = chemspiderData.inchi != null ? chemspiderData.inchi : inchi;
            logp = chemspiderData.logp != null ? chemspiderData.logp : logp;
            psa = chemspiderData.psa != null ? chemspiderData.psa : psa;
            ro5Violations = chemspiderData.ro5_violations != null ? chemspiderData.ro5_violations : ro5Violations;
            smiles = chemspiderData.smiles != null ? chemspiderData.smiles : smiles;
            inchiKey = chemspiderData.inchikey != null ? chemspiderData.inchikey : inchikey;
            rtb = chemspiderData.rtb != null ? chemspiderData.rtb : rtb;
            fullMWT = chemspiderData.molweight != null ? chemspiderData.molweight : molweight;
            molform = chemspiderData.molformula != null ? chemspiderData.molformula : molformula;

            // provenance 
            chemspiderLinkOut = csURI;
            chemspiderProvenance = {};
            chemspiderProvenance['source'] = 'chemspider';
            chemspiderProvenance['hba'] = chemspiderLinkOut;
            chemspiderProvenance['hbd'] = chemspiderLinkOut;
            chemspiderProvenance['inchi'] = chemspiderLinkOut;
            chemspiderProvenance['logp'] = chemspiderLinkOut;
            chemspiderProvenance['psa'] = chemspiderLinkOut;
            chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
            chemspiderProvenance['smiles'] = chemspiderLinkOut;
            chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
            chemspiderProvenance['molform'] = chemspiderLinkOut;
            lensChemspider.push({
                "csURI": csURI,
                "hba": hba,
                "hbd": hbd,
                "inchi": inchi,
                "logp": logp,
                "psa": psa,
                "ro5Violations": ro5Violations,
                "smiles": smiles,
                "fullMWT": fullMWT,
                "molform": molform,
                "rtb": rtb,
                "inchiKey": inchiKey,
                "chemspiderProvenance": chemspiderProvenance
            })

        } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemblValue') {
            chemblData = match;
            chemblURI = chemblData["_about"] != null ? chemblData["_about"] : chemblURI;
            mwFreebase = chemblData.mw_freebase != null ? chemblData.mw_freebase : mwFreebase;

            // provenance
            chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + chemblURI.split("/").pop();
            chemblProvenance = {};
            chemblProvenance['source'] = 'chembl';
            chemblProvenance['fullMWT'] = chemblLinkOut;
            chemblProvenance['mwFreebase'] = chemblLinkOut;
            chemblProvenance['rtb'] = chemblLinkOut;
            lensChembl.push({
                "chemblURI": chemblURI,
                "chemblProvenance": chemblProvenance
            });

        } else if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
            conceptWikiData = match;
            prefLabel = conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : prefLabel;
            cwURI = conceptWikiData["_about"] != null ? conceptWikiData["_about"] : cwURI;
            lensCW.push({
                "cwURI": cwURI,
                "prefLabel": prefLabel
            });

        }
    });
    return {
        "lensChemspider": lensChemspider,
        "lensDrugbank": lensDrugbank,
        "lensChembl": lensChembl,
        "lensCW": lensCW
    };
}

CompoundSearch.prototype.parseDrugbankBlock = function(drugbankBlock) {
    var constants = new Constants();
    var URI = null,
        description = null,
        biotransformationItem = null,
        toxicity = null,
        proteinBinding = null,
        drugbankData = null,
        drugbankProvenance = {},
        drugbankLinkout = null;

    drugbankData = drugbankBlock;
    URI = drugbankData[constants.ABOUT] !== null ? drugbankData[constants.ABOUT] : null;
    description = drugbankData.description != null ? drugbankData.description : description;
    biotransformationItem = drugbankData.biotransformation != null ? drugbankData.biotransformation : biotransformationItem;
    toxicity = drugbankData.toxicity != null ? drugbankData.toxicity : toxicity;
    proteinBinding = drugbankData.proteinBinding != null ? drugbankData.proteinBinding : proteinBinding;
    drugbankURI = drugbankData[constants.ABOUT] != null ? drugbankData[constants.ABOUT] : drugbankURI;

    // provenance
    drugbankLinkout = URI;
    drugbankProvenance['source'] = 'drugbank';
    drugbankProvenance['description'] = drugbankLinkout;
    drugbankProvenance['biotransformation'] = drugbankLinkout;
    drugbankProvenance['toxicity'] = drugbankLinkout;
    drugbankProvenance['proteinBinding'] = drugbankLinkout;
    return {
        "description": description,
        "biotransformationItem": biotransformationItem,
        "toxicity": toxicity,
        "proteinBinding": proteinBinding,
        "URI": drugbankURI,
        "drugbankProvenance": drugbankProvenance,
    };

}

CompoundSearch.prototype.parseChemspiderBlock = function(chemspiderBlock) {
    var constants = new Constants();
    var URI = null,
        hba = null,
        hbd = null,
        inchi = null,
        logp = null,
        psa = null,
        ro5Violations = null,
        smiles = null,
        fullMWT = null,
        molform = null,
        rtb = null,
        inchiKey = null,
        molform = null;
    var chemspiderData = chemspiderBlock;
    var chemspiderProvenance = {};
    var chemspiderLinkOut = null;

    URI = chemspiderData["_about"] !== null ? chemspiderData["_about"] : URI;
    hba = chemspiderData.hba != null ? chemspiderData.hba : hba;
    hbd = chemspiderData.hbd != null ? chemspiderData.hbd : hbd;
    inchi = chemspiderData.inchi != null ? chemspiderData.inchi : inchi;
    logp = chemspiderData.logp != null ? chemspiderData.logp : logp;
    psa = chemspiderData.psa != null ? chemspiderData.psa : psa;
    ro5Violations = chemspiderData.ro5_violations != null ? chemspiderData.ro5_violations : ro5Violations;
    smiles = chemspiderData.smiles != null ? chemspiderData.smiles : smiles;
    inchiKey = chemspiderData.inchikey != null ? chemspiderData.inchikey : null;
    rtb = chemspiderData.rtb != null ? chemspiderData.rtb : rtb;
    fullMWT = chemspiderData.molweight != null ? chemspiderData.molweight : null;
    molform = chemspiderData.molformula != null ? chemspiderData.molformula : null;

    // provenance 
    chemspiderLinkOut = URI;
    chemspiderProvenance = {};
    chemspiderProvenance['source'] = 'chemspider';
    chemspiderProvenance['hba'] = chemspiderLinkOut;
    chemspiderProvenance['hbd'] = chemspiderLinkOut;
    chemspiderProvenance['inchi'] = chemspiderLinkOut;
    chemspiderProvenance['logp'] = chemspiderLinkOut;
    chemspiderProvenance['psa'] = chemspiderLinkOut;
    chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
    chemspiderProvenance['smiles'] = chemspiderLinkOut;
    chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
    chemspiderProvenance['molform'] = chemspiderLinkOut;
    return {
        "URI": URI,
        "hba": hba,
        "hbd": hbd,
        "inchi": inchi,
        "logp": logp,
        "psa": psa,
        "ro5Violations": ro5Violations,
        "smiles": smiles,
        "fullMWT": fullMWT,
        "molform": molform,
        "rtb": rtb,
        "inchiKey": inchiKey,
        "chemspiderProvenance": chemspiderProvenance
    };

}

CompoundSearch.prototype.parseChemblBlock = function(chemblBlock) {
    var constants = new Constants();
    var mwFreebase = null;
    var chemblData = chemblBlock;
    var URI = chemblData[constants.ABOUT];
    var chemblProvenance = null;
    var chemblLinkOut = null;

    mwFreebase = chemblData.mw_freebase != null ? chemblData.mw_freebase : mwFreebase;

    // provenance
    chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + URI.split("/").pop();
    chemblProvenance = {};
    chemblProvenance['source'] = 'chembl';
    chemblProvenance['mwFreebase'] = chemblLinkOut;
    return {
        "URI": URI,
        "mwFreebase": mwFreebase,
        "chemblProvenance": chemblProvenance
    };
}

CompoundSearch.prototype.parseConceptwikiBlock = function(conceptwikiBlock) {
    var constants = new Constants();
    var conceptWikiData = conceptwikiBlock;
    var prefLabel = conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : prefLabel;
    var URI = conceptWikiData[constants.ABOUT] != null ? conceptWikiData[constants.ABOUT] : cwURI;

    var conceptwikiProvenance = {};
    // provenance
    conceptwikiProvenance['source'] = 'conceptwiki';
    conceptwikiProvenance['prefLabel'] = URI;

    return {
        "URI": URI,
        "prefLabel": prefLabel,
        "conceptwikiProvenance": conceptwikiProvenance
    };


}

/**
 * Parse the results from {@link CompoundSearch#fetchCompoundBatch}
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompoundBatch}
 * @returns {FetchCompoundBatchResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundBatchResponse = function(response) {
    var constants = new Constants();
    var compounds = [];
    response.items.forEach(function(item, index, items) {
        var id = null,
            prefLabel = null,
            cwURI = null,
            description = null,
            biotransformationItem = null,
            toxicity = null,
            proteinBinding = null,
            csURI = null,
            hba = null,
            hbd = null,
            inchi = null,
            logp = null,
            psa = null,
            ro5Violations = null,
            smiles = null,
            chemblURI = null,
            fullMWT = null,
            molform = null,
            mwFreebase = null,
            rtb = null,
            inchiKey = null,
            drugbankURI = null,
            molweight = null,
            molformula = null;
        var drugbankData, chemspiderData, chemblData, conceptWikiData;
        var uri = item[constants.ABOUT];

        // check if we already have the CS URI
        var possibleURI = 'http://' + uri.split('/')[2];
        //var uriLink = document.createElement('a');
        //uriLink.href = uri;
        //var possibleURI = 'http://' + uriLink.hostname;
        csURI = constants.SRC_CLS_MAPPINGS[possibleURI] === 'chemspiderValue' ? uri : null;

        var drugbankProvenance, chemspiderProvenance, chemblProvenance;
        var descriptionItem, toxicityItem, proteinBindingItem, hbaItem, hbdItem, inchiItem, logpItem, psaItem, ro5VioloationsItem, smilesItem, inchiKeyItem, molformItem, fullMWTItem, mwFreebaseItem;
        var drugbankLinkout, chemspiderLinkOut, chemblLinkOut;

        // this id is not strictly true since we could have searched using a chemspider id etc
        id = uri.split("/").pop();
        prefLabel = item.prefLabel ? item.prefLabel : null;
        cwURI = constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] == 'conceptWikiValue' ? item[constants.ABOUT] : cwURI;
        //if an ops.rsc.org uri is used then the compound chemistry details are found in the top level
        hba = item.hba != null ? item.hba : null;
        hbd = item.hbd != null ? item.hbd : null;
        inchi = item.inchi != null ? item.inchi : null;
        inchiKey = item.inchikey != null ? item.inchikey : null;
        logp = item.logp != null ? item.logp : null;
        molform = item.molformula != null ? item.molformula : null;
        fullMWT = item.molweight != null ? item.molweight : null;
        psa = item.psa != null ? item.psa : null;
        ro5Violations = item.ro5_violations != null ? item.ro5_violations : null;
        rtb = item.rtb !== null ? item.rtb : null;
        smiles = item.smiles != null ? item.smiles : null;
        if (Array.isArray(item.exactMatch)) {
            item.exactMatch.forEach(function(match, i, allValues) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                    drugbankData = match;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    chemspiderData = match;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemblValue') {
                    chemblData = match;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    conceptWikiData = match;
                }
            });
        }
        if (drugbankData) {
            description = drugbankData.description != null ? drugbankData.description : description;
            biotransformationItem = drugbankData.biotransformation != null ? drugbankData.biotransformation : biotransformationItem;
            toxicity = drugbankData.toxicity != null ? drugbankData.toxicity : toxicity;
            proteinBinding = drugbankData.proteinBinding != null ? drugbankData.proteinBinding : proteinBinding;
            drugbankURI = drugbankData[constants.ABOUT] != null ? drugbankData[constants.ABOUT] : drugbankURI;

            // provenance
            drugbankLinkout = drugbankURI;
            drugbankProvenance = {};
            drugbankProvenance['source'] = 'drugbank';
            drugbankProvenance['description'] = drugbankLinkout;
            drugbankProvenance['biotransformation'] = drugbankLinkout;
            drugbankProvenance['toxicity'] = drugbankLinkout;
            drugbankProvenance['proteinBinding'] = drugbankLinkout;

        }
        if (chemspiderData) {
            csURI = chemspiderData["_about"] !== null ? chemspiderData["_about"] : csURI;
            hba = chemspiderData.hba != null ? chemspiderData.hba : hba;
            hbd = chemspiderData.hbd != null ? chemspiderData.hbd : hbd;
            inchi = chemspiderData.inchi != null ? chemspiderData.inchi : inchi;
            logp = chemspiderData.logp != null ? chemspiderData.logp : logp;
            psa = chemspiderData.psa != null ? chemspiderData.psa : psa;
            ro5Violations = chemspiderData.ro5_violations != null ? chemspiderData.ro5_violations : ro5Violations;
            smiles = chemspiderData.smiles != null ? chemspiderData.smiles : smiles;
            inchiKey = chemspiderData.inchikey != null ? chemspiderData.inchikey : inchikey;
            rtb = chemspiderData.rtb != null ? chemspiderData.rtb : rtb;
            fullMWT = chemspiderData.molweight != null ? chemspiderData.molweight : molweight;
            molform = chemspiderData.molformula != null ? chemspiderData.molformula : molformula;

            // provenance 
            chemspiderLinkOut = csURI;
            chemspiderProvenance = {};
            chemspiderProvenance['source'] = 'chemspider';
            chemspiderProvenance['hba'] = chemspiderLinkOut;
            chemspiderProvenance['hbd'] = chemspiderLinkOut;
            chemspiderProvenance['inchi'] = chemspiderLinkOut;
            chemspiderProvenance['logp'] = chemspiderLinkOut;
            chemspiderProvenance['psa'] = chemspiderLinkOut;
            chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
            chemspiderProvenance['smiles'] = chemspiderLinkOut;
            chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
            chemspiderProvenance['molform'] = chemspiderLinkOut;

        }
        if (chemblData) {
            chemblURI = chemblData["_about"] != null ? chemblData["_about"] : chemblURI;
            mwFreebase = chemblData.mw_freebase != null ? chemblData.mw_freebase : mwFreebase;

            // provenance
            chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + chemblURI.split("/").pop();
            chemblProvenance = {};
            chemblProvenance['source'] = 'chembl';
            chemblProvenance['fullMWT'] = chemblLinkOut;
            chemblProvenance['mwFreebase'] = chemblLinkOut;
            chemblProvenance['rtb'] = chemblLinkOut;
        }
        if (conceptWikiData) {
            prefLabel = conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : prefLabel;
            cwURI = conceptWikiData["_about"] != null ? conceptWikiData["_about"] : cwURI;
        }
        compounds.push({
            "id": id,
            "cwURI": cwURI,
            "prefLabel": prefLabel,
            "URI": uri,
            "description": description,
            "biotransformationItem": biotransformationItem,
            "toxicity": toxicity,
            "proteinBinding": proteinBinding,
            "csURI": csURI,
            "hba": hba,
            "hbd": hbd,
            "inchi": inchi,
            "logp": logp,
            "psa": psa,
            "ro5Violations": ro5Violations,
            "smiles": smiles,
            "chemblURI": chemblURI,
            "fullMWT": fullMWT,
            "molform": molform,
            "mwFreebase": mwFreebase,
            "rtb": rtb,
            "inchiKey": inchiKey,
            "drugbankURI": drugbankURI,

            "drugbankProvenance": drugbankProvenance,
            "chemspiderProvenance": chemspiderProvenance,
            "chemblProvenance": chemblProvenance

        });
    });
    return compounds;
}

/**
 * Parse the results from {@link CompoundSearch#fetchCompoundPharmacology}
 * @param {Object} response - the JSON response from {@link CompoundSearch#fetchCompoundPharmacology}
 * @returns {FetchCompoundPharmacologyResponse} Containing the flattened response
 * @method
 */
CompoundSearch.prototype.parseCompoundPharmacologyResponse = function(response) {
    var drugbankProvenance, chemspiderProvenance, chemblProvenance, conceptwikiProvenance;
    var constants = new Constants();
    var records = [];
    response.items.forEach(function(item, i, items) {

        chemblProvenance = {};
        chemblProvenance['source'] = 'chembl';

        var chembl_activity_uri = item[constants.ABOUT];
        var chembl_src = item[constants.IN_DATASET];
        // according to the API docs pmid can be an array but an array of what?
        var activity_pubmed_id = item['pmid'] ? item['pmid'] : null;
        var activity_relation = item['activity_relation'] ? item['activity_relation'] : null;
        var activity_unit_block = item['activity_unit'];
        var activity_standard_units = activity_unit_block ? activity_unit_block.prefLabel : null;
        //var activity_standard_units = item['standardUnits'] ? item['standardUnits'] : null;
        var activity_standard_value = item['standardValue'] ? item['standardValue'] : null;
        var activity_activity_type = item['activity_type'] ? item['activity_type'] : null;
        //TODO seems to be some confusion about what the value is called
        var activity_activity_value = item['activity_value'] ? item['activity_value'] : null;
        var pChembl = item['pChembl'] ? item['pChembl'] : null;

        var compound_full_mwt_item = null;
        var forMolecule = item[constants.FOR_MOLECULE];
        var chembleMoleculeLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';
        var chembl_compound_uri = null;
        var compound_full_mwt = null;
        var em = null;
        var cw_compound_uri = null,
            compound_pref_label = null,
            cw_src = null,
            cs_compound_uri = null,
            compound_inchi = null,
            compound_inchikey = null,
            compound_smiles = null,
            cs_src = null,
            drugbank_compound_uri = null,
            compound_drug_type = null,
            compound_generic_name = null,
            drugbank_src = null,
            csid = null,
            compound_smiles_item = null,
            compound_inchi_item = null,
            compound_inchikey_item = null,
            compound_pref_label_item = null;

        if (forMolecule != null) {
            chembl_compound_uri = forMolecule[constants.ABOUT];
            //compound_full_mwt = forMolecule['full_mwt'] ? forMolecule['full_mwt'] : null;
            chembleMoleculeLink += chembl_compound_uri.split('/').pop();
            //compound_full_mwt_item = chembleMoleculeLink;
            em = forMolecule["exactMatch"];
        }
        //during testing there have been cases where em is null
        var chemblMolecule = em != null ? em[constants.ABOUT] : null;
        if (em != null) {
            // the exact match block may only have 1 entry
            Utils.arrayify(em).forEach(function(match, index, matches) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cw_compound_uri = match[constants.ABOUT];
                    compound_pref_label = match[constants.PREF_LABEL];
                    compound_pref_label_item = cw_compound_uri;
                    cw_src = match["inDataset"];
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    cs_compound_uri = match[constants.ABOUT];
                    csid = cs_compound_uri.split('/').pop();
                    compound_inchi = match['inchi'];
                    compound_inchikey = match['inchikey'];
                    compound_smiles = match['smiles'];
                    compound_full_mwt = match['molweight'];
                    var chemSpiderLink = 'http://www.chemspider.com/' + csid;
                    compound_smiles_item = chemSpiderLink;
                    compound_inchi_item = chemSpiderLink;
                    compound_inchikey_item = chemSpiderLink;
                    compound_full_mwt_item = chemSpiderLink;
                    cs_src = match["inDataset"];
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                    drugbank_compound_uri = match[constants.ABOUT];
                    compound_drug_type = match['drugType'];
                    compound_generic_name = match['genericName'];
                    drugbank_src = match[constants.ABOUT];
                }
            });
        }

        var target_title_item = null,
            target_organism_item = null,
            activity_activity_type_item = null,
            activity_standard_value_item = null,
            activity_standard_units_item = null,
            activity_relation_item = null,
            assay_description = null,
            assay_description_item = null,
            assay_organism = null,
            assay_organism_src = null,
            assay_organism_item = null;
        var target_organism = {};
        var onAssay = item[constants.ON_ASSAY];
        if (onAssay != null) {
            var chembl_assay_uri = onAssay[constants.ABOUT];
            var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';
            assay_description = onAssay['description'];
            var chembleAssayLink = chembldAssayLink + chembl_assay_uri.split('/').pop();
            assay_description_item = chembleAssayLink;
            assay_organism = onAssay['assayOrganismName'] ? onAssay['assayOrganismName'] : null;
            assay_organism_item = chembleAssayLink;
            chemblProvenance['assayOrganism'] = chembleAssayLink;
            chemblProvenance['assayDescription'] = chembleAssayLink;

            var target = onAssay[constants.ON_TARGET];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.targetOrganismName != null ? target.targetOrganismName : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }
        }
        var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/search.ebi?t=' + chembl_activity_uri.split('/').pop().split('_').pop() + '&db=chembl-activity';

        activity_activity_type_item = chemblActivityLink;
        activity_standard_value_item = chemblActivityLink;
        activity_standard_units_item = chemblActivityLink;
        activity_relation_item = chemblActivityLink;
        records.push({
            //for compound
            compoundInchikey: compound_inchikey,
            compoundDrugType: compound_drug_type,
            compoundGenericName: compound_generic_name,
            compoundInchikeySrc: cs_src,
            compoundDrugTypeSrc: drugbank_src,
            compoundGenericNameSrc: drugbank_src,
            targetTitleSrc: chembl_src,
            //for target
            chemblActivityUri: chembl_activity_uri,
            chemblCompoundUri: chembl_compound_uri,
            compoundFullMwt: compound_full_mwt,
            cwCompoundUri: cw_compound_uri,
            compoundPrefLabel: compound_pref_label,
            csCompoundUri: cs_compound_uri,
            csid: csid,
            compoundInchi: compound_inchi,
            compoundSmiles: compound_smiles,
            chemblAssayUri: chembl_assay_uri,
            targetTitle: target_title,
	    targetOrganismName: target_organism_name,
	    targetComponents: target_components,
	    targetURI: target_uri,
	    targetProvenance: target_provenance,
            assayOrganism: assay_organism,
            assayDescription: assay_description,
            activityRelation: activity_relation,
            activityStandardUnits: activity_standard_units,
            activityStandardValue: activity_standard_value,
            activityActivityType: activity_activity_type,
            activityValue: activity_activity_value,

            compoundFullMwtSrc: chembl_src,
            compoundPrefLabel_src: cw_src,
            compoundInchiSrc: cs_src,
            compoundSmilesSrc: cs_src,
            targetOrganismSrc: chembl_src,
            assayOrganismSrc: chembl_src,
            assayDescriptionSrc: chembl_src,
            activityRelationSrc: chembl_src,
            activityStandardUnitsSrc: chembl_src,
            activityStandardValueSrc: chembl_src,
            activityActivityTypeSrc: chembl_src,
            activityPubmedId: activity_pubmed_id,
            assayDescriptionItem: assay_description_item,
            assayOrganismItem: assay_organism_item,
            activityActivityTypeItem: activity_activity_type_item,
            activityRelationItem: activity_relation_item,
            activityStandardValueItem: activity_standard_value_item,
            activityStandardUnitsItem: activity_standard_units_item,
            compoundFullMwtItem: compound_full_mwt_item,
            compoundSmilesItem: compound_smiles_item,
            compoundInchiItem: compound_inchi_item,
            compoundInchikeyItem: compound_inchikey_item,
            compoundPrefLabelItem: compound_pref_label_item,
            pChembl: pChembl,
            chemblProvenance: chemblProvenance
        });
    });
    return records;
}

/**
 * Parse the results from {@link CompoundSearch#compoundPharmacologyCount}
 * @param {Object} response - the JSON response from {@link CompoundSearch#compoundPharmacologyCount}
 * @returns {Number} Count of the number of pharmacology entries for the compound
 * @method
 */
CompoundSearch.prototype.parseCompoundPharmacologyCountResponse = function(response) {
    return response.primaryTopic.compoundPharmacologyTotalResults;
}

/**
 * Parse the results from {@link CompoundSearch#compoundClassMembersCount}
 * @param {Object} response - the JSON response from {@link CompoundSearch#compoundClassMembersCount}
 * @returns {Number} Count of the number of compounds classified for a particular class
 * @method
 */
CompoundSearch.prototype.parseCompoundClassMembersCountResponse = function(response) {
    return response.primaryTopic.memberCount;
}

/**
 * Parse the results from {@link CompoundSearch#compoundClassMembers}
 * @param {Object} response - the JSON response from {@link CompoundSearch#compoundClassMembers}
 * @returns {Number} Compounds classified for a particular class
 * @method
 */
CompoundSearch.prototype.parseCompoundClassMembersResponse = function(response) {
    var constants = new Constants();
    var compounds = [];
    response.items.forEach(function(item, index, array) {
        compounds.push({
            "label": item.exactMatch.prefLabel,
            "URI": item[constants.ABOUT]
        });
    });
    return compounds;
}
exports.CompoundSearch = CompoundSearch;

},{"./Constants":17,"./Utils":27,"nets":6}],16:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
ConceptWikiSearch = function(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

/**
 * Performs a free text search to resolve the identity of an entity in a certain branch.
 * @param {string} query - Query of at least three characters.
 * @param {string} limit - The maximum number of search results.
 * @param {string} branch - The branch to search in: chebi, uniprot, drugbank, chembl or ocrs.
 * @param {string} type - Restrict search by compound, target or targetComponent.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 */
ConceptWikiSearch.prototype.freeText = function(query, limit, branch, type, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['q'] = query;
    limit ? params['l'] = limit : '';
    branch ? params['b'] = branch : '';
    type != null ? params['t'] = type : '';
    nets({
        url: this.baseURL + '/search?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()));
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

ConceptWikiSearch.prototype.findCompounds = function(query, limit, callback) {
	params = {};
	params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['q'] = query;
    params['t'] = 'compound';
    limit != null ? params['l'] = limit : '';
    nets({
        url: this.baseURL + '/search?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()));
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

ConceptWikiSearch.prototype.findTargets = function(query, limit, callback) {
	params = {};
	params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['q'] = query;
    limit ? params['l'] = limit : '';
    params['t'] = 'target';
    nets({
        url: this.baseURL + '/search?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()));
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

ConceptWikiSearch.prototype.parseResponse = function(response) {
	var uris = [];
        response.hits.forEach(function(hit, i) {
		var label;
		hit["label"] != null ? label = hit["label"][0] : '';
		if (label != null) {
                    hit["altLabel"] ? label = hit["altLabel"][0] : '';
		}
			    uris.push({
				   'uri': hit["@id"],
				   'prefLabel': label,
				   'type': hit["@ops_type"],
				   // use the first type, can there be multiple?
				   'originalType': hit["@type"][0]
			    });
		    });
	return uris;
}

},{"./Constants":17,"./Utils":27,"nets":6}],17:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details
Constants = function() {};

Constants.prototype.SRC_CLS_MAPPINGS = {
  'http://www.conceptwiki.org': 'conceptWikiValue',
  'http://www.conceptwiki.org/': 'conceptWikiValue',
  'http://ops.conceptwiki.org': 'conceptWikiValue',
  'http://ops.conceptwiki.org/': 'conceptWikiValue',
  'http://data.kasabi.com/dataset/chembl-rdf': 'chemblValue',
  'http://rdf.ebi.ac.uk/resource/chembl/molecule' : 'chemblValue',
  'http://www.ebi.ac.uk/chembl' : 'chemblValue',
  'http://www4.wiwiss.fu-berlin.de/drugbank': 'drugbankValue',
  'http://linkedlifedata.com/resource/drugbank': 'drugbankValue',
  'http://www.openphacts.org/bio2rdf/drugbank' : 'drugbankValue',
  'http://www.chemspider.com': 'chemspiderValue',
  'http://www.chemspider.com/': 'chemspiderValue',
  'http://ops.rsc-us.org': 'chemspiderValue',
  'http://ops.rsc.org': 'chemspiderValue',
  'http://rdf.chemspider.com': 'chemspiderValue',
  'http://rdf.chemspider.com/': 'chemspiderValue',
  'http://ops.rsc-us.org' : 'chemspiderValue',
  'http://purl.uniprot.org' : 'uniprotValue',
  'http://purl.uniprot.org/' : 'uniprotValue'
};

Constants.prototype.IN_DATASET =  'inDataset';
Constants.prototype.ABOUT = '_about';
Constants.prototype.LABEL = 'label';
Constants.prototype.PREF_LABEL = 'prefLabel';
Constants.prototype.COMPOUND_PHARMACOLOGY_COUNT = 'compoundPharmacologyTotalResults';
Constants.prototype.TARGET_PHARMACOLOGY_COUNT = 'targetPharmacologyTotalResults';
Constants.prototype.ENZYME_FAMILY_COUNT = 'enzymePharmacologyTotalResults';
Constants.prototype.ON_ASSAY = 'hasAssay';
Constants.prototype.ON_TARGET = 'hasTarget';
Constants.prototype.EXACT_MATCH = 'exactMatch';
Constants.prototype.PRIMARY_TOPIC = 'primaryTopic';
Constants.prototype.RESULT = 'result';
Constants.prototype.ACTIVITY = 'activity';
Constants.prototype.FOR_MOLECULE = 'hasMolecule';
Constants.prototype.ASSAY_TARGET = 'target';
Constants.prototype.ITEMS = 'items';
Constants.prototype.PAGINATED_NEXT = 'next';
Constants.prototype.PAGINATED_PREVIOUS = 'prev';
Constants.prototype.PAGINATED_PAGE_SIZE = 'itemsPerPage';
Constants.prototype.PAGINATED_START_INDEX = 'startIndex';
Constants.prototype.TARGET_OF_ASSAY = 'targetOfAssay';
Constants.prototype.ASSAY_OF_ACTIVITY = 'assayOfActivity';
Constants.prototype.HAS_TARGET_COMPONENT = 'hasTargetComponent';
Constants.prototype.MOLFORM = 'molformula';
Constants.prototype.FULL_MWT = 'full_mwt';
Constants.prototype.INCHI = 'inchi';
Constants.prototype.INCHIKEY = 'inchikey';
Constants.prototype.RO5_VIOLATIONS = 'ro5_violations';
Constants.prototype.SMILES = 'smiles';
Constants.prototype.RELEVANCE = 'relevance';
Constants.prototype.PATHWAY_COUNT = 'pathway_count';
Constants.prototype.MOLWT = 'molweight';
Constants.prototype.EBILINK = 'http://www.ebi.ac.uk';


module.exports = Constants;;

},{}],18:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 * @author [Egon Willighagen]{@link http://orcid.org/0000-0001-7542-0286}
 */
DataSources = function DataSources(baseURL, appID, appKey) {
        this.baseURL = baseURL;
        this.appID = appID;
        this.appKey = appKey;
}

/**
 * Fetch a list of data sources used in the Open PHACTS linked data cache.
 *
 * @param {requestCallback} callback - Function that will be called with success, status, and JSON response values.
 * @method
 * @example
 * var datasources = new DataSources("https://beta.openphacts.org/1.5", appID, appKey);
 * var callback = function(success, status, response) {
 *    var subsets = response.primaryTopic.subset;
 *    for (i=0; subsets.length; i++) {
 *      console.log("Subset: " + subsets[i].title);
 *    }
 * };
 * datasources.getSources(callback);
 */
DataSources.prototype.getSources = function(callback) {
	params={};
	params['_format'] = "json";
	params['app_key'] = this.appKey;
	params['app_id'] = this.appID;
	nets({
        url: this.baseURL + '/sources?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

exports.DataSources = DataSources;

},{"./Constants":17,"./Utils":27,"nets":6}],19:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
DiseaseSearch = function DiseaseSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the disease represented by the URI provided.
 * @param {string} URI - The URI for the disease of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseaseResult = searcher.parseDiseaseResponse(response);
 * };
 * searcher.fetchDisease('http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
 */
DiseaseSearch.prototype.fetchDisease = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
	nets({
        url: this.baseURL + '/disease?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

/**
 * Fetch multiple diseases represented by the URIs provided.
 * @param {Array} URIList - A list of URIs for multiple diseases.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseaseResult = searcher.parseDiseaseBatchResponse(response);
 * };
 * searcher.fetchDiseaseBatch('http://linkedlifedata.com/resource/umls/id/C0004238|http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
 */
DiseaseSearch.prototype.fetchDiseaseBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';
	nets({
        url: this.baseURL + '/disease/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}
/**
 * Count the number of diseases for a target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseaseResult = searcher.parseDiseasesByTargetCountResponse(response);
 * };
 * searcher.diseasesByTargetCount('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, callback);
 */
DiseaseSearch.prototype.diseasesByTargetCount = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
	nets({
        url: this.baseURL + '/disease/byTarget/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

/**
 * Fetch the diseases for a target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var diseases = searcher.parseDiseasesByTargetResponse(response);
 * };
 * searcher.diseasesByTarget('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, null, null, null, callback);
 */
DiseaseSearch.prototype.diseasesByTarget = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
	nets({
        url: this.baseURL + '/disease/byTarget?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

/**
 * Count the number of targets for a disease represented by the URI provided.
 * @param {string} URI - The URI for the disease of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targetResult = searcher.parseTargetsByDiseaseCountResponse(response);
 * };
 * searcher.targetsByDiseaseCount('http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
 */
DiseaseSearch.prototype.targetsByDiseaseCount = function(URI, lens, callback) {
        params = {};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = URI;
        lens ? params['_lens'] = lens : '';
nets({
        url: this.baseURL + '/disease/getTargets/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

    }

/**
     * Fetch the targets for a disease represented by the URI provided.
     * @param {string} URI - The URI for the disease of interest.
     * @param {string} [page=1] - Which page of records to return.
     * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
     * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
     * @param {string} [lens] - An optional lens to apply to the result.
     * @param {requestCallback} callback - Function that will be called with the result.
     * @method
     * @example
     * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
     * var callback=function(success, status, response){
     *    var targets = searcher.parseTargetsByDiseaseResponse(response);
     * };
     * searcher.targetsByDisease('http://linkedlifedata.com/resource/umls/id/C0004238', null, null, null, null, callback);
     */
DiseaseSearch.prototype.targetsByDisease = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
nets({
        url: this.baseURL + '/disease/getTargets?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Count the number of diseases associated with a target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var associationsCount = searcher.parseAssociationsByTargetCountResponse(response);
 * };
 * searcher.associationsByTargetCount('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, callback);
 */
DiseaseSearch.prototype.associationsByTargetCount = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
nets({
        url: this.baseURL + '/disease/assoc/byTarget/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch the disease-target associations for a particular target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var associations = searcher.parseAssociationsByTargetResponse(response);
 * };
 * searcher.associationsByTarget('http://purl.uniprot.org/uniprot/Q9Y5Y9', null, null, null, null, callback);
 */
DiseaseSearch.prototype.associationsByTarget = function(URI, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
nets({
        url: this.baseURL + '/disease/assoc/byTarget?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch the disease-target associations for a particular disease represented by the URI provided.
 * @param {string} URI - The URI for the disease of interest.
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var associations = searcher.parseAssociationsByDiseaseResponse(response);
 * };
 * searcher.associationsByDisease('http://linkedlifedata.com/resource/umls/id/C0004238', null, null, null, null, callback);
 */
DiseaseSearch.prototype.associationsByDisease = function(URI, page, pageSize, orderBy, lens, callback) {
        params = {};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = URI;
        page ? params['_page'] = page : '';
        pageSize ? params['_pageSize'] = pageSize : '';
        orderBy ? params['_orderBy'] = orderBy : '';
        lens ? params['_lens'] = lens : '';
nets({
        url: this.baseURL + '/disease/assoc/byDisease?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

    }

/**
     * Count the number of targets associated with a disease represented by the URI provided.
     * @param {string} URI - The URI for the disease of interest.
     * @param {string} [lens] - An optional lens to apply to the result.
     * @param {requestCallback} callback - Function that will be called with the result.
     * @method
     * @example
     * var searcher = new DiseaseSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
     * var callback=function(success, status, response){
     *    var associationsCount = searcher.parseAssociationsByDiseaseCountResponse(response);
     * };
     * searcher.associationsByDiseaseCount('http://linkedlifedata.com/resource/umls/id/C0004238', null, callback);
     */
DiseaseSearch.prototype.associationsByDiseaseCount = function(URI, lens, callback) {
        params = {};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = URI;
        lens ? params['_lens'] = lens : '';
nets({
        url: this.baseURL + '/disease/assoc/byDisease/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

    }

/**
     * Parse the results from {@link DiseaseSearch#fetchDisease}
     * @param {Object} response - the JSON response from {@link DiseaseSearch#fetchDisease}
     * @returns {FetchDiseaseResponse} Containing the flattened response
     * @method
     */
DiseaseSearch.prototype.parseDiseaseResponse = function(response) {
    var constants = new Constants();
    var URI = null,
        name = null,
        diseaseClass = [];
    URI = response.primaryTopic[constants.ABOUT];
    name = response.primaryTopic.name;
    if (response.primaryTopic.diseaseClass != null) {
            Utils.arrayify(response.primaryTopic.diseaseClass).forEach(function(item, index) {
                diseaseClass.push({
                    "name": item.name,
                    "URI": item[constants.ABOUT]
                });
            });
    }
    return {
        "URI": URI,
        "name": name,
        "diseaseClass": diseaseClass
    };
}

/**
     * Parse the results from {@link DiseaseSearch#fetchDiseaseBatch}
     * @param {Object} response - the JSON response from {@link DiseaseSearch#fetchDiseaseBatch}
     * @returns {Array.FetchDiseaseResponse} Containing the flattened response
     * @method
     */
DiseaseSearch.prototype.parseDiseaseBatchResponse = function(response) {
    var constants = new Constants();
    var items = [];
    response.items.forEach(function(item, index) {
    var URI = null,
        name = null,
        diseaseClass = [];
    URI = item[constants.ABOUT];
    name = item.name;
    if (item.diseaseClass != null) {
        Utils.arrayify(item.diseaseClass).forEach(function(diseaseClassItem, index) {
                diseaseClass.push({
                    "name": diseaseClassItem.name,
                    "URI": diseaseClassItem[constants.ABOUT]
                });
            });
        }
    items.push({
        "URI": URI,
        "name": name,
        "diseaseClass": diseaseClass
    });
    });
    return items;
}

/**
 * Parse the results from {@link DiseaseSearch#diseasesByTargetCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#diseasesByTargetCount}
 * @returns {Number} Count of the number of diseases for the target
 * @method
 */
DiseaseSearch.prototype.parseDiseasesByTargetCountResponse = function(response) {
    return response.primaryTopic.diseaseCount;
}

/**
 * Parse the results from {@link DiseaseSearch#diseasesByTarget}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#diseasesByTarget}
 * @returns {DiseasesByTargetResponse} List of disease items
 * @method
 */
DiseaseSearch.prototype.parseDiseasesByTargetResponse = function(response) {
    var constants = new Constants();
    var diseases = [];
    response.items.forEach(function(item, index) {
        var name = null,
            URI = null,
            gene = null,
            encodes = null,
            encodeURI = null,
            encodeLabel = null;
        name = item.name;
        URI = item[constants.ABOUT];
        gene = {};
        gene["URI"] = item.forGene[constants.ABOUT];
        gene["encodes"] = item.forGene.encodes[constants.ABOUT];
        if (item.forGene.encodes.exactMatch != null) {
            gene["encodesProvenance"] = item.forGene.encodes.exactMatch[constants.ABOUT] != null ? item.forGene.encodes.exactMatch[constants.ABOUT] : null;
            gene["encodesLabel"] = item.forGene.encodes.exactMatch.prefLabel != null ? item.forGene.encodes.exactMatch.prefLabel : null;
        } else {
            gene["encodesProvenance"] = null;
            gene["encodesLabel"] = null;
        }
        diseases.push({
            "name": name,
            "URI": URI,
            "gene": gene
        });
    });
    return diseases;
}

/**
 * Parse the results from {@link DiseaseSearch#targetsByDiseaseCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#targetsByDiseaseCount}
 * @returns {Number} Count of the number of diseases for the target
 * @method
 */
DiseaseSearch.prototype.parseTargetsByDiseaseCountResponse = function(response) {
    return response.primaryTopic.targetCount;
}

/**
 * Parse the results from {@link DiseaseSearch#targetsByDisease}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#targetsByDisease}
 * @returns {TargetsByDiseaseResponse} List of disease items
 * @method
 */
DiseaseSearch.prototype.parseTargetsByDiseaseResponse = function(response) {
    var constants = new Constants();
    var targets = [];
        Utils.arrayify(response.items).forEach(function(item, index, array) {
            var dataset = null,
                URI = null;
            URI = item[constants.ABOUT];
            dataset = item[constants.IN_DATASET];
            targets.push({
                "dataset": dataset,
                "URI": URI
            });
        });
    return targets;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByTargetCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByTargetCount}
 * @returns {Number} Total count of disease-target associations which correspond to a target
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByTargetCountResponse = function(response) {
    return response.primaryTopic.associationsCount;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByTarget}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByTarget}
 * @returns {AssociationsResponse} List of disease-target associations
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByTargetResponse = function(response) {
    var constants = new Constants();
    var diseaseTargetAssociations = [];
        Utils.arrayify(response.items).forEach(function(diseaseTargetAssociation, index, array) {
            var dta = {};
            dta.about = diseaseTargetAssociation[constants.ABOUT];
            dta.dataset = diseaseTargetAssociation[constants.IN_DATASET];
            dta.gene = {};
            dta.gene["URI"] = diseaseTargetAssociation.gene[constants.ABOUT];
            dta.gene["encodes"] = diseaseTargetAssociation.gene.encodes[constants.ABOUT];
            dta.gene["encodesProvenance"] = diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] != null ? diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] : null;
            dta.gene["encodesLabel"] = diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel != null ? diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel : null;
            dta.pmid = [];
            if (diseaseTargetAssociation.pmid != null) {
                Utils.arrayify(diseaseTargetAssociation.pmid).forEach(function(pmid, index, array) {
                    dta.pmid.push(pmid);
                });
            }
            dta.type = [];
                Utils.arrayify(diseaseTargetAssociation.assoc_type).forEach(function(type, index, array) {
                    dta.type.push({
                        "about": type[constants.ABOUT],
                        "label": type.label
                    });
                });

            dta.description = [];
            if (diseaseTargetAssociation.description != null) {
                Utils.arrayify(diseaseTargetAssociation.description).forEach(function(description, index, array) {
                    dta.description.push(description);
                });
            }
            dta.primarySource = [];
                Utils.arrayify(diseaseTargetAssociation.primarySource).forEach(function(primarySource, index, array) {
                    dta.primarySource.push(primarySource);
                });
            dta.disease = {};
            dta.disease.diseaseClasses = [];
            dta.disease.URI = diseaseTargetAssociation.disease[constants.ABOUT];
            dta.disease.dataset = diseaseTargetAssociation.disease[constants.IN_DATASET];
            if(diseaseTargetAssociation.disease.diseaseClass != null) {
	    Utils.arrayify(diseaseTargetAssociation.disease.diseaseClass).forEach(function(diseaseClass, index, array) {
                    var URI = diseaseClass[constants.ABOUT];
                    var name = diseaseClass.name;
                    var dataset = diseaseClass[constants.IN_DATASET];
                    dta.disease.diseaseClasses.push({
                        "URI": URI,
                        "name": name,
                        "dataset": dataset
                    });
            });
	    }
            diseaseTargetAssociations.push(dta);
        });
    return diseaseTargetAssociations;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByDiseaseCount}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByDiseaseCount}
 * @returns {Number} Total count of disease-target associations which correspond to a disease
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByDiseaseCountResponse = function(response) {
    return response.primaryTopic.associationsCount;
}

/**
 * Parse the results from {@link DiseaseSearch#associationsByDisease}
 * @param {Object} response - the JSON response from {@link DiseaseSearch#associationsByDisease}
 * @returns {AssociationsResponse} List of disease-target associations
 * @method
 */
DiseaseSearch.prototype.parseAssociationsByDiseaseResponse = function(response) {
    var constants = new Constants();
    var diseaseTargetAssociations = [];
        Utils.arrayify(response.items).forEach(function(diseaseTargetAssociation, index, array) {
            var dta = {};
            dta.about = diseaseTargetAssociation[constants.ABOUT];
            dta.dataset = diseaseTargetAssociation[constants.IN_DATASET];
            dta.gene = {};
            dta.gene["URI"] = diseaseTargetAssociation.gene[constants.ABOUT];
            // TODO API contract not being fulfilled for gene encodes
            if (diseaseTargetAssociation.gene.encodes != null) {
                dta.gene["encodes"] = diseaseTargetAssociation.gene.encodes[constants.ABOUT];
                dta.gene["encodesProvenance"] = diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] != null ? diseaseTargetAssociation.gene.encodes.exactMatch[constants.ABOUT] : null;
                dta.gene["encodesLabel"] = diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel != null ? diseaseTargetAssociation.gene.encodes.exactMatch.prefLabel : null;
            } else {
                dta.gene.encodes = null;
                dta.gene.encodesProvenance = null;
                dta.gene.encodesLabel = null;
            }
            dta.pmid = [];
            if (diseaseTargetAssociation.pmid != null) {
                Utils.arrayify(diseaseTargetAssociation.pmid).forEach(function(pmid, index, array) {
                    dta.pmid.push(pmid);
                });
            }
            dta.type = [];
                Utils.arrayify(diseaseTargetAssociation.type).forEach(function(type, index, array) {
                    dta.type.push({
                        "about": type[constants.ABOUT],
                        "label": type.label
                    });
                });

            dta.description = [];
            if (diseaseTargetAssociation.description != null) {
                Utils.arrayify(diseaseTargetAssociation.description).forEach(function(description, index, array) {
                    dta.description.push(description);
                });
            }
            dta.primarySource = [];
                Utils.arrayify(diseaseTargetAssociation.primarySource).forEach(function(primarySource, index, array) {
                    dta.primarySource.push(primarySource);
                });
            dta.disease = {};
            dta.disease.diseaseClasses = [];
            dta.disease.URI = diseaseTargetAssociation.disease[constants.ABOUT];
            dta.disease.dataset = diseaseTargetAssociation.disease[constants.IN_DATASET];
                Utils.arrayify(diseaseTargetAssociation.disease.diseaseClass).forEach(function(diseaseClass, index, array) {
                    var URI = diseaseClass[constants.ABOUT];
                    var name = diseaseClass.name;
                    var dataset = diseaseClass[constants.IN_DATASET];
                    dta.disease.diseaseClasses.push({
                        "URI": URI,
                        "name": name,
                        "dataset": dataset
                    });
                });
            diseaseTargetAssociations.push(dta);
        });
    return diseaseTargetAssociations;
}

exports.DiseaseSearch = DiseaseSearch;

},{"./Constants":17,"./Utils":27,"nets":6}],20:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
MapSearch = function MapSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

MapSearch.prototype.mapURL = function(URI, targetUriPattern, graph, lens, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['Uri'] = URI;
        targetUriPattern ? params['targetUriPattern'] = targetUriPattern : '';
        graph ? params['graph'] = graph : '';
        lens ? params['lensUri'] = lens : '';
	nets({
        url: this.baseURL + '/mapUri?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

MapSearch.prototype.parseMapURLResponse = function(response) {
        var constants = new Constants();
        var items = response.primaryTopic[constants.EXACT_MATCH];
        var urls = [];
	        Utils.arrayify(items).forEach(function(item, i) {
              urls.push(item);
	        });
	return urls;
}

exports.MapSearch = MapSearch;

},{"./Constants":17,"./Utils":27,"nets":6}],21:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
/**
 * Main container of the OPS.js library. It is the parent class for all the components.
 *
 * @namespace
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */

var Openphacts = {} || Openphacts;
Openphacts.CompoundSearch = require("./CompoundSearch");
Openphacts.TargetSearch = require("./TargetSearch");
Openphacts.ConceptWikiSearch = require("./ConceptWikiSearch");
Openphacts.TreeSearch = require("./TreeSearch");
Openphacts.PathwaySearch = require("./PathwaySearch");
Openphacts.StructureSearch = require("./StructureSearch");
Openphacts.TissueSearch = require("./TissueSearch");
Openphacts.ActivitySearch = require("./ActivitySearch");
Openphacts.DataSources = require("./DataSources");
Openphacts.DiseaseSearch = require("./DiseaseSearch");
Openphacts.MapSearch = require("./MapSearch");
Openphacts.Version = require("./Version");

module.exports = Openphacts;

/**
 * General callback for any request
 * @callback requestCallback
 * @param {Boolean} success - True or False
 * @param {Number} status - HTTP status code
 * @param {string} response - Response message
 */
/**
 * Contains data for a compound fetched with {@link CompoundSearch#fetchCompound}
 * @typedef {Object} FetchCompoundResponse
 * @property {string} cwURI - Concept Wiki URI which represents the compound
 * @property {string} prefLabel - The preferred label for the compound
 * @property {string} URI - The URI for the compound
 * @property {string} description - A description of the compound
 * @property {string} biotransformationItem - The biotransformation item for the compound
 * @property {string} toxicity - The toxicity of the compound
 * @property {string} proteinBinding - The protein binding for the compound
 * @property {string} csURI - ChemSpider URI
 * @property {string} hba - hba
 * @property {string} hbd -hbd
 * @property {string} inchi - inchi
 * @property {string} logp - logp
 * @property {string} psa - psa
 * @property {string} ro5Violations - ro5Violations
 * @property {string} smiles - smiles
 * @property {string} chemblURI - chemblURI
 * @property {string} fullMWT - fullMWT
 * @property {string} molform - molform
 * @property {string} mwFreebase - mwFreebase
 * @property {string} rtb - rtb
 * @property {string} inchiKey - inchiKey
 * @property {string} drugbankURI - drugbankURI
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} chemspiderProvenance - chemspiderProvenance
 * @property {string} chemblProvenance - chemblProvenance
 */
/**
 * Contains data for compounds fetched with {@link CompoundSearch#fetchCompoundBatch}
 * @typedef {Array.<Object>} FetchCompoundBatchResponse
 * @property {string} cwURI - Concept Wiki URI which represents the compound
 * @property {string} prefLabel - The preferred label for the compound
 * @property {string} URI - The URI for the compound
 * @property {string} description - A description of the compound
 * @property {string} biotransformationItem - The biotransformation item for the compound
 * @property {string} toxicity - The toxicity of the compound
 * @property {string} proteinBinding - The protein binding for the compound
 * @property {string} csURI - ChemSpider URI
 * @property {string} hba - hba
 * @property {string} hbd -hbd
 * @property {string} inchi - inchi
 * @property {string} logp - logp
 * @property {string} psa - psa
 * @property {string} ro5Violations - ro5Violations
 * @property {string} smiles - smiles
 * @property {string} chemblURI - chemblURI
 * @property {string} fullMWT - fullMWT
 * @property {string} molform - molform
 * @property {string} mwFreebase - mwFreebase
 * @property {string} rtb - rtb
 * @property {string} inchiKey - inchiKey
 * @property {string} drugbankURI - drugbankURI
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} chemspiderProvenance - chemspiderProvenance
 * @property {string} chemblProvenance - chemblProvenance
 */

/**
 * An array of pharmacology records for a compound returned from {@link CompoundSearch#compoundPharmacology}
 * @typedef {Array.<Object>} FetchCompoundPharmacologyResponse
 * @property {string} compoundInchikey - compound_inchikey
 * @property {string} compoundDrugType - compound_drug_type
 * @property {string} compoundGenericName - compound_generic_name
 * @property {Array} targets - targets
 * @property {string} compoundInchikeySrc - cs_src
 * @property {string} compoundDrugTypeSrc - drugbank_src
 * @property {string} compoundGenericNameSrc - drugbank_src
 * @property {string} targetTitleSrc - chembl_src
 * @property {string} chemblActivityUri - chembl_activity_uri
 * @property {string} chemblCompoundUri - chembl_compound_uri
 * @property {string} compoundFullMwt - compound_full_mwt
 * @property {string} cwCompoundUri - cw_compound_uri
 * @property {string} compoundPrefLabel - compound_pref_label
 * @property {string} csCompoundUri - cs_compound_uri
 * @property {string} csid - csid
 * @property {string} compoundInchi - compound_inchi
 * @property {string} compoundSmiles - compound_smiles
 * @property {string} chemblAssayUri - chembl_assay_uri
 * @property {Array} targetOrganisms - target_organisms
 * @property {string} assayOrganism - assay_organism
 * @property {string} assayDescription - assay_description
 * @property {string} activityRelation - activity_relation
 * @property {string} activityStandardUnits - activity_standard_units
 * @property {string} activityStandardValue - activity_standard_value
 * @property {string} activityActivityType - activity_activity_type
 * @property {string} activityValue - activity_activity_value
 * @property {string} compoundFullMwtSrc - chembl_src
 * @property {string} compoundPrefLabel_src - cw_src
 * @property {string} compoundInchiSrc - cs_src
 * @property {string} compoundSmilesSrc - cs_src
 * @property {string} targetOrganismSrc - chembl_src
 * @property {string} assayOrganismSrc - chembl_src
 * @property {string} assayDescriptionSrc - chembl_src
 * @property {string} activityRelationSrc - chembl_src
 * @property {string} activityStandardUnitsSrc - chembl_src
 * @property {string} activityStandardValueSrc - chembl_src
 * @property {string} activityActivityTypeSrc - chembl_src
 * @property {string} activityPubmedId - activity_pubmed_id
 * @property {string} assayDescriptionItem - assay_description_item
 * @property {string} assayOrganismItem - assay_organism_item
 * @property {string} activityActivityTypeItem - activity_activity_type_item
 * @property {string} activityRelationItem - activity_relation_item
 * @property {string} activityStandardValueItem - activity_standard_value_item
 * @property {string} activityStandardUnitsItem - activity_standard_units_item
 * @property {string} compoundFullMwtItem - compound_full_mwt_item
 * @property {string} compoundSmilesItem - compound_smiles_item
 * @property {string} compoundInchiItem - compound_inchi_item
 * @property {string} compoundInchikeyItem - compound_inchikey_item
 * @property {string} compoundPrefLabelItem - compound_pref_label_item
 * @property {string} pChembl - pChembl
 * @property {string} chemblProvenance - chemblProvenance
 */
/**
 * Contains data for a target fetched with {@link TargetSearch#fetchTarget}
 * @typedef {Object} FetchTargetResponse
 * @property {string} cellularLocation - cellularLocation
 * @property {string} molecularWeight - molecularWeight
 * @property {string} numberOfResidues - numberOfResidues
 * @property {string} theoreticalPi - theoreticalPi
 * @property {string} drugbankURI - drugbankURI
 * @property {Array} keywords- keywords
 * @property {string} functionAnnotation - functionAnnotation
 * @property {string} alternativeName - alternativeName
 * @property {string} existence - existence
 * @property {string} organism - organism
 * @property {string} sequence - sequence
 * @property {Array} classifiedWith - classifiedWith
 * @property {Array} seeAlso - seeAlso
 * @property {string} prefLabel - prefLabel
 * @property {string} chemblItems - chemblItems
 * @property {string} cwURI - cwURI
 * @property {string} URI - URI
 * @property {string} chemblProvenance - chemblProvenance
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} uniprotProvenance - uniprotProvenance
 * @property {string} conceptwikiProvenance - conceptwikiProvenance
 */
/**
 * Contains data for targets fetched with {@link TargetSearch#fetchTargetBatch}
 * @typedef {Array.<Object>} FetchTargetBatchResponse
 * @property {string} cellularLocation - cellularLocation
 * @property {string} molecularWeight - molecularWeight
 * @property {string} numberOfResidues - numberOfResidues
 * @property {string} theoreticalPi - theoreticalPi
 * @property {string} drugbankURI - drugbankURI
 * @property {Array} keywords- keywords
 * @property {string} functionAnnotation - functionAnnotation
 * @property {string} alternativeName - alternativeName
 * @property {string} existence - existence
 * @property {string} organism - organism
 * @property {string} sequence - sequence
 * @property {Array} classifiedWith - classifiedWith
 * @property {Array} seeAlso - seeAlso
 * @property {string} prefLabel - prefLabel
 * @property {string} chemblItems - chemblItems
 * @property {string} cwURI - cwURI
 * @property {string} URI - URI
 * @property {string} chemblProvenance - chemblProvenance
 * @property {string} drugbankProvenance - drugbankProvenance
 * @property {string} uniprotProvenance - uniprotProvenance
 * @property {string} conceptwikiProvenance - conceptwikiProvenance
 */
/**
 * Contains information about a single disease fetched with {@link DiseaseSearch#fetchDisease}
 * @typedef {Object} FetchDiseaseResponse
 * @property {string} URI - URI
 * @property {string} name - name
 * @property {Array} diseaseClass - diseaseClass
 */
/**
 * Contains list of diseases for a single target fetched with {@link DiseaseSearch#diseasesByTarget}
 * @typedef {Array.<Object>} DiseasesByTargetResponse
 * @property {string} URI - URI
 * @property {string} name - name
 * @property {Array.<object>} gene - containing URI for the gene, link to the gene it encodes, encodesLabel and encodesProvenance link to where the label came from
 */
/** 
 * Contains list of targets for a particular disease fetched with {@link DiseaseSearch#targetsByDisease}
 * @typedef {Array.<Object>} TargetsByDiseaseResponse
 * @property {string} URI - URI
 * @property {string} dataset - dataset
 */
/**
 * Contains list of disease target associations for a target fetched with {@link DiseaseSearch#associationsByTarget} or disease fetched with {@link DiseaseSearch#associationsByDisease}
 * @typedef {Array.<Object>} AssociationsResponse
 * @property {string} about - link to source files describing the disease-target associations
 * @property {string} dataset - link to the void dataset describing the links between the diseases and other datasets
 * @property {Array.<string>} description - description
 * @property {Array.<DiseaseResponse>} disease - disease
 * @property {Array.<object>} gene - containing URI for the gene, link to the gene it encodes, encodesLabel and encodesProvenance link to where the label came from
 * @property {Array.<string>} pmid - pubmed ID
 * @property {Array.<string>} primarySource - primarySource
 * @property {Array.<Object>} type - containing URI and label
 */
/**
 * Contains list of diseases contained within a {@link AssociationsResponse}
 * @typedef {Array.<Object>} DiseaseResponse
 * @property {string} URI - link to the disease
 * @property {string} dataset - source of the data
 * @property {Array.<Object>} diseaseClasses - containing URI, source dataset and name
 */
/**
 * Contains various types of data about the compounds matching a source compound when a lens is applied using {@link CompoundSearch#fetchCompound}
 * Note that the items in each list cannot be linked together but you can use the {@link MapSearch#mapURL} call to discover which items are about the same compound.
 * @typedef {Array.<Object>} FetchCompoundLensResponse
 * @property {Array} lensChemspider - List of compounds from chemspider
 * @property {Array} lensDrugbank - list of drugbank info items relating to the chemspider compounds
 * @property {Array} lensCW - list of conceptwiki info about the compounds
 * @property {Array} lensChembl - list of chembl info items about the compounds
 */

},{"./ActivitySearch":14,"./CompoundSearch":15,"./ConceptWikiSearch":16,"./DataSources":18,"./DiseaseSearch":19,"./MapSearch":20,"./PathwaySearch":22,"./StructureSearch":23,"./TargetSearch":24,"./TissueSearch":25,"./TreeSearch":26,"./Version":28}],22:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
PathwaySearch = function PathwaySearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

PathwaySearch.prototype.information = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathway?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.byCompound = function(URI, organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? params['_orderBy'] = orderBy : '';
    nets({
        url: this.baseURL + '/pathways/byCompound?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.countPathwaysByCompound = function(URI, organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathways/byCompound/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.byTarget = function(URI, organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    nets({
        url: this.baseURL + '/pathways/byTarget?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.countPathwaysByTarget = function(URI, organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathways/byTarget/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Get a list of targets that are part of the pathway specified
 * @param {string} URI - URI of the pathway (e.g.: "http://identifiers.org/wikipathways/WP1008")
 * @param {string} [lens] - The Lens name
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new PathwaySearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targets = searcher.parseGetTargetsResponse(response);
 * };
 * searcher.getTargets('http://identifiers.org/wikipathways/WP1008', null, callback);
 */
PathwaySearch.prototype.getTargets = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathway/getTargets?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.getCompounds = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathway/getCompounds?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.byReference = function(URI, organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    nets({
        url: this.baseURL + '/pathways/byReference?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.countPathwaysByReference = function(URI, organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathways/byReference/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.getReferences = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathway/getReferences?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.countPathways = function(organism, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/pathways/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.list = function(organism, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    organism ? params['pathway_organism'] = organism : '';
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    nets({
        url: this.baseURL + '/pathways?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.organisms = function(lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    lens ? params['_lens'] = lens : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    //TODO order by neeeds an RDF like syntax to work eg ?cw_uri or DESC(?cw_uri), need to hide that
    //from users by having a descending flag and creating the correct syntax here
    orderBy ? orderBy = params['_orderBy'] : '';
    nets({
        url: this.baseURL + '/pathways/organisms?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

PathwaySearch.prototype.parseInformationResponse = function(response) {
    var constants = new Constants();
    var latest_version, identifier, revision, title, description, parts, inDataset, pathwayOntology, organism, organismLabel, about, URI = null;
    latest_version = response.primaryTopic.latest_version;
    identifier = response.primaryTopic[constants.ABOUT];
    URI = response.primaryTopic[constants.ABOUT];;
    title = latest_version.title ? latest_version.title : null;
    organism = latest_version.organism[constants.ABOUT] ? latest_version.organism[constants.ABOUT] : null;
    organismLabel = latest_version.organism.label ? latest_version.organism.label : null;
    pathwayOntology = latest_version.pathwayOntology ? latest_version.pathwayOntology : null;
    var pathwayOntologies = [];
    if (pathwayOntology) {
            Utils.arrayify(pathwayOntology).forEach(function(ontology, i) {
                pathwayOntologies.push(ontology);
            });
    }
    description = latest_version.description ? latest_version.description : null;
    revision = latest_version[constants.ABOUT] ? latest_version[constants.ABOUT] : null;
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var parts = [];
    partsComplete.forEach(function(part,  i) {
        parts.push({
            about: part["_about"],
            type: part.type
        });
    });
    // provenance
    var wikipathwaysProvenance = {};
    wikipathwaysProvenance['source'] = 'wikipathways';
    wikipathwaysProvenance['title'] = identifier;
    wikipathwaysProvenance['description'] = identifier;
    wikipathwaysProvenance['organismLabel'] = organism;
    return {
        'URI': URI,
        'title': title,
        'description': description,
        'identifier': identifier,
        'revision': revision,
        'pathwayOntologies': pathwayOntologies,
        'organism': organism,
        'organismLabel': organismLabel,
        'parts': parts,
        'wikipathwaysProvenance': wikipathwaysProvenance
    };
}

PathwaySearch.prototype.parseByCompoundResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, about, type, prefLabel, description, pathwayOntology, geneProductLabel, geneProductURI, geneProductCWURI;
        title = item.title;
        identifier = item.identifier;
        parts = item.hasPart;
        about = parts[constants.ABOUT];
        type = parts.type;
        geneProductLabel = parts.exactMatch.prefLabel;
        geneProductURI = parts[constants.ABOUT];
        geneProductCWURI = parts.exactMatch[constants.ABOUT];
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
            'geneProductLabel': geneProductLabel,
            'geneProductURI': geneProductURI,
            'geneProductCWURI': geneProductCWURI,
            'about': about
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseCountPathwaysByCompoundResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseByTargetResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, about, type, prefLabel, description, pathwayOntology, geneProductLabel, geneProductURI, geneProductCWURI;
        var geneProducts = [];
        title = item.title;
        identifier = item.identifier;
        parts = item.hasPart;
        about = parts[constants.ABOUT];
        type = parts.type;
            Utils.arrayify(parts).forEach(function(part, index, array) {
                var geneProduct = {};
                geneProducts.push(geneProduct);
                geneProduct['URI'] = part[constants.ABOUT];
                var exactMatches = [];
                geneProduct['exactMatch'] = exactMatches;
                    Utils.arrayify(part.exactMatch).forEach(function(exactMatch, index, array) {
                        exactMatches.push({'label': exactMatch.prefLabel, 'URI': exactMatch[constants.ABOUT]});
                    });
            });
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
            'geneProducts': geneProducts,
            'about': about
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseCountPathwaysByTargetResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseGetTargetsResponse = function(response) {
    var constants = new Constants();
    var latest_version, revision, title, parts;
    latest_version = response.primaryTopic.latest_version;
    title = latest_version.title;
    revision = latest_version[constants.ABOUT];
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var geneProducts = [];
        Utils.arrayify(partsComplete).forEach(function(part, i) {
            geneProducts.push(part);
        });
    return {
        'title': title,
        'revision': revision,
        'geneProducts': geneProducts
    };
}

PathwaySearch.prototype.parseGetCompoundsResponse = function(response) {
    var constants = new Constants();
    var latest_version, revision, title, parts;
    latest_version = response.primaryTopic.latest_version;
    title = latest_version.title;
    revision = latest_version[constants.ABOUT];
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var metabolites = [];
        Utils.arrayify(partsComplete).forEach(function(part, i) {
            metabolites.push(part);
        });
    return {
        'title': title,
        'revision': revision,
        'metabolites': metabolites
    };
}

PathwaySearch.prototype.parseByReferenceResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, publication, prefLabel, description, pathwayOntology;
        title = item.title;
        identifier = item.identifier;
        parts = item.hasPart;
        publication = parts[constants.ABOUT];
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
            'publication': publication,
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseCountPathwaysByReferenceResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseGetReferencesResponse = function(response) {
    var constants = new Constants();
    var latest_version, revision, title, parts;
    latest_version = response.primaryTopic.latest_version;
    title = latest_version.title;
    revision = latest_version[constants.ABOUT];
    var partsComplete = latest_version.hasPart ? latest_version.hasPart : null;
    var references = [];
        Utils.arrayify(partsComplete).forEach(function(part, i) {
            references.push(part);
        });
    return {
        'title': title,
        'revision': revision,
        'references': references
    };
}
PathwaySearch.prototype.parseCountPathwaysResponse = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.PATHWAY_COUNT];
}

PathwaySearch.prototype.parseListResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var pathways = [];
    items.forEach(function(item, i) {
        var title, identifier, organism, organismLabel, parts, publication, prefLabel, description, pathwayOntology;
        title = item.title;
        identifier = item.identifier;
        organism = item.pathway_organism[constants.ABOUT];
        organismLabel = item.pathway_organism.label;
        description = item.description ? item.description : null;
        pathwayOntology = item.pathwayOntology ? item.pathwayOntology : null;
        pathways.push({
            'title': title,
            'identifier': identifier,
            'description': description,
            'pathwayOntology': pathwayOntology,
            'organism': organism,
            'organismLabel': organismLabel,
        });
    });
    return pathways;
}

PathwaySearch.prototype.parseOrganismsResponse = function(response) {
    var constants = new Constants();
    var items = response.items;
    var organisms = [];
        Utils.arrayify(items).forEach(function(item, i) {
            var URI, count, label;
            URI = item[constants.ABOUT];;
            count = item.pathway_count;
            label = item.label;
            organisms.push({
                'URI': URI,
                'count': count,
                'label': label
            });
        });
    return organisms;
}

exports.PathwaySearch = PathwaySearch;

},{"./Constants":17,"./Utils":27,"nets":6}],23:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
StructureSearch = function StructureSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

StructureSearch.prototype.exact = function(smiles, matchType, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['searchOptions.Molecule'] = smiles;
        matchType != null ? params['searchOptions.MatchType'] = matchType : '';
    nets({
        url: this.baseURL + '/structure/exact?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

StructureSearch.prototype.substructure = function(smiles, molType, start, count, callback) {
    params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['searchOptions.Molecule'] = smiles;
    molType != null ? params['searchOptions.MolType'] = molType : '';
    start != null ? params['resultOptions.Start'] = start : '';
    count != null ? params['resultOptions.Count'] = count : '';
    nets({
        url: this.baseURL + '/structure/substructure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

StructureSearch.prototype.inchiKeyToURL = function(inchiKey, callback) {
params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['inchi_key'] = inchiKey;   
    nets({
        url: this.baseURL + '/structure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

StructureSearch.prototype.inchiToURL = function(inchi, callback) {
params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['inchi'] = inchi;   
 
    nets({
        url: this.baseURL + '/structure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

StructureSearch.prototype.similarity = function(smiles, type, threshold, alpha, beta, start, count, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['searchOptions.Molecule'] = smiles;
        type != null ? params['searchOptions.SimilarityType'] = type : params['searchOptions.SimilarityType'] = 0;
        threshold != null ? params['searchOptions.Threshold'] = threshold : params['searchOptions.Threshold'] = 0.99;
        alpha != null ? params['searchOptions.Alpha'] = alpha : '';
        beta != null ? params['searchOptions.Beta'] = beta : '';
        start != null ? params['resultOptions.Start'] = start : '';
        count != null ? params['resultOptions.Count'] = count : '';
    nets({
        url: this.baseURL + '/structure/similarity?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

StructureSearch.prototype.smilesToURL = function(smiles, callback) {
params={};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['smiles'] = smiles;   
 
    nets({
        url: this.baseURL + '/structure?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

StructureSearch.prototype.parseExactResponse = function(response) {
    var results = [];
        Utils.arrayify(response.primaryTopic.result).forEach(function(result, i) {
          results.push(result);
        });
	return results;
}

StructureSearch.prototype.parseSubstructureResponse = function(response) {
    var constants = new Constants();
    var results = [];
        Utils.arrayify(response.primaryTopic.result).forEach(function(result, i) {
          results.push({"about": result[constants.ABOUT], "relevance": result[constants.RELEVANCE]});
        });
	return results;
}

StructureSearch.prototype.parseInchiKeyToURLResponse = function(response) {
	return response.primaryTopic["_about"];
}

StructureSearch.prototype.parseInchiToURLResponse = function(response) {
	return response.primaryTopic["_about"];
}

StructureSearch.prototype.parseSimilarityResponse = function(response) {
    var constants = new Constants();
    var results = [];
        Utils.arrayify(response.primaryTopic.result).forEach(function(result, i) {
          results.push({"about": result[constants.ABOUT], "relevance": result[constants.RELEVANCE]});
        });
	return results;
}

StructureSearch.prototype.parseSmilesToURLResponse = function(response) {
	return response.primaryTopic["_about"];
}

exports.StructureSearch = StructureSearch;

},{"./Constants":17,"./Utils":27,"nets":6}],24:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
TargetSearch = function TargetSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targetResult = searcher.parseTargetResponse(response);
 * };
 * searcher.fetchTarget('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', null, callback);
 */
TargetSearch.prototype.fetchTarget = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/target?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * Fetch the targets represented by the URIs provided.
 * @param {string} URIList - The URIs for the targets of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targets = searcher.parseTargetBatchResponse(response);
 * };
 * searcher.fetchTargetBatch(['http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', 'http://www.conceptwiki.org/concept/7b21c06f-0343-4fcc-ab0f-a74ffe871ade'], null, callback);
 */
TargetSearch.prototype.fetchTargetBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';

    nets({
        url: this.baseURL + '/target/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });
}

/**
 * The hierarchy classes for the different Compounds that interact with a given Target.
 * @param {string} URI - The URI for the target of interest.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var targetResult = searcher.parseTargetResponse(response);
 * };
 * searcher.compoundsForTarget('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', callback);
 */
TargetSearch.prototype.compoundsForTarget = function(URI, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;

    nets({
        url: this.baseURL + '/target/classificationsForCompounds?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch pharmacology records for the target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [page=1] - Which page of records to return.
 * @param {string} [pageSize=10] - How many records to return. Set to 'all' to return all records in a single page
 * @param {string} [orderBy] - Order the records by this field eg ?assay_type or DESC(?assay_type)
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseTargetPharmacologyResponse(response);
 * };
 * searcher.targetPharmacology('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 20, null, null, callback);
 */
TargetSearch.prototype.targetPharmacology = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, page, pageSize, orderBy, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    page ? params['_page'] = page : '';
    pageSize ? params['_pageSize'] = pageSize : '';
    orderBy ? params['_orderBy'] = orderBy : '';
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/target/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch a count of the pharmacology records belonging to the target represented by the URI provided.
 * @param {string} URI - The URI for the target of interest
 * @param {string} [assayOrganism] - Filter by assay organism eg Homo Sapiens
 * @param {string} [targetOrganism] - Filter by target organism eg Rattus Norvegicus
 * @param {string} [activityType] - Filter by activity type eg IC50
 * @param {string} [activityValue] - Return pharmacology records with activity values equal to this number
 * @param {string} [minActivityValue] - Return pharmacology records with activity values greater than or equal to this number
 * @param {string} [minExActivityValue] - Return pharmacology records with activity values greater than this number
 * @param {string} [maxActivityValue] - Return pharmacology records with activity values less than or equal to this number
 * @param {string} [maxExActivityValue] - Return pharmacology records with activity values less than this number
 * @param {string} [activityUnit] - Return pharmacology records which have this activity unit eg nanomolar
 * @param {string} [activityRelation] - Return pharmacology records which have this activity relation eg =
 * @param {string} [pChembl] - Return pharmacology records with pChembl equal to this number
 * @param {string} [minpChembl] - Return pharmacology records with pChembl values greater than or equal to this number
 * @param {string} [minExpChembl] - Return pharmacology records with pChembl values greater than this number
 * @param {string} [maxpChembl] - Return pharmacology records with pChembl values less than or equal to this number
 * @param {string} [maxExpChembl] - Return pharmacology records with pChembl values less than this number
 * @param {string} [targetType] - Filter by one of the available target types. e.g. single_protein
 * @param {string} [lens] - Which chemistry lens to apply to the records
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 * @example
 * var searcher = new TargetSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *     var pharmacologyResult == searcher.parseTargetPharmacologyCountResponse(response);
 * };
 * searcher.targetPharmacologyCount('http://www.conceptwiki.org/concept/b932a1ed-b6c3-4291-a98a-e195668eda49', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, callback);
 */
TargetSearch.prototype.targetPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, activityRelation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism ? params['assay_organism'] = assayOrganism : '';
    targetOrganism ? params['target_organism'] = targetOrganism : '';
    activityType ? params['activity_type'] = activityType : '';
    activityValue ? params['activity_value'] = activityValue : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    activityUnit ? params['activity_unit'] = activityUnit : '';
    activityRelation ? params['activity_relation'] = activityRelation : '';
    pChembl ? params['pChembl'] = pChembl : '';
    minpChembl ? params['min-pChembl'] = minpChembl : '';
    minExpChembl ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType ? params['target_type'] = targetType : '';
    lens ? params['_lens'] = lens : '';

    nets({
        url: this.baseURL + '/target/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * A list of target types
 * @param {string} lens - Which chemistry lens to apply to the result
 * @param {requestCallback} callback - Function that will be called with the result
 * @method
 */
TargetSearch.prototype.targetTypes = function(lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;

    nets({
        url: this.baseURL + '/types?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Parse a block of uniprot data for a target
 * @param {Object} uniprotBlock - JSON containing some Uniprot data for a target
 * @returns {Object} Flattened uniprot response
 * @method
 */
TargetSearch.prototype.parseUniprotBlock = function(uniprotBlock) {
    var constants = new Constants();
    var uniprotData = uniprotBlock;
    var uniprotURI = uniprotData[constants.ABOUT];
    var classifiedWith = [];
    var seeAlso = [];
    if (uniprotData.classifiedWith) {
        Utils.arrayify(uniprotData.classifiedWith).forEach(function(classified, j, allClassified) {
            classifiedWith.push(classified);
        });
    }
    if (uniprotData.seeAlso) {
        Utils.arrayify(uniprotData.seeAlso).forEach(function(see, j, allSee) {
            seeAlso.push(see);
        });
    }
    var molecularWeight = uniprotData.molecularWeight ? uniprotData.molecularWeight : null;
    var functionAnnotation = uniprotData.Function_Annotation ? uniprotData.Function_Annotation : null;
    var alternativeName = uniprotData.alternativeName ? Utils.arrayify(uniprotData.alternativeName) : [];
    var existence = uniprotData.existence ? uniprotData.existence : null;
    var organism = uniprotData.organism ? uniprotData.organism : null;
    var sequence = uniprotData.sequence ? uniprotData.sequence : null;
    var mass = uniprotData.mass ? uniprotData.mass : null;
    var uniprotProvenance = {};
    var uniprotLinkOut = uniprotURI;
    uniprotProvenance['source'] = 'uniprot';
    uniprotProvenance['classifiedWith'] = uniprotLinkOut;
    uniprotProvenance['seeAlso'] = uniprotLinkOut;
    uniprotProvenance['molecularWeight'] = uniprotLinkOut;
    uniprotProvenance['functionAnnotation'] = uniprotLinkOut;
    uniprotProvenance['alternativeName'] = uniprotLinkOut;
    uniprotProvenance['existence'] = uniprotLinkOut;
    uniprotProvenance['organism'] = uniprotLinkOut;
    uniprotProvenance['sequence'] = uniprotLinkOut;
    uniprotProvenance['mass'] = uniprotLinkOut;

    return {
        'alternativeName': alternativeName,
        'molecularWeight': molecularWeight,
        'functionAnnotation': functionAnnotation,
        'mass': mass,
        'existence': existence,
        'organism': organism,
        'sequence': sequence,
        'classifiedWith': classifiedWith,
        'seeAlso': seeAlso,
        'uniprotProvenance': uniprotProvenance
    };
}

/**
 * Parse a block of concept wiki data for a target
 * @param {Object} conceptWikiBlock - JSON containing some Concept Wiki data for a target
 * @returns {Object} Flattened Concept Wiki response
 * @method
 */
TargetSearch.prototype.parseConceptWikiBlock = function(conceptWikiBlock) {
    var constants = new Constants();
    var cwUri = conceptWikiBlock[constants.ABOUT];
    var label = conceptWikiBlock[constants.PREF_LABEL];
    var conceptWikiLinkOut = conceptWikiBlock[constants.ABOUT];
    var conceptwikiProvenance = {};
    conceptwikiProvenance['source'] = 'conceptwiki';
    conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
    return {
        'prefLabel': label,
        'URI': cwUri,
        'conceptwikiProvenance': conceptwikiProvenance
    };
}

/**
 * Parse a block of ChEMBL data for a target
 * @param {Object} chemblBlock - JSON containing some ChEMBL data for a target
 * @returns {Object} Flattened ChEMBL response
 * @method
 */
TargetSearch.prototype.parseChemblBlock = function(chemblBlock) {
    var constants = new Constants();
    // there can be multiple proteins per target response
    var chemblData = chemblBlock;
    var chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/target/inspect/';
    var chemblDataItem = {};
    chemblDataItem['chembl_src'] = chemblData[constants.IN_DATASET];
    chemblUri = chemblData[constants.ABOUT];
    chemblLinkOut += chemblUri.split('/').pop();
    chemblDataItem['linkOut'] = chemblLinkOut;
    var synonymsData;
    if (chemblData[constants.LABEL]) {
        synonymsData = chemblData[constants.LABEL];
    }
    chemblDataItem['synonyms'] = synonymsData;
    var targetComponents = {};
    if (chemblData[constants.HAS_TARGET_COMPONENT]) {
        Utils.arrayify(chemblData[constants.HAS_TARGET_COMPONENT]).forEach(function(targetComponent, index, allTargetComponents) {
            targetComponents[targetComponent[constants.ABOUT]] = targetComponent.description;
        });
    }
    chemblDataItem['targetComponents'] = targetComponents;
    chemblDataItem['type'] = chemblData.type;

    var chemblProvenance = {};
    chemblProvenance['source'] = 'chembl';
    chemblProvenance['synonymsData'] = chemblLinkOut;
    chemblProvenance['targetComponents'] = chemblLinkOut;
    chemblProvenance['type'] = chemblLinkOut;
    return {
        'chemblDataItem': chemblDataItem,
        'chemblProvenance': chemblProvenance
    };
}

/**
 * Parse a block of drugbank data for a target
 * @param {Object} drugbankBlock - JSON containing some drugbank data for a target
 * @returns {Object} Flattened drugbank response
 */
TargetSearch.prototype.parseDrugbankBlock = function(drugbankBlock) {
    var constants = new Constants();
    var drugbankData = drugbankBlock;
    var cellularLocation = drugbankData.cellularLocation ? drugbankData.cellularLocation : null;
    var numberOfResidues = drugbankData.numberOfResidues ? drugbankData.numberOfResidues : null;
    var theoreticalPi = drugbankData.theoreticalPi ? drugbankData.theoreticalPi : null;
    var drugbankURI = drugbankData[constants.ABOUT] ? drugbankData[constants.ABOUT] : null;

    var drugbankLinkOut = drugbankURI;
    var drugbankProvenance = {};
    drugbankProvenance['source'] = 'drugbank';
    drugbankProvenance['cellularLocation'] = drugbankLinkOut;
    drugbankProvenance['numberOfResidues'] = drugbankLinkOut;
    drugbankProvenance['theoreticalPi'] = drugbankLinkOut;
    return {
        'cellularLocation': cellularLocation,
        'numberOfResidues': numberOfResidues,
        'theoreticalPi': theoreticalPi,
        'drugbankURI': drugbankURI,
        'drugbankProvenance': drugbankProvenance
    };
}

/**
 * Parse the results from {@link TargetSearch#fetchTarget}
 * @param {Object} response - the JSON response from {@link TargetSearch#fetchTarget}
 * @returns {FetchTargetResponse} Containing the flattened response
 * @method
 */
TargetSearch.prototype.parseTargetResponse = function(response) {
    var me = this;
    var constants = new Constants();
    var uniprotBlock = {};
    var conceptWikiBlock = {};
    var chemblBlock = {};
    var drugbankBlock = {};
    var URI = response.primaryTopic[constants.ABOUT];
    var id = URI.split("/").pop();
    var chemblItems = [];
    // depending on the URI used the info block for that object will be on the top level rather than in exactMatch
    // We need to check what the URI represents and pull the appropriate info out 
    if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'drugbankValue') {
        drugbankBlock = me.parseDrugbankBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'chemblValue') {
    	    chemblBlock = me.parseChemblBlock(response.primaryTopic);
        chemblItems.push(chemblBlock);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'uniprotValue') {
        uniprotBlock = me.parseUniprotBlock(response.primaryTopic);
    } else if (constants.SRC_CLS_MAPPINGS[response.primaryTopic[constants.IN_DATASET]] === 'conceptWikiValue') {
        conceptWikiBlock = me.parseConceptWikiBlock(response.primaryTopic);
    }
    var exactMatches = response.primaryTopic[constants.EXACT_MATCH];
    Utils.arrayify(exactMatches).forEach(function(exactMatch, i, allMatches) {
        var src = exactMatch[constants.IN_DATASET];
        if (src) {
            if (constants.SRC_CLS_MAPPINGS[src] === 'drugbankValue') {
                drugbankBlock = me.parseDrugbankBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'chemblValue') {
                chemblBlock = me.parseChemblBlock(exactMatch);
                chemblItems.push(chemblBlock);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'uniprotValue') {
                uniprotBlock = me.parseUniprotBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'conceptWikiValue') {
                conceptWikiBlock = me.parseConceptWikiBlock(exactMatch);
            }
        }
    });
    // each chemblItem has its own provenance
    return {
        'id': id,
        'URI': URI,
        'cellularLocation': drugbankBlock.cellularLocation != null ? drugbankBlock.cellularLocation : null,
        'numberOfResidues': drugbankBlock.numberOfResidues != null ? drugbankBlock.numberOfResidues : null,
        'theoreticalPi': drugbankBlock.theoreticalPi != null ? drugbankBlock.theoreticalPi : null,
        'drugbankURI': drugbankBlock.drugbankURI != null ? drugbankBlock.drugbankURI : null,
        'molecularWeight': uniprotBlock.molecularWeight != null ? uniprotBlock.molecularWeight : null,
        'functionAnnotation': uniprotBlock.functionAnnotation != null ? uniprotBlock.functionAnnotation : null,
        'alternativeName': uniprotBlock.alternativeName != null ? uniprotBlock.alternativeName : null,
        'mass': uniprotBlock.mass != null ? uniprotBlock.mass : null,
        'existence': uniprotBlock.existence != null ? uniprotBlock.existence : null,
        'organism': uniprotBlock.organism != null ? uniprotBlock.organism : null,
        'sequence': uniprotBlock.sequence != null ? uniprotBlock.sequence : null,
        'classifiedWith': uniprotBlock.classifiedWith != null ? uniprotBlock.classifiedWith : null,
        'seeAlso': uniprotBlock.seeAlso != null ? uniprotBlock.seeAlso : null,
        'chemblItems': chemblItems,
        'cwURI': conceptWikiBlock.URI != null ? conceptWikiBlock.URI : null,
        'prefLabel': conceptWikiBlock.prefLabel != null ? conceptWikiBlock.prefLabel : null,
        'drugbankProvenance': drugbankBlock.drugbankProvenance != null ? drugbankBlock.drugbankProvenance : null,
        'uniprotProvenance': uniprotBlock.uniprotProvenance != null ? uniprotBlock.uniprotProvenance : null,
        'conceptwikiProvenance': conceptWikiBlock.conceptwikiProvenance != null ? conceptWikiBlock.conceptwikiProvenance : null
    };
}

/**
 * Parse the results from {@link TargetSearch#fetchTargetBatch}
 * @param {Object} response - the JSON response from {@link TargetSearch#fetchTargetBatch}
 * @returns {FetchTargetBatchResponse} Containing the flattened response
 * @method
 */
TargetSearch.prototype.parseTargetBatchResponse = function(response) {
    var constants = new Constants();
    var targets = [];
    var me = this;
    var constants = new Constants();
    response.items.forEach(function(item, index, items) {

    var uniprotBlock = {};
    var conceptWikiBlock = {};
    var chemblBlock = {};
    var drugbankBlock = {};
    var URI = item[constants.ABOUT];
    var id = URI.split("/").pop();
    var chemblItems = [];
    // depending on the URI used the info block for that object will be on the top level rather than in exactMatch
    // We need to check what the URI represents and pull the appropriate info out 
    if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'drugbankValue') {
        drugbankBlock = me.parseDrugbankBlock(item);
    } else if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'chemblValue') {
    	    chemblBlock = me.parseChemblBlock(item);
        chemblItems.push(chemblBlock);
    } else if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'uniprotValue') {
        uniprotBlock = me.parseUniprotBlock(item);
    } else if (constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] === 'conceptWikiValue') {
        conceptWikiBlock = me.parseConceptWikiBlock(item);
    }
    var exactMatches = item[constants.EXACT_MATCH];
    Utils.arrayify(exactMatches).forEach(function(exactMatch, i, allMatches) {
        var src = exactMatch[constants.IN_DATASET];
        if (src) {
            if (constants.SRC_CLS_MAPPINGS[src] === 'drugbankValue') {
                drugbankBlock = me.parseDrugbankBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'chemblValue') {
                chemblBlock = me.parseChemblBlock(exactMatch);
                chemblItems.push(chemblBlock);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'uniprotValue') {
                uniprotBlock = me.parseUniprotBlock(exactMatch);
            } else if (constants.SRC_CLS_MAPPINGS[src] === 'conceptWikiValue') {
                conceptWikiBlock = me.parseConceptWikiBlock(exactMatch);
            }
        }
    });
targets.push({
        'id': id,
        'URI': URI,
        'cellularLocation': drugbankBlock.cellularLocation != null ? drugbankBlock.cellularLocation : null,
        'numberOfResidues': drugbankBlock.numberOfResidues != null ? drugbankBlock.numberOfResidues : null,
        'theoreticalPi': drugbankBlock.theoreticalPi != null ? drugbankBlock.theoreticalPi : null,
        'drugbankURI': drugbankBlock.drugbankURI != null ? drugbankBlock.drugbankURI : null,
        'molecularWeight': uniprotBlock.molecularWeight != null ? uniprotBlock.molecularWeight : null,
        'functionAnnotation': uniprotBlock.functionAnnotation != null ? uniprotBlock.functionAnnotation : null,
        'alternativeName': uniprotBlock.alternativeName != null ? uniprotBlock.alternativeName : null,
        'mass': uniprotBlock.mass != null ? uniprotBlock.mass : null,
        'existence': uniprotBlock.existence != null ? uniprotBlock.existence : null,
        'organism': uniprotBlock.organism != null ? uniprotBlock.organism : null,
        'sequence': uniprotBlock.sequence != null ? uniprotBlock.sequence : null,
        'classifiedWith': uniprotBlock.classifiedWith != null ? uniprotBlock.classifiedWith : null,
        'seeAlso': uniprotBlock.seeAlso != null ? uniprotBlock.seeAlso : null,
        'chemblItems': chemblItems,
        'cwURI': conceptWikiBlock.URI != null ? conceptWikiBlock.URI : null,
        'prefLabel': conceptWikiBlock.prefLabel != null ? conceptWikiBlock.prefLabel : null,
        'drugbankProvenance': drugbankBlock.drugbankProvenance != null ? drugbankBlock.drugbankProvenance : null,
        'uniprotProvenance': uniprotBlock.uniprotProvenance != null ? uniprotBlock.uniprotProvenance : null,
        'conceptwikiProvenance': conceptWikiBlock.conceptwikiProvenance != null ? conceptWikiBlock.conceptwikiProvenance : null
    });
    });
    return targets;
}

TargetSearch.prototype.parseTargetPharmacologyResponse = function(response) {
    var constants = new Constants();
    var records = [];

    response.items.forEach(function(item, index, items) {

        chemblProvenance = {};
        chemblProvenance['source'] = 'chembl';

        var chembl_activity_uri = item["_about"];
        var chembl_src = item["inDataset"];

        //big bits
        var forMolecule = item[constants.FOR_MOLECULE];
        var chembl_compound_uri;
        var compound_full_mwt = null;
        var compound_full_mwt_item;

        var em;
        var chembleMoleculeLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';

        if (forMolecule != null) {
            chembl_compound_uri = forMolecule["_about"];
            //compound_full_mwt = forMolecule['full_mwt'] ? forMolecule['full_mwt'] : null;
            chembleMoleculeLink += chembl_compound_uri.split('/').pop();
            compound_full_mwt_item = chembleMoleculeLink;
            em = forMolecule["exactMatch"];
        }

        var cw_compound_uri = null,
            compound_pref_label = null,
            cw_src = null,
            cs_compound_uri = null,
            compound_inchi = null,
            compound_inchikey = null,
            compound_smiles = null,
            cs_src = null,
            drugbank_compound_uri = null,
            compound_drug_type = null,
            compound_generic_name = null,
            drugbank_src = null,
            csid = null,
            compound_pref_label_item = null,
            compound_inchi_item = null,
            compound_inchikey_item = null,
            compound_smiles_item = null,
            assay_description = null,
            assay_description_item = null,
            compound_ro5_violations = null;
        if (em != null) {
            em.forEach(function(match, index, all) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cw_compound_uri = match["_about"];
                    compound_pref_label = match['prefLabel'];
                    cw_src = match["inDataset"];
                    compound_pref_label_item = cw_compound_uri;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    cs_compound_uri = match["_about"];
                    csid = cs_compound_uri.split('/').pop();
                    compound_inchi = match['inchi'];
                    compound_inchikey = match['inchikey'];
                    compound_smiles = match['smiles'];
                    compound_full_mwt = match.molweight;
                    compound_ro5_violations = match.ro5_violations;
                    cs_src = match["inDataset"];
                    var chemSpiderLink = 'http://www.chemspider.com/' + csid;
                    compound_inchi_item = chemSpiderLink;
                    compound_inchikey_item = chemSpiderLink;
                    compound_smiles_item = chemSpiderLink;
                } // else if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                //   drugbank_compound_uri = match["_about"];
                //   compound_drug_type = match['drugType'];
                //   compound_generic_name = match['genericName'];
                //   drugbank_src = match["_about"];
                //}
            });
        }

        var onAssay = item[constants.ON_ASSAY];
        var chembl_assay_uri;
        var assay_organism;
        var assay_organism_item;
        var target;
        var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';

        if (onAssay != null) {
            chembl_assay_uri = onAssay[constants.ABOUT];
            assay_organism = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
            assay_organism_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
            assay_description = onAssay['description'] ? onAssay['description'] : null;
            //assay_description_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
            target = onAssay[constants.ON_TARGET];
        }
        var target_pref_label;
        var target_pref_label_item;
        var targetMatch;
        var target_title = null;
        var target_organism;
        var target_organism_item;
        var target_concatenated_uris;
        var chemblTargetLink = 'https://www.ebi.ac.uk/chembldb/target/inspect/';
        var target_organisms = [];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.targetOrganismName != null ? target.targetOrganismName : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
	tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;		
				}
				target_components.push(tc);
			});
		}
            }

        var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/search.ebi?t=' + chembl_activity_uri.split('/').pop().split('_').pop() + '&db=chembl-activity';

        var activity_activity_type_item, activity_standard_value_item, activity_standard_units_item, activity_relation_item;

        var activity_activity_type = item['activity_type'] ? item['activity_type'] : null;
        activity_activity_type_item = chemblActivityLink;
        var activity_standard_value = item['activity_value'] ? item['activity_value'] : null;
        activity_standard_value_item = chemblActivityLink;
        var activity_standard_units = item.activity_unit ? item.activity_unit.prefLabel : null;
        activity_standard_units_item = chemblActivityLink;
        var activity_relation = item['activity_relation'] ? item['activity_relation'] : null;
        activity_relation_item = chemblActivityLink;
        var activity_pubmed_id = item['pmid'] ? item['pmid'] : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var pChembl = item.pChembl;
        var documents = [];
        if (item.hasDocument) {
            Utils.arrayify(item.hasDocument).forEach(function(document, index, documents) {
                documents.push(document);
            });
        }
        records.push({ //for compound
            'compoundInchikey': compound_inchikey,
            //compoundDrugType: compound_drug_type,
            //compoundGenericName: compound_generic_name,
            //targetConcatenatedUris: target_concatenated_uris,

            'compoundInchikeySrc': cs_src,
            //compoundDrugTypeSrc: drugbank_src,
            //compoundGenericNameSrc: drugbank_src,
            'targetTitleSrc': chembl_src,
            //targetConcatenatedUrisSrc: chembl_src,
	    'targetTitle': target_title,
	    'targetOrganismName': target_organism_name,
	    'targetComponents': target_components,
	    'targetURI': target_uri,
	    'targetProvenance': target_provenance,

            //for target
            'chemblActivityUri': chembl_activity_uri,
            'chemblCompoundUri': chembl_compound_uri,
            'compoundFullMwt': compound_full_mwt,
            'cwCompoundUri': cw_compound_uri,
            'compoundPrefLabel': compound_pref_label,
            'csCompoundUri': cs_compound_uri,
            'csid': csid,
            'compoundInchi': compound_inchi,
            'compoundSmiles': compound_smiles,
            'chemblAssayUri': chembl_assay_uri,


            'assayOrganism': assay_organism,
            'assayDescription': assay_description,
            'activityRelation': activity_relation,
            'activityStandardUnits': activity_standard_units,
            'activityStandardValue': activity_standard_value,
            'activityActivityType': activity_activity_type,
            'activityPubmedId': activity_pubmed_id,
            'activityComment': activity_comment,

            'compoundFullMwtSrc': chembl_src,
            'compoundPrefLabelSrc': cw_src,
            'compoundInchiSrc': cs_src,
            'compoundSmilesSrc': cs_src,
            //targetOrganismSrc: chembl_src,
            'targetPrefLabelSrc': cw_src,
            'assayOrganismSrc': chembl_src,
            'assayDescriptionSrc': chembl_src,
            'activityRelationSrc': chembl_src,
            'activityStandardUnits_src': chembl_src,
            'activityStandardValue_src': chembl_src,
            'activityActivityType_src': chembl_src,

            'compoundPrefLabelItem': compound_pref_label_item,
            'activityActivityTypeItem': activity_activity_type_item,
            'activityRelationItem': activity_relation_item,
            'activityStandardValueItem': activity_standard_value_item,
            'activityStandardUnitsItem': activity_standard_units_item,
            'compoundFullMwtItem': compound_full_mwt_item,
            'compoundSmilesItem': compound_smiles_item,
            'compoundInchiItem': compound_inchi_item,
            'compoundInchikeyItem': compound_inchikey_item,
            //targetPrefLabelItem: target_pref_label_item,
            'assayOrganismItem': assay_organism_item,
            //assayDescriptionItem: assay_description_item,
            //targetOrganismItem: target_organism_item,
            'pChembl': pChembl,
            'compoundRO5Violations': compound_ro5_violations,
            'chemblProvenance': chemblProvenance,
            'chemblDOIs': documents
        });
    });
    return records;
}

TargetSearch.prototype.parseTargetPharmacologyCountResponse = function(response) {
    return response.primaryTopic.targetPharmacologyTotalResults;
}

},{"./Constants":17,"./Utils":27,"nets":6}],25:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
TissueSearch = function TissueSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

/**
 * Fetch the tissue represented by the URI provided.
 * @param {string} URI - The URI for the tissue of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TissueSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var tissueResult = searcher.parseTissueResponse(response);
 * };
 * searcher.fetchTissue('ftp://ftp.nextprot.org/pub/current_release/controlled_vocabularies/caloha.obo#TS-0171', null, callback);
 */
TissueSearch.prototype.fetchTissue = function(URI, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/tissue?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Fetch the mutiple tissues represented by the URIs provided.
 * @param {Array.<string>} URIList - A list of URIs for the tissue of interest.
 * @param {string} [lens] - An optional lens to apply to the result.
 * @param {requestCallback} callback - Function that will be called with the result.
 * @method
 * @example
 * var searcher = new TissueSearch("https://beta.openphacts.org/1.5", "appID", "appKey");
 * var callback=function(success, status, response){
 *    var tissueResult = searcher.parseTissueBatchResponse(response);
 * };
 * searcher.fetchTissueBatch(['ftp://ftp.nextprot.org/pub/current_release/controlled_vocabularies/caloha.obo#TS-0171', 'ftp://ftp.nextprot.org/pub/current_release/controlled_vocabularies/caloha.obo#TS-0173'], null, callback);
 */
TissueSearch.prototype.fetchTissueBatch = function(URIList, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    var URIs = URIList.join('|');
    params['uri_list'] = URIs;
    lens ? params['_lens'] = lens : '';
    nets({
        url: this.baseURL + '/tissue/batch?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

/**
 * Parse the results from {@link TissueSearch#fetchTissue}
 * @param {Object} response - the JSON response from {@link TissueSearch#fetchTissue}
 * @returns {FetchTissueResponse} Containing the flattened response
 * @method
 */
TissueSearch.prototype.parseTissueResponse = function(response) {
    var constants = new Constants();
    var uri = response.primaryTopic[constants.ABOUT];
    var label = response.primaryTopic.label;
    var definition = response.primaryTopic.definition != null ? response.primaryTopic.definition : null;
    var dataset = response.primaryTopic[constants.IN_DATASET] != null ? response.primaryTopic[constants.IN_DATASET] : null;
    var dbXrefs = [];
    if (response.primaryTopic.hasDbXref != null) {
        Utils.arrayify(response.primaryTopic.hasDbXref).forEach(function(dbXref, index) {
            dbXrefs.push(dbXref);
        });
    }
    return {
        "uri": uri,
        "label": label,
        "definition": definition,
        "dataset": dataset,
        "dbXrefs": dbXrefs
    };
}

/**
 * Parse the results from {@link TissueSearch#fetchTissueBatch}
 * @param {Object} response - the JSON response from {@link TissueSearch#fetchTissueBatch}
 * @returns {Array.<FetchTissueResponse>} Containing the flattened response
 * @method
 */
TissueSearch.prototype.parseTissueBatchResponse = function(response) {
    var constants = new Constants();
    var tissues = [];
    response.items.forEach(function(tissue, index) {
    var uri = tissue[constants.ABOUT];
    var label = tissue.label;
    var definition = tissue.definition != null ? tissue.definition : null;
    var dataset = tissue[constants.IN_DATASET] != null ? tissue[constants.IN_DATASET] : null;
    var dbXrefs = [];
    if (tissue.hasDbXref != null) {
        arrayify(tissue.hasDbXref).forEach(function(dbXref, index) {
            dbXrefs.push(dbXref);
        });
    }
    tissues.push({
        "uri": uri,
        "label": label,
        "definition": definition,
        "dataset": dataset,
        "dbXrefs": dbXrefs
    });
    });
    return tissues;
}

exports.TissueSearch = TissueSearch;

},{"./Constants":17,"./Utils":27,"nets":6}],26:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.
var Utils = require("./Utils");
var Constants = require("./Constants");
var nets = require("nets");

/**
 * @constructor
 * @param {string} baseURL - URL for the Open PHACTS API
 * @param {string} appID - Application ID for the application being used. Created by {@link https://dev.openphacts.org}
 * @param {string} appKey - Application Key for the application ID.
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
TreeSearch = function TreeSearch(baseURL, appID, appKey) {
    	this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}

TreeSearch.prototype.getRootNodes = function(root, callback) {
	var params = {};
	params['root'] = root;
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
 
    nets({
        url: this.baseURL + '/tree?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getChildNodes = function(URI, callback) {
	var params = {};
	params['uri'] = URI;
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    nets({
        url: this.baseURL + '/tree/children?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getParentNodes = function(URI, callback) {
	var params = {};
	params['uri'] = URI;
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;

    nets({
        url: this.baseURL + '/tree/parents?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}


TreeSearch.prototype.getTargetClassPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    lens != null ? params['lens'] = lens : '';
    nets({
        url: this.baseURL + '/target/tree/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getTargetClassPharmacologyPaginated = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    lens != null ? params['lens'] = lens : '';
    page != null ? params['_page'] = page : '';
    pageSize != null ? params['_pageSize'] = pageSize : '';
    orderBy != null ? params['_orderBy'] = orderBy : '';
nets({
        url: this.baseURL + '/target/tree/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getCompoundClassPharmacologyCount = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    lens != null ? params['lens'] = lens : '';
nets({
        url: this.baseURL + '/compound/tree/pharmacology/count?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });

}

TreeSearch.prototype.getCompoundClassPharmacologyPaginated = function(URI, assayOrganism, targetOrganism, activityType, activityValue, activityUnit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, relation, pChembl, minpChembl, minExpChembl, maxpChembl, maxExpChembl, targetType, lens, page, pageSize, orderBy, callback) {
    params = {};
    params['_format'] = "json";
    params['app_key'] = this.appKey;
    params['app_id'] = this.appID;
    params['uri'] = URI;
    assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
    targetOrganism != null ? params['target_organism'] = targetOrganism : '';
    activityType != null ? params['activity_type'] = activityType : '';
    activityValue != null ? params['activity_value'] = activityValue : '';
    activityUnit != null ? params['activity_unit'] = activityUnit : '';
    minActivityValue ? params['min-activity_value'] = minActivityValue : '';
    minExActivityValue ? params['minEx-activity_value'] = minExActivityValue : '';
    maxActivityValue ? params['max-activity_value'] = maxActivityValue : '';
    maxExActivityValue ? params['maxEx-activity_value'] = maxExActivityValue : '';
    relation != null ? params['activity_relation'] = relation : '';
    pChembl != null ? params['pChembl'] = pChembl : '';
    minpChembl != null ? params['min-pChembl'] = minpChembl : '';
    minExpChembl != null ? params['minEx-pChembl'] = minExpChembl : '';
    maxpChembl != null ? params['max-pChembl'] = maxpChembl : '';
    maxExpChembl != null ? params['maxEx-pChembl'] = maxExpChembl : '';
    targetType != null ? params['target_type'] = targetType : '';
    lens != null ? params['lens'] = lens : '';
    page != null ? params['_page'] = page : '';
    pageSize != null ? params['_pageSize'] = pageSize : '';
    orderBy != null ? params['_orderBy'] = orderBy : '';
nets({
        url: this.baseURL + '/compound/tree/pharmacology/pages?' + Utils.encodeParams(params),
        method: "GET",
        // 30 second timeout just in case
        timeout: 30000,
        headers: {
            "Accept": "application/json"
        }
    }, function(err, resp, body) {
        if (resp.statusCode === 200) {
            callback.call(this, true, resp.statusCode, JSON.parse(body.toString()).result);
        } else {
            callback.call(this, false, resp.statusCode);
        }
    });


}

TreeSearch.prototype.parseRootNodes = function(response) {
    var enzymeRootClasses = [];
    var prefLabel = response.primaryTopic.hasPart.prefLabel;
        Utils.arrayify(response.primaryTopic.hasPart.rootNode).forEach(function(member, i) {
            enzymeRootClasses.push({
                uri: member["_about"],
                name: member.prefLabel
            });
        });
    return {
        'label': prefLabel,
        'rootClasses': enzymeRootClasses
    };
}

TreeSearch.prototype.parseChildNodes = function(response) {
    var constants = new Constants();
    var childResponse = {};
    var treeClasses = [];
    var label = response.primaryTopic.prefLabel;
    //label = Utils.arrayify(label)[0];
    childResponse['label'] = label;
    // The childNode might be inside an exactMatch block in 1.5
    if (response.primaryTopic.childNode == null) {
        response.primaryTopic.childNode = response.primaryTopic.exactMatch.childNode;
    }
        Utils.arrayify(response.primaryTopic.childNode).forEach(function(member, i) {
            var about;
            var names = [];
            if (member[constants.ABOUT] != null) {
                about = member["_about"];

                    Utils.arrayify(member.prefLabel).forEach(function(label, j) {
                        names.push(label);
                    });
            }
            treeClasses.push({
                uri: about,
                names: names
            });
        });
    childResponse['children'] = treeClasses;
    return childResponse;
}

TreeSearch.prototype.parseParentNodes = function(response) {
    var constants = new Constants();
    var parentResponse = {};
    var treeClasses = [];
    var label = response.primaryTopic.prefLabel;
    label = Utils.arrayify(label)[0];
    parentResponse['label'] = label;
        Utils.arrayify(response.primaryTopic.parentNode).forEach(function(member, i) {
            var about = member["_about"];
            var names = [];
                Utils.arrayify(member.prefLabel).forEach(function(label, j) {
                    names.push(label);
                });
            treeClasses.push({
                uri: about,
                names: names
            });
        });
    parentResponse['parents'] = treeClasses;
    return parentResponse;
}


TreeSearch.prototype.parseTargetClassPharmacologyCount = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.TARGET_PHARMACOLOGY_COUNT];
}

TreeSearch.prototype.parseTargetClassPharmacologyPaginated = function(response) {
    var constants = new Constants();
    var records = [];
    response.items.forEach(function(item, i, all) {
        var targets = [];
        var chemblActivityURI = null,
            pmid = null,
            //relation = null,
            //standardUnits = null,
            //standardValue = null,
            activityType = null,
            inDataset = null,
            fullMWT = null,
            chemblURI = null,
            cwURI = null,
            prefLabel = null,
            csURI = null,
            inchi = null,
            inchiKey = null,
            smiles = null,
            ro5Violations = null,
            targetURI = null,
            targetTitle = null,
            targetOrganism = null,
            assayURI = null,
            assayDescription = null,
            assayOrganism = null,
            publishedRelation = null,
            publishedType = null,
            publishedUnits = null,
            publishedValue = null,
            pChembl = null,
            activityType = null,
            activityRelation = null,
            activityValue = null,
            activityUnits = null,
            conceptwikiProvenance = {},
            chemspiderProvenance = {},
            assayTargetProvenance = {},
            assayProvenance = {};
        chemblActivityURI = item["_about"];
        pmid = item.pmid;

        activityType = item.activity_type;
        activityRelation = item.activity_relation;
        activityValue = item.activity_value;
        var units = item.activity_unit;
        if (units) {
            activityUnits = units.prefLabel;
        }
        //relation = item.relation ? item.relation : null;
        //standardUnits = item.standardUnits;
        //standardValue = item.standardValue ? item.standardValue : null;
        activityType = item.activity_type;
        inDataset = item[constants.IN_DATASET];
        forMolecule = item[constants.FOR_MOLECULE];
        chemblURI = forMolecule[constants.ABOUT] ? forMolecule[constants.ABOUT] : null;
        pChembl = item.pChembl ? item.pChembl : null;
        if (forMolecule[constants.EXACT_MATCH] != null) {
            forMolecule[constants.EXACT_MATCH].forEach(function(match, j, all) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cwURI = match[constants.ABOUT];
                    prefLabel = match[constants.PREF_LABEL];
                    var conceptWikiLinkOut = cwURI;
                    conceptwikiProvenance['source'] = 'conceptwiki';
                    conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    csURI = match[constants.ABOUT];
                    inchi = match[constants.INCHI];
                    inchiKey = match[constants.INCHIKEY];
                    smiles = match[constants.SMILES];
                    ro5Violations = match[constants.RO5_VIOLATIONS] != null ? match[constants.RO5_VIOLATIONS] : null;
                    fullMWT = match[constants.MOLWT] ? match[constants.MOLWT] : null;
                    var chemspiderLinkOut = csURI;
                    chemspiderProvenance['source'] = 'chemspider';
                    chemspiderProvenance['hba'] = chemspiderLinkOut;
                    chemspiderProvenance['hbd'] = chemspiderLinkOut;
                    chemspiderProvenance['inchi'] = chemspiderLinkOut;
                    chemspiderProvenance['logp'] = chemspiderLinkOut;
                    chemspiderProvenance['psa'] = chemspiderLinkOut;
                    chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
                    chemspiderProvenance['smiles'] = chemspiderLinkOut;
                    chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
                    chemspiderProvenance['molform'] = chemspiderLinkOut;
                }
            });
        }
        var target = item.hasAssay.hasTarget;
var target_organisms = [];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }
        var onAssay = item[constants.ON_ASSAY];
        assayURI = onAssay["_about"] ? onAssay["_about"] : null;
        assayDescription = onAssay.description ? onAssay.description : null;
        assayOrganismName = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
        var assayOrganismLinkOut = assayURI;
        assayProvenance['assayDescription'] = assayOrganismLinkOut;
        assayProvenance['assayOrganismName'] = assayOrganismLinkOut;
        publishedRelation = item.publishedRelation ? item.publishedRelation : null;
        publishedType = item.publishedType ? item.publishedType : null;
        publishedUnits = item.publishedUnits ? item.publishedUnits : null;
        publishedValue = item.publishedValue ? item.publishedValue : null;
        standardUnits = item.standardUnits ? item.standardUnits : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var documents = [];
        if (item.hasDocument) {
                Utils.arrayify(item.hasDocument).forEach(function(document, index, documents) {
                    documents.push(document);
                });
            }
        records.push({
            'targetComponents': target_components,
		'targetTitle': target_title,
		'targetURI': target_uri,
		'targetOrganismName': target_organism_name,
            'chemblActivityURI': chemblActivityURI,
            'pmid': pmid,
            //'relation': relation,
            //'standardUnits': standardUnits,
            //'standardValue': standardValue,
            'activityType': activityType,
            'activityRelation': activityRelation,
            'activityUnits': activityUnits,
            'activityValue': activityValue,
            'inDataset': inDataset,
            'fullMWT': fullMWT,
            'chemblURI': chemblURI,
            'cwURI': cwURI,
            'prefLabel': prefLabel,
            'csURI': csURI,
            'inchi': inchi,
            'inchiKey': inchiKey,
            'smiles': smiles,
            'ro5Violations': ro5Violations,
            //targetURI: targetURI,
            //targetTitle: targetTitle,
            //targetOrganism: targetOrganism,
            'assayURI': assayURI,
            'assayDescription': assayDescription,
            'assayOrganismName': assayOrganismName,
            'publishedRelation': publishedRelation,
            'publishedType': publishedType,
            'publishedUnits': publishedUnits,
            'publishedValue': publishedValue,
            'pChembl': pChembl,
            'conceptWikiProvenance': conceptwikiProvenance,
            'chemspiderProvenance': chemspiderProvenance,
            'assayTargetProvenance': assayTargetProvenance,
            'assayProvenance': assayProvenance,
            'chemblDOIs': documents,
            'activityComment': activity_comment
        });
    });
    return records;
}

TreeSearch.prototype.parseCompoundClassPharmacologyCount = function(response) {
    var constants = new Constants();
    return response.primaryTopic[constants.COMPOUND_PHARMACOLOGY_COUNT];
}

TreeSearch.prototype.parseCompoundClassPharmacologyPaginated = function(response) {
    var constants = new Constants();
    var records = [];
    response.items.forEach(function(item, i, all) {
        var targets = [];
        var chemblActivityURI = null,
            qudtURI = null,
            pmid = null,
            //relation = null,
            //standardUnits = null,
            //standardValue = null,
            activityType = null,
            inDataset = null,
            fullMWT = null,
            chemblURI = null,
            cwURI = null,
            prefLabel = null,
            csURI = null,
            inchi = null,
            inchiKey = null,
            smiles = null,
            ro5Violations = null,
            targetURI = null,
            targetTitle = null,
            targetOrganism = null,
            assayURI = null,
            assayDescription = null,
            assayOrganism = null,
            publishedRelation = null,
            publishedType = null,
            publishedUnits = null,
            publishedValue = null,
            pChembl = null,
            activityType = null,
            activityRelation = null,
            activityValue = null,
            activityUnits = null,
            conceptwikiProvenance = {},
            chemspiderProvenance = {},
            assayTargetProvenance = {},
            assayProvenance = {};
        chemblActivityURI = item["_about"];
        pmid = item.pmid;

        activityType = item.activity_type;
        activityRelation = item.activity_relation;
        activityValue = item.activity_value;
        var units = item.activity_unit;
        if (units) {
            activityUnits = units.prefLabel;
        }
        qudtURI = item.qudt_uri ? item.qudt_uri : null;
        //relation = item.relation ? item.relation : null;
        //standardUnits = item.standardUnits;
        //standardValue = item.standardValue ? item.standardValue : null;
        activityType = item.activity_type;
        inDataset = item[constants.IN_DATASET];
        forMolecule = item[constants.FOR_MOLECULE];
        chemblURI = forMolecule[constants.ABOUT] ? forMolecule[constants.ABOUT] : null;
        pChembl = item.pChembl ? item.pChembl : null;
if (forMolecule[constants.EXACT_MATCH] != null) {
        forMolecule[constants.EXACT_MATCH].forEach(function(match, j, all) {
            var src = match[constants.IN_DATASET];
            if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                cwURI = match[constants.ABOUT];
                prefLabel = match[constants.PREF_LABEL];
                var conceptWikiLinkOut = cwURI;
                conceptwikiProvenance['source'] = 'conceptwiki';
                conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
            } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                csURI = match[constants.ABOUT];
                inchi = match[constants.INCHI];
                inchiKey = match[constants.INCHIKEY];
                smiles = match[constants.SMILES];
                ro5Violations = match[constants.RO5_VIOLATIONS] !== null ? match[constants.RO5_VIOLATIONS] : null;
                fullMWT = match[constants.MOLWT] ? match[constants.MOLWT] : null;
                var chemspiderLinkOut = csURI;
                chemspiderProvenance['source'] = 'chemspider';
                chemspiderProvenance['hba'] = chemspiderLinkOut;
                chemspiderProvenance['hbd'] = chemspiderLinkOut;
                chemspiderProvenance['inchi'] = chemspiderLinkOut;
                chemspiderProvenance['logp'] = chemspiderLinkOut;
                chemspiderProvenance['psa'] = chemspiderLinkOut;
                chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
                chemspiderProvenance['smiles'] = chemspiderLinkOut;
                chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
                chemspiderProvenance['molform'] = chemspiderLinkOut;
            }
        });
}
        var target = item.hasAssay.hasTarget;
        var assayTargets = [];
var target_organism_name = null;
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Utils.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }
        var onAssay = item[constants.ON_ASSAY];
        assayURI = onAssay["_about"] ? onAssay["_about"] : null;
        assayDescription = onAssay.description ? onAssay.description : null;
        assayOrganismName = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
        var assayOrganismLinkOut = assayURI;
        assayProvenance['assayDescription'] = assayOrganismLinkOut;
        assayProvenance['assayOrganismName'] = assayOrganismLinkOut;
        publishedRelation = item.publishedRelation ? item.publishedRelation : null;
        publishedType = item.publishedType ? item.publishedType : null;
        publishedUnits = item.publishedUnits ? item.publishedUnits : null;
        publishedValue = item.publishedValue ? item.publishedValue : null;
        standardUnits = item.standardUnits ? item.standardUnits : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var documents = [];
        if (item.hasDocument) {
                Utils.arrayify(item.hasDocument).forEach(function(document, index, documents) {
                    documents.push(document);
                });
        }

        records.push({
            'qudtURI': qudtURI,
            'chemblActivityURI': chemblActivityURI,
            'pmid': pmid,
            //'relation': relation,
            //'standardUnits': standardUnits,
            //'standardValue': standardValue,
            'activityType': activityType,
            'activityRelation': activityRelation,
            'activityUnits': activityUnits,
            'activityValue': activityValue,
            'inDataset': inDataset,
            'fullMWT': fullMWT,
            'chemblURI': chemblURI,
            'cwURI': cwURI,
            'prefLabel': prefLabel,
            'csURI': csURI,
            'inchi': inchi,
            'inchiKey': inchiKey,
            'smiles': smiles,
            'ro5Violations': ro5Violations,
            'targetURI': target_uri,
            'targetTitle': target_title,
            'targetOrganismName': target_organism_name,
	    'targetComponents': target_components,
            'assayURI': assayURI,
            'assayDescription': assayDescription,
            'assayOrganismName': assayOrganismName,
            'publishedRelation': publishedRelation,
            'publishedType': publishedType,
            'publishedUnits': publishedUnits,
            'publishedValue': publishedValue,
            'pChembl': pChembl,
            'conceptWikiProvenance': conceptwikiProvenance,
            'chemspiderProvenance': chemspiderProvenance,
            'assayTargetProvenance': assayTargetProvenance,
            'assayProvenance': assayProvenance,
            'chemblDOIs': documents,
            'activityComment': activity_comment
        });
    });
    return records;
}
exports.TreeSearch = TreeSearch;

},{"./Constants":17,"./Utils":27,"nets":6}],27:[function(require,module,exports){
/**
 * Check if some data is an array and return either itself if it is an array
 * or an array with it as the first member if it is not. Used for the cases where
 * the API returns either an array or a singleton.
 * @param {Object}
 * @returns {Array}
 * @method
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
exports.arrayify = function(data) {
    if (!Array.isArray(data)) {
        return [data];
    } else {
        return data;;
    }
}

/**
 * Turns an object containing key/value pairs into URI encoded 'key1=value1&key2=value2...' parameters for
 * an http request.
 * @param {Object}
 * @returns {String}
 * @method
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
exports.encodeParams = function(params) {
    var requestParams = "";
    Object.keys(params).forEach(function(key, index) {
        requestParams += key + "=" + encodeURIComponent(params[key]) + "&";
    });
    requestParams = requestParams.substr(0, requestParams.length - 1);
    return requestParams;
}

},{}],28:[function(require,module,exports){
//This content is released under the MIT License, http://opensource.org/licenses/MIT. See licence.txt for more details.

/**
 * @constructor
 * @license [MIT]{@link http://opensource.org/licenses/MIT}
 * @author [Ian Dunlop]{@link https://github.com/ianwdunlop}
 */
Version = function Version() {
 
};

/**
 * Provides metadata and version information about this release of OPS.js.
 * @method
 * @example
 * new Version().information();
 */
Version.prototype.information = function() {
	return {
               "version": "6.0.2", 
               "author": "Ian Dunlop",
	       "ORCID": "http://orcid.org/0000-0001-7066-3350",
               "title": "OPS.js",
               "description": "Javascript library for accessing the Open PHACTS Linked Data API",
               "project": "Open PHACTS",
               "organization": "School of Computer Science",
               "address": "University of Manchester, UK",
               "year": "2015",
               "month": "July",
               "url": "http://github.com/openphacts/ops.js",
               "LDA-version": "1.5"
           }; 
};

exports.Version = Version;

},{}]},{},[21]);
