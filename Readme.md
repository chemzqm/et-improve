# Et-improve

[![Build Status](https://img.shields.io/travis/chemzqm/et-improve/master.svg?style=flat-square)](http://travis-ci.org/chemzqm/et-improve)

An javascript template engine designed to make complex render easy and precise while user friendly.

There's also a webpack loader [ei-loader](https://www.npmjs.com/package/ei-loader) to help load compiled function directly.

For vim user:

    autocmd BufNewFile,BufRead *.et set filetype=html

could be add to `.vimrc` for html syntax and plugin support of files with `et` suffix.

## Features

* Easy to debug, friendly error is thown on compile when possible.
![](http://7xrnd0.com1.z0.glb.clouddn.com/5mxgwipm6d)
* Works on both client and server side.
* No `eval` and `with`, strict mode friendly.
* Simple javascript code transition, no need to learn much.
* Support filters object (with arguments and/or chained), see [test](https://github.com/chemzqm/et-improve/blob/master/test/test.js)
* Render precisely, every white space charactor is keeped unless line only contains controll script.

## Api

### .compile(template, [option])

Compile template string to function with optional option.

* *option.debug* enable debug mode when true

The compiled function have syntax as `function (data, [filters], [escape])`,

* `deta` is a required javascript plain object
* `filters` is optional object with key as filter name and value as filter function
* `escape` optional escape function which overwrite default escape function for html output.

__template should not contain include syntax__

### .compileFile(file, [option])

Compile a file with optional option.

This API only exist on `node` environment.

* *option.debug* enable debug mode when true

## Template syntax

You could only use `_` to access base object.

* `{{= _.data}}` => `str += escape(_.data)`
* `{{! _.data}}` => `str += _.data`
* `{{each _.items as item, i}}` => `_.items.forEach(function(item, i)`
* `{{if _.age > 20}}` => `if (_.age > 20) {`
* `{{elif _.age < 50}}` => `} else if (_.age < 50){`
* `{{else}}` => `else {`
* `{{/}}` => '}'

__Make sure to use `{{/}}` to close brackets__

## Example template

``` html
{{include ./head.html}}
{{each _.users as user, i}}
  {{if user.valid}}
    <div>{{= user.image}}</div>
    <div>{{= user.age}}</div>
    <div>{{= user.name}}</div>
    {{if user.hobbies && user.hobbies.length}}
      <div class="hobby">
        {{each user.hobbies as hobby}}
          <span>{{= hobby}}</span>
        {{/}}
      </div>
    {{/}}
  {{else}}
    <div>invalid user</div>
  {{/}}
{{/}}
{{include ./foot.html}}
```
## License

Copyright 2016 chemzqm@gmail.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
