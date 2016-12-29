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

CPL.Core.Plant = function()
 {
  this.VERSION_MAJOR = 0;
  this.VERSION_MINOR = 14;

  var children  = [];
  var baseSeed  = 0;
  var name      = "Plant";

  var metaInfo =
   {
    author       : null,
    authorUrl    : null,
    licenseName  : null,
    licenseUrl   : null,
    plantInfoUrl : null,
   };

  this.metaInfo = metaInfo;

  this.children = children;

  var totalBranchGroupCount = 0;

  var self = this;

  function setEmpty ()
   {
    children.splice(0,children.length);

    baseSeed              = 0;
    totalBranchGroupCount = 0;

    metaInfo.author       = null;
    metaInfo.authorUrl    = null;
    metaInfo.licenseName  = null;
    metaInfo.licenseUrl   = null;
    metaInfo.plantInfoUrl = null;
   }

  function updateBranchGroupIndices()
   {
    var currIndex = 0;

    for (var i = 0; i < self.children.length; i++)
     {
      currIndex = self.children[i].updateBranchGroupIndices(currIndex);
     }

    totalBranchGroupCount = currIndex;
   }

  function getBranchGroupByName(name)
   {
    var result = null;

    for (var i = 0; result == null && i < self.children.length; i++)
     {
      result = self.children[i].getBranchGroupByName(name);
     }

    return result;
   }

  this.getBranchGroupByIndex = function(index)
   {
    var result = null;

    function search(p)
     {
      for (var i = 0; result == null && i < p.children.length; i++)
       {
        if (p.children[i].index == index)
         {
          result = p.children[i];
         }
        else
         {
          search(p.children[i]);
         }
       }
     }

    search(self);

    return result;
   }

  this.generateUniqueBranchGroupName = function ()
   {
    var i = 0;
    var name;
    var branchGroup;

    do
     {
      i++;

      name = "Branch" + i;
     }
    while (getBranchGroupByName(name) != null);

    return name;
   }

  this.setBaseSeed = function(seed)
   {
    baseSeed = seed;
   }

  this.getBaseSeed = function()
   {
    return baseSeed;
   }

  this.setName = function(newName)
   {
    name = newName;
   }

  this.getName = function()
   {
    return name;
   }

  this.appendBranchGroup = function(parentBranchGroup,childBranchGroup)
   {
    if (parentBranchGroup == null)
     {
      this.children.push(childBranchGroup);
     }
    else
     {
      parentBranchGroup.children.push(childBranchGroup);
     }

    updateBranchGroupIndices();
   }

  this.removeBranchGroup = function(branchGroup)
   {
    for (var i = 0; i < this.children.length; i++)
     {
      if (this.children[i] != branchGroup)
       {
        if (this.children[i].removeBranchGroup(branchGroup))
         {
          updateBranchGroupIndices();

          return true;
         }
       }
      else
       {
        this.children.splice(i,1);

        updateBranchGroupIndices();

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

  this.isTrunkBranchGroup = function(branchGroup)
   {
    for (var i = 0; i < this.children.length; i++)
     {
      if (branchGroup == this.children[i])
       {
        return true;
       }
     }

    return false;
   }

  this.getBranchGroupParent = function(branchGroup)
   {
    function getParent(currBranchGroup)
     {
      for (var i = 0; i < currBranchGroup.children.length; i++)
       {
        if (currBranchGroup.children[i] == branchGroup)
         {
          return currBranchGroup;
         }
        else
         {
          var parent = getParent(currBranchGroup.children[i]);

          if (parent)
           {
            return parent;
           }
         }
       }

      return null;
     }

    var parent;

    for (var i = 0; i < this.children.length; i++)
     {
      parent = getParent(this.children[i]);

      if (parent)
       {
        return parent;
       }
     }

    return null;
   }

  this.getTotalBranchGroupCount = function()
   {
    return totalBranchGroupCount;
   }

  function walkBranchGroup(rng,parent,group,fn)
   {
    var branchingAlg = group.branchingAlg;
    var stem         = group.stem;

    branchingAlg.forEachBranch(rng,parent,stem,function(branch)
     {
      fn(branch);

      walkBranch(rng,branch,fn);
     });
   }

  function walkBranch(rng,branch,fn)
   {
    var stem  = branch.stem;
    var group = stem.group;

    for (var i = 0; i < group.children.length; i++)
     {
      walkBranchGroup(rng,branch,group.children[i],fn);
     }
   }

  function walkBaseGroup(rng,group,fn)
   {
    walkBranchGroup(rng,null,group,fn);
   }

  function walk(rng,fn)
   {
    for (var i = 0; i < children.length; i++)
     {
      walkBaseGroup(rng,children[i],fn);
     }
   }

/*
  function generateDummyMeshesData()
   {
    var positions = new Float32Array([0.0,1.0,0.0,-0.5,0.0,0.0,0.5,0.0,0.0]);
    var normals   = new Float32Array([0.0,0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0]);
    var colors    = new Float32Array([0.0,1.0,0.0,0.0,1.0,0.0,0.0,1.0,0.0]);
    var indices   = new Uint16Array([0,1,2]);

    return [
            {
             positions : positions,
             normals   : normals,
             colors    : colors,
             indices   : indices
            }
           ];
   }
*/

  function calcBranchIndexCount(branch)
   {
    var count = 0;
    var n = branch.getPrimitiveCount();

    for (var i = 0; i < n; i++)
     {
      if (branch.getPrimitiveType(i) == CPL.Core.QUAD)
       {
        count += 4;
       }
      else
       {
        count += 3;
       }
     }

    return count;
   }

  function calculateMeshSizes(options)
   {
    var sizes = new Array();

    for (var i = 0; i < totalBranchGroupCount; i++)
     {
      sizes.push(
       {
        positionAttrCount : 0,
        normalAttrCount : 0,
        texCoordAttrCount : 0,
        indexCount : 0,
        primitiveCount : 0
       });
     }

    var disable_randomness = options && options.disable_randomness;

    var rng = disable_randomness ? null : new CPL.Core.RNGSimple(baseSeed);

    walk(rng,function(branch)
     {
      var branchGroupIndex = branch.stem.group.index;

      sizes[branchGroupIndex].positionAttrCount += branch.getVAttrCount(CPL.Core.ATTR_VERTEX);
      sizes[branchGroupIndex].normalAttrCount   += branch.getVAttrCount(CPL.Core.ATTR_NORMAL);
      sizes[branchGroupIndex].texCoordAttrCount += branch.getVAttrCount(CPL.Core.ATTR_TEXCOORD0);
      sizes[branchGroupIndex].indexCount        += calcBranchIndexCount(branch);
      sizes[branchGroupIndex].primitiveCount    += branch.getPrimitiveCount();
     });

    return sizes;
   }

  function calculateMeshSizesI(options)
   {
    var sizes = new Array();

    for (var i = 0; i < totalBranchGroupCount; i++)
     {
      sizes.push({ attrCount : 0, indexCount : 0 });
     }

    var disable_randomness = options && options.disable_randomness;

    var rng = disable_randomness ? null : new CPL.Core.RNGSimple(baseSeed);

    walk(rng,function(branch)
     {
      var branchGroupIndex = branch.stem.group.index;
      var attrCount        = branch.getVAttrCountI();
      var indexCount       = branch.getIndexCountI();

      sizes[branchGroupIndex].attrCount  += attrCount;
      sizes[branchGroupIndex].indexCount += indexCount;
     });

    return sizes;
   }

  function fillMeshesDataI(meshesData,options)
   {
    var attrPositions  = new Array(totalBranchGroupCount);
    var indexPositions = new Array(totalBranchGroupCount);

    for (var i = 0; i < totalBranchGroupCount; i++)
     {
      attrPositions[i]  = 0;
      indexPositions[i] = 0;
     }

    var disable_randomness = options && options.disable_randomness;

    var rng = disable_randomness ? null : new CPL.Core.RNGSimple(baseSeed);

    walk(rng,function(branch)
     {
      var branchGroupIndex = branch.stem.group.index;
      var attrCount        = branch.getVAttrCountI();
      var indexCount       = branch.getIndexCountI();

      branch.fillVAttrBuffersI(meshesData[branchGroupIndex].positions,
                               meshesData[branchGroupIndex].normals,
                               meshesData[branchGroupIndex].colors,
                               meshesData[branchGroupIndex].texCoords,
                               attrPositions[branchGroupIndex]);

      branch.fillIndexBufferI(meshesData[branchGroupIndex].indices,
                              attrPositions[branchGroupIndex],
                              indexPositions[branchGroupIndex]);

      attrPositions[branchGroupIndex]  += attrCount;
      indexPositions[branchGroupIndex] += indexCount;
     });
   }

  function fillMaterialsAndVisRanges(meshesData)
   {
    function fillBranchMaterialRecursive (parent)
     {
      var children = parent.children;

      for (var i = 0; i < children.length; i++)
       {
        var child = children[i];

        meshesData[child.index].materialDef = child.materialDef;
        meshesData[child.index].visRange    = child.visRange;

        fillBranchMaterialRecursive(child);
       }
     }

    fillBranchMaterialRecursive(self);
   }

  this.forEachBranchGroup = function(fn)
   {
    function walkChildren(branchGroup)
     {
      fn(branchGroup);

      for (var i = 0; i < branchGroup.children.length; i++)
       {
        walkChildren(branchGroup.children[i]);
       }
     }

    for (var i = 0; i < children.length; i++)
     {
      walkChildren(children[i]);
     }
   }

  // default_options =
  //  {
  //   disable_randomness : false
  //  }

  function MeshGeneratorI (options)
   {
    var meshSizes  = calculateMeshSizesI(options);
    var meshesData = [];
    var generatedAttrCountArray  = [];
    var generatedIndexCountArray = [];

    for (var i = 0; i < meshSizes.length; i++)
     {
      var attrCount  = meshSizes[i].attrCount;
      var indexCount = meshSizes[i].indexCount;

      meshesData.push({
                       positions   : new Float32Array(attrCount * 3),
                       normals     : new Float32Array(attrCount * 3),
                       colors      : new Float32Array(attrCount * 3),
                       texCoords   : new Float32Array(attrCount * 2),
                       indices     : new Uint16Array(indexCount),
                       materialDef : null,
                       visRange    : null
                      });

      generatedAttrCountArray.push(0);
      generatedIndexCountArray.push(0);
     }

    fillMaterialsAndVisRanges(meshesData);

    var stateStack = []

    var disable_randomness = options && options.disable_randomness;

    var rng = disable_randomness ? null : new CPL.Core.RNGSimple(baseSeed);

    for (var i = 0; i < children.length; i++)
     {
      var child = children[children.length - i - 1];
      var workItem =
       {
        generator : child.branchingAlg.getBranchGenerator(rng,null,child.stem)
       };

      stateStack.push(workItem);
     }

    this.step = function (branchCount)
     {
      var workItem;
      var branch;

      while (branchCount > 0 && stateStack.length > 0)
       {
        workItem = stateStack[stateStack.length - 1];

        branch = workItem.generator();

        if (branch)
         {
          var branchGroup      = branch.stem.group;
          var branchGroupIndex = branchGroup.index;
          var attrCount        = branch.getVAttrCountI();
          var indexCount       = branch.getIndexCountI();

          branch.fillVAttrBuffersI(meshesData[branchGroupIndex].positions,
                                   meshesData[branchGroupIndex].normals,
                                   meshesData[branchGroupIndex].colors,
                                   meshesData[branchGroupIndex].texCoords,
                                   generatedAttrCountArray[branchGroupIndex]);

          branch.fillIndexBufferI(meshesData[branchGroupIndex].indices,
                                  generatedAttrCountArray[branchGroupIndex],
                                  generatedIndexCountArray[branchGroupIndex]);

          generatedAttrCountArray[branchGroupIndex]  += attrCount;
          generatedIndexCountArray[branchGroupIndex] += indexCount;

          branchCount--;

          for (var i = 0; i < branchGroup.children.length; i++)
           {
            var child = branchGroup.children[branchGroup.children.length - i - 1];
            var workItem =
             {
              generator : child.branchingAlg.getBranchGenerator(rng,branch,child.stem)
             };

            stateStack.push(workItem);
           }
         }
        else
         {
          stateStack.pop();
         }
       }
     }

    this.done = function ()
     {
      return stateStack.length == 0;
     }

    this.getMeshData = function(meshIndex)
     {
      return meshesData[meshIndex];
     }

    this.getMeshAttrCount = function(meshIndex)
     {
      return generatedAttrCountArray[meshIndex];
     }

    this.getMeshIndexCount = function(meshIndex)
     {
      return generatedIndexCountArray[meshIndex];
     }
   }

  this.createMeshGeneratorI = function(options)
   {
    return new MeshGeneratorI(options);
   }

  this.generateMeshesDataI = function(options)
   {
    var meshSizes = calculateMeshSizesI(options);

    var meshesData = [];

    for (var i = 0; i < meshSizes.length; i++)
     {
      var attrCount  = meshSizes[i].attrCount;
      var indexCount = meshSizes[i].indexCount;

      meshesData.push({
                       positions   : new Float32Array(attrCount * 3),
                       normals     : new Float32Array(attrCount * 3),
                       colors      : new Float32Array(attrCount * 3),
                       texCoords   : new Float32Array(attrCount * 2),
                       indices     : new Uint16Array(indexCount),
                       materialDef : null,
                       visRange    : null
                      });
     }

    fillMeshesDataI(meshesData,options);

    fillMaterialsAndVisRanges(meshesData);

    return meshesData;

    //return generateDummyMeshesData();
   }

  function MeshGenerator (options)
   {
    var meshSizes  = calculateMeshSizes(options);
    var meshesData = [];

    var attrOffsets  = [];
    var indexOffsets = [];
    var primitiveTypeOffsets = [];

    for (var i = 0; i < meshSizes.length; i++)
     {
      var branchGroupSizes = meshSizes[i];
      var indexCount = branchGroupSizes.indexCount;

      meshesData.push({
                       positions   : new Float32Array(branchGroupSizes.positionAttrCount * 3),
                       normals     : new Float32Array(branchGroupSizes.normalAttrCount * 3),
                       texCoords   : new Float32Array(branchGroupSizes.texCoordAttrCount * 2),
                       positionIndices : new Uint16Array(indexCount),
                       normalIndices   : new Uint16Array(indexCount),
                       texCoordIndices : new Uint16Array(indexCount),
                       primitiveTypes : new Uint8Array(branchGroupSizes.primitiveCount),
                       materialDef : null,
                       visRange    : null
                      });

      attrOffsets.push({ positions : 0, normals : 0, texCoords : 0 });
      indexOffsets.push(0);
      primitiveTypeOffsets.push(0);
     }

    fillMaterialsAndVisRanges(meshesData);

    var stateStack = []

    var disable_randomness = options && options.disable_randomness;

    var rng = disable_randomness ? null : new CPL.Core.RNGSimple(baseSeed);

    for (var i = 0; i < children.length; i++)
     {
      var child = children[children.length - i - 1];
      var workItem =
       {
        generator : child.branchingAlg.getBranchGenerator(rng,null,child.stem)
       };

      stateStack.push(workItem);
     }

    this.step = function (branchCount)
     {
      var workItem;
      var branch;

      while (branchCount > 0 && stateStack.length > 0)
       {
        workItem = stateStack[stateStack.length - 1];

        branch = workItem.generator();

        if (branch)
         {
          var branchGroup      = branch.stem.group;
          var branchGroupIndex = branchGroup.index;

          branch.fillVAttrBuffers(meshesData[branchGroupIndex].positions,
                                  meshesData[branchGroupIndex].normals,
                                  meshesData[branchGroupIndex].texCoords,
                                  attrOffsets[branchGroupIndex]);

          branch.fillIndexBuffer(meshesData[branchGroupIndex].positionIndices,
                                 meshesData[branchGroupIndex].normalIndices,
                                 meshesData[branchGroupIndex].texCoordIndices,
                                 attrOffsets[branchGroupIndex],
                                 indexOffsets[branchGroupIndex]);

          var primCount = branch.getPrimitiveCount();
          var primitiveTypeOffset = primitiveTypeOffsets[branchGroupIndex];

          for (var primIndex = 0; primIndex < primCount; primIndex++)
           {
            meshesData[branchGroupIndex].primitiveTypes[primitiveTypeOffset] = branch.getPrimitiveType();

            primitiveTypeOffset++;
           }

          primitiveTypeOffsets[branchGroupIndex] = primitiveTypeOffset;

          attrOffsets[branchGroupIndex].positions += branch.getVAttrCount(CPL.Core.ATTR_VERTEX);
          attrOffsets[branchGroupIndex].normals   += branch.getVAttrCount(CPL.Core.ATTR_NORMAL);
          attrOffsets[branchGroupIndex].texCoords += branch.getVAttrCount(CPL.Core.ATTR_TEXCOORD0);
          indexOffsets[branchGroupIndex]          += calcBranchIndexCount(branch);

          branchCount--;

          for (var i = 0; i < branchGroup.children.length; i++)
           {
            var child = branchGroup.children[branchGroup.children.length - i - 1];
            var workItem =
             {
              generator : child.branchingAlg.getBranchGenerator(rng,branch,child.stem)
             };

            stateStack.push(workItem);
           }
         }
        else
         {
          stateStack.pop();
         }
       }
     }

    this.done = function ()
     {
      return stateStack.length == 0;
     }

    this.getMeshData = function(meshIndex)
     {
      return meshesData[meshIndex];
     }

    this.getMeshAttrCount = function(meshIndex,attr)
     {
      if (attr == CPL.Core.ATTR_VERTEX)
       {
        return attrOffsets[meshIndex].positions;
       }
      else if (attr == CPL.Core.ATTR_NORMAL)
       {
        return attrOffsets[meshIndex].normals;
       }
      else if (attr == CPL.Core.ATTR_TEXCOORD0)
       {
        return attrOffsets[meshIndex].texCoords;
       }
      else
       {
        return 0;
       }
     }

    this.getMeshIndexCount = function(meshIndex)
     {
      return indexOffsets[meshIndex];
     }
   }

  this.generateMeshesData = function(options)
   {
    var branchGroupCount = self.getTotalBranchGroupCount();

    var generator = new MeshGenerator(options);

    while (!generator.done())
     {
      generator.step(1000);
     }

    // generator provides access to data for single branch group
    // only (even if it stores data in array internally), so we
    // need to recreate array. it shouldn't be a problem since
    // branchgroup count usualy is not large
    var data = [];

    for (var i = 0; i < branchGroupCount; i++)
     {
      data.push(generator.getMeshData(i));
     }

    return data;
   }

  this.setEmpty = setEmpty;

  function loadMetaInfo (loader,versionMajor,versionMinor)
   {
    metaInfo.author = loader.readTaggedValue("Author","s");

    if (versionMajor > 0 || versionMinor > 13)
     {
      metaInfo.authorUrl = loader.readTaggedValue("AuthorURL","s");
     }

    metaInfo.licenseName  = loader.readTaggedValue("LicenseName","s");
    metaInfo.licenseUrl   = loader.readTaggedValue("LicenseURL","s");
    metaInfo.plantInfoUrl = loader.readTaggedValue("PlantInfoURL","s");
   }

  function writeMetaInfo (writer)
   {
    writer.writeTagged("Author","s",metaInfo.author);
    writer.writeTagged("AuthorURL","s",metaInfo.authorUrl);
    writer.writeTagged("LicenseName","s",metaInfo.licenseName);
    writer.writeTagged("LicenseURL","s",metaInfo.licenseUrl);
    writer.writeTagged("PlantInfoURL","s",metaInfo.plantInfoUrl);
   }

  function load (lineReader)
   {
    var loader = new CPL.Core.FmtInputStream(lineReader);
    var args   = [];

    setEmpty();

    loader.readTagged(args,"P3D","uu");

    var versionMajor = args[0];
    var versionMinor = args[1];

    if (versionMajor != this.VERSION_MAJOR ||
        versionMinor  > this.VERSION_MINOR  ||
        versionMinor  < 3)
     {
      throw new CPL.Core.Error(loader.formatErrorMessage("unsupported file format version"));
     }

    if (versionMinor < 7)
     {
      loader.enableEscapeChars();
     }

    if (versionMinor >= 13)
     {
      loadMetaInfo(loader,versionMajor,versionMinor);
     }

    baseSeed = loader.readTaggedValue("BaseSeed","u");

    var dummyBranchGroup = CPL.Core.BranchGroup.load(loader,null,versionMajor,versionMinor);

    name = dummyBranchGroup.name;

    for (var i = 0; i < dummyBranchGroup.children.length; i++)
     {
      children.push(dummyBranchGroup.children[i]);
     }

    updateBranchGroupIndices();
   }

  function save (lineWriter)
   {
    var writer = new CPL.Core.FmtOutputStream(lineWriter);

    writer.writeTagged("P3D","uu",this.VERSION_MAJOR,this.VERSION_MINOR);

    writeMetaInfo(writer);

    writer.writeTagged("BaseSeed","u",baseSeed);

    var baseBranchGroup = new CPL.Core.BranchGroup(null,null,null);

    baseBranchGroup.name = name;

    for (var i = 0; i < children.length; i++)
     {
      baseBranchGroup.children.push(children[i]);
     }

    baseBranchGroup.save(writer);
   }

  this.load = load;
  this.save = save;
 }

CPL.Core.Plant.load = function(lineReader)
 {
  var plant = new CPL.Core.Plant();

  plant.load(lineReader);

  return plant;
 }

