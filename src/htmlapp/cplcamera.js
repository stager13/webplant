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

function Camera()
 {
  this.center    = new CPL.Core.Vector3(0.0,0.0,0.0);
  this.direction = new CPL.Core.Quaternion(0.0,0.0,0.0,1.0);
  this.distance  = -30.0;
 }

Camera.prototype.setCenter = function(x,y,z)
 {
  this.center.v[0] = x;
  this.center.v[1] = y;
  this.center.v[2] = z;
 }

Camera.prototype.setDirection = function(x,y,z,w)
 {
  this.direction.q[0] = x;
  this.direction.q[1] = y;
  this.direction.q[2] = z;
  this.direction.q[3] = w;
 }

Camera.prototype.setDistance = function(distance)
 {
  this.distance = -distance;
 }

Camera.prototype.getTransformToCameraSpace = function()
 {
  var distanceMatrix = CPL.Core.Matrix4x4.makeTranslation(0.0,0.0,this.distance);
  var rotationMatrix = this.direction.asMatrix4x4();
  var resultMatrix   = CPL.Core.Matrix4x4.multiply(distanceMatrix,rotationMatrix);

  resultMatrix.translate
   (this.center.v[0],this.center.v[1],this.center.v[2]);

  return resultMatrix;
 }

Camera.prototype.rotateInCameraSpace = function(angle,x,y,z)
 {
  var rotation = CPL.Core.Quaternion.fromAxisAndAngle(x,y,z,angle);

  this.direction = CPL.Core.Quaternion.crossProduct(rotation,this.direction);

  this.direction.normalize();
 }

Camera.prototype.rotateInWorldSpace = function(angle,x,y,z)
 {
  var v = new CPL.Core.Vector3(x,y,z);

  this.direction.rotateVectorInPlace(v);

  this.rotateInCameraSpace(angle,v.v[0],v.v[1],v.v[2]);
 }

Camera.prototype.centerMoveInCameraSpace = function(x,y,z)
 {
  var v = new CPL.Core.Vector3(x,y,z);

  this.direction.rotateVectorInvInPlace(v);

  this.center.add(v);
 }

