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

function DropDownList(parent,items,selectedId,changeFunc)
 {
  this.input = null;

  function create()
   {
    var selector = document.createElement("select");

    for (var i = 0; i < items.length; i++)
     {
      var option = document.createElement("option");

      option.appendChild(document.createTextNode(items[i].name));

      if (items[i].id == selectedId)
       {
        option.selected = true;
       }

      selector.appendChild(option);
     }

    selector.onchange = function(evt)
     {
      changeFunc(items[selector.selectedIndex].id);
     }

    parent.appendChild(selector);

    this.input = selector;
   }

  function getIndexById(id)
   {
    for (var i = 0; i < items.length; i++)
     {
      if (items[i].id == id)
       {
        return i;
       }
     }

    return -1;
   }

  function setValue(id)
   {
    var index = getIndexById(id);

    if (index >= 0)
     {
      this.input.selectedIndex = index;
     }
   }

  this.create   = create;
  this.setValue = setValue;
 }

