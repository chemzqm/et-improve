/*eslint "quotes": 0*/
var dev = process.env.NODE_ENV === 'development'
var fs = require('fs')
var path = require('path')

/**
 * Compile function from file path and option
 *
 * @public
 * @param {String} file
 * @param {Object} opt
 * @returns {undefined}
 */
exports.compileFile = function (file, opt) {
  opt = opt || {}
  var template = parseInclude(file, opt)
  return compile(template, opt)
}

var parseInclude = function (file, opt) {
  var content = fs.readFileSync(file, {encoding: opt.encoding || 'utf8'})
  if (!/\{\{include/.test(content)) return content
  return content.replace(/\{\{include\s+([^}]+)\}\}\n?/g, function (match, relative_path) {
    var target_file = path.resolve(path.dirname(file), relative_path)
    return parseInclude(target_file, opt)
  })
}

/**
 * Compilet template to function with option
 *
 * @public
 * @param {String} template
 * @param {Object} opt
 * @returns {Function}
 */
var compile = exports.compile = function (template, opt) {
  opt = opt || {};
  var debug = opt.hasOwnProperty('debug') ? opt.debug : dev
  var str

  if (debug) {
    // Adds the fancy stack trace meta info
    var input = template.replace(/['\n]/g, function (_) {
      if (_ === "'") return "\\'"
      return '\\n'
    })
    str = [
      'var __stack = { linenr: 1, input: \'' + input + '\'};',
        rethrow.toString(),
      'try {',
        parse(template, opt),
      '} catch (err) {',
      '  rethrow(err, __stack.input, __stack.linenr);',
      '}'
    ].join("\n");
  } else {
    str = parse(template, opt);
  }

  str = 'escape = escape || ' + escape.toString() + ';\n' + str;
  var fn;
  try {
    fn = new Function('_, filters, escape', str);
  } catch (err) {
    if ('SyntaxError' == err.name) {
      err.message += ' while compiling ejs';
    }
    throw err;
  }

  return fn;
}

var control = /^\s*\{\{[\w|\/][^}]*\}\}\s*$/

function parse(str, opt) {
  opt = opt || {};
  var debug = opt.hasOwnProperty('debug') ? opt.debug : dev
    , buf = '';

  buf += 'var _str="";\n';

  var linenr = 1;
  var closes = [];
  var line = ''
  var js
  var res

  for (var i = 0; i <= str.length; i++) {
    var ch = str[i]
    if (ch === '\r') {
      continue;
    } else if (ch === '\\') {
      line += '\\\\'
    } else if(ch === '\n' || typeof ch === 'undefined') {
      if (debug) buf += "__stack.linenr=" + linenr + ';'
      if (control.test(line)) {
        js = line.match(/\{\{(.*)\}\}/)[1]
        res = parseKeyword(js, closes)
        if (res instanceof Error) rethrow(res, str, linenr)
        buf += res + "\n"
      } else {
        // no interpolation
        if (!/\{\{/.test(line)) {
          buf += "_str += '" + gsub(line, "'", "\\'") + (ch === '\n' ? '\\n' : '') + "';\n"
        } else {
          var text = ''
          var expr
          for (var j = 0; j < line.length; j++) {
            if (line[j] === '{' && line[j + 1] === '{') {
              if (text.length) buf += "_str += '" + gsub(text, "'", "\\'") + "';\n"
              text = ''
              var end = line.indexOf('}}', j);
              js = line.substring(j + 2, end);
              // parse = !
              switch (js[0]) {
                case '=':
                  expr = js.replace(/^=\s*/, '')
                  expr = parseFilters(expr)
                  res = '_str+=escape(' + expr + ');'
                  break
                case '!':
                  expr = js.replace(/^!\s*/, '')
                  expr = parseFilters(expr)
                  res = '_str+=' + expr + ';'
                  break
                default:
                  res = parseKeyword(js, closes)
              }
              if (res instanceof Error) rethrow(res, str, linenr)
              buf += res + "\n"
              j = end + 1
            } else {
              text += line[j]
            }
          }
          if (text.length) buf += "_str += '" + gsub(text, "'", "\\'") + "';\n"
          if (ch === '\n') buf += "_str +='\\n'\n"
        }
      }
      line = ''
      linenr += 1
    } else {
      line += str[i]
    }
  }
  if (closes.length) rethrow(new Error('tag not closed'), str, linenr)
  buf += 'return _str\n'
  return buf
}

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html){
  html = html == null ? '': html;
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
}

/**
 * Re-throw the given `err` in context to the
 * `str` of et, and `linenr`.
 *
 * @param {Error} err
 * @param {String} str
 * @param {String} filename
 * @param {String} linenr
 * @api private
 */

function rethrow(err, input, linenr){
  // str from context
  var lines = input.split('\n')
    , start = Math.max(linenr - 3, 0)
    , end = Math.min(lines.length, linenr + 3);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == linenr ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.message = 'et compile error:'
    + linenr + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
}

function gsub(str, pat, sub) {
  return str.replace(new RegExp(pat, 'g'), sub)
}

function parseKeyword(js, closes) {
  if (js === '\/') {
    if (closes.length === 0) {
      return new Error("no matched begin tag")
    } else {
      return closes.pop()
    }
  }
  if (!/^each|if|elif|else(\s|$)/.test(js)) {
    return new Error("expression {{" + js +"}} not recognized")
  }
  var postfix, prefix;
  var expression = js.replace(/^\w+\s*/, '');
  if (js.indexOf('each') === 0) {
    var o = parseForExpression(expression)
    if (!o.attr) return new Error("attribute not found for " + expression)
    o.as = o.as || '__val'
    var args = o.as + (o.index ? ',' + o.index : '')
    prefix  = o.attr + '.forEach(function(' + args + '){';
    closes.push('})')
  } else if (js.indexOf('if') === 0) {
    prefix  = 'if (' + expression + '){';
    closes.push('}')
  } else if (js.indexOf('elif') === 0) {
    prefix  = '} else if (' + expression + '){';
  } else if (js.indexOf('else') === 0) {
    prefix  = '} else {';
  }
  return prefix
}

// posts as post, i
function parseForExpression(str) {
  var parts = str.split(/,\s*/)
  var index = parts[1]
  parts = parts[0].split(/\s+as\s+/)
  return {
    index: index,
    attr: parts[0],
    as: parts[1]
  }
}

function parseFilters(js) {
  if (!/\s\|\s/.test(js)) return js
  var arr = js.split(/\s*\|\s*/)
  var res = arr[0]

  for (var i = 1; i < arr.length; i++) {
    var f = arr[i].trim()
    if (f) {
      var parts = f.match(/^([\w$_]+)(.*)$/)
      var args
      if (parts[2]) {
        args = parseArgs(parts[2].trim())
        res = 'filters.' + parts[1] + '(' + res + ', ' + args.join(', ') + ')'
      } else {
        res = 'filters.' + f + '(' + res + ')'
      }
    }
  }
  return res
}


/**
 * Parse arguments from string eg:
 * 'a' false 3 => ['a', false, 3]
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */
function parseArgs(str) {
  var strings = []
  var s = str.replace(/(['"]).+?\1/g, function (str) {
    strings.push(str)
    return '$'
  })
  var arr = s.split(/\s+/)
  for (var i = 0, l = arr.length; i < l; i++) {
    var v= arr[i]
    if (v === '$') {
      arr[i] = strings.shift()
    }
  }
  return arr
}
