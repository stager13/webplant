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

CPL.Core.BranchingAlgTube = function()
 {
  var self = this;

  reset();

  function reset ()
   {
    self.density       = 5.0;
    self.densityV      = 0.0;
    self.minNumber     = 0;
    self.maxNumber     = 0;
    self.multiplicity  = 1;
    self.startRevAngle = 0.0;
    self.revAngle      = 80.0 * Math.PI / 180.0;
    self.revAngleV     = 0.0;
    self.minOffset     = 0.15;
    self.maxOffset     = 1.0;
    self.rotation      = 0.0;

    self.declinationSpline = CPL.Core.Spline.makeConstant(0.3);
    self.declinationV = 0.0;
   }

  this.getBranchGenerator = function(rng,parent,stem)
   {
    var currRevAngle = self.startRevAngle;
    var branchRegionLength = parent.getLength() * (self.maxOffset - self.minOffset);

    if (branchRegionLength <= 0.0)
     {
      return function() { return null; };
     }

    var multRevAngleStep = 2.0 * Math.PI / self.multiplicity;

    var branchDeclination = CPL.Core.Quaternion.makeIdentity();
    var branchRevolution  = CPL.Core.Quaternion.makeIdentity();
    var branchRotation    = CPL.Core.Quaternion.makeIdentity();

    var offsetVector = new CPL.Core.Vector3(0.0,0.0,0.0);

    var branchIndex = 0;
    var multIndex   = 0;

    var branchCount;
    var offsetStep;
    var currOffset;

    return function()
     {
      if (branchCount === undefined)
       {
        if (rng != null)
         {
          branchCount = Math.floor(branchRegionLength * self.density * (1.0 + rng.uniformFloat(-self.densityV,self.densityV)));
         }
        else
         {
          branchCount = Math.floor(branchRegionLength * self.density);
         }

        branchCount = Math.floor(branchCount / self.multiplicity);

        if (branchCount < self.minNumber)
         {
          branchCount = self.minNumber;
         }

        if (self.maxNumber > 0 && branchCount > self.maxNumber)
         {
          branchCount = self.maxNumber;
         }

        if (branchCount < 1)
         {
          return null;
         }

        offsetStep = (self.maxOffset - self.minOffset) / (branchCount + 1);
        currOffset = self.minOffset + offsetStep;
       }

      if (multIndex >= self.multiplicity)
       {
        currRevAngle += self.revAngle;

        if (rng != null)
         {
          currRevAngle += self.revAngle * rng.uniformFloat(-self.revAngleV,self.revAngleV);
         }

        currOffset += offsetStep;

        multIndex = 0;

        branchIndex++;
       }

      if (branchIndex >= branchCount)
       {
        return null;
       }

      var baseDeclination = self.declinationSpline.getValue(currOffset);

      if (rng != null)
       {
        baseDeclination += baseDeclination * rng.uniformFloat(-self.declinationV,self.declinationV);
       }

      branchDeclination.setFromAxisAndAngle
       (0.0,0.0,-1.0,Math.PI * baseDeclination);

      branchRevolution.setFromAxisAndAngle
       (0.0,1.0,0.0,currRevAngle + multRevAngleStep * multIndex);

      branchRotation.setFromAxisAndAngle
       (0.0,1.0,0.0,self.rotation);

      var intermediateRotation =
       CPL.Core.Quaternion.crossProduct(branchRevolution,branchDeclination);

      var orientation =
       CPL.Core.Quaternion.crossProduct(intermediateRotation,branchRotation);

      offsetVector.v[1] = currOffset;

      var branch = stem.createInstance(rng,parent,offsetVector,orientation);

      multIndex++;

      return branch;
     };
   }

  this.forEachBranch = function(rng,parent,stem,fn)
   {
    var currRevAngle = this.startRevAngle;
    var branchRegionLength = parent.getLength() * (this.maxOffset - this.minOffset);

    if (branchRegionLength <= 0.0)
     {
      return;
     }

    var branchCount;

    if (rng != null)
     {
      branchCount = Math.floor(branchRegionLength * this.density * (1.0 + rng.uniformFloat(-this.densityV,this.densityV)));
     }
    else
     {
      branchCount = Math.floor(branchRegionLength * this.density);
     }

    branchCount = Math.floor(branchCount / this.multiplicity);

    if (branchCount < this.minNumber)
     {
      branchCount = this.minNumber;
     }

    if (this.maxNumber > 0 && branchCount > this.maxNumber)
     {
      branchCount = this.maxNumber;
     }

    if (branchCount < 1)
     {
      return;
     }

    var offsetStep = (this.maxOffset - this.minOffset) / (branchCount + 1);
    var currOffset = this.minOffset + offsetStep;
    var multRevAngleStep = 2.0 * Math.PI / this.multiplicity;

    var branchDeclination = CPL.Core.Quaternion.makeIdentity();
    var branchRevolution  = CPL.Core.Quaternion.makeIdentity();
    var branchRotation    = CPL.Core.Quaternion.makeIdentity();

    var offsetVector = new CPL.Core.Vector3(0.0,0.0,0.0);

    for (var i = 0; i < branchCount; i++)
     {
      for (var multIndex = 0; multIndex < this.multiplicity; multIndex++)
       {
        var baseDeclination = this.declinationSpline.getValue(currOffset);

        if (rng != null)
         {
          baseDeclination += baseDeclination * rng.uniformFloat(-this.declinationV,this.declinationV);
         }

        branchDeclination.setFromAxisAndAngle
         (0.0,0.0,-1.0,Math.PI * baseDeclination);

        branchRevolution.setFromAxisAndAngle
         (0.0,1.0,0.0,currRevAngle + multRevAngleStep * multIndex);

        branchRotation.setFromAxisAndAngle
         (0.0,1.0,0.0,this.rotation);

        var intermediateRotation =
         CPL.Core.Quaternion.crossProduct(branchRevolution,branchDeclination);

        var orientation =
         CPL.Core.Quaternion.crossProduct(intermediateRotation,branchRotation);

        offsetVector.v[1] = currOffset;

        var branch = stem.createInstance(rng,parent,offsetVector,orientation);

        fn(branch);
       }

      currRevAngle += this.revAngle;

      if (rng != null)
       {
        currRevAngle += this.revAngle * rng.uniformFloat(-this.revAngleV,this.revAngleV);
       }

      currOffset += offsetStep;
     }
   }

  this.load = function(loader,versionMajor,versionMinor)
   {
    reset();

    self.density   = loader.readTaggedValue("Density","f");
    self.densityV  = loader.readTaggedValue("DensityV","f");

    if (versionMajor > 0 || versionMinor > 5)
     {
      self.minNumber = loader.readTaggedValue("MinNumber","u");

      var maxLimitEnabled = loader.readTaggedValue("MaxLimitEnabled","b");

      self.maxNumber = loader.readTaggedValue("MaxNumber","u");

      if (!maxLimitEnabled)
       {
        self.maxNumber = 0;
       }
     }
    else
     {
      self.minNumber = 0;
      self.maxNumber = 0;
     }

    if (versionMajor > 0 || versionMinor > 1)
     {
      self.multiplicity  = loader.readTaggedValue("Multiplicity","u");
     }
    else
     {
      self.multiplicity  = 1;
     }

    if (versionMajor > 0 || versionMinor > 7)
     {
      self.startRevAngle = loader.readTaggedValue("StartRevAngle","f");
     }
    else
     {
      self.startRevAngle = 0.0;
     }

    self.revAngle  = loader.readTaggedValue("RevAngle","f");
    self.revAngleV = loader.readTaggedValue("RevAngleV","f");
    self.rotation  = loader.readTaggedValue("RotAngle","f");
    self.minOffset = loader.readTaggedValue("MinOffset","f");
    self.maxOffset = loader.readTaggedValue("MaxOffset","f");

    self.declinationSpline  = loader.readTaggedSpline("DeclinationCurve");
    self.declinationV       = loader.readTaggedValue("DeclinationV","f");
   }

  this.save = function(writer)
   {
    writer.writeTagged("BranchingAlg","s","Std");
    writer.writeTagged("Density","f",self.density);
    writer.writeTagged("DensityV","f",self.densityV);
    writer.writeTagged("MinNumber","u",self.minNumber);
    writer.writeTagged("MaxLimitEnabled","b",self.maxNumber > 0);
    writer.writeTagged("MaxNumber","u",self.maxNumber);
    writer.writeTagged("Multiplicity","u",self.multiplicity);
    writer.writeTagged("StartRevAngle","f",self.startRevAngle);
    writer.writeTagged("RevAngle","f",self.revAngle);
    writer.writeTagged("RevAngleV","f",self.revAngleV);
    writer.writeTagged("RotAngle","f",self.rotation);
    writer.writeTagged("MinOffset","f",self.minOffset);
    writer.writeTagged("MaxOffset","f",self.maxOffset);
    writer.writeTaggedSpline("DeclinationCurve",self.declinationSpline);
    writer.writeTagged("DeclinationV","f",self.declinationV);
   }
 }

CPL.Core.BranchingAlgTube.load = function(loader,versionMajor,versionMinor)
 {
  var balg = new CPL.Core.BranchingAlgTube();

  balg.load(loader,versionMajor,versionMinor);

  return balg;
 }

