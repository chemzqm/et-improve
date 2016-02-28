# Et-improve

[![Build Status](https://secure.travis-ci.org/chemzqm/et-improve.png)](http://travis-ci.org/chemzqm/et-improve)

An improved javascript template engine.

The design philosophy is to make syntax simple and complex render easily.

It 's not desinged for compile speed, but for user friendly you should always use reusable function.

## Api

Only compile API exists, a function is retuened and it could called to get
result string with `data object` and optional `escape function`

### .compile(template, [option])

Compile template string with optional option.

* *option.debug* enable debug mode when true

__template should not contain include syntax__

### .compileFile(file, [option])

Compile a file with optional option.

* *option.debug* enable debug mode when true

__file content could contain include syntax__

## Template syntax

You should use `_` to access base object.

* `{{= _.data}}` => `str += escape(_.data)`
* `{{! _.data}}` => `str += _.data`
* `{{each _.items as item, i}}` => `_.items.forEach(function(item, i)`
* `{{if _.age > 20}}` => `if (_.age > 20) {`
* `{{elif _.age < 50}}` => `} else if (_.age < 50){`
* `{{else}}` => `else {`
* `{{/}}` => '}'

__Make sure to use `{{/}}` to close tag__

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
