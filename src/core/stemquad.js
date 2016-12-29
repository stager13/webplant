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

CPL.Core.StemQuadInstance = function (stem,width,length,thickness,localToWorldMatrix)
 {
  this.stem = stem;

  this.getVAttrCount = function(attr)
   {
    var sectionCount = stem.sectionCount;

    if (sectionCount == 1)
     {
      if (attr == CPL.Core.ATTR_NORMAL  ||
          attr == CPL.Core.ATTR_TANGENT ||
          attr == CPL.Core.ATTR_BINORMAL)
       {
        return 1;
       }
      else
       {
        return 4;
       }
     }
    else
     {
      if (attr == CPL.Core.ATTR_NORMAL  ||
          attr == CPL.Core.ATTR_TANGENT ||
          attr == CPL.Core.ATTR_BINORMAL)
       {
        return sectionCount + 1;
       }
      else
       {
        return (sectionCount + 1) * 2;
       }
     }
   }

  this.fillVAttrBuffers = function(positions,normals,texCoords,bufferOffsets)
   {
    var sectionCount = stem.sectionCount;
    var curvature    = stem.curvature;
    var posOffset    = bufferOffsets.positions * 3;
    var normalOffset = bufferOffsets.normals   * 3;
    var uvOffset     = bufferOffsets.texCoords * 2;
    var halfWidth    = width / 2.0;
    var position     = new CPL.Core.Vector3(0.0,0.0,0.0);
    var normal       = new CPL.Core.Vector3(0.0,0.0,0.0);

    for (var h = 0; h <= sectionCount; h++)
     {
      var yOffset = h / sectionCount;
      var y = yOffset * length;
      var z = (sectionCount > 1) ?
               (curvature.getValue(yOffset) - 0.5) * thickness:
               0.0;

      position.set(-halfWidth,y,z);
      position.applyTransform(localToWorldMatrix);

      positions[posOffset]     = position.v[0];
      positions[posOffset + 1] = position.v[1];
      positions[posOffset + 2] = position.v[2];

      texCoords[uvOffset]     = 0.0;
      texCoords[uvOffset + 1] = h / sectionCount;

      posOffset += 3;
      uvOffset  += 2;

      position.set(halfWidth,y,z);
      position.applyTransform(localToWorldMatrix);

      positions[posOffset]     = position.v[0];
      positions[posOffset + 1] = position.v[1];
      positions[posOffset + 2] = position.v[2];

      texCoords[uvOffset]     = 1.0;
      texCoords[uvOffset + 1] = h / sectionCount;

      posOffset += 3;
      uvOffset  += 2;

      if (sectionCount > 1)
       {
        normal.set(0.0,0.0,1.0);

        normal.v[1] = -curvature.getTangent(yOffset);

        normal.normalize();

        normal.apply3x3SubTransform(localToWorldMatrix);
        normal.normalize();

        normals[normalOffset]     = normal.v[0];
        normals[normalOffset + 1] = normal.v[1];
        normals[normalOffset + 2] = normal.v[2];

        normalOffset += 3;
       }
     }

    if (sectionCount == 1)
     {
      normal.set(0.0,0.0,1.0);

      normal.apply3x3SubTransform(localToWorldMatrix);
      normal.normalize();

      normals[normalOffset]     = normal.v[0];
      normals[normalOffset + 1] = normal.v[1];
      normals[normalOffset + 2] = normal.v[2];

      normalOffset += 3;
     }
   }

  this.fillIndexBuffer = function(positionIndices,normalIndices,texCoordIndices,attrBufferOffsets,indexBufferOffset)
   {
    var sectionCount = stem.sectionCount;

    if (sectionCount == 1)
     {
      positionIndices[indexBufferOffset]     = attrBufferOffsets.positions;
      positionIndices[indexBufferOffset + 1] = attrBufferOffsets.positions + 1;
      positionIndices[indexBufferOffset + 2] = attrBufferOffsets.positions + 3;
      positionIndices[indexBufferOffset + 3] = attrBufferOffsets.positions + 2;

      normalIndices[indexBufferOffset]     = attrBufferOffsets.normals;
      normalIndices[indexBufferOffset + 1] = attrBufferOffsets.normals;
      normalIndices[indexBufferOffset + 2] = attrBufferOffsets.normals;
      normalIndices[indexBufferOffset + 3] = attrBufferOffsets.normals;

      texCoordIndices[indexBufferOffset]     = attrBufferOffsets.texCoords;
      texCoordIndices[indexBufferOffset + 1] = attrBufferOffsets.texCoords + 1;
      texCoordIndices[indexBufferOffset + 2] = attrBufferOffsets.texCoords + 3;
      texCoordIndices[indexBufferOffset + 3] = attrBufferOffsets.texCoords + 2;
     }
    else
     {
      for (var sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++)
       {
        var baseOffset = sectionIndex * 2;

        positionIndices[indexBufferOffset    ] = attrBufferOffsets.positions + baseOffset;
        positionIndices[indexBufferOffset + 1] = attrBufferOffsets.positions + baseOffset + 1;
        positionIndices[indexBufferOffset + 2] = attrBufferOffsets.positions + baseOffset + 3;
        positionIndices[indexBufferOffset + 3] = attrBufferOffsets.positions + baseOffset + 2;

        normalIndices[indexBufferOffset]     = attrBufferOffsets.normals + sectionIndex;
        normalIndices[indexBufferOffset + 1] = attrBufferOffsets.normals + sectionIndex;
        normalIndices[indexBufferOffset + 2] = attrBufferOffsets.normals + sectionIndex + 1;
        normalIndices[indexBufferOffset + 3] = attrBufferOffsets.normals + sectionIndex + 1;

        texCoordIndices[indexBufferOffset    ] = attrBufferOffsets.texCoords + baseOffset;
        texCoordIndices[indexBufferOffset + 1] = attrBufferOffsets.texCoords + baseOffset + 1;
        texCoordIndices[indexBufferOffset + 2] = attrBufferOffsets.texCoords + baseOffset + 3;
        texCoordIndices[indexBufferOffset + 3] = attrBufferOffsets.texCoords + baseOffset + 2;

        indexBufferOffset += 4;
       }
     }
   }

  this.getPrimitiveCount = function()
   {
    return stem.sectionCount;
   }

  this.getPrimitiveType = function(primitiveIndex)
   {
    return CPL.Core.QUAD;
   }

  this.getVAttrCountI = function()
   {
    return 2 + stem.sectionCount * 2;
   }

  this.getIndexCountI = function()
   {
    return stem.sectionCount * 2 * 3;
   }

  this.fillVAttrBuffersI = function(positions,normals,colors,texCoords,buffersOffset)
   {
    var sectionCount = stem.sectionCount;
    var curvature    = stem.curvature;
    var baseOffset   = buffersOffset * 3;
    var uvOffset     = buffersOffset * 2;
    var halfWidth    = width / 2.0;
    var position     = new CPL.Core.Vector3(0.0,0.0,0.0);
    var normal       = new CPL.Core.Vector3(0.0,0.0,0.0);
    var color        = stem.group.materialDef.color;
    var r            = color.r;
    var g            = color.g;
    var b            = color.b;

    for (var h = 0; h <= sectionCount; h++)
     {
      var yOffset = h / sectionCount;
      var y = yOffset * length;
      var z = (sectionCount > 1) ?
               (curvature.getValue(yOffset) - 0.5) * thickness:
               0.0;

      position.set(-halfWidth,y,z);
      position.applyTransform(localToWorldMatrix);

      positions[baseOffset]     = position.v[0];
      positions[baseOffset + 1] = position.v[1];
      positions[baseOffset + 2] = position.v[2];

      normal.set(0.0,0.0,1.0);

      if (sectionCount > 1)
       {
        normal.v[1] = -curvature.getTangent(yOffset);

        normal.normalize();
       }

      normal.apply3x3SubTransform(localToWorldMatrix);
      normal.normalize();

      normals[baseOffset]     = normal.v[0];
      normals[baseOffset + 1] = normal.v[1];
      normals[baseOffset + 2] = normal.v[2];

      colors[baseOffset]     = r;
      colors[baseOffset + 1] = g;
      colors[baseOffset + 2] = b;

      texCoords[uvOffset]     = 0.0;
      texCoords[uvOffset + 1] = h / sectionCount;

      baseOffset += 3;
      uvOffset   += 2;

      position.set(halfWidth,y,z);
      position.applyTransform(localToWorldMatrix);

      positions[baseOffset]     = position.v[0];
      positions[baseOffset + 1] = position.v[1];
      positions[baseOffset + 2] = position.v[2];

      normals[baseOffset]     = normal.v[0];
      normals[baseOffset + 1] = normal.v[1];
      normals[baseOffset + 2] = normal.v[2];

      colors[baseOffset]     = r;
      colors[baseOffset + 1] = g;
      colors[baseOffset + 2] = b;

      texCoords[uvOffset]     = 1.0;
      texCoords[uvOffset + 1] = h / sectionCount;

      baseOffset += 3;
      uvOffset   += 2;
     }
   }

  this.fillIndexBufferI = function(indices,attrBufferOffset,indexBufferOffset)
   {
    var sectionCount = stem.sectionCount;

    for (var sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++)
     {
      indices[indexBufferOffset]     = attrBufferOffset + sectionIndex * 2;
      indices[indexBufferOffset + 1] = indices[indexBufferOffset] + 1;
      indices[indexBufferOffset + 2] = indices[indexBufferOffset] + 2;
      indices[indexBufferOffset + 3] = indices[indexBufferOffset + 2];
      indices[indexBufferOffset + 4] = indices[indexBufferOffset + 1];
      indices[indexBufferOffset + 5] = indices[indexBufferOffset] + 3;

      indexBufferOffset += 6;
     }
   }

  this.getWorldTransform = function()
   {
    return localToWorldMatrix;
   }
 }


CPL.Core.StemQuad = function ()
 {
  var self = this;

  reset();

  function reset()
   {
    self.group  = null;
    self.length = 0.05;
    self.width  = 0.05;
    self.originOffsetX = 0.0;
    self.originOffsetY = 0.0;

    self.sectionCount = 1;
    self.thickness    = 0.0;

    self.scaling   = CPL.Core.Spline.makeConstant(1.0);
    self.curvature = CPL.Core.Spline.makeConstant(0.5);
   }

  this.load = function(loader,versionMajor,versionMinor)
   {
    reset();

    self.length = loader.readTaggedValue("Length","f");
    self.width  = loader.readTaggedValue("Width","f");

    if (versionMajor > 0 || versionMinor >= 10)
     {
      self.originOffsetX = loader.readTaggedValue("OriginOffsetX","f");
      self.originOffsetY = loader.readTaggedValue("OriginOffsetY","f");
     }
    else
     {
      self.originOffsetX = 0.0;
      self.originOffsetY = 0.0;
     }

    if (versionMajor > 0 || versionMinor > 1)
     {
      self.scaling      = loader.readTaggedSpline("Scaling");
      self.sectionCount = loader.readTaggedValue("SectionCount","u");
      self.curvature    = loader.readTaggedSpline("Curvature");
      self.thickness    = loader.readTaggedValue("Thickness","f");
     }
    else
     {
      self.scaling      = CPL.Core.Spline.makeConstant(1.0);
      self.sectionCount = 1;
      self.curvature    = CPL.Core.Spline.makeConstant(0.5);
      self.thickness    = 0.0;
     }
   }

  this.save = function(writer)
   {
    writer.writeTagged("StemModel","s","Quad");
    writer.writeTagged("Length","f",self.length);
    writer.writeTagged("Width","f",self.width);
    writer.writeTagged("OriginOffsetX","f",self.originOffsetX);
    writer.writeTagged("OriginOffsetY","f",self.originOffsetY);
    writer.writeTaggedSpline("Scaling",self.scaling);
    writer.writeTagged("SectionCount","u",self.sectionCount);
    writer.writeTaggedSpline("Curvature",self.curvature);
    writer.writeTagged("Thickness","f",self.thickness);
   }
 }

CPL.Core.StemQuad.prototype.createInstance = function(rng,parent,offset,orientation)
 {
  var offsetY = (parent != null) ? offset.v[1] : 0.0;
  var scale   = this.scaling.getValue(offsetY);

  var scaledWidth  = this.width  * scale;
  var scaledLength = this.length * scale;

  var originOffsetTransform = CPL.Core.Matrix4x4.makeTranslation
                               (-this.originOffsetX * scaledWidth,
                                -this.originOffsetY * scaledLength,
                                0.0);

  var localToWorldMatrix;

  if (parent != null)
   {
    var parentOrientation = parent.getAxisOrientationAt(offsetY);
    var parentAxisPos     = parent.getAxisPointAt(offsetY);
    var parentTransform   = parent.getWorldTransform();

    var instanceOrientation = CPL.Core.Quaternion.crossProduct
                               (parentOrientation,orientation);

    var translationTransform = CPL.Core.Matrix4x4.makeTranslation
                                (parentAxisPos.v[0],
                                 parentAxisPos.v[1],
                                 parentAxisPos.v[2]);

    localToWorldMatrix =
     CPL.Core.Matrix4x4.multiply
      (CPL.Core.Matrix4x4.multiply
        (parentTransform,
         CPL.Core.Matrix4x4.multiply
          (translationTransform,
           instanceOrientation.asMatrix4x4())),
       originOffsetTransform);
   }
  else
   {
    localToWorldMatrix = CPL.Core.Matrix4x4.multiply
                          (CPL.Core.BranchingAlgBase.makeBranchWorldMatrix
                            (offset,orientation),
                           originOffsetTransform);
   }

  return new CPL.Core.StemQuadInstance
              (this,scaledWidth,scaledLength,this.thickness * scale,
               localToWorldMatrix);
 }

CPL.Core.StemQuad.load = function(loader,versionMajor,versionMinor)
 {
  var stem = new CPL.Core.StemQuad();

  stem.load(loader,versionMajor,versionMinor);

  return stem;
 }

