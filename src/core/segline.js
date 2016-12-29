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

CPL.Core.SegmentedLine = function(length,segmentCount)
 {
  this.length   = length;
  this.segCount = segmentCount;

  var segQuats;

  if (segmentCount > 1)
   {
    segQuats = new Array(segmentCount - 1);

    for (var i = 0; i < (segmentCount - 1); i++)
     {
      segQuats[i] = CPL.Core.Quaternion.makeIdentity();
     }
   }
  else
   {
    segQuats = null;
   }

  this.segQuats = segQuats;
 }

CPL.Core.SegmentedLine.prototype.getPointAt = function(offset)
 {
  var segCount = this.segCount;
  var segIndex = Math.floor(offset * segCount);

  if (segIndex >= segCount)
   {
    segIndex = segCount - 1;
   }

  var segLength = this.length / segCount;
  var point     = new CPL.Core.Vector3(0.0,this.length * offset - segIndex * segLength,0.0);
  var segQuats  = this.segQuats;

  while (segIndex > 0)
   {
    segIndex--;

    segQuats[segIndex].rotateVectorInPlace(point);

    point.v[1] += segLength;
   }

  return point;
 }

CPL.Core.SegmentedLine.prototype.getOrientationAtPoint = function(offset)
 {
  var segCount    = this.segCount;
  var segIndex    = Math.floor(offset * this.segCount);
  var segQuats    = this.segQuats;

  if (segIndex >= segCount)
   {
    segIndex = segCount - 1;
   }

  var segFraction = (offset - segIndex / segCount) * segCount;

  var next;
  var prev;

  if (segIndex == segCount - 1)
   {
    next = CPL.Core.Quaternion.IDENTITY;
   }
  else
   {
    next = segQuats[segIndex].clone();

    next.toPower(0.5);
    next.normalize();
   }

  if (segIndex == 0)
   {
    prev = CPL.Core.Quaternion.IDENTITY;
   }
  else
   {
    prev = segQuats[segIndex - 1].clone();

    prev.conjugate();
    prev.toPower(0.5);
    prev.normalize();
   }

  var orientation = CPL.Core.Quaternion.slerp(prev,next,segFraction);

  orientation.normalize();

  while (segIndex > 0)
   {
    orientation = CPL.Core.Quaternion.crossProduct(segQuats[segIndex - 1],orientation);

    segIndex--;
   }

  return orientation;
 }

CPL.Core.SegmentedLine.prototype.getOrientationAtSegment = function(segIndex)
 {
  var segCount = this.segCount;
  var segQuats = this.segQuats;

  if (segIndex > 0 && segIndex <= segCount)
   {
    var orientation = CPL.Core.Quaternion.IDENTITY;

    for (var i = 0; i < segIndex - 1; i++)
     {
      orientation = CPL.Core.Quaternion.crossProduct(orientation,segQuats[i]);
     }

    if (segIndex < segCount)
     {
      segIndex--;

      var last = segQuats[segIndex].clone();

      last.toPower(0.5);
      last.normalize();

      orientation = CPL.Core.Quaternion.crossProduct(orientation,last);
     }
   }
  else
   {
    orientation = CPL.Core.Quaternion.makeIdentity();
   }

  return orientation;
 }

CPL.Core.SegmentedLine.prototype.getSegmentOrientation = function(segIndex)
 {
  return this.segQuats[segIndex];
 }

CPL.Core.SegmentedLine.prototype.setSegmentOrientation = function(segIndex,orientation)
 {
  this.segQuats[segIndex].copyFrom(orientation);
 }

