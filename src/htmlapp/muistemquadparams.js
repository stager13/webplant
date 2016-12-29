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

function StemQuadParams(parent,app)
 {
  this.lengthInput        = null;
  this.widthInput         = null;
  this.originOffsetXInput = null;
  this.originOffsetYInput = null;
  this.scalingInput       = null;
  this.sectionCountInput  = null;
  this.curvatureInput     = null;
  this.thicknessInput     = null;

  function create()
   {
    parent.style.display = "none";

    this.lengthInput =
     uiTools.addRangeParameter(parent,"quadLength","Length",
                               0.1,0.1,20,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"length",value));
      });

    this.widthInput =
     uiTools.addRangeParameter(parent,"quadWidth","Width",
                               0.1,0.1,20,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"width",value));
      });

    this.originOffsetXInput =
     uiTools.addRangeParameter(parent,"quadOriginOffsetX","Origin offset X",
                               0.0,-0.5,0.5,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"originOffsetX",value));
      });

    this.originOffsetYInput =
     uiTools.addRangeParameter(parent,"quadOriginOffsetY","Origin offset Y",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"originOffsetY",value));
      });

   this.scalingInput =
    uiTools.addFuncParameter(parent,"quadScaling","Scaling",
                            CPL.Core.Spline.makeConstant(1.0,5),
     function(spline)
      {
       app.execCommand
        (new uiTools.FuncChangeCommand
              (app.getCurrentBranchGroup().stem,"scaling",spline));
      });

   this.sectionCountInput =
    uiTools.addRangeParameter(parent,"quadSectionCount","Section count",
                              1,1,100,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"sectionCount",value));
      });

   this.curvatureInput =
    uiTools.addFuncParameter(parent,"quadCurvature","Curvature",
                             CPL.Core.Spline.makeConstant(0.5,5),
     function(spline)
      {
       app.execCommand
        (new uiTools.FuncChangeCommand
              (app.getCurrentBranchGroup().stem,"curvature",spline));
      });

   this.thicknessInput =
    uiTools.addRangeParameter(parent,"quadThickness","Thickness",
                              0.0,0.0,1.0,0.01,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"thickness",value));
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

    this.lengthInput.setValue(branchGroup.stem.length);
    this.widthInput.setValue(branchGroup.stem.width);
    this.originOffsetXInput.setValue(branchGroup.stem.originOffsetX);
    this.originOffsetYInput.setValue(branchGroup.stem.originOffsetY);
    this.scalingInput.setData(branchGroup.stem.scaling);
    this.sectionCountInput.setValue(branchGroup.stem.sectionCount);
    this.curvatureInput.setData(branchGroup.stem.curvature);
    this.thicknessInput.setValue(branchGroup.stem.thickness);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

