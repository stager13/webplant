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

function App(canvas)
 {
  var self = this;

  this.canvas     = canvas;
  this.view       = new View(canvas);
  this.structView = null;
  this.plant      = this.createNewPlant();
  this.undoCommands = new CommandArray();
  this.plantsDb   = []

  this.randomnessDisabled = false;

  this.stemModelSelector   = new StemModelSelector(document.getElementById("stem-model-selection-panel"),this);
  this.generalParamsPanel = new GeneralParams(document.getElementById("general-parameters-panel"),this);
  this.uiParamsPanel = new UIParams(document.getElementById("ui-parameters-panel"),this);
  this.stemTubeParamsPanel = new StemTubeParams(document.getElementById("stem-parameters-panel"),this);
  this.stemQuadParamsPanel = new StemQuadParams(document.getElementById("stem-quad-parameters-panel"),this);
  this.stemWingsParamsPanel = new StemWingsParams(document.getElementById("stem-wings-parameters-panel"),this);
  this.balgTubeParamsPanel = new BranchingAlgTubeParams(document.getElementById("balg-tube-parameters-panel"),this);
  this.balgBaseParamsPanel = new BranchingAlgBaseParams(document.getElementById("balg-base-parameters-panel"),this);
  this.balgWingsParamsPanel = new BranchingAlgWingsParams(document.getElementById("balg-wings-parameters-panel"),this);
  this.materialParamsPanel = new MaterialParams(document.getElementById("material-parameters-panel"),this);
  this.visRangeParamsPanel = new VisRangeParams(document.getElementById("visrange-parameters-panel"),this);

  this.addGroupButton    = document.getElementById("new-group-button");
  this.deleteGroupButton = document.getElementById("delete-group-button");
  this.renameButton      = document.getElementById("rename-group-button");

  this.dbPlantSelector   = document.getElementById("select-plant-from-db");

  this.addGroupButton.onclick = function(evt)
   {
    self.addNewBranchGroup();
   }

  this.deleteGroupButton.onclick = function(evt)
   {
    self.deleteCurrentBranchGroup();
   }

  this.renameButton.onclick = function(evt)
   {
    var branchGroup = self.currentBranchGroup;

    if (branchGroup != null)
     {
      self.renameBranchGroup(branchGroup);
     }
    else
     {
      self.renamePlant();
     }
   }

  function generatePlantFileName(extension)
   {
    var name = self.plant.getName();

    return (name.length > 0 ? name : "Plant") + "." + extension;
   }

  this.generatePlantFileName = generatePlantFileName;

  this.undoButton = document.getElementById("undo-button");
  this.redoButton = document.getElementById("redo-button");

  this.undoButton.onclick = function(evt)
   {
    self.undo();
   }

  this.redoButton.onclick = function(evt)
   {
    self.redo();
   }

  this.undoButton.disabled = true;
  this.redoButton.disabled = true;

  var loadButton = document.getElementById("load-button");

  loadButton.onchange = function(evt)
   {
    if (loadButton.files && loadButton.files[0])
     {
      self.load(loadButton.files[0]);
     }
   }

  var saveButton = document.getElementById("save-button");

  saveButton.onclick = function(evt)
   {
    var textLineWriter = new CPL.Core.TextLineWriter();

    self.plant.save(textLineWriter);

    var ngpText = textLineWriter.getText();

    var blob = new Blob([ngpText],{type : 'text/plain'});

    var downloadLink = document.createElement("a");

    downloadLink.download = generatePlantFileName("ngp");
    downloadLink.innerHTML = "Download file";

    if (window.webkitURL != null)
     {
      downloadLink.href = window.webkitURL.createObjectURL(blob);
     }
    else
     {
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.onclick = function(evt)
       {
        document.body.removeChild(evt.target);
       };
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
     }

    downloadLink.click();
   }

  saveButton.disabled = false;

  var saveNGAButton = document.getElementById("save-nga-button");

  saveNGAButton.onclick = function(evt)
   {
    self.saveNGA();
   }

  var saveOBJButton = document.getElementById("save-obj-button");

  saveOBJButton.onclick = function(evt)
   {
    self.saveOBJ();
   }

  saveOBJButton.disabled = false;

  function setPlantsDb(plants)
   {
    function addOption(text)
     {
      var opt = document.createElement("option");

      opt.text = text;

      self.dbPlantSelector.add(opt);
     }

    self.plantsDb = plants;

    while (self.dbPlantSelector.length > 0)
     {
      self.dbPlantSelector.remove(self.dbPlantSelector.length - 1);
     }

    addOption("Examples...");

    for (var i = 0; i < plants.length; i++)
     {
      addOption(plants[i].name);
     }

    if (i > 0)
     {
      self.dbPlantSelector.style.display = "inline";
     }

    self.dbPlantSelector.selectedIndex = 0;
   }

  function sendAJAXSimple (url,handler,isBinary)
   {
    if (!window.XMLHttpRequest) return;

    var request = new XMLHttpRequest();

    var STATE_RESPONSE_READY = 4;
    var HTTP_STATUS_OK       = 200;

    if (isBinary)
     {
      request.responseType = "arraybuffer";
     }

    request.onreadystatechange = function()
     {
      if (this.readyState == STATE_RESPONSE_READY &&
          this.status     == HTTP_STATUS_OK)
       {
        handler(isBinary ? this.response : this.responseText);
       }
     }

    request.open("GET",url);
    request.send();
   }

  this.sendAJAXSimple = sendAJAXSimple;

  function tryLoadPlantsDb()
   {
    sendAJAXSimple("plants-db.json",function(content)
     {
      try
       {
        plants = JSON.parse(content);

        setPlantsDb(plants);
       }
      catch (err)
       {
        // just ignore broken db file
       }
     },false);
   }

  this.dbPlantSelector.onchange = function(e)
   {
    var selectedIndex = self.dbPlantSelector.selectedIndex;

    if (selectedIndex == 0 || selectedIndex > self.plantsDb.length) return;

    self.loadNGAFromUrl(self.plantsDb[selectedIndex - 1].url);
   }

  tryLoadPlantsDb();

  function loadNGAFromZip (zipFileContent)
   {
    var zip = new JSZip();

    zip.loadAsync(zipFileContent)
     .then(function (z)
      {
       // look for .ngp file inside .zip
       var ngpFiles = z.filter(function(relativePath,file)
        {
         return relativePath.toLowerCase().endsWith(".ngp");
        });

       if (ngpFiles.length != 1)
        {
         alert("Load failed: bad .nga file, must contain exactly on .ngp entry");

         return;
        }

       var texFiles = z.filter(function(relativePath,file)
        {
         return relativePath.startsWith("textures/");
        });

       var newTextureCache = new TextureCache();

       for (var texIndex = 0; texIndex < texFiles.length; texIndex++)
        {
         (function(texFile)
          {
           texFile.async("base64").then
            (
             function success(content)
              {
               var image = new Image();

               var imageUrl = "data:image/png;base64," + content;

               image.onload = function()
                {
                 var texture = new Texture(self.getGLContext(),image);
                 var texName = texFile.name.substring("textures/".length);

                 newTextureCache.putTexture(texName,texture,imageUrl,image);

                 self.updatePlant();
                }

               image.src = imageUrl;
              }
            );
           })
          (texFiles[texIndex]);
        }

       ngpFiles[0].async("string").then
        (function success(content)
          {
           var loader = new CPL.Core.TextLineReader(content);

           try
            {
             self.plant = CPL.Core.Plant.load(loader);

             self.view.setTextureCache(newTextureCache);

             self.updatePlant();
             self.setCurrentBranchGroup(self.plant.children[0]);
            }
           catch (err)
            {
             var message = err.getMessage ? err.getMessage() : err;

             alert("Load failed: " + message);
            }
          },
         function error(e)
          {
           console.log(e);

           alert("Load failed: bad .ngp file inside .nga");
          });
      },
     function (e)
      {
       console.log(e);

       alert("Load failed: bad .nga file format");
      });
   }

  this.loadNGAFromZip = loadNGAFromZip;
 }

App.prototype.createTubeTrunkStem = function()
 {
  var stem = new CPL.Core.StemTube();

  stem.length = 15.0;
  stem.radius = 0.2;

  return stem;
 }

App.prototype.createTubeBranchStem = function()
 {
  var stem = new CPL.Core.StemTube();

  stem.length = 0.5;
  stem.radius = 0.5;

  return stem;
 }

App.prototype.createQuadBranchStem = function()
 {
  return new CPL.Core.StemQuad();
 }

App.prototype.createWingsBranchStem = function(parentStem)
 {
  return new CPL.Core.StemWings(parentStem);
 }

App.prototype.addNewBranchGroup = function()
 {
  var currBranchGroup = this.currentBranchGroup;
  var newBranchGroup  = null;
  var app             = this;

  this.execCommand(
   {
    exec : function()
     {
      if (newBranchGroup == null)
       {
        var branchingAlg = currBranchGroup == null ?
                            new CPL.Core.BranchingAlgBase() :
                            new CPL.Core.BranchingAlgTube();

        newBranchGroup = new CPL.Core.BranchGroup(app.createTubeBranchStem(),
                                         branchingAlg,
                                         new CPL.Core.MaterialDef());

        newBranchGroup.name = app.plant.generateUniqueBranchGroupName();
       }

      app.plant.appendBranchGroup(currBranchGroup,newBranchGroup);
      app.setCurrentBranchGroup(newBranchGroup);
     },

    undo : function()
     {
      app.plant.removeBranchGroup(newBranchGroup);
      app.setCurrentBranchGroup(currBranchGroup);
     }
   });
 }

App.prototype.deleteCurrentBranchGroup = function()
 {
  var app               = this;
  var currBranchGroup   = this.currentBranchGroup;
  var parentBranchGroup = this.plant.getBranchGroupParent(currBranchGroup);

  this.execCommand(
   {
    exec : function()
     {
      app.plant.removeBranchGroup(currBranchGroup);
      app.setCurrentBranchGroup(parentBranchGroup);
     },

    undo : function()
     {
      app.plant.appendBranchGroup(parentBranchGroup,currBranchGroup);
      app.setCurrentBranchGroup(currBranchGroup);
     }
   });
 }

App.prototype.renamePlant = function()
 {
  var self    = this;
  var oldName = self.plant.getName();
  var newName = window.prompt("Enter new name",oldName);

  if (newName != null)
   {
    this.execCommand(
     {
      exec : function()
       {
        self.plant.setName(newName);
       },

      undo : function()
       {
        self.plant.setName(oldName);
       }
     });
   }
 }

App.prototype.renameBranchGroup = function(branchGroup)
 {
  var oldName = branchGroup.name;
  var newName = window.prompt("Enter new name",oldName);

  if (newName != null)
   {
    this.execCommand(
     {
      exec : function()
       {
        branchGroup.name = newName;
       },

      undo : function()
       {
        branchGroup.name = oldName;
       }
     });
   }
 }

App.prototype.replaceBranchGroup = function(oldBranchGroup,newBranchGroup)
 {
  this.plant.replaceBranchGroup(oldBranchGroup,newBranchGroup);

  if (oldBranchGroup == this.currentBranchGroup)
   {
    this.currentBranchGroup = newBranchGroup;

    this.setCurrentBranchGroup(this.currentBranchGroup);
   }

  this.updatePlant();
 }

App.prototype.changeBranchGroupStemModel = function(branchGroup,stemModelId)
 {
  var isTrunk = this.plant.isTrunkBranchGroup(branchGroup);

  var newStemModel;
  var newBranchingAlg;

  if (stemModelId == CPL.Core.STEM_MODEL_ID_TUBE)
   {
    if (branchGroup.stem instanceof CPL.Core.StemTube) return branchGroup;

    newStemModel    = isTrunk ? this.createTubeTrunkStem() : this.createTubeBranchStem();
    newBranchingAlg = isTrunk ? new CPL.Core.BranchingAlgBase() : new CPL.Core.BranchingAlgTube();
   }
  else if (stemModelId == CPL.Core.STEM_MODEL_ID_QUAD)
   {
    if (branchGroup.stem instanceof CPL.Core.StemQuad) return branchGroup;

    newStemModel    = this.createQuadBranchStem();
    newBranchingAlg = isTrunk ? new CPL.Core.BranchingAlgBase() : new CPL.Core.BranchingAlgTube();
   }
  else if (stemModelId == CPL.Core.STEM_MODEL_ID_WINGS)
   {
    if (branchGroup.stem instanceof CPL.Core.StemWings) return branchGroup;

    if (this.plant.isTrunkBranchGroup(branchGroup))
     {
      alert("'Wings' branch must have a parent");

      return branchGroup;
     }

    newStemModel = this.createWingsBranchStem
                    (this.plant.getBranchGroupParent
                      (branchGroup).stem);

    newBranchingAlg = new CPL.Core.BranchingAlgWings();
   }

  var newBranchGroup = new CPL.Core.BranchGroup(newStemModel,newBranchingAlg,branchGroup.materialDef);

  newBranchGroup.name = branchGroup.name;

  this.replaceBranchGroup(branchGroup,newBranchGroup);

  return newBranchGroup;
 }

App.prototype.changeCurrentBranchGroupStemModel = function(stemModelId)
 {
  this.changeBranchGroupStemModel(this.currentBranchGroup,stemModelId);
 }

App.prototype.createNewPlant = function()
 {
  var plant = new CPL.Core.Plant();

  var trunk     = new CPL.Core.BranchGroup(this.createTubeTrunkStem(),new CPL.Core.BranchingAlgBase(),new CPL.Core.MaterialDef());
  var branches  = new CPL.Core.BranchGroup(this.createTubeBranchStem(),new CPL.Core.BranchingAlgTube(),new CPL.Core.MaterialDef());
  //var branches2 = new CPL.Core.BranchGroup(this.createTubeBranchStem(),new CPL.Core.BranchingAlgTube(),new CPL.Core.MaterialDef());
  var branches2 = new CPL.Core.BranchGroup(this.createQuadBranchStem(),new CPL.Core.BranchingAlgTube(),new CPL.Core.MaterialDef());

  trunk.name     = "Trunk";
  branches.name  = "Branch1";
  branches2.name = "Branch2";

  plant.appendBranchGroup(null,trunk);
  plant.appendBranchGroup(trunk,branches);
  plant.appendBranchGroup(branches,branches2);

  this.currentBranchGroup = trunk;

  return plant;
 }

App.prototype.run = function()
 {
  this.generalParamsPanel.create();
  this.uiParamsPanel.create();
  this.stemTubeParamsPanel.create();
  this.stemQuadParamsPanel.create();
  this.stemWingsParamsPanel.create();
  this.balgBaseParamsPanel.create();
  this.balgTubeParamsPanel.create();
  this.balgWingsParamsPanel.create();
  this.materialParamsPanel.create();
  this.visRangeParamsPanel.create();

  this.setCurrentBranchGroup(this.plant.children[0]);

  this.view.setPlant(this.plant);

  this.view.render();
 }

App.prototype.getCurrentBranchGroup = function()
 {
  return this.currentBranchGroup;
 }

App.prototype.setCurrentBranchGroup = function(branchGroup)
 {
  this.currentBranchGroup = branchGroup;

  this.structView.refreshView();

  this.stemModelSelector.onBranchGroupChanged(branchGroup);

  if (branchGroup == null)
   {
    this.generalParamsPanel.update();
    this.generalParamsPanel.show();
    this.uiParamsPanel.update();
    this.uiParamsPanel.show();
   }
  else
   {
    this.generalParamsPanel.hide();
    this.uiParamsPanel.hide();
   }

  if (branchGroup != null && branchGroup.stem instanceof CPL.Core.StemTube)
   {
    this.stemTubeParamsPanel.update();
    this.stemTubeParamsPanel.show();
   }
  else
   {
    this.stemTubeParamsPanel.hide();
   }

  if (branchGroup != null && branchGroup.stem instanceof CPL.Core.StemQuad)
   {
    this.stemQuadParamsPanel.update();
    this.stemQuadParamsPanel.show();
   }
  else
   {
    this.stemQuadParamsPanel.hide();
   }

  if (branchGroup != null && branchGroup.stem instanceof CPL.Core.StemWings)
   {
    this.stemWingsParamsPanel.update();
    this.stemWingsParamsPanel.show();
   }
  else
   {
    this.stemWingsParamsPanel.hide();
   }

  if (branchGroup != null && branchGroup.branchingAlg instanceof CPL.Core.BranchingAlgBase)
   {
    this.balgBaseParamsPanel.update();
    this.balgBaseParamsPanel.show();
   }
  else
   {
    this.balgBaseParamsPanel.hide();
   }

  if (branchGroup != null && branchGroup.branchingAlg instanceof CPL.Core.BranchingAlgTube)
   {
    this.balgTubeParamsPanel.update();
    this.balgTubeParamsPanel.show();
   }
  else
   {
    this.balgTubeParamsPanel.hide();
   }

  if (branchGroup != null && branchGroup.branchingAlg instanceof CPL.Core.BranchingAlgWings)
   {
    this.balgWingsParamsPanel.update();
    this.balgWingsParamsPanel.show();
   }
  else
   {
    this.balgWingsParamsPanel.hide();
   }

  if (branchGroup != null)
   {
    this.materialParamsPanel.update();
    this.materialParamsPanel.show();
   }
  else
   {
    this.materialParamsPanel.hide();
   }

  if (branchGroup != null)
   {
    this.visRangeParamsPanel.update();
    this.visRangeParamsPanel.show();
   }
  else
   {
    this.visRangeParamsPanel.hide();
   }

  if (branchGroup != null)
   {
    this.deleteGroupButton.disabled = false;
   }
  else
   {
    this.deleteGroupButton.disabled = true;
   }
 }

App.prototype.setStructureView = function(structView)
 {
  this.structView = structView;

  structView.refreshView();
 }

App.prototype.execCommand = function(cmd)
 {
  this.undoCommands.pushAndExec(cmd);
  this.updatePlant();

  //FIXME: need more correct way to update parameter panels
  this.setCurrentBranchGroup(this.currentBranchGroup);

  this.undoButton.disabled = !this.undoCommands.canUndo();
  this.redoButton.disabled = !this.undoCommands.canRedo();
 }

App.prototype.undo = function()
 {
  this.undoCommands.undo();
  this.updatePlant();

  //FIXME: need more correct way to update parameter panels
  this.setCurrentBranchGroup(this.currentBranchGroup);

  this.undoButton.disabled = !this.undoCommands.canUndo();
  this.redoButton.disabled = !this.undoCommands.canRedo();
 }

App.prototype.redo = function()
 {
  this.undoCommands.redo();
  this.updatePlant();

  //FIXME: need more correct way to update parameter panels
  this.setCurrentBranchGroup(this.currentBranchGroup);

  this.undoButton.disabled = !this.undoCommands.canUndo();
  this.redoButton.disabled = !this.undoCommands.canRedo();
 }

App.prototype.updatePlant = function()
 {
  var generatorOptions =
   {
    disable_randomness : this.isRandomnessDisabled()
   };

  this.view.setPlant(this.plant,generatorOptions);
  this.view.render();
 }

App.prototype.setRandomnessState = function(isDisabled)
 {
  // we do not update plant here since setRandomnessState is called from
  // inside execCommand which updates model itself
  this.randomnessDisabled = isDisabled;
 }

App.prototype.isRandomnessDisabled = function()
 {
  return this.randomnessDisabled;
 }

App.prototype.getCurrentLOD = function()
 {
  return this.view.getCurrentLOD();
 }

App.prototype.setCurrentLOD = function(newLOD)
 {
  this.view.setCurrentLOD(newLOD);
 }

App.prototype.loadNGP = function(inputFile)
 {
  var self = this;

  var reader = new FileReader();

  reader.onload = function(evt)
   {
    var loader = new CPL.Core.TextLineReader(evt.target.result);

    try
     {
      self.plant = CPL.Core.Plant.load(loader);

      self.updatePlant();
      self.setCurrentBranchGroup(self.plant.children[0]);
     }
    catch (err)
     {
      var message = err.getMessage ? err.getMessage() : err;

      alert("Load failed: " + message);
     }
   }

  reader.readAsText(inputFile);
 }

App.prototype.loadNGAFromUrl = function(url)
 {
  var self = this;

  this.sendAJAXSimple(url,function(content)
   {
    self.loadNGAFromZip(content);
   },true);
 }

App.prototype.loadNGA = function(inputFile)
 {
  var self   = this;
  var reader = new FileReader();

  reader.onload = function(evt)
   {
    self.loadNGAFromZip(evt.target.result);
   }

  reader.readAsBinaryString(inputFile);
 }

App.prototype.load = function(inputFile)
 {
  if (inputFile.name.toLowerCase().endsWith(".nga"))
   {
    this.loadNGA(inputFile);
   }
  else
   {
    this.loadNGP(inputFile);
   }
 }

App.prototype.saveNGA = function()
 {
  var textLineWriter = new CPL.Core.TextLineWriter();

  this.plant.save(textLineWriter);

  var ngpText = textLineWriter.getText();

  var zip = new JSZip();

  zip.file(this.generatePlantFileName("ngp"),ngpText);

  var texNames = {}

  this.plant.forEachBranchGroup(function(branchGroup)
   {
    var materialDef = branchGroup.materialDef;

    if (materialDef.diffuseTex)
     {
      texNames[materialDef.diffuseTex] = true;
     }

    if (materialDef.normalTex)
     {
      texNames[materialDef.normalTex] = true;
     }

    if (materialDef.aux1Tex)
     {
      texNames[materialDef.aux1Tex] = true;
     }

    if (materialDef.aux2Tex)
     {
      texNames[materialDef.aux2Tex] = true;
     }
   });

  var texCache  = this.getTextureCache();
  var texFolder;

  for (var texName in texNames)
   {
    var texData = texCache.getTextureDataByName(texName);

    if (texData && texData.startsWith("data:"))
     {
      var commaPos = texData.indexOf(",");

      if (commaPos > 0)
       {
        imageData = texData.substring(commaPos + 1);

        if (texFolder === undefined)
         {
          texFolder = zip.folder("textures");
         }

        texFolder.file(texName,imageData,{base64:true});
       }
     }
   }

  var ngaName = this.generatePlantFileName("nga");

  zip.generateAsync({type : "blob"}).then(function(content)
   {
    uiTools.saveFile(ngaName,content);
   });
 }

App.prototype.saveOBJ = function()
 {
  var zipName = this.generatePlantFileName("zip");

  var zip = CPL.Plugins.ExportOBJ.exportToZip(this.plant,this.getTextureCache());

  zip.generateAsync({type : "blob"}).then(function(content)
   {
    uiTools.saveFile(zipName,content);
   });
 }

App.prototype.getView = function()
 {
  return this.view;
 }

App.prototype.getGLContext = function()
 {
  return this.view.getGLContext();
 }

App.prototype.getTextureCache = function()
 {
  return this.view.getTextureCache();
 }

