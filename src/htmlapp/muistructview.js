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

function StructureView(parent,app)
 {
  var OFFSET_STEP = 2;
  var SELECT_COLOR = "#00FFFF";

  function refreshView()
   {
    parent.innerHTML = "";

    var plant = app.plant;

    function appendPlantItem(parent)
     {
      var element = document.createElement("div");
      var text    = document.createTextNode(plant.getName());

      element.appendChild(text);

      if (app.getCurrentBranchGroup() == null)
       {
        element.style.backgroundColor = SELECT_COLOR;
       }

      element.onclick = function(evt)
       {
        app.setCurrentBranchGroup(null);
       }

      parent.appendChild(element);
     }

    function appendBranchGroup(parent,branchGroup,offset)
     {
      var element = document.createElement("div");
      var text    = document.createTextNode(branchGroup.name);

      element.style.paddingLeft = offset + "em";

      if (branchGroup == app.getCurrentBranchGroup())
       {
        element.style.backgroundColor = SELECT_COLOR;
       }

      element.appendChild(text);

      parent.appendChild(element);

      for (var i = 0; i < branchGroup.children.length; i++)
       {
        appendBranchGroup(parent,branchGroup.children[i],offset + OFFSET_STEP);
       }

      element.onclick = function(evt)
       {
        app.setCurrentBranchGroup(branchGroup);
       }
     }

    appendPlantItem(parent);

    for (var i = 0; i < plant.children.length; i++)
     {
      appendBranchGroup(parent,plant.children[i],OFFSET_STEP);
     }
   }

  refreshView();

  this.refreshView = refreshView;
 }

