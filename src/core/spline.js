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

CPL.Core.Spline = function ()
 {
  var maxPoints = 32;

  this.pointsX     = new Array(maxPoints);
  this.pointsY     = new Array(maxPoints);
  this.pointsY2    = new Array(maxPoints);
  this.pointsCount = 0;
 }

CPL.Core.Spline.makeConstant = function(value)
 {
  return CPL.Core.Spline.makeLinear(value,value);
 }

CPL.Core.Spline.makeLinear = function(a,b)
 {
  var spline = new CPL.Core.Spline();

  spline.pointsX[0] = 0.0;
  spline.pointsY[0] = a;
  spline.pointsX[1] = 1.0;
  spline.pointsY[1] = b;

  spline.pointsY2[0] = 0.0;
  spline.pointsY2[1] = 0.0;

  spline.pointsCount = 2;

  return spline;
 }

CPL.Core.Spline.prototype.copyFrom = function(srcSpline)
 {
  var pointsCount = srcSpline.pointsCount;

  var srcPointsX  = srcSpline.pointsX;
  var srcPointsY  = srcSpline.pointsY;
  var srcPointsY2 = srcSpline.pointsY2;
  var dstPointsX  = this.pointsX;
  var dstPointsY  = this.pointsY;
  var dstPointsY2 = this.pointsY2;

  this.pointsCount = pointsCount;

  for (var i = 0; i < pointsCount; i++)
   {
    dstPointsX[i]  = srcPointsX[i];
    dstPointsY[i]  = srcPointsY[i];
    dstPointsY2[i] = srcPointsY2[i];
   }
 }

CPL.Core.Spline.prototype.clone = function()
 {
  var spline = new CPL.Core.Spline();

  spline.copyFrom(this);

  return spline;
 }

CPL.Core.Spline.prototype.toString = function()
 {
  var s = "Spline[";

  for (var i = 0; i < this.pointsCount; i++)
   {
    s += "(" + this.pointsX[i] + "," + this.pointsY[i] + ")";
   }

  s += "]";

  return s;
 }

CPL.Core.Spline.prototype.getPointX = function(pointIndex)
 {
  return this.pointsX[pointIndex];
 }

CPL.Core.Spline.prototype.getPointY = function(pointIndex)
 {
  return this.pointsY[pointIndex];
 }

CPL.Core.Spline.prototype.getValue = function(x)
 {
  var pointsCount = this.pointsCount;

  if      (pointsCount == 0)
   {
    return 0.0;
   }
  else if (pointsCount == 1)
   {
    return this.pointsY[0];
   }
  else if (pointsCount == 2)
   {
    return this.pointsY[0] +
            (x - this.pointsX[0]) * (this.pointsY[1] - this.pointsY[0]) /
             (this.pointsX[1] - this.pointsX[0]);
   }

  var base    = 0;
  var pointsX = this.pointsX;
  var pointsY = this.pointsY;

  while (base < pointsCount && pointsX[base] < x)
   {
    base++;
   }

  if (base == 0)
   {
    return pointsY[0];
   }
  else if (base == pointsCount)
   {
    return pointsY[pointsCount - 1];
   }

  var pointsY2 = this.pointsY2;

  var h = pointsX[base] - pointsX[base - 1];
  var a = (pointsX[base] - x) / h;
  var b = (x - pointsX[base - 1]) / h;

  return a * pointsY[base - 1] +
         b * pointsY[base] +
         ((a * a * a - a) * pointsY2[base - 1] +
          (b * b * b - b) * pointsY2[base]) * h * h / 6.0;
 }

CPL.Core.Spline.prototype.getTangent = function(x)
 {
  var pointsCount = this.pointsCount;

  if      (pointsCount < 2)
   {
    return 0.0;
   }

  var base    = 0;
  var pointsX = this.pointsX;
  var pointsY = this.pointsY;

  while (base < pointsCount && pointsX[base] < x)
   {
    base++;
   }

  if (base == 0)
   {
    base = 1;
   }
  else if (base == pointsCount)
   {
    base = pointsCount - 1;
   }

  var pointsY2 = this.pointsY2;

  var h = pointsX[base] - pointsX[base - 1];
  var a = (pointsX[base] - x) / h;
  var b = (x - pointsX[base - 1]) / h;

  return (pointsY[base] - pointsY[base - 1]) / h -
         (3.0 * a * a - 1.0) * h * pointsY2[base - 1] / 6.0 +
         (3.0 * b * b - 1.0) * h * pointsY2[base] / 6.0;
 }

CPL.Core.Spline.prototype.recalcY2 = function()
 {
  var pointsCount = this.pointsCount;
  var pointsX     = this.pointsX;
  var pointsY     = this.pointsY;
  var pointsY2    = this.pointsY2;

  var u = new Float32Array(pointsCount - 1);

  pointsY2[0] = 0;
  u[0]        = 0;

  var sig,p;

  for (var i = 1; i < pointsCount - 1; i++)
   {
    sig = (pointsX[i] - pointsX[i - 1]) / (pointsX[i + 1] - pointsX[i - 1]);
    p   = sig * pointsY2[i - 1] + 2.0;
    pointsY2[i] = (sig - 1.0) / p;

    var temp = (pointsY[i + 1] - pointsY[i]) / (pointsX[i + 1] - pointsX[i]) -
               (pointsY[i] - pointsY[i - 1]) / (pointsX[i] - pointsX[i - 1]);

    u[i] = (6.0 * temp / (pointsX[i + 1] - pointsX[i - 1]) - sig * u[i - 1]) / p;
   }

  var qn = 0;
  var un = 0;

  pointsY2[pointsCount - 1] = (un - qn * u[pointsCount - 2]) /
                               (qn * pointsY2[pointsCount - 2] + 1.0);

  for (var k = pointsCount - 2; k >= 0; k--)
   {
    pointsY2[k] = pointsY2[k] * pointsY2[k + 1] + u[k];
   }
 }

CPL.Core.Spline.prototype.addPoint = function(x,y)
 {
  var pointsCount = this.pointsCount;

  var base    = 0;
  var pointsX = this.pointsX;
  var pointsY = this.pointsY;

  while (base < pointsCount && pointsX[base] < x)
   {
    base++;
   }

  if (base < pointsCount)
   {
    for (var i = pointsCount; i > base; i--)
     {
      pointsX[i] = pointsX[i - 1];
      pointsY[i] = pointsY[i - 1];
     }
   }

  pointsX[base] = x;
  pointsY[base] = y;

  this.pointsCount++;

  if (this.pointsCount > 1)
   {
    this.recalcY2();
   }
  else
   {
    this.pointsY2[0] = 0.0;
    this.pointsY2[1] = 0.0;
   }
 }

CPL.Core.Spline.prototype.delPoint = function(pointIndex)
 {
  var pointsCount = this.pointsCount;
  var pointsX = this.pointsX;
  var pointsY = this.pointsY;

  if (pointIndex < pointsCount)
   {
    for (var i = pointIndex + 1; i < pointsCount; i++)
     {
      pointsX[i - 1] = pointsX[i];
      pointsY[i - 1] = pointsY[i];
     }

    this.pointsCount--;

    if (this.pointsCount > 1)
     {
      this.recalcY2();
     }
   }
 }

CPL.Core.Spline.prototype.updatePoint = function(x,y,pointIndex)
 {
  if (pointIndex < this.pointsCount)
   {
    this.pointsX[pointIndex] = x;
    this.pointsY[pointIndex] = y;

    if (this.pointsCount > 1)
     {
      this.recalcY2();
     }
   }
 }

