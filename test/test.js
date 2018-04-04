/*global describe, it*/
/*eslint "quotes": 0*/
var expect = require('expect.js')
var et = require('..')
var path = require('path')

describe('compile', function() {
  it('should works with empty template', function () {
    var fn = et.compile('')
    expect(fn()).to.be('')
  })

  it('should support backslash', function () {
    var fn = et.compile('/^\\/app')
    expect(fn()).to.be('/^\\/app')
  })

  it('should works with simple string', function () {
    var fn = et.compile("a='abc'\nb")
    expect(fn()).to.be("a='abc'\nb")
  })

  it('should works with if tag', function () {
    var fn = et.compile("{{if _.x}}\n  <abc>\n{{/}}")
    expect(fn({x:1})).to.be('  <abc>\n')
    expect(fn({x:0})).to.be('')
  })

  it('should works with unescape syntax', function () {
    var fn = et.compile("{{! _.code}}")
    expect(fn({code: '<code>hello</code>'})).to.be('<code>hello</code>')
  })

  it('should works with if elif else tag', function () {
    var str =`{{if _.x === 0}}
  empty
{{elif _.x === 1}}
  has one
{{else}}
  has many
{{/}}`
    var fn = et.compile(str)
    expect(fn({x:0})).to.be('  empty\n')
    expect(fn({x:1})).to.be('  has one\n')
    expect(fn({x:2})).to.be('  has many\n')
  })

  it('should works with mixed line', function () {
    var fn = et.compile('start{{if _.x}} {{= _.name}} {{/}}e\nend')
    expect(fn({x: true, name: 'foo'})).to.be('start foo e\nend')
  })

  it('should works with inline each statement', function () {
    var fn = et.compile('{{each _.children as child}}{{= child.name}}{{/}}')
    expect(fn({children: [{name: 'foo'}, {name: 'bar'}]})).to.be('foobar')
    expect(fn({children: [{name: 'foo'}]})).to.be('foo')
  })

  it('should works with each statement with index', function () {
    var fn = et.compile('{{each _.children as child,i}}\n{{= i+1}} of {{= _.children.length}} {{= child.name}}\n{{/}}')
    var res = fn({children: [{name: 'foo'}, {name: 'bar'}]})
    expect(res).to.be('1 of 2 foo\n2 of 2 bar\n')
  })

  it('should works with inline if else statement', function () {
    var fn = et.compile('')
  })

  it('should throw when no matched begin tag', function () {
    expect(function () {
      var fn = et.compile('a\n{{/}}')
      fn()
    }).to.throwError()
  })

  it('should throw when tag not recognized', function () {
    expect(function () {
      var fn = et.compile('a\n{{abd}}')
      fn()
    }).to.throwError()
  })
})

describe('compile file', function () {
  it('should compile file', function () {
    var fn = et.compileFile(path.join(__dirname, './templates/body.html'))
    var str = fn({data: 'Hello javascript'})
    expect(str).to.be('<html>\nHello javascript\n</html>\n')
  })

  it('should compile nested include file', function () {
    var fn = et.compileFile(path.join(__dirname, './templates/index.et'))
    var str = fn({data: 'Hello javascript', title: 'hello'})
    expect(str).to.be('<html>\n<head>\n<title>hello</title>\n</head>\nHello javascript\n</html>\n')
  })
})

describe('support filters', function () {
  it('should support single filter', function () {
    var fn = et.compile('{{= _.x | number}}')
    var str = fn({x: '1'}, {
      number: function (val) {
        return Number(val).toFixed(2)
      }
    })
    expect(str).to.be('1.00')
  })

  it('should support filter with arguments', function () {
    var fn = et.compile('{{= _.x | number 3}}')
    var str = fn({x: '3.14145'}, {
      number: function (val, n) {
        return Number(val).toFixed(n)
      }
    })
    expect(str).to.be('3.141')
  })

  it('should suppoert nested filters', function () {
    var fn = et.compile('{{= _.x | number 3 | reverse}}')
    var str = fn({x: '3.14145'}, {
      number: function (val, n) {
        return Number(val).toFixed(n)
      },
      reverse: function (n) {
        var str = String(n)
        return str.split(/\s*/).reverse().join('')
      }
    })
    expect(str).to.be('141.3')
  })
})
