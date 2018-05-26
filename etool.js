'use strict'

const iconv        = require('iconv-lite')
const EventEmitter = require('events')

const sysSectionOffset  = 0x8
const userSectionOffset = 0xa8
const userHeadOffset    = 0xb0
const userDataOffset    = 0x10c


const fileHead    = Buffer.from('CNWTEPRG')
const sectionFlag = Buffer.from([0x19, 0x73, 0x11, 0x15])

/**
 * variable string
 * 
 * @class VString
 * @private
 */
class VString {
  constructor(buf = Buffer.alloc(0)) {
    this.buf = buf
  }

  load(buf = Buffer.alloc(0), offset = 0) {
    const size = buf.readInt32LE(offset)

    this.buf = buf.slice(offset + 4, offset + 4 + size)
    return 4 + size
  }

  get full() {
    const sizeBuf = Buffer.alloc(4)
    sizeBuf.writeInt32LE(this.buf.byteLength, 0)

    return Buffer.concat([sizeBuf, this.buf])
  }

  [Symbol.toPrimitive]() {
    return this.full
  }

  get size() {
    return this.buf.byteLength
  }

  set value(str) {
    this.buf = iconv.encode(str, 'gbk')
  }

  get value() {
    return iconv.decode(this.buf, 'gbk')
  }
}

/**
 * @class VInt
 * @private
 */
class VInt {

  constructor(buf = Buffer.alloc(4), offset = 0) {
    this.buf = buf.slice(offset, offset + 4)
  }

  load(buf = Buffer.alloc(4), offset = 0) {
    this.buf = buf.slice(offset, offset + 4)
    return 4
  }

  get full() {
    return this.buf
  }

  [Symbol.toPrimitive]() {
    return this.full
  }

  set value(int) {
    this.buf.writeInt32LE(int, 0)
  }

  get value() {
    return this.buf.readInt32LE(0)
  }
}

/**
 * E lang code file analyze class
 * 
 * @class eLangTool
 */
class eLangTool extends EventEmitter {

  /**
   * Creates an instance of eLangTool.
   * @param {Buffer} [buf] Buffer for E lang code file
   * @memberof eLangTool
   */
  constructor(buf = Buffer.alloc(0)) {
    super()
    this.file       = buf
    this.sysSection = buf.slice(8, userSectionOffset)

    if (buf.slice(sysSectionOffset, sysSectionOffset + 4).toString('hex')
      !== sectionFlag.toString('hex')
    ) {
      this.emit('error', new Error('Sys section flag error!'))
      return
    }
    if (buf.slice(userSectionOffset, userSectionOffset + 4).toString('hex')
      !== sectionFlag.toString('hex')
    ) {
      this.emit('error', new Error('User section flag error!'))
      return
    }

    const userDataSize = buf.readInt32LE(0xe0)

    if (userDataSize < 84) {
      this.emit('error', new Error('User data size error!'))
      return
    }


    this.user = {
      fullBuf : buf.slice(userSectionOffset, userDataOffset + userDataSize),
      headHash: new VInt(buf.slice(userSectionOffset + 4)),
      headBuf : buf.slice(userHeadOffset, userDataOffset),

      dataHash: new VInt(buf.slice(userHeadOffset + 44)),
      dataSize: new VInt(buf.slice(userHeadOffset + 48)),
      dataBuf : buf.slice(userDataOffset, userDataOffset + userDataSize),

      data: {
        name       : new VString(),
        description: new VString(),
        author     : new VString(),
        zipCode    : new VString(),
        address    : new VString(),
        phone      : new VString(),
        fax        : new VString(),
        email      : new VString(),
        homepage   : new VString(),
        copyright  : new VString(),
        major      : new VInt(),      // major for version 
        minor      : new VInt(),      // minor for version 
        patch      : new VInt(),      // patch for version 
        date       : new VInt(),      // date for version 
        get fullVersion() {
          return `${this.major.value}.${this.minor.value}.${this.patch.value}.${this.date.value}`
        },
        set fullVersion(ver) {
          this.version = ver
        },
        get version() {
          return `${this.major.value}.${this.minor.value}.${this.patch.value}`
        },
        set version(ver) {
          const vers = (ver + '').split('.')

          this.major.value = isNaN(parseInt(vers[0])) ? this.major.value : parseInt(vers[0])
          this.minor.value = isNaN(parseInt(vers[1])) ? this.minor.value : parseInt(vers[1])
          this.patch.value = isNaN(parseInt(vers[2])) ? this.patch.value : parseInt(vers[2])
          this.date.value  = parseInt(vers[3]) || parseInt(formatDate()) || this.date.value
        },
      }
    }

    if (this.user.headHash.value !== getCheckValue(this.user.headBuf)) {
      this.emit('error', new Error('User head hash error!'))
      return
    }
    if (this.user.dataHash.value !== getCheckValue(this.user.dataBuf)) {
      this.emit('error', new Error('User head hash error!'))
      return
    }

    let offset = userDataOffset

    offset += this.user.data.name.load(buf, offset)
    offset += this.user.data.description.load(buf, offset)
    offset += this.user.data.author.load(buf, offset)
    offset += this.user.data.zipCode.load(buf, offset)
    offset += this.user.data.address.load(buf, offset)
    offset += this.user.data.phone.load(buf, offset)
    offset += this.user.data.fax.load(buf, offset)
    offset += this.user.data.email.load(buf, offset)
    offset += this.user.data.homepage.load(buf, offset)
    offset += this.user.data.copyright.load(buf, offset)
    offset += this.user.data.major.load(buf, offset)
    offset += this.user.data.minor.load(buf, offset)
    offset += this.user.data.patch.load(buf, offset)
    offset += this.user.data.date.load(buf, offset)

    this.otherSection = buf.slice(userDataOffset + userDataSize)
    if (buf.slice(userDataOffset + userDataSize, userDataOffset + userDataSize + 4).toString('hex')
      !== sectionFlag.toString('hex')
    ) {
      this.emit('error', new Error('Other section flag error!'))
      return
    }
  }

  /**
   * output E lang code file buffer
   * 
   * @returns 
   * @memberof eLangTool
   */
  save() {
    const userData = Buffer.concat([
      this.user.data.name.full,
      this.user.data.description.full,
      this.user.data.author.full,
      this.user.data.zipCode.full,
      this.user.data.address.full,
      this.user.data.phone.full,
      this.user.data.fax.full,
      this.user.data.email.full,
      this.user.data.homepage.full,
      this.user.data.copyright.full,
      this.user.data.major.full,
      this.user.data.minor.full,
      this.user.data.patch.full,
      this.user.data.date.full,
      Buffer.alloc(0x20),
    ])
    this.user.dataSize.value = userData.byteLength
    this.user.dataHash.value = getCheckValue(userData)
    this.user.headHash.value = getCheckValue(this.user.headBuf)

    return Buffer.concat([
      this.file.slice(0, userDataOffset),
      userData,
      this.otherSection
    ])
  }
}

function formatDate(date = new Date(), fmt = 'yyMMdd') {
  var o = {
    "M+": date.getMonth() + 1,                     //月份 
    "d+": date.getDate(),                          //日 
    "h+": date.getHours(),                         //小时 
    "m+": date.getMinutes(),                       //分 
    "s+": date.getSeconds(),                       //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3),   //季度 
    "S" : date.getMilliseconds()                   //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt
      .replace(RegExp.$1, (date.getFullYear() + "")
        .substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
        ? (o[k])
        : (("00" + o[k]).substr(("" + o[k]).length)))
  }
  return fmt
}

function getCheckValue(buf = Buffer.alloc(0)) {
  const key = Buffer.alloc(4)
  for (let i = 0; i < buf.byteLength; i++) {
    key[i % 4] = key[i % 4] ^ buf[i]
  }
  return key.readInt32LE(0)
}


module.exports = eLangTool
