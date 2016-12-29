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

function VisRangeParams(parent,app)
 {
  this.visRangeEnabledInput = null;
  this.minLODInput          = null;
  this.maxLODInput          = null;

  function create()
   {
    var visRangeEnabledInput =
     uiTools.addCheckBoxParameter(parent,"visRangeEnabled","Vis. range enabled",
                                  false,
     function(checked)
      {
       app.execCommand
        (new uiTools.BoolChangeCommand
              (app.getCurrentBranchGroup().visRange,"enabled",checked));
      });

    var minLODInput =
     uiTools.addRangeParameter(parent,"visRangeMinLOD","Min. LOD",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       var visRange = app.getCurrentBranchGroup().visRange;

       if (visRange.max < value)
        {
         app.execCommand
          (new uiTools.Number2ChangeCommand
                (visRange,"min","max",value,value));

         maxLODInput.setValue(value);
        }
       else
        {
         app.execCommand
          (new uiTools.NumberChangeCommand(visRange,"min",value));
        }
      });

    var maxLODInput =
     uiTools.addRangeParameter(parent,"visRangeMaxLOD","Max. LOD",
                               1.0,0.0,1.0,0.05,
     function(value)
      {
       var visRange = app.getCurrentBranchGroup().visRange;

       if (visRange.min > value)
        {
         app.execCommand
          (new uiTools.Number2ChangeCommand
                (visRange,"max","min",value,value));

         minLODInput.setValue(value);
        }
       else
        {
         app.execCommand
          (new uiTools.NumberChangeCommand(visRange,"max",value));
        }
      });

    this.visRangeEnabledInput = visRangeEnabledInput;
    this.minLODInput          = minLODInput;
    this.maxLODInput          = maxLODInput;
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
    var visRange = app.getCurrentBranchGroup().visRange;

    this.visRangeEnabledInput.setValue(visRange.enabled);
    this.minLODInput.setValue(visRange.min);
    this.maxLODInput.setValue(visRange.max);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

