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

CPL.Core.BranchingAlgBase = function()
 {
  var self = this;

  reset();

  function reset ()
   {
    self.shape     = CPL.Core.SHAPE_SQUARE;
    self.spread    = 0.0;
    self.density   = 1.0;
    self.densityV  = 0.0;
    self.minNumber = 1;
    self.maxNumber = 1;

    self.declFactor  = 0.0;
    self.declFactorV = 0.0;

    self.rotation = 0.0;
   }

  function calcBranchCount(rng)
   {
    var spread      = self.spread;
    var branchCount = 0;

    if (spread >= CPL.Core.EPSILON)
     {
      var area = spread * spread;

      if (rng)
       {
        branchCount = Math.floor(area * (1.0 + rng.uniformFloat(-self.densityV,self.densityV)) * self.density);
       }
      else
       {
        branchCount = Math.floor(area * self.density);
       }
     }

    if (branchCount < self.minNumber)
     {
      branchCount = self.minNumber;
     }

    if (self.maxNumber > 0 && branchCount > self.maxNumber)
     {
      branchCount = self.maxNumber;
     }

    return branchCount;
   }

  function isPointInsideCircle(x,y,radius)
   {
    return x * x + y * y <= radius * radius;
   }

  function genOffsetSquare(rng)
   {
    var halfSpread = self.spread * 0.5;

    return new CPL.Core.Vector3
                (rng.uniformFloat(-halfSpread,halfSpread),
                 0.0,
                 rng.uniformFloat(-halfSpread,halfSpread));
   }

  function genOffsetCircle(rng)
   {
    var MAX_RETRIES  = 100;
    var counter      = 0;
    var insideCircle = false;
    var halfSpread   = self.spread * 0.5;
    var offset;

    while (!insideCircle && counter < MAX_RETRIES)
     {
      offset = genOffsetSquare(rng);

      insideCircle = isPointInsideCircle(offset.v[0],offset.v[2],halfSpread);

      counter++;
     }

    if (!insideCircle)
     {
      offset.set(0.0,0.0,0.0);
     }

    return offset;
   }

  function genBranchOffset(rng)
   {
    if (self.spread >= CPL.Core.EPSILON && rng)
     {
      if (self.shape == CPL.Core.SHAPE_CIRCLE)
       {
        return genOffsetCircle(rng);
       }
      else
       {
        return genOffsetSquare(rng);
       }
     }
    else
     {
      return new CPL.Core.Vector3(0.0,0.0,0.0);
     }
   }

  function calcBranchOrientationInCircleShape(x,z,rng)
   {
    var xAxisVsPointAngle = Math.atan2(x,z);

    var rotation1 = CPL.Core.Quaternion.fromAxisAndAngle(0.0,1.0,0.0,xAxisVsPointAngle);
    var rotation2 = CPL.Core.Quaternion.fromAxisAndAngle(0.0,1.0,0.0,self.rotation);

    var spread = self.spread;

    var squaredRadius = spread * spread * 0.25;
    var normDistance;

    if (squaredRadius >= CPL.Core.EPSILON)
     {
      normDistance = Math.sqrt((x * x + z * z) / squaredRadius)
     }
    else
     {
      normDistance = 0.0;
     }

    if (rng)
     {
      normDistance += rng.uniformFloat(-self.declFactorV,self.declFactorV);
     }

    var halfPI = Math.PI * 0.5;

    var declAngle = normDistance * self.declFactor * halfPI;

    if (declAngle < -halfPI)
     {
      declAngle = -halfPI;
     }
    else if (declAngle > halfPI)
     {
      declAngle = halfPI;
     }

    var declination = CPL.Core.Quaternion.fromAxisAndAngle(1.0,0.0,0.0,declAngle);

    var temp = CPL.Core.Quaternion.crossProduct(rotation1,declination);

    return CPL.Core.Quaternion.crossProduct(temp,rotation2);
   }

  this.getBranchGenerator = function(rng,parent,stem)
   {
    var orientation;

    if (self.shape == CPL.Core.SHAPE_SQUARE)
     {
      orientation = CPL.Core.Quaternion.fromAxisAndAngle(0.0,1.0,0.0,self.rotation);
     }

    var branchCount = calcBranchCount(rng);
    var branchIndex = 0;

    return function()
     {
      if (branchIndex < branchCount)
       {
        branchIndex++;

        var offset = genBranchOffset(rng);

        if (self.shape == CPL.Core.SHAPE_CIRCLE)
         {
          orientation = calcBranchOrientationInCircleShape
                         (offset.v[0],offset.v[2],rng);
         }

        return stem.createInstance(rng,parent,offset,orientation);
       }
      else
       {
        return null;
       }
     }
   }

  this.forEachBranch = function(rng,parent,stem,fn)
   {
    var orientation;

    if (self.shape == CPL.Core.SHAPE_SQUARE)
     {
      orientation = CPL.Core.Quaternion.fromAxisAndAngle(0.0,1.0,0.0,self.rotation);
     }

    var branchCount = calcBranchCount(rng);

    for (var branchIndex = 0; branchIndex < branchCount; branchIndex++)
     {
      var offset = genBranchOffset(rng);

      if (self.shape == CPL.Core.SHAPE_CIRCLE)
       {
        orientation = calcBranchOrientationInCircleShape
                       (offset.v[0],offset.v[2],rng);
       }

      var branch = stem.createInstance(rng,parent,offset,orientation);

      fn(branch);
     }
   }

  this.load = function(loader,versionMajor,versionMinor)
   {
    reset();

    if (versionMajor > 0 || versionMinor > 11)
     {
      self.shape     = loader.readTaggedValue("Shape","u");
      self.spread    = loader.readTaggedValue("Spread","f");
      self.density   = loader.readTaggedValue("Density","f");
      self.densityV  = loader.readTaggedValue("DensityV","f");
      self.minNumber = loader.readTaggedValue("MinNumber","u");

      var maxLimitEnabled = loader.readTaggedValue("MaxLimitEnabled","b");

      self.maxNumber = loader.readTaggedValue("MaxNumber","u");

      if (!maxLimitEnabled)
       {
        self.maxNumber = 0;
       }

      self.declFactor  = loader.readTaggedValue("DeclFactor","f");
      self.declFactorV = loader.readTaggedValue("DeclFactorV","f");
     }

    self.rotation = loader.readTaggedValue("RotAngle","f");
   }

  this.save = function(writer)
   {
    writer.writeTagged("BranchingAlg","s","Base");
    writer.writeTagged("Shape","u",self.shape);
    writer.writeTagged("Spread","f",self.spread);
    writer.writeTagged("Density","f",self.density);
    writer.writeTagged("DensityV","f",self.densityV);
    writer.writeTagged("MinNumber","u",self.minNumber);
    writer.writeTagged("MaxLimitEnabled","b",self.maxNumber > 0);
    writer.writeTagged("MaxNumber","u",self.maxNumber);
    writer.writeTagged("DeclFactor","f",self.declFactor);
    writer.writeTagged("DeclFactorV","f",self.declFactorV);
    writer.writeTagged("RotAngle","f",self.rotation);
   }
 }

CPL.Core.BranchingAlgBase.makeBranchWorldMatrix = function(offset,orientation)
 {
  var orientationMatrix = orientation.asMatrix4x4();
  var translationMatrix = CPL.Core.Matrix4x4.makeTranslation(offset.v[0],offset.v[1],offset.v[2]);

  return CPL.Core.Matrix4x4.multiply(translationMatrix,orientationMatrix);
 }

CPL.Core.BranchingAlgBase.load = function(loader,versionMajor,versionMinor)
 {
  var balg = new CPL.Core.BranchingAlgBase();

  balg.load(loader,versionMajor,versionMinor);

  return balg;
 }

