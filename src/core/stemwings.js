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

CPL.Core.StemWingsInstance = function (stem,parentStem,parent,width,thickness,orientation,localToWorldMatrix)
 {
  this.stem = stem;

  this.getVAttrCount = function(attr)
   {
    if (attr == CPL.Core.ATTR_NORMAL   ||
        attr == CPL.Core.ATTR_BINORMAL ||
        attr == CPL.Core.ATTR_TANGENT)
     {
      return (parentStem.axisResolution + 1) * (stem.sectionCount + 1) * 2;
     }
    else
     {
      return (parentStem.axisResolution + 1) * (stem.sectionCount * 2 + 1);
     }
   }

  this.fillVAttrBuffers = function(positions,normals,texCoords,bufferOffsets)
   {
    var sectionCount   = stem.sectionCount;
    var curvature      = stem.curvature;
    var axisResolution = parentStem.axisResolution;
    var posOffset      = bufferOffsets.positions * 3;
    var normalOffset   = bufferOffsets.normals * 3;
    var uvOffset       = bufferOffsets.texCoords * 2;
    var position       = new CPL.Core.Vector3(0.0,0.0,0.0);
    var normal         = new CPL.Core.Vector3(0.0,0.0,0.0);

    for (var rowIndex = 0; rowIndex <= axisResolution ; rowIndex++)
     {
      var yFraction = rowIndex / axisResolution;

      for (var colIndex = sectionCount; colIndex >= -sectionCount; colIndex--)
       {
        var xFraction = Math.abs(colIndex / sectionCount);
        var x = width * xFraction;
        var y = 0.0;
        var z = (curvature.getValue(xFraction) - 0.5) * thickness;

        if (colIndex < 0)
         {
          x = -x;
         }

        position.set(x,y,z);

        var axisOrientation = parent.getAxisOrientationAt(yFraction);
        var axisPoint       = parent.getAxisPointAt(yFraction);

        orientation.rotateVectorInPlace(position);
        axisOrientation.rotateVectorInPlace(position);

        position.add(axisPoint);
        position.applyTransform(localToWorldMatrix);

        positions[posOffset]     = position.v[0];
        positions[posOffset + 1] = position.v[1];
        positions[posOffset + 2] = position.v[2];

        posOffset += 3;

        var nx = curvature.getTangent(xFraction);

        if (colIndex >= 0)
         {
          nx = -nx;
         }

        normal.set(nx,0.0,1.0);
        normal.normalize();

        orientation.rotateVectorInPlace(normal);
        axisOrientation.rotateVectorInPlace(normal);

        normal.apply3x3SubTransform(localToWorldMatrix);

        normal.normalize();

        normals[normalOffset]     = normal.v[0];
        normals[normalOffset + 1] = normal.v[1];
        normals[normalOffset + 2] = normal.v[2];

        normalOffset += 3;

        if (colIndex == 0)
         {
          normal.set(-nx,0.0,1.0);
          normal.normalize();

          orientation.rotateVectorInPlace(normal);
          axisOrientation.rotateVectorInPlace(normal);

          normal.apply3x3SubTransform(localToWorldMatrix);

          normal.normalize();

          normals[normalOffset]     = normal.v[0];
          normals[normalOffset + 1] = normal.v[1];
          normals[normalOffset + 2] = normal.v[2];

          normalOffset += 3;
         }

        var u = (colIndex + sectionCount) / (sectionCount * 2);
        var v = yFraction;

        texCoords[uvOffset]     = u;
        texCoords[uvOffset + 1] = v;

        uvOffset += 2;
       }
     }
   }

  this.fillIndexBuffer = function(positionIndices,normalIndices,texCoordIndices,attrBufferOffsets,indexBufferOffset)
   {
    var sectionCount   = stem.sectionCount;
    var sectionCount2  = sectionCount * 2;
    var primitiveCount = getPrimitiveCount();

    for (var primitiveIndex = 0; primitiveIndex < primitiveCount; primitiveIndex++)
     {
      // positions and uvs
      var i1 = Math.floor(primitiveIndex / sectionCount2) *
                (sectionCount2 + 1) + primitiveIndex % sectionCount2;
      var i2 = i1 + 1;
      var i4 = i2 + sectionCount2;
      var i3 = i4 + 1;

      positionIndices[indexBufferOffset]     = attrBufferOffsets.positions + i1;
      positionIndices[indexBufferOffset + 1] = attrBufferOffsets.positions + i2;
      positionIndices[indexBufferOffset + 2] = attrBufferOffsets.positions + i3;
      positionIndices[indexBufferOffset + 3] = attrBufferOffsets.positions + i4;

      texCoordIndices[indexBufferOffset]     = attrBufferOffsets.texCoords + i1;
      texCoordIndices[indexBufferOffset + 1] = attrBufferOffsets.texCoords + i2;
      texCoordIndices[indexBufferOffset + 2] = attrBufferOffsets.texCoords + i3;
      texCoordIndices[indexBufferOffset + 3] = attrBufferOffsets.texCoords + i4;

      // normals
      i1 = Math.floor(primitiveIndex / sectionCount2) * (sectionCount2 + 2) +
            primitiveIndex % sectionCount2;

      if (primitiveIndex % sectionCount2 >= sectionCount)
       {
        i1++;
       }

      i2 = i1 + 1;
      i3 = i2 + sectionCount2 + 2;
      i4 = i3 - 1;

      normalIndices[indexBufferOffset]     = attrBufferOffsets.normals + i1;
      normalIndices[indexBufferOffset + 1] = attrBufferOffsets.normals + i2;
      normalIndices[indexBufferOffset + 2] = attrBufferOffsets.normals + i3;
      normalIndices[indexBufferOffset + 3] = attrBufferOffsets.normals + i4;

      indexBufferOffset += 4;
     }
   }

  function getPrimitiveCount()
   {
    return stem.sectionCount * 2 * parentStem.axisResolution;
   }

  this.getPrimitiveCount = getPrimitiveCount;

  this.getPrimitiveType = function(primitiveIndex)
   {
    return CPL.Core.QUAD;
   }

  this.getVAttrCountI = function()
   {
    return (parentStem.axisResolution + 1) * (stem.sectionCount + 1) * 2;
   }

  this.getIndexCountI = function()
   {
    return getPrimitiveCount() * 2 * 3;
   }

  this.fillVAttrBuffersI = function(positions,normals,colors,texCoords,buffersOffset)
   {
    var sectionCount   = stem.sectionCount;
    var axisResolution = parentStem.axisResolution;
    var curvature      = stem.curvature;
    var leftBaseOffset = buffersOffset * 3;
    var leftUvOffset   = buffersOffset * 2;
    var posLeft        = new CPL.Core.Vector3(0.0,0.0,0.0);
    var posRight       = new CPL.Core.Vector3(0.0,0.0,0.0);
    var normalLeft     = new CPL.Core.Vector3(0.0,0.0,0.0);
    var normalRight    = new CPL.Core.Vector3(0.0,0.0,0.0);

    var color = stem.group.materialDef.color;
    var r     = color.r;
    var g     = color.g;
    var b     = color.b;

    // go from branch tip to base
    for (var rowIndex = axisResolution; rowIndex >= 0 ; rowIndex--)
     {
      var yFraction = rowIndex / axisResolution;

      for (var colIndex = -sectionCount; colIndex <= 0; colIndex++)
       {
        var xFraction = -colIndex / sectionCount;

        posLeft.v[0] = -width * xFraction;
        posLeft.v[1] = 0.0;
        posLeft.v[2] = (curvature.getValue(xFraction) - 0.5) * thickness;

        posRight.v[0] = -posLeft.v[0];
        posRight.v[1] =  posLeft.v[1];
        posRight.v[2] =  posLeft.v[2];

        normalLeft.set(curvature.getTangent(xFraction),0.0,1.0);
        normalLeft.normalize();

        normalRight.v[0] = -normalLeft.v[0];
        normalRight.v[1] =  normalLeft.v[1];
        normalRight.v[2] =  normalLeft.v[2];

        var axisOrientation = parent.getAxisOrientationAt(yFraction);
        var axisPoint       = parent.getAxisPointAt(yFraction);

        orientation.rotateVectorInPlace(posLeft);
        orientation.rotateVectorInPlace(posRight);
        orientation.rotateVectorInPlace(normalLeft);
        orientation.rotateVectorInPlace(normalRight);
        axisOrientation.rotateVectorInPlace(posLeft);
        axisOrientation.rotateVectorInPlace(posRight);
        axisOrientation.rotateVectorInPlace(normalLeft);
        axisOrientation.rotateVectorInPlace(normalRight);

        posLeft.add(axisPoint);
        posRight.add(axisPoint);
        posLeft.applyTransform(localToWorldMatrix);
        posRight.applyTransform(localToWorldMatrix);

        normalLeft.apply3x3SubTransform(localToWorldMatrix);
        normalRight.apply3x3SubTransform(localToWorldMatrix);

        normalLeft.normalize();
        normalRight.normalize();

        positions[leftBaseOffset]     = posLeft.v[0];
        positions[leftBaseOffset + 1] = posLeft.v[1];
        positions[leftBaseOffset + 2] = posLeft.v[2];
        normals[leftBaseOffset]       = normalLeft.v[0];
        normals[leftBaseOffset + 1]   = normalLeft.v[1];
        normals[leftBaseOffset + 2]   = normalLeft.v[2];
        colors[leftBaseOffset]        = r;
        colors[leftBaseOffset + 1]    = g;
        colors[leftBaseOffset + 2]    = b;
        texCoords[leftUvOffset]       = 0.5 - xFraction / 2.0;
        texCoords[leftUvOffset + 1]   = yFraction;

        var rightBaseOffset = leftBaseOffset + (-colIndex * 2 + 1) * 3;
        var rightUvOffset   = leftUvOffset   + (-colIndex * 2 + 1) * 2;

        positions[rightBaseOffset]     = posRight.v[0];
        positions[rightBaseOffset + 1] = posRight.v[1];
        positions[rightBaseOffset + 2] = posRight.v[2];
        normals[rightBaseOffset]       = normalRight.v[0];
        normals[rightBaseOffset + 1]   = normalRight.v[1];
        normals[rightBaseOffset + 2]   = normalRight.v[2];
        colors[rightBaseOffset]        = r;
        colors[rightBaseOffset + 1]    = g;
        colors[rightBaseOffset + 2]    = b;
        texCoords[rightUvOffset]       = 0.5 + xFraction / 2.0;
        texCoords[rightUvOffset + 1]   = yFraction;

        leftBaseOffset += 3;
        leftUvOffset   += 2;
       }

      leftBaseOffset += (sectionCount + 1) * 3;
      leftUvOffset   += (sectionCount + 1) * 2;
     }
   }

  this.fillIndexBufferI = function(indices,attrBufferOffset,indexBufferOffset)
   {
    var sectionCount   = stem.sectionCount;
    var axisResolution = parentStem.axisResolution;
    var rowPointCount  = (sectionCount + 1) * 2;

    for (var rowIndex = 0; rowIndex < axisResolution; rowIndex++)
     {
      var base = attrBufferOffset + rowIndex * rowPointCount;

      for (var colIndex = 0; colIndex < sectionCount; colIndex++)
       {
        indices[indexBufferOffset]     = base;
        indices[indexBufferOffset + 1] = base + rowPointCount;
        indices[indexBufferOffset + 2] = base + 1;
        indices[indexBufferOffset + 3] = base + 1;
        indices[indexBufferOffset + 4] = base + rowPointCount;
        indices[indexBufferOffset + 5] = base + rowPointCount + 1;

        var rightOffset = indexBufferOffset + sectionCount * 6;
        base           += sectionCount + 1;

        indices[rightOffset]     = base;
        indices[rightOffset + 1] = base + rowPointCount;
        indices[rightOffset + 2] = base + 1;
        indices[rightOffset + 3] = base + 1;
        indices[rightOffset + 4] = base + rowPointCount;
        indices[rightOffset + 5] = base + rowPointCount + 1;

        indexBufferOffset += 6;

        base -= sectionCount;
       }

      indexBufferOffset += sectionCount * 6;
     }
   }

  this.getWorldTransform = function()
   {
    return localToWorldMatrix;
   }
 }

CPL.Core.StemWings = function (parentStem)
 {
  var self = this;

  reset();

  function reset()
   {
    self.group               = null;
    self.parentStem          = parentStem;
    self.width               = 0.5;
    self.sectionCount        = 1;
    self.thickness           = 0.0
    self.widthScalingEnabled = false;

    self.curvature = CPL.Core.Spline.makeConstant(0.5);
   }

  this.load = function(loader,versionMajor,versionMinor)
   {
    reset();

    var wingsAngle = loader.readTaggedValue("WingsAngle","f");

    self.width        = loader.readTaggedValue("Width","f");
    self.sectionCount = loader.readTaggedValue("SectionCount","u");
    self.curvature    = loader.readTaggedSpline("Curvature");
    self.thickness    = loader.readTaggedValue("Thickness","f");

    if (versionMajor > 0 || versionMinor > 10)
     {
      self.widthScalingEnabled = loader.readTaggedValue("WidthThicknessScaling","b");
     }
    else
     {
      self.widthScalingEnabled = false;
     }
   }

  this.save = function(writer)
   {
    writer.writeTagged("StemModel","s","Wings");
    writer.writeTagged("Width","f",self.width);
    writer.writeTagged("SectionCount","u",self.sectionCount);
    writer.writeTaggedSpline("Curvature",self.curvature);
    writer.writeTagged("Thickness","f",self.thickness);
    writer.writeTagged("WidthThicknessScaling","b",self.widthScalingEnabled);
   }
 }

CPL.Core.StemWings.prototype.createInstance = function(rng,parent,offset,orientation)
 {
  var localToWorldMatrix = parent.getWorldTransform();

  var instanceWidth     = this.width;
  var instanceThickness = this.thickness;

  if (this.widthScalingEnabled)
   {
    var scaleFactor = parent.lengthScaleFactor;

    instanceWidth     *= scaleFactor;
    instanceThickness *= scaleFactor;
   }

  return new CPL.Core.StemWingsInstance
              (this,this.parentStem,parent,
               instanceWidth,instanceThickness,orientation,
               localToWorldMatrix);
 }

CPL.Core.StemWings.load = function(loader,versionMajor,versionMinor,parentStem)
 {
  var stem = new CPL.Core.StemWings(parentStem);

  stem.load(loader,versionMajor,versionMinor);

  return stem;
 }

