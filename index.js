const protobuf = require("protobufjs")
const hashjs = require('hash.js')
const bs58 = require('bs58')

function createMultihash (content) {
  const hash = hashjs.sha256().update(content).digest()
  return bs58.encode(Buffer.concat([ Buffer.from([ 0x12, 0x20 ]), Buffer.from(hash) ]))
}

function encodeUnixFile (content, cb) {
  protobuf.load('unixfs.proto', function (err, root) {
    if (err) {
      return cb(err)
    }
    
    if (content.length > (1024 * 256)) {
      return cb('Data too big and needs to be chunked. (Not implemented.)')
    }
    
    var Data = root.lookup('Data')
    var message = Data.create({
      Type: 2, // 'File'
      Data: content,
      filesize: content.length,
      // blocksizes: [ content.length ]
    })
    cb(null, Data.encode(message).finish())
  })
}

function encodePBDag (content, cb) {
  protobuf.load('pbdag.proto', function (err, root) {
    if (err) {
      return cb(err)
    }
    
    var PBNode = root.lookup('PBNode')
    var message = PBNode.create({
      Data: content
    })
    cb(null, PBNode.encode(message).finish())
  })
}

const fs = require('fs')
encodeUnixFile('Hello World', function (err, ret) {
//  console.log(err, ret)
  
  if (err) throw err;
  
  encodePBDag(ret, function (err, ret) {
//    console.log(err, ret)
    
    if (err) throw err;
    
    console.log(createMultihash(ret))
  })
})

