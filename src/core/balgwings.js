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

CPL.Core.BranchingAlgWings = function()
 {
  var self = this;

  reset();

  function reset ()
   {
    self.rotation  = 0.0;
   }

  this.getBranchGenerator = function(rng,parent,stem)
   {
    var orientation = CPL.Core.Quaternion.fromAxisAndAngle(0.0,1.0,0.0,self.rotation);

    var branchIndex = 0;

    return function()
     {
      if (branchIndex == 0)
       {
        branchIndex = 1;

        return stem.createInstance(rng,parent,null,orientation);
       }
      else
       {
        return null;
       }
     }
   }

  this.forEachBranch = function(rng,parent,stem,fn)
   {
    var orientation = CPL.Core.Quaternion.fromAxisAndAngle(0.0,1.0,0.0,self.rotation);
    var branch      = stem.createInstance(rng,parent,null,orientation);

    fn(branch);
   }

  this.load = function(loader,versionMajor,versionMinor)
   {
    reset();

    self.rotation = loader.readTaggedValue("RotAngle","f");
   }

  this.save = function(writer)
   {
    writer.writeTagged("BranchingAlg","s","Wings");
    writer.writeTagged("RotAngle","f",self.rotation);
   }
 }

CPL.Core.BranchingAlgWings.load = function(loader,versionMajor,versionMinor)
 {
  var balg = new CPL.Core.BranchingAlgWings();

  balg.load(loader,versionMajor,versionMinor);

  return balg;
 }

