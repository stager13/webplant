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

function GeneralParams(parent,app)
 {
  this.baseSeedInput           = null;
  this.randomnessDisabledInput = null;
  this.LODLevelInput           = null;
  this.authorInput             = null;
  this.authorUrlInput          = null;
  this.licenseNameInput        = null;
  this.licenseUrlInput         = null;
  this.plantInfoUrlInput       = null;

  function ChangeSeedCommand (newSeed)
   {
    var oldSeed = app.plant.getBaseSeed();

    this.exec = function()
     {
      app.plant.setBaseSeed(newSeed);
     }

    this.undo = function()
     {
      app.plant.setBaseSeed(oldSeed);
     }
   }

  function SetRandomnessStateCommand(isDisabled)
   {
    this.exec = function()
     {
      app.setRandomnessState(isDisabled);
     }

    this.undo = function()
     {
      app.setRandomnessState(!isDisabled);
     }
   }

  function ChangeLODCommand(newLOD)
   {
    var oldLOD = app.getCurrentLOD();

    this.exec = function()
     {
      app.setCurrentLOD(newLOD);
     }

    this.undo = function()
     {
      app.setCurrentLOD(oldLOD);
     }
   }

  function create()
   {
    parent.style.display = "none";

    this.baseSeedInput =
     uiTools.addRangeParameter(parent,"plantSeed","Seed",
                               app.plant.getBaseSeed(),1,1000,1,
     function(value)
      {
       app.execCommand
        (new ChangeSeedCommand(value));
      });

    this.randomnessDisabledInput =
     uiTools.addCheckBoxParameter(parent,"randomnessDisabled","Randomness disabled",
                                  app.isRandomnessDisabled(),
                                  function(checked)
      {
       app.execCommand
        (new SetRandomnessStateCommand(checked));
      });

    this.LODLevelInput =
     uiTools.addRangeParameter(parent,"LODLevel","LOD level",
                               app.getCurrentLOD(),0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new ChangeLODCommand(value));
      });

    this.authorInput = uiTools.addStringParameter(parent,"author","Author",
                                                  app.plant.metaInfo.author,
                                                  function(value)
     {
      app.execCommand(new uiTools.StringChangeCommand
                           (app.plant.metaInfo,"author",value));
     });

    this.authorUrlInput = uiTools.addStringParameter(parent,"author","Author URL",
                                                     app.plant.metaInfo.authorUrl,
                                                     function(value)
     {
      app.execCommand(new uiTools.StringChangeCommand
                           (app.plant.metaInfo,"authorUrl",value));
     });


    this.licenseNameInput = uiTools.addStringParameter(parent,"licenseName","License",
                                                       app.plant.metaInfo.licenseName,
                                                       function(value)
     {
      app.execCommand(new uiTools.StringChangeCommand
                           (app.plant.metaInfo,"licenseName",value));
     });

    this.licenseUrlInput = uiTools.addStringParameter(parent,"licenseUrl","License URL",
                                                      app.plant.metaInfo.licenseUrl,
                                                      function(value)
     {
      app.execCommand(new uiTools.StringChangeCommand
                           (app.plant.metaInfo,"licenseUrl",value));
     });

    this.plantInfoUrlInput = uiTools.addStringParameter
                              (parent,"plantInfo","Plant description URL",
                               app.plant.metaInfo.plantInfoUrl,function(value)
     {
      app.execCommand(new uiTools.StringChangeCommand
                           (app.plant.metaInfo,"plantInfoUrl",value));
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
    var plant = app.plant;

    this.baseSeedInput.setValue(plant.getBaseSeed());
    this.randomnessDisabledInput.setValue(app.isRandomnessDisabled());
    this.LODLevelInput.setValue(app.getCurrentLOD());
    this.authorInput.value = app.plant.metaInfo.author;
    this.authorUrlInput.value = app.plant.metaInfo.authorUrl;
    this.licenseNameInput.value = app.plant.metaInfo.licenseName;
    this.licenseUrlInput.value = app.plant.metaInfo.licenseUrl;
    this.plantInfoUrlInput.value = app.plant.metaInfo.plantInfoUrl;
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

