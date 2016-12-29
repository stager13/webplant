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

function StemModelSelector(parent,app)
 {
  var tr       = document.createElement("tr");
  var label_td = document.createElement("td");
  var label    = document.createTextNode("Branch model");

  label_td.appendChild(label);

  tr.appendChild(label_td);

  var selector_td  = document.createElement("td");
  var selector     = document.createElement("select");
  var tube_option  = document.createElement("option");
  var quad_option  = document.createElement("option");
  var wings_option = document.createElement("option");

  tube_option.appendChild(document.createTextNode("Tube"));
  quad_option.appendChild(document.createTextNode("Quad"));
  wings_option.appendChild(document.createTextNode("Wings"));

  selector.appendChild(tube_option);
  selector.appendChild(quad_option);
  selector.appendChild(wings_option);

  selector.onchange = function()
   {
    var stemModelId    = selector.selectedIndex;
    var oldBranchGroup = app.getCurrentBranchGroup();
    var newBranchGroup = null;

    app.execCommand
     (
      {
       exec : function ()
        {
         if (newBranchGroup == null)
          {
           newBranchGroup = app.changeBranchGroupStemModel(oldBranchGroup,stemModelId);
          }
         else
          {
           app.replaceBranchGroup(oldBranchGroup,newBranchGroup);
          }
        },
       undo : function ()
        {
         app.replaceBranchGroup(newBranchGroup,oldBranchGroup);
        }
      }
     );
   }

  selector_td.appendChild(selector);

  tr.appendChild(selector_td);

  parent.appendChild(tr);

  this.onBranchGroupChanged = function(branchGroup)
   {
    selector.disabled = branchGroup == null || branchGroup.children.length > 0;

    tube_option.selected  = false;
    quad_option.selected  = false;
    wings_option.selected = false;

    if (branchGroup != null)
     {
      if (branchGroup.stem instanceof CPL.Core.StemTube)
       {
        tube_option.selected = true;
       }
      else if (branchGroup.stem instanceof CPL.Core.StemQuad)
       {
        quad_option.selected = true;
       }
      else if (branchGroup.stem instanceof CPL.Core.StemWings)
       {
        wings_option.selected = true;
       }
     }
   }
 }

