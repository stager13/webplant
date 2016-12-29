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

function RangeEdit(parent,value,min,max,step,changeFunc)
 {
  this.range = null;
  this.label = null;

  function create()
   {
    var table    = document.createElement("table");
    var tr       = document.createElement("tr");
    var range_td = document.createElement("td");
    var label_td = document.createElement("td");

    table.appendChild(tr);
    tr.appendChild(range_td);
    tr.appendChild(label_td);

    var range = document.createElement("input");

    range.type  = "range";
    range.min   = min;
    range.max   = max;
    range.step  = step;
    range.value = value;

    label_td.style.minWidth = "2em";
    label_td.innerHTML      = value;

    range.oninput = function(evt)
     {
      var value = Number(evt.target.value);

      label_td.innerHTML = value;

      changeFunc(value);
     }

    range_td.appendChild(range);

    parent.appendChild(tr);

    this.range = range;
    this.label = label_td;
   }

  function setValue(newValue)
   {
    this.range.value     = newValue;
    this.label.innerHTML = newValue;
   }

  this.create   = create;
  this.setValue = setValue;
 }

