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

function StemTubeParams(parent,app)
 {
  this.axisLengthInput         = null;
  this.axisLengthVInput        = null;
  this.axisLengthScaleInput    = null;
  this.axisResolutionInput     = null;
  this.axisVariationInput      = null;
  this.crossSectionRadiusInput = null;
  this.crossResolutionInput    = null;
  this.profileInput            = null;
  this.phototropismInput       = null;
  this.texGenScaleUInput       = null;
  this.texGenModeVInput        = null;
  this.texGenScaleVInput       = null;

  function create()
   {
    parent.style.display = "none";

    var currentBranchGroup = app.getCurrentBranchGroup();

    this.axisLengthInput =
     uiTools.addRangeParameter(parent,"axisLength","Length",
                               currentBranchGroup.stem.length,0.1,20,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"length",value));
      });

    this.axisLengthVInput =
     uiTools.addRangeParameter(parent,"axisLengthV","Length variation",
                               currentBranchGroup.stem.lengthV,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"lengthV",value));
      });

   this.axisLengthScaleInput =
    uiTools.addFuncParameter(parent,"lengthScale","Length scaling",
                             currentBranchGroup.stem.lengthScale,
     function(spline)
      {
       app.execCommand
        (new uiTools.FuncChangeCommand
              (app.getCurrentBranchGroup().stem,"lengthScale",spline));
      });

   this.axisResolutionInput =
    uiTools.addRangeParameter(parent,"axisResolution","Axis resolution",
                              currentBranchGroup.stem.axisResolution,1,100,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"axisResolution",value));
      });

    this.axisVariationInput =
     uiTools.addRangeParameter(parent,"axisVariation","Axis variation",
                               currentBranchGroup.stem.axisVariation,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"axisVariation",value));
      });

   this.crossSectionRadiusInput =
    uiTools.addRangeParameter(parent,"crossSectionRadius","Radius",
                              currentBranchGroup.stem.radius,0.1,5.0,0.1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"radius",value));
      });

   this.profileInput =
    uiTools.addFuncParameter(parent,"profile","Profile",
                             currentBranchGroup.stem.profile,
     function(spline)
      {
       app.execCommand
        (new uiTools.FuncChangeCommand
              (app.getCurrentBranchGroup().stem,"profile",spline));
      });

   this.crossResolutionInput =
    uiTools.addRangeParameter(parent,"crossResolution","Cross-section resolution",
                              currentBranchGroup.stem.crossResolution,3,16,1,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand
              (app.getCurrentBranchGroup().stem,"crossResolution",value));
      });

     this.phototropismInput =
      uiTools.addFuncParameter(parent,"phototropism","Phototropism",
                               currentBranchGroup.stem.phototropism,
       function(spline)
        {
         app.execCommand
          (new uiTools.FuncChangeCommand
                (app.getCurrentBranchGroup().stem,"phototropism",spline));
        });

    this.texGenScaleUInput =
     uiTools.addRangeParameter(parent,"tubeTexGenScaleU","U-Scale",
                               1.0,0.0,20.0,0.1,
      function(value)
       {
        app.execCommand
         (new uiTools.NumberChangeCommand
               (app.getCurrentBranchGroup().stem,"texScaleU",value));
       });

    this.texGenModeVInput = uiTools.addDropDownListParameter
      (parent,"stemTubeTexGenModeV","V-Mode",
       [
        {
         id   : CPL.Core.TEXGEN_MODE_RELATIVE,
         name : "Relative"
        },
        {
         id   : CPL.Core.TEXGEN_MODE_ABSOLUTE,
         name : "Absolute"
        }
       ],
       CPL.Core.TEXGEN_MODE_RELATIVE,
       function(value)
        {
         app.execCommand
          (new uiTools.NumberChangeCommand
                (app.getCurrentBranchGroup().stem,"texGenModeV",value));
        });

    this.texGenScaleVInput =
     uiTools.addRangeParameter(parent,"tubeTexGenScaleV","V-Scale",
                               1.0,0.0,20.0,0.1,
      function(value)
       {
        app.execCommand
         (new uiTools.NumberChangeCommand
               (app.getCurrentBranchGroup().stem,"texScaleV",value));
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

    this.axisLengthInput.setValue(branchGroup.stem.length);
    this.axisLengthVInput.setValue(branchGroup.stem.lengthV);
    this.axisLengthScaleInput.setData(branchGroup.stem.lengthScale);
    this.axisResolutionInput.setValue(branchGroup.stem.axisResolution);
    this.axisVariationInput.setValue(branchGroup.stem.axisVariation);
    this.crossSectionRadiusInput.setValue(branchGroup.stem.radius);
    this.crossResolutionInput.setValue(branchGroup.stem.crossResolution);
    this.profileInput.setData(branchGroup.stem.profile);
    this.phototropismInput.setData(branchGroup.stem.phototropism);

    this.texGenScaleUInput.setValue(branchGroup.stem.texScaleU);
    this.texGenModeVInput.setValue(branchGroup.stem.texGenModeV);
    this.texGenScaleVInput.setValue(branchGroup.stem.texScaleV);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

