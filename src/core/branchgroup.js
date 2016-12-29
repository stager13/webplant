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

/*
 * Do not add/remove elements of "children" field directly,
 * use appendChildToBranchGroup method of Plant
 */

CPL.Core.BranchGroup = function(stem,branchingAlg,materialDef)
 {
  this.index        = undefined;
  this.stem         = stem;
  this.branchingAlg = branchingAlg;
  this.materialDef  = materialDef;
  this.visRange     = new CPL.Core.VisRange();
  this.name         = "Branch";
  this.dummy        = false;

  if (stem != null)
   {
    stem.group = this;
   }

  this.children = [];

  this.updateBranchGroupIndices = function(startIndex)
   {
    var currIndex = startIndex;

    this.index = currIndex++;

    for (var i = 0; i < this.children.length; i++)
     {
      currIndex = this.children[i].updateBranchGroupIndices(currIndex);
     }

    return currIndex;
   }

  this.removeBranchGroup = function(branchGroup)
   {
    for (var i = 0; i < this.children.length; i++)
     {
      if (this.children[i] != branchGroup)
       {
        if (this.children[i].removeBranchGroup(branchGroup))
         {
          return true;
         }
       }
      else
       {
        this.children.splice(i,1);

        return true;
       }
     }

    return false;
   }

  this.replaceBranchGroup = function(originalBranchGroup,newBranchGroup)
   {
    for (var i = 0; i < this.children.length; i++)
     {
      if (this.children[i] != originalBranchGroup)
       {
        if (this.children[i].replaceBranchGroup(originalBranchGroup,newBranchGroup))
         {
          return true;
         }
       }
      else
       {
        newBranchGroup.index = originalBranchGroup.index;

        this.children[i] = newBranchGroup;

        return true;
       }
     }

    return false;
   }

  this.getBranchGroupByName = function(name)
   {
    var result = this.name == name ? this : null;

    for (var i = 0; result == null && i < this.children.length; i++)
     {
      result = this.children[i].getBranchGroupByName(name);
     }

    return result;
   }

  this.save = function(writer)
   {
    writer.writeTagged("BranchGroupName","s",this.name);
    writer.writeTagged("IsDummy","b",this.dummy);

    if (this.branchingAlg != null)
     {
      this.branchingAlg.save(writer);
     }
    else
     {
      writer.writeTagged("BranchingAlg","s","__None__");
     }

    if (this.stem != null)
     {
      this.stem.save(writer);
     }
    else
     {
      writer.writeTagged("StemModel","s","__None__");
     }

    if (this.materialDef != null)
     {
      this.materialDef.save(writer);
     }
    else
     {
      writer.writeTagged("Material","s","__None__");
     }

    this.visRange.save(writer);

    writer.writeTagged("BranchModelCount","u",this.children.length);

    for (var i = 0; i < this.children.length; i++)
     {
      this.children[i].save(writer);
     }
   }
 }

CPL.Core.BranchGroup.load = function(loader,parentBranchGroup,versionMinor,versionMajor)
 {
  var args = [];
  var branchGroupName = null;
  var parentStemModel = null;

  if (parentBranchGroup != null)
   {
    parentStemModel = parentBranchGroup.stem;
   }

  if (versionMajor > 0 || versionMinor >= 4)
   {
    loader.readTagged(args,"BranchGroupName","s");

    branchGroupName = args[0];
   }

  if (versionMajor > 0 || versionMinor > 8)
   {
    loader.readTagged(args,"IsDummy","b");

    this.dummy = args[0];
   }

  loader.readTagged(args,"BranchingAlg","s");

  var branchingAlgName = args[0];
  var branchingAlg     = null;

  if      (branchingAlgName == null)
   {
   }
  else if (branchingAlgName == "Std")
   {
    branchingAlg = CPL.Core.BranchingAlgTube.load(loader,versionMinor,versionMajor);
   }
  else if (branchingAlgName == "Wings")
   {
    if (parentStemModel == null || (!(parentStemModel instanceof CPL.Core.StemTube)))
     {
      throw new CPL.Core.Error(loader.formatErrorMessage("'wings' model can be attached to 'tube' only"));
     }

    branchingAlg = CPL.Core.BranchingAlgWings.load(loader,versionMinor,versionMajor);
   }
  else if (branchingAlgName == "Base")
   {
    branchingAlg = CPL.Core.BranchingAlgBase.load(loader,versionMinor,versionMajor);
   }
  else
   {
    throw new CPL.Core.Error(loader.formatErrorMessage("unsupported branching algorithm (" + branchingAlgName + ")"));
   }

  loader.readTagged(args,"StemModel","s");

  var stemModelName = args[0];
  var stemModel     = null;

  if      (stemModelName == null)
   {
   }
  else if (stemModelName == "Tube")
   {
    stemModel = CPL.Core.StemTube.load(loader,versionMinor,versionMajor);
   }
  else if (stemModelName == "Quad")
   {
    stemModel = CPL.Core.StemQuad.load(loader,versionMinor,versionMajor);
   }
  else if (stemModelName == "Wings")
   {
    if (parentStemModel == null || (!(parentStemModel instanceof CPL.Core.StemTube)))
     {
      throw new CPL.Core.Error(loader.formatErrorMessage("'wings' model can be attached to 'tube' only"));
     }

    stemModel = CPL.Core.StemWings.load(loader,versionMinor,versionMajor,parentStemModel);
   }
  else if (stemModelName == "GMesh")
   {
    throw new CPL.Core.Error(loader.formatErrorMessage("'g-mesh' stem model is not supported"));
   }
  else
   {
    throw new CPL.Core.Error(loader.formatErrorMessage("unsupported stem model (" + stemModelName + ")"));
   }

  loader.readTagged(args,"Material","s");

  var materialName = args[0];
  var materialDef  = null;

  if (materialName == null)
   {
    materialDef = new CPL.Core.MaterialDef();
   }
  else
   {
    materialDef = CPL.Core.MaterialDef.load(loader,versionMinor,versionMajor);

    if (stemModel instanceof CPL.Core.StemQuad)
     {
     }
    else
     {
      materialDef.billboardMode = CPL.Core.BILLBOARD_MODE_NONE;
     }
   }

  var visRange = CPL.Core.VisRange.load(loader);

  var branchGroup = new CPL.Core.BranchGroup(stemModel,branchingAlg,materialDef);

  if (branchGroupName)
   {
    branchGroup.name = branchGroupName;
   }

  branchGroup.visRange = visRange;

  loader.readTagged(args,"BranchModelCount","u");

  var count = args[0];

  for (var index = 0; index < count; index++)
   {
    var subBranch = CPL.Core.BranchGroup.load(loader,branchGroup,versionMinor,versionMajor);

    branchGroup.children.push(subBranch);
   }

  return branchGroup;
 }

