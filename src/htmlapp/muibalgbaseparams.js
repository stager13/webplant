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

function BranchingAlgBaseParams(parent,app)
 {
  this.shapeInput       = null;
  this.spreadInput      = null;
  this.densityInput     = null;
  this.densityVInput    = null;
  this.minNumberInput   = null;
  this.maxNumberInput   = null;
  this.declFactorInput  = null;
  this.declFactorVInput = null;
  this.rotationInput    = null;

  function create()
   {
    parent.style.display = "none";

    var shapeInput =
     uiTools.addDropDownListParameter
      (parent,"balgBaseShape","Shape",
       [
        {
         id   : CPL.Core.SHAPE_SQUARE,
         name : "Square"
        },
        {
         id   : CPL.Core.SHAPE_CIRCLE,
         name : "Circle"
        }
       ],
       CPL.Core.SHAPE_SQUARE,
       function(value)
        {
         app.execCommand
          (new uiTools.NumberChangeCommand
                (app.getCurrentBranchGroup().branchingAlg,"shape",value));
        });

    var spreadInput =
     uiTools.addRangeParameter(parent,"balgBaseSpread","Spread",
                               0.0,0.0,10.0,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"spread",value));
      });

    var densityInput =
     uiTools.addRangeParameter(parent,"balgBaseDensity","Density",
                               1.0,0.0,20.0,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"density",value));
      });

    var densityVInput =
     uiTools.addRangeParameter(parent,"balgBaseDensityV","Variation",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"densityV",value));
      });

    var minNumberInput =
     uiTools.addRangeParameter(parent,"balgBaseMinNumber","Min. number",
                               0,0,100,1,
     function(value)
      {
       var branchingAlg = app.getCurrentBranchGroup().branchingAlg;

       if (branchingAlg.maxNumber > 0 &&
           branchingAlg.maxNumber < value)
        {
         app.execCommand
          (new uiTools.Number2ChangeCommand
                (branchingAlg,"minNumber","maxNumber",value,value));

         maxNumberInput.setValue(value);
        }
       else
        {
         app.execCommand
          (new uiTools.NumberChangeCommand(branchingAlg,"minNumber",value));
        }
      });

    var maxNumberInput =
     uiTools.addRangeParameter(parent,"balgBaseMaxNumber","Max. number",
                               0,0,100,1,
     function(value)
      {
       var branchingAlg = app.getCurrentBranchGroup().branchingAlg;

       if (value > 0 && branchingAlg.minNumber > value)
        {
         app.execCommand
          (new uiTools.Number2ChangeCommand
                (branchingAlg,"maxNumber","minNumber",value,value));

         minNumberInput.setValue(value);
        }
       else
        {
         app.execCommand
          (new uiTools.NumberChangeCommand(branchingAlg,"maxNumber",value));
        }
      });

    var declFactorInput =
     uiTools.addRangeParameter(parent,"balgBaseDeclFactor","Declination",
                               0.0,-1.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"declFactor",value));
      });

    var declFactorVInput =
     uiTools.addRangeParameter(parent,"balgBaseDeclFactorV","Variation",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"declFactorV",value));
      });

    var rotationInput =
     uiTools.addRangeParameter(parent,"balgBaseRotation","Rotation angle",
                               0,0,359,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"rotation",value * Math.PI / 180.0));
      });

    this.shapeInput       = shapeInput;
    this.spreadInput      = spreadInput;
    this.densityInput     = densityInput;
    this.densityVInput    = densityVInput;
    this.minNumberInput   = minNumberInput;
    this.maxNumberInput   = maxNumberInput;
    this.declFactorInput  = declFactorInput;
    this.declFactorVInput = declFactorVInput;
    this.rotationInput    = rotationInput;
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

    this.shapeInput.setValue(branchingAlg.shape);
    this.spreadInput.setValue(branchingAlg.spread);
    this.densityInput.setValue(branchingAlg.density);
    this.densityVInput.setValue(branchingAlg.densityV);
    this.minNumberInput.setValue(branchingAlg.minNumber);
    this.maxNumberInput.setValue(branchingAlg.maxNumber);
    this.declFactorInput.setValue(branchingAlg.declFactor);
    this.declFactorVInput.setValue(branchingAlg.declFactorV);
    this.rotationInput.setValue(branchingAlg.rotation * 180.0 / Math.PI);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

