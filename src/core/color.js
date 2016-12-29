/*

Copyright (c) 2016 Sergey Prokhorchuk

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

CPL.Core.RGB = function(r,g,b)
 {
  this.r = r;
  this.g = g;
  this.b = b;
 }

CPL.Core.RGB.prototype.parseHTMLString = function(htmlString)
 {
  if (htmlString.length != 7 || htmlString.charAt(0) != '#')
   {
    return;
   }

  this.r = parseInt(htmlString.slice(1,3),16) / 255.0;
  this.g = parseInt(htmlString.slice(3,5),16) / 255.0;
  this.b = parseInt(htmlString.slice(5,7),16) / 255.0;
 }

CPL.Core.RGB.prototype.copyFrom = function(source)
 {
  this.r = source.r;
  this.g = source.g;
  this.b = source.b;
 }

CPL.Core.RGB.prototype.clone = function()
 {
  var color = new CPL.Core.RGB(0.0,0.0,0.0);

  color.copyFrom(this);

  return color;
 }

CPL.Core.RGB.prototype.toString = function()
 {
  function component2hex(value)
   {
    var v = Math.floor(value * 255 + 0.5);
    var s = v.toString(16);

    if (s.length == 1)
     {
      s = "0" + s;
     }

    return s;
   }

  return "#" + component2hex(this.r) + component2hex(this.g) + component2hex(this.b);
 }

