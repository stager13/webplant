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

function BranchingAlgTubeParams(parent,app)
 {
  this.densityInput       = null;
  this.densityVInput      = null;
  this.minNumberInput     = null;
  this.maxNumberInput     = null;
  this.multiplicityInput  = null;
  this.minOffsetInput     = null;
  this.maxOffsetInput     = null;
  this.startRevAngleInput = null;
  this.revAngleInput      = null;
  this.revAngleVInput     = null;
  this.declinationInput   = null;
  this.declinationVInput  = null;

  function create()
   {
    parent.style.display = "none";

    var densityInput =
     uiTools.addRangeParameter(parent,"balgTubeDensity","Density",
                               1.0,0.0,20.0,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"density",value));
      });

    var densityVInput =
     uiTools.addRangeParameter(parent,"balgTubeDensityV","Variation",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"densityV",value));
      });

    var minNumberInput =
     uiTools.addRangeParameter(parent,"balgTubeMinNumber","Min. number",
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
     uiTools.addRangeParameter(parent,"balgTubeMaxNumber","Max. number",
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

    var multiplicityInput =
     uiTools.addRangeParameter(parent,"balgTubeMultiplicity","Multiplicity",
                               1,1,16,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"multiplicity",value));
      });

    var minOffsetInput =
     uiTools.addRangeParameter(parent,"balgTubeMinOffset","Min. offset",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       var branchingAlg = app.getCurrentBranchGroup().branchingAlg;

       if (branchingAlg.maxOffset < value)
        {
         app.execCommand
          (new uiTools.Number2ChangeCommand
                (branchingAlg,"minOffset","maxOffset",value,value));

         maxOffsetInput.setValue(value);
        }
       else
        {
         app.execCommand
          (new uiTools.NumberChangeCommand(branchingAlg,"minOffset",value));
        }
      });

    var maxOffsetInput =
     uiTools.addRangeParameter(parent,"balgTubeMaxOffset","Max. offset",
                               1.0,0.0,1.0,0.05,
     function(value)
      {
       var branchingAlg = app.getCurrentBranchGroup().branchingAlg;

       if (branchingAlg.minOffset > value)
        {
         app.execCommand
          (new uiTools.Number2ChangeCommand
                (branchingAlg,"maxOffset","minOffset",value,value));

         minOffsetInput.setValue(value);
        }
       else
        {
         app.execCommand
          (new uiTools.NumberChangeCommand(branchingAlg,"maxOffset",value));
        }
      });

    var startRevAngleInput =
     uiTools.addRangeParameter(parent,"balgTubeStartRevAngle","Start RevAngle",
                               0,0,359,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"startRevAngle",value * Math.PI / 180.0));
      });

    var revAngleInput =
     uiTools.addRangeParameter(parent,"balgTubeRevAngle","RevAngle",
                               0,0,359,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"revAngle",value * Math.PI / 180.0));
      });

    var revAngleVInput =
     uiTools.addRangeParameter(parent,"balgTubeRevAngleV","Variation",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"revAngleV",value));
      });

    var rotAngleInput =
     uiTools.addRangeParameter(parent,"balgTubeRotAngle","RotAngle",
                               0,0,359,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"rotation",value * Math.PI / 180.0));
      });

   var declinationInput =
    uiTools.addFuncParameter(parent,"balgTubeDeclination","Declination",
                             CPL.Core.Spline.makeConstant(0.5,5),
     function(spline)
      {
       app.execCommand
        (new uiTools.FuncChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"declinationSpline",spline));
      });

    var declinationVInput =
     uiTools.addRangeParameter(parent,"balgTubeDeclinationV","Variation",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().branchingAlg,"declinationV",value));
      });

    this.densityInput       = densityInput;
    this.densityVInput      = densityVInput;
    this.minNumberInput     = minNumberInput;
    this.maxNumberInput     = maxNumberInput;
    this.multiplicityInput  = multiplicityInput;
    this.minOffsetInput     = minOffsetInput;
    this.maxOffsetInput     = maxOffsetInput;
    this.startRevAngleInput = startRevAngleInput;
    this.revAngleInput      = revAngleInput;
    this.revAngleVInput     = revAngleVInput;
    this.rotAngleInput      = rotAngleInput;
    this.declinationInput   = declinationInput;
    this.declinationVInput  = declinationVInput;
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
    var branchGroup = app.getCurrentBranchGroup();

    this.densityInput.setValue(branchGroup.branchingAlg.density);
    this.densityVInput.setValue(branchGroup.branchingAlg.densityV);
    this.minNumberInput.setValue(branchGroup.branchingAlg.minNumber);
    this.maxNumberInput.setValue(branchGroup.branchingAlg.maxNumber);
    this.multiplicityInput.setValue(branchGroup.branchingAlg.multiplicity);
    this.minOffsetInput.setValue(branchGroup.branchingAlg.minOffset);
    this.maxOffsetInput.setValue(branchGroup.branchingAlg.maxOffset);
    this.startRevAngleInput.setValue(branchGroup.branchingAlg.startRevAngle * 180.0 / Math.PI);
    this.revAngleInput.setValue(branchGroup.branchingAlg.revAngle * 180.0 / Math.PI);
    this.revAngleVInput.setValue(branchGroup.branchingAlg.revAngleV);
    this.rotAngleInput.setValue(branchGroup.branchingAlg.rotation * 180.0 / Math.PI);

    this.declinationInput.setData(branchGroup.branchingAlg.declinationSpline);
    this.declinationVInput.setValue(branchGroup.branchingAlg.declinationV);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

