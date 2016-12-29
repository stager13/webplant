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

CPL.Core.StemTubeInstance = function (stem,axis,length,radiusBase,lengthScaleFactor,localToWorldMatrix)
 {
  this.stem               = stem;
  this.axis               = axis;
  this.radiusBase         = radiusBase;
  this.length             = length;
  this.lengthScaleFactor  = lengthScaleFactor;
  this.localToWorldMatrix = localToWorldMatrix;

  this.getVAttrCount = function(attr)
   {
    if (attr == CPL.Core.ATTR_TEXCOORD0)
     {
      return (stem.axisResolution + 1) * (stem.crossResolution + 1);
     }
    else
     {
      return (stem.axisResolution + 1) * stem.crossResolution;
     }
   }

  this.fillVAttrBuffers = function(positions,normals,texCoords,bufferOffsets)
   {
    var topLevel     = stem.axisResolution;
    var colCount     = stem.crossResolution;
    var posOffset    = bufferOffsets.positions * 3;
    var normalOffset = bufferOffsets.normals   * 3;
    var uvOffset     = bufferOffsets.texCoords * 2;
    var transform    = localToWorldMatrix;
    var position     = new CPL.Core.Vector3(0.0,0.0,0.0);
    var normal       = new CPL.Core.Vector3(0.0,0.0,0.0);

    for (var currLevel = 0; currLevel <= topLevel; currLevel++)
     {
      var heightFraction = (topLevel - currLevel) / topLevel;
      var y      = this.length * heightFraction;
      var radius = this.radiusBase * stem.profile.getValue(heightFraction);
      var segOrientation = this.axis.getOrientationAtSegment(topLevel - currLevel);
      var centerPoint    = this.axis.getPointAt(heightFraction);

      for (var colIndex = 0; colIndex < colCount; colIndex++)
       {
        var angle = 2 * Math.PI / colCount * colIndex;

        var x = Math.sin(angle);
        var z = Math.cos(angle);

        position.set(x * radius,0,z * radius);

        segOrientation.rotateVectorInPlace(position);

        position.add(centerPoint);
        position.applyTransform(transform);

        positions[posOffset]     = position.v[0];
        positions[posOffset + 1] = position.v[1];
        positions[posOffset + 2] = position.v[2];

        posOffset += 3;

        normal.set(x,-stem.profile.getTangent(heightFraction),z);

        normal.normalize();

        segOrientation.rotateVectorInPlace(normal);
        normal.apply3x3SubTransform(transform);

        normal.normalize();

        normals[normalOffset]     = normal.v[0];
        normals[normalOffset + 1] = normal.v[1];
        normals[normalOffset + 2] = normal.v[2];

        normalOffset += 3;

        var texCoordV = heightFraction * stem.texScaleV;

        if (stem.texGenModeV == CPL.Core.TEXGEN_MODE_ABSOLUTE)
         {
          texCoordV = texCoordV * this.length / stem.axisResolution;
         }

        var texCoordU = colIndex / colCount * stem.texScaleU;

        texCoords[uvOffset]     = texCoordU;
        texCoords[uvOffset + 1] = texCoordV;

        if (colIndex + 1 == colCount)
         {
          texCoords[uvOffset + 2] = stem.texScaleU;
          texCoords[uvOffset + 3] = texCoordV;

          uvOffset += 2;
         }

        uvOffset += 2;
       }
     }
   }

  this.fillIndexBuffer = function(positionIndices,normalIndices,texCoordIndices,attrBufferOffsets,indexBufferOffset)
   {
    var primitiveCount  = this.getPrimitiveCount();
    var crossResolution = stem.crossResolution;

    for (var primitiveIndex = 0; primitiveIndex < primitiveCount; primitiveIndex++)
     {
      positionIndices[indexBufferOffset] = attrBufferOffsets.positions + primitiveIndex;
      positionIndices[indexBufferOffset + 1] = attrBufferOffsets.positions + primitiveIndex + crossResolution;
      positionIndices[indexBufferOffset + 2] = positionIndices[indexBufferOffset + 1] + 1;
      positionIndices[indexBufferOffset + 3] = positionIndices[indexBufferOffset] + 1;

      if ((primitiveIndex + 1) % crossResolution == 0)
       {
        positionIndices[indexBufferOffset + 2] -= crossResolution;
        positionIndices[indexBufferOffset + 3] -= crossResolution;
       }

      normalIndices[indexBufferOffset] = attrBufferOffsets.normals + primitiveIndex;
      normalIndices[indexBufferOffset + 1] = attrBufferOffsets.normals + primitiveIndex + crossResolution;
      normalIndices[indexBufferOffset + 2] = normalIndices[indexBufferOffset + 1] + 1;
      normalIndices[indexBufferOffset + 3] = normalIndices[indexBufferOffset] + 1;

      if ((primitiveIndex + 1) % crossResolution == 0)
       {
        normalIndices[indexBufferOffset + 2] -= crossResolution;
        normalIndices[indexBufferOffset + 3] -= crossResolution;
       }

      var level = Math.floor(primitiveIndex / crossResolution);

      texCoordIndices[indexBufferOffset] =
       attrBufferOffsets.texCoords + level * (crossResolution + 1) +
        (primitiveIndex % crossResolution);
      texCoordIndices[indexBufferOffset + 1] =
       texCoordIndices[indexBufferOffset] + crossResolution + 1;
      texCoordIndices[indexBufferOffset + 2] =
       texCoordIndices[indexBufferOffset + 1] + 1;
      texCoordIndices[indexBufferOffset + 3] =
       texCoordIndices[indexBufferOffset] + 1;

      indexBufferOffset += 4;
     }
   }

  this.getPrimitiveCount = function()
   {
    return stem.crossResolution * stem.axisResolution;
   }

  this.getPrimitiveType = function(primitiveIndex)
   {
    return CPL.Core.QUAD;
   }

  this.getVAttrCountI = function()
   {
    return (stem.crossResolution + 1) * (stem.axisResolution + 1);
   }

  this.getIndexCountI = function()
   {
    return stem.crossResolution * 6 * stem.axisResolution;
   }

  this.fillVAttrBuffersI = function(positions,normals,colors,texCoords,buffersOffset)
   {
    var topLevel   = stem.axisResolution;
    var colCount   = stem.crossResolution;
    var baseOffset = buffersOffset * 3;
    var uvOffset   = buffersOffset * 2;
    var transform  = localToWorldMatrix;
    var position   = new CPL.Core.Vector3(0.0,0.0,0.0);
    var currNormal = new CPL.Core.Vector3(0.0,0.0,0.0);
    var color      = stem.group.materialDef.color;
    var r          = color.r;
    var g          = color.g;
    var b          = color.b;

    for (var currLevel = 0; currLevel <= topLevel; currLevel++)
     {
      var heightFraction = (topLevel - currLevel) / topLevel;
      var y      = this.length * heightFraction;
      var radius = this.radiusBase * stem.profile.getValue(heightFraction);
      var segOrientation = this.axis.getOrientationAtSegment(topLevel - currLevel);
      var centerPoint    = this.axis.getPointAt(heightFraction);
      var texCoordV = heightFraction * stem.texScaleV;

      if (stem.texGenModeV == CPL.Core.TEXGEN_MODE_ABSOLUTE)
       {
        texCoordV = texCoordV * this.length / stem.axisResolution;
       }

      for (var colIndex = 0; colIndex < colCount; colIndex++)
       {
        var angle = 2 * Math.PI / colCount * colIndex;

        var x =  Math.cos(angle) * radius;
        var z = -Math.sin(angle) * radius;

        position.set(x,0,z);

        segOrientation.rotateVectorInPlace(position);

        currNormal.copyFrom(position);

        position.add(centerPoint);
        position.applyTransform(transform);

        positions[baseOffset]     = position.v[0];
        positions[baseOffset + 1] = position.v[1];
        positions[baseOffset + 2] = position.v[2];

        currNormal.normalize();

        currNormal.apply3x3SubTransform(transform);

        normals[baseOffset]     = currNormal.v[0];
        normals[baseOffset + 1] = currNormal.v[1];
        normals[baseOffset + 2] = currNormal.v[2];

        colors[baseOffset]     = r;
        colors[baseOffset + 1] = g;
        colors[baseOffset + 2] = b;

        var texCoordU = colIndex / colCount * stem.texScaleU;

        texCoords[uvOffset]     = texCoordU;
        texCoords[uvOffset + 1] = texCoordV;

        if (colIndex == 0)
         {
          var seamOffset = baseOffset + colCount * 3;

          positions[seamOffset]     = position.v[0];
          positions[seamOffset + 1] = position.v[1];
          positions[seamOffset + 2] = position.v[2];

          normals[seamOffset]     = currNormal.v[0];
          normals[seamOffset + 1] = currNormal.v[1];
          normals[seamOffset + 2] = currNormal.v[2];

          colors[seamOffset]     = r;
          colors[seamOffset + 1] = g;
          colors[seamOffset + 2] = b;

          texCoords[uvOffset + colCount * 2]     = stem.texScaleU;
          texCoords[uvOffset + colCount * 2 + 1] = texCoordV;
         }

        baseOffset += 3; //NOTE: this is used for attributes with 3 components
        uvOffset   += 2; //NOTE: this is used for attributes with 2 components
       }

      // skip seam vertex which was already filled inside loop
      baseOffset += 3;
      uvOffset   += 2;
     }
   }

  this.fillIndexBufferI = function(indices,attrBufferOffset,indexBufferOffset)
   {
    var topLevel        = stem.axisResolution;
    var crossResolution = stem.crossResolution;
    var faceCount       = crossResolution;

    for (var currLevel = 0; currLevel < topLevel; currLevel++)
     {
      var i1 = attrBufferOffset + currLevel * (crossResolution + 1);
      var i2 = i1 + crossResolution + 1;
      var i3 = i1 + 1;
      var i4 = i2 + 1;

      for (var faceIndex = 0; faceIndex < faceCount; faceIndex++)
       {
        indices[indexBufferOffset++] = i1;
        indices[indexBufferOffset++] = i2;
        indices[indexBufferOffset++] = i3;
        indices[indexBufferOffset++] = i3;
        indices[indexBufferOffset++] = i2;
        indices[indexBufferOffset++] = i4;

        i1++; i2++; i3++; i4++;
       }
     }
   }

  this.getRadiusAt = function(offset)
   {
    return this.radiusBase * this.stem.profile.getValue(offset);
   }

  this.getLength = function()
   {
    return this.length;
   }

  this.getAxisPointAt = function(offset)
   {
    return axis.getPointAt(offset);
   }

  this.getAxisOrientationAt = function(offset)
   {
    return axis.getOrientationAtPoint(offset);
   }

  this.getWorldTransform = function()
   {
    return localToWorldMatrix;
   }

  function applyPhototropismToSegment(newOrientation,currOrientation,
                                      targetVector,factor)
   {
    var segmentY = new CPL.Core.Vector3(0.0,1.0,0.0);

    currOrientation.rotateVectorInPlace(segmentY);

    var cosA = CPL.Core.Vector3.scalarProduct(targetVector,segmentY);

    if (cosA >= 1.0)
     {
      newOrientation.copyFrom(currOrientation);

      return;
     }

    var angle = Math.acos(cosA);

    var axis;

    if (angle >= Math.PI)
     {
      axis = new CPL.Core.Vector3(0.0,0.0,1.0);
     }
    else
     {
      axis = CPL.Core.Vector3.crossProduct(segmentY,targetVector);

      axis.normalize();
     }

    var rotation = CPL.Core.Quaternion.fromAxisAndAngle(axis.v[0],axis.v[1],axis.v[2],
                                               angle * factor);

    rotation.rotateVectorInPlace(segmentY);

    cosA = segmentY.v[1];

    if (cosA >= 1.0)
     {
      newOrientation.setIdentity();
     }
    else if (cosA <= -1.0)
     {
      newOrientation.q[0] = 0.0;
      newOrientation.q[1] = 0.0;
      newOrientation.q[2] = 1.0;
      newOrientation.q[3] = 0.0;
     }
    else
     {
      axis.v[0] = segmentY.v[2];
      axis.v[1] = 0.0;
      axis.v[2] = -segmentY.v[0];

      axis.normalize();

      newOrientation.setFromAxisAndAngle(axis.v[0],axis.v[1],axis.v[2],
                                         Math.acos(cosA));
     }
   }

  this.applyPhototropism = function()
   {
    var worldRotation = localToWorldMatrix.extract3x3();
    var yVector       = new CPL.Core.Vector3(0.0,1.0,0.0);

    worldRotation.transpose();
    worldRotation.multiplyVector(yVector);

    var segCount = this.axis.segCount;

    for (var segIndex = 0; segIndex < segCount - 1; segIndex++)
     {
      var factor;

      if (segCount > 2)
       {
        factor = this.stem.phototropism.getValue(segIndex / (segCount - 2));
       }
      else
       {
        factor = this.stem.phototropism.getValue(0.5);
       }

      factor = factor * 2.0 - 1.0;

      var segOrientation = CPL.Core.Quaternion.makeIdentity();

      if (factor < 0.0)
       {
        var yVectorNeg = new CPL.Core.Vector3(-yVector.v[0],-yVector.v[1],-yVector.v[2]);

        applyPhototropismToSegment
         (segOrientation,this.axis.getSegmentOrientation(segIndex),
          yVectorNeg,-factor);
       }
      else
       {
        applyPhototropismToSegment
         (segOrientation,this.axis.getSegmentOrientation(segIndex),
          yVector,factor);
       }

      this.axis.setSegmentOrientation(segIndex,segOrientation);

      segOrientation.rotateVectorInvInPlace(yVector);
     }
   }

  this.applyAxisVariation = function(rng,variationFactor)
   {
    if (rng == null)
     {
      return;
     }

    var segCount = this.axis.segCount;

    var q = CPL.Core.Quaternion.makeIdentity();

    for (var segIndex = 0; segIndex < segCount - 1; segIndex++)
     {
      var angle1 = rng.uniformFloat(0.0,Math.PI * 2.0);
      var angle2 = rng.uniformFloat(-variationFactor,variationFactor) * Math.PI;

      var angle1Sin = Math.sin(angle1);
      var angle1Cos = Math.cos(angle1);


      q.setFromAxisAndAngle(angle1Cos,0.0,angle1Sin,angle2);

      this.axis.setSegmentOrientation(segIndex,q);
     }
   }
 }

CPL.Core.StemTube = function ()
 {
  var self = this;

  reset();

  function reset ()
   {
    self.group           = null;
    self.axisResolution  = 5;
    self.crossResolution = 8;
    self.length          = 15.0;
    self.lengthV         = 0.0;
    self.axisVariation   = 0.0;
    self.radius          = 0.6;

    self.profile      = CPL.Core.Spline.makeLinear(1.0,0.0);
    self.lengthScale  = CPL.Core.Spline.makeLinear(1.0,0.0);
    self.phototropism = CPL.Core.Spline.makeConstant(0.5);

    self.texGenModeU = CPL.Core.TEXGEN_MODE_RELATIVE;
    self.texScaleU   = 1.0;
    self.texGenModeV = CPL.Core.TEXGEN_MODE_RELATIVE;
    self.texScaleV   = 1.0;
   }

  this.load = function(loader,versionMajor,versionMinor)
   {
    var args = [];

    reset();

    self.length  = loader.readTaggedValue("Length","f");
    self.lengthV = loader.readTaggedValue("LengthV","f");

    self.lengthScale = loader.readTaggedSpline("LengthOffsetDep");

    self.axisVariation  = loader.readTaggedValue("AxisVariation","f");
    self.axisResolution = loader.readTaggedValue("AxisResolution","u");

    self.radius = loader.readTaggedValue("ProfileScaleBase","f");

    self.profile = loader.readTaggedSpline("ProfileScaleCurve");

    self.crossResolution = loader.readTaggedValue("ProfileResolution","u");

    self.phototropism = loader.readTaggedSpline("PhototropismCurve");

    var texGenMode;

    texGenMode = loader.readTaggedValue("BaseTexUMode","u");

    if (texGenMode == CPL.Core.TEXGEN_MODE_ABSOLUTE ||
        texGenMode == CPL.Core.TEXGEN_MODE_RELATIVE)
     {
      self.texGenModeU = texGenMode;
     }
    else
     {
      throw new CPL.Core.Error(loader.formatErrorMessage("invalid U-texcoord mode (" + args[0] + ")"));
     }

    self.texScaleU = loader.readTaggedValue("BaseTexUScale","f");

    texGenMode = loader.readTaggedValue("BaseTexVMode","u");

    if (texGenMode == CPL.Core.TEXGEN_MODE_ABSOLUTE ||
        texGenMode == CPL.Core.TEXGEN_MODE_RELATIVE)
     {
      self.texGenModeV = texGenMode;
     }
    else
     {
      throw new CPL.Core.Error(loader.formatErrorMessage("invalid V-texcoord mode (" + args[0] + ")"));
     }

    self.texScaleV = loader.readTaggedValue("BaseTexVScale","f");
   }

  this.save = function(writer)
   {
    writer.writeTagged("StemModel","s","Tube");
    writer.writeTagged("Length","f",self.length);
    writer.writeTagged("LengthV","f",self.lengthV);
    writer.writeTaggedSpline("LengthOffsetDep",self.lengthScale);
    writer.writeTagged("AxisVariation","f",self.axisVariation);
    writer.writeTagged("AxisResolution","u",self.axisResolution);
    writer.writeTagged("ProfileScaleBase","f",self.radius);
    writer.writeTaggedSpline("ProfileScaleCurve",self.profile);
    writer.writeTagged("ProfileResolution","u",self.crossResolution);
    writer.writeTaggedSpline("PhototropismCurve",self.phototropism);
    writer.writeTagged("BaseTexUMode","u",self.texGenModeU);
    writer.writeTagged("BaseTexUScale","f",self.texScaleU);
    writer.writeTagged("BaseTexVMode","u",self.texGenModeV);
    writer.writeTagged("BaseTexVScale","f",self.texScaleV);
   }
 }

CPL.Core.StemTube.prototype.createInstance = function(rng,parent,offset,orientation)
 {
  var radiusBase     = this.radius;
  var instanceLength = this.length;

  var localToWorldMatrix;
  var lengthScaleFactor;

  if (parent != null)
   {
    var offsetY = offset.v[1];

    radiusBase *= parent.getRadiusAt(offsetY);

    var parentOrientation = parent.getAxisOrientationAt(offsetY);
    var parentAxisPos     = parent.getAxisPointAt(offsetY);
    var parentTransform   = parent.getWorldTransform();

    var instanceOrientation = CPL.Core.Quaternion.crossProduct(parentOrientation,orientation);

    var translationTransform = CPL.Core.Matrix4x4.makeTranslation
                                (parentAxisPos.v[0],
                                 parentAxisPos.v[1],
                                 parentAxisPos.v[2]);

    localToWorldMatrix = CPL.Core.Matrix4x4.multiply(parentTransform,
                                            CPL.Core.Matrix4x4.multiply
                                             (translationTransform,
                                              instanceOrientation.asMatrix4x4()));

    lengthScaleFactor = this.lengthScale.getValue(offsetY);
    instanceLength *= parent.getLength() * lengthScaleFactor;
   }
  else
   {
    // trunk and BranchingAlgBase is used

    lengthScaleFactor  = 1.0;
    localToWorldMatrix = CPL.Core.BranchingAlgBase.makeBranchWorldMatrix
                          (offset,orientation);
   }

  if (rng != null)
   {
    instanceLength += rng.uniformFloat(-this.lengthV,this.lengthV) * instanceLength;
   }

  var line = new CPL.Core.SegmentedLine(instanceLength,this.axisResolution);

  var instance = new CPL.Core.StemTubeInstance(this,line,instanceLength,radiusBase,lengthScaleFactor,localToWorldMatrix);

  instance.applyAxisVariation(rng,this.axisVariation);
  instance.applyPhototropism();

  return instance;
 }

CPL.Core.StemTube.load = function(loader,versionMajor,versionMinor)
 {
  var stem = new CPL.Core.StemTube();

  stem.load(loader,versionMajor,versionMinor);

  return stem;
 }

