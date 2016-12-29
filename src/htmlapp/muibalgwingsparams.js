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

function BranchingAlgWingsParams(parent,app)
 {
  this.rotationInput    = null;

  function create()
   {
    parent.style.display = "none";

    var rotationInput =
     uiTools.addRangeParameter(parent,"balgWingsRotation","Rotation angle",
                               0,0,359,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"rotation",value * Math.PI / 180.0));
      });

    this.rotationInput = rotationInput;
   }

  function show()
   {
    parent.style.display = "block";
   }

  function hide()
   {
    parent.style.display = "none";
   }

  function update()
   {
    var branchingAlg = app.getCurrentBranchGroup().branchingAlg;

    this.rotationInput.setValue(branchingAlg.rotation * 180.0 / Math.PI);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

