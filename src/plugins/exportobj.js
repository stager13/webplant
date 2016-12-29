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

CPL.Plugins.ExportOBJ = (function()
 {
  /*
   * options =
   *  {
   *   exportHidden : false,
   *   exportOutVisRange : false,
   *   scalingFactor : undefined,
   *   joinSimilarMaterials : true
   *  };
   */

  var COLOR_TOLERANCE = 1 / 256;

  function createDefaultOptions ()
   {
    var opts =
     {
      exportHidden         : false,
      exportOutVisRange    : false,
      scalingFactor        : undefined,
      joinSimilarMaterials : true
     };

    return opts;
   }

  function createIdentityMaterialsMapping(plant)
   {
    var mapping = [];
    var n = plant.getTotalBranchGroupCount();

    for (var i = 0; i < n; i++)
     {
      mapping.push(i);
     }

    return mapping;
   }

  function isSimilarColorComponent(c1,c2)
   {
    return Math.abs(c1 - c2) < COLOR_TOLERANCE;
   }

  function isSameTextureRef(tex1,tex2)
   {
    return tex1 == tex2;
   }

  function isSimilarMaterials(mat1,mat2)
   {
    return isSimilarColorComponent(mat1.color.r,mat2.color.r) &&
           isSimilarColorComponent(mat1.color.g,mat2.color.g) &&
           isSimilarColorComponent(mat1.color.b,mat2.color.b) &&
           isSameTextureRef(mat1.diffuseTex,mat2.diffuseTex);
   }

  function getSimilarMaterialIndex(plant,materialDef)
   {
    var n = plant.getTotalBranchGroupCount();

    for (var i = 0; i < n; i++)
     {
      if (isSimilarMaterials(plant.getBranchGroupByIndex(i).materialDef,materialDef))
       {
        return i;
       }
     }

    return undefined;
   }

  //FIXME: branch group visibility is ignored here
  function createJoinedMaterialsMapping(plant)
   {
    var mapping = [];
    var n = plant.getTotalBranchGroupCount();

    for (var i = 0; i < n; i++)
     {
      mapping.push(getSimilarMaterialIndex(plant,plant.getBranchGroupByIndex(i).materialDef));
     }

    return mapping;
   }

  function createMaterialsMapping(plant,joinSimilarMaterials)
   {
    if (joinSimilarMaterials)
     {
      return createJoinedMaterialsMapping(plant);
     }
    else
     {
      return createIdentityMaterialsMapping(plant);
     }
   }

  function createOBJFileContent(plant,materialMapping,mtlFileName,options)
   {
    var content = "";

    var meshes = plant.generateMeshesData();

    content += "o " + plant.getName() + "\n";
    content += "mtllib " + mtlFileName + "\n";

    var scalingFactor = options.scalingFactor;

    var vertexIndexOffset   = 1;
    var normalIndexOffset   = 1;
    var texCoordIndexOffset = 1;

    var groupCount = plant.getTotalBranchGroupCount();

    for (var groupIndex = 0; groupIndex < groupCount; groupIndex++)
     {
      content += "g bgroup" + groupIndex + "\n";
      content += "usemtl pmat" + materialMapping[groupIndex] + "\n";

      var diffuseTex = plant.getBranchGroupByIndex(groupIndex).materialDef.diffuseTex;

      if (diffuseTex)
       {
        content += "usemap " + diffuseTex + "\n";
       }
      else
       {
        content += "usemap off\n";
       }

      var meshData = meshes[groupIndex];

      var vertexAttrData  = meshData.positions;
      var vertexAttrCount = vertexAttrData.length;

      if (scalingFactor === undefined)
       {
        for (var i = 0; i < vertexAttrCount; i += 3)
         {
          content += "v " + vertexAttrData[i] + " "
                          + vertexAttrData[i + 1] + " "
                          + vertexAttrData[i + 2] + "\n";
         }
       }
      else
       {
        for (var i = 0; i < vertexAttrCount; i += 3)
         {
          content += "v " + vertexAttrData[i] * scalingFactor + " "
                          + vertexAttrData[i + 1] * scalingFactor + " "
                          + vertexAttrData[i + 2] * scalingFactor + "\n";
         }
       }

      var normalAttrData  = meshData.normals;
      var normalAttrCount = normalAttrData.length;

      for (var i = 0; i < normalAttrCount; i += 3)
       {
        content += "vn " + normalAttrData[i] + " "
                         + normalAttrData[i + 1] + " "
                         + normalAttrData[i + 2] + "\n";
       }

      var texCoordAttrData  = meshData.texCoords;
      var texCoordAttrCount = texCoordAttrData.length;

      for (var i = 0; i < texCoordAttrCount; i += 2)
       {
        content += "vt " + texCoordAttrData[i] + " "
                         + texCoordAttrData[i + 1] + "\n";
       }

      var primCount   = meshData.primitiveTypes.length;
      var indexOffset = 0;
      var vertexIndices = meshData.positionIndices;
      var normalIndices = meshData.normalIndices;
      var texCoordIndices = meshData.texCoordIndices;

      for (var primIndex = 0; primIndex < primCount; primIndex++)
       {
        if (meshData.primitiveTypes[primIndex] == CPL.Core.QUAD)
         {
          content += "f "
           + (vertexIndexOffset + vertexIndices[indexOffset]) + "/"
           + (texCoordIndexOffset + texCoordIndices[indexOffset]) + "/"
           + (normalIndexOffset + normalIndices[indexOffset]) + " "
           + (vertexIndexOffset + vertexIndices[indexOffset + 1]) + "/"
           + (texCoordIndexOffset + texCoordIndices[indexOffset + 1]) + "/"
           + (normalIndexOffset + normalIndices[indexOffset + 1]) + " "
           + (vertexIndexOffset + vertexIndices[indexOffset + 2]) + "/"
           + (texCoordIndexOffset + texCoordIndices[indexOffset + 2]) + "/"
           + (normalIndexOffset + normalIndices[indexOffset + 2]) + " "
           + (vertexIndexOffset + vertexIndices[indexOffset + 3]) + "/"
           + (texCoordIndexOffset + texCoordIndices[indexOffset + 3]) + "/"
           + (normalIndexOffset + normalIndices[indexOffset + 3]) + "\n";

          indexOffset += 4;
         }
        else
         {
          content += "f "
           + (vertexIndexOffset + vertexIndices[indexOffset]) + "/"
           + (texCoordIndexOffset + texCoordIndices[indexOffset]) + "/"
           + (normalIndexOffset + normalIndices[indexOffset]) + " "
           + (vertexIndexOffset + vertexIndices[indexOffset + 1]) + "/"
           + (texCoordIndexOffset + texCoordIndices[indexOffset + 1]) + "/"
           + (normalIndexOffset + normalIndices[indexOffset + 1]) + " "
           + (vertexIndexOffset + vertexIndices[indexOffset + 2]) + "/"
           + (texCoordIndexOffset + texCoordIndices[indexOffset + 2]) + "/"
           + (normalIndexOffset + normalIndices[indexOffset + 2]) + "\n";

          indexOffset += 3;
         }
       }

      vertexIndexOffset   += vertexAttrCount / 3;
      normalIndexOffset   += normalAttrCount / 3;
      texCoordIndexOffset += texCoordAttrCount / 2;
     }

    return content;
   }

  function createMTLFileContent(plant,materialMapping)
   {
    var content = "";

    var groupCount = plant.getTotalBranchGroupCount();

    for (var groupIndex = 0; groupIndex < groupCount; groupIndex++)
     {
      if (materialMapping[groupIndex] == groupIndex)
       {
        var matDef = plant.getBranchGroupByIndex(groupIndex).materialDef;

        content += "newmtl pmat" + groupIndex + "\n";
        content += "Kd " + matDef.color.r + " "
                         + matDef.color.g + " "
                         + matDef.color.b + "\n";
        content += "Ns 1\n";

        if (matDef.diffuseTex)
         {
          content += "map_Kd " + matDef.diffuseTex + "\n";
         }
       }
     }

    return content;
   }

  function packTextures(zip,plant,materialMapping,textureCache)
   {
    var groupCount = plant.getTotalBranchGroupCount();

    for (var groupIndex = 0; groupIndex < groupCount; groupIndex++)
     {
      if (materialMapping[groupIndex] == groupIndex)
       {
        var matDef = plant.getBranchGroupByIndex(groupIndex).materialDef;

        if (matDef.diffuseTex)
         {
          var texData = textureCache.getTextureDataByName(matDef.diffuseTex);

          if (texData && texData.startsWith("data:"))
           {
            var commaPos = texData.indexOf(",");

            if (commaPos > 0)
             {
              imageData = texData.substring(commaPos + 1);

              zip.file(matDef.diffuseTex,imageData,{base64:true});
             }
           }
         }
       }
     }
   }

  function exportToZip(plant,textureCache,options)
   {
    if (!options)
     {
      options = createDefaultOptions();
     }

    var plantName   = plant.getName();
    var objFileName = plantName + ".obj";
    var mtlFileName = plantName + ".mtl";

    var materialMapping = createMaterialsMapping(plant,options.joinSimilarMaterial);
    var objFileContent  = createOBJFileContent(plant,materialMapping,mtlFileName,options);
    var mtlFileContent  = createMTLFileContent(plant,materialMapping);

    var zip = new JSZip();

    zip.file(objFileName,objFileContent);
    zip.file(mtlFileName,mtlFileContent);

    packTextures(zip,plant,materialMapping,textureCache);

    return zip;
   }

  return { "exportToZip" : exportToZip };
 })();

