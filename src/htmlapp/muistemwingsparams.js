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

function StemWingsParams(parent,app)
 {
  this.widthInput               = null;
  this.sectionCountInput        = null;
  this.curvatureInput           = null;
  this.thicknessInput           = null;
  this.widthScalingEnabledInput = null;

  function create()
   {
    parent.style.display = "none";

    this.widthInput =
     uiTools.addRangeParameter(parent,"wingsWidth","Width",
                               0.5,0.0,20,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"width",value));
      });

   this.sectionCountInput =
    uiTools.addRangeParameter(parent,"wingsSectionCount","Section count",
                              1,1,100,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"sectionCount",value));
      });

   this.curvatureInput =
    uiTools.addFuncParameter(parent,"wingsCurvature","Curvature",
                             CPL.Core.Spline.makeConstant(0.5,5),
     function(spline)
      {
       app.execCommand
        (new uiTools.FuncChangeCommand
              (app.getCurrentBranchGroup().stem,"curvature",spline));
      });

   this.thicknessInput =
    uiTools.addRangeParameter(parent,"wingsThickness","Thickness",
                              0.0,0.0,1.0,0.01,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"thickness",value));
      });

   this.widthScalingEnabledInput=
    uiTools.addCheckBoxParameter(parent,"wingsWidthScalingEnabled","Apply scaling",
                                 false,
    function(checked)
     {
      app.execCommand
       (new uiTools.BoolChangeCommand
             (app.getCurrentBranchGroup().stem,"widthScalingEnabled",checked));
     });
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

    this.widthInput.setValue(branchGroup.stem.width);
    this.sectionCountInput.setValue(branchGroup.stem.sectionCount);
    this.thicknessInput.setValue(branchGroup.stem.thickness);
    this.curvatureInput.setData(branchGroup.stem.curvature);
    this.widthScalingEnabledInput.setValue(branchGroup.stem.widthScalingEnabled);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

