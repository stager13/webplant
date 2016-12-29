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

function ColorRGBEdit(parent,value,changeFunc)
 {
  this.input = null;
  this.label = null;

  function create()
   {
    var input_element = document.createElement("input");

    input_element.type  = "color";
    input_element.value = value.toString();

    input_element.oninput = function(evt)
     {
      var color = new CPL.Core.RGB(1.0,1.0,1.0);

      color.parseHTMLString(evt.target.value);

      changeFunc(color);
     }

    parent.appendChild(input_element);

    this.input_element = input_element;
   }

  function setValue(newValue)
   {
    this.input_element.value = newValue.toString();
   }

  this.create   = create;
  this.setValue = setValue;
 }

