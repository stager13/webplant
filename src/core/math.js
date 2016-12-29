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

CPL.Core.EPSILON = 0.000001;

CPL.Core.Vector3 = function(x,y,z)
 {
  this.v = new Float32Array([x,y,z]);
 }

CPL.Core.Vector3.prototype.toString = function()
 {
  return "(" + this.v[0] + "," + this.v[1] + "," + this.v[2] + ")";
 }

CPL.Core.Vector3.prototype.length = function()
 {
  var v = this.v;

  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
 }

CPL.Core.Vector3.prototype.normalize = function()
 {
  var v = this.v;
  var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] );

  v[0] = v[0] / l; v[1] = v[1] / l; v[2] = v[2] / l;
 }

CPL.Core.Vector3.prototype.copyFrom = function(source)
 {
  var vSrc = source.v;
  var vDst = this.v;

  vDst[0] = vSrc[0]; vDst[1] = vSrc[1]; vDst[2] = vSrc[2];
 }

CPL.Core.Vector3.prototype.set = function(x,y,z)
 {
  this.v[0] = x;
  this.v[1] = y;
  this.v[2] = z;
 }

CPL.Core.Vector3.prototype.add = function(other)
 {
  this.v[0] += other.v[0];
  this.v[1] += other.v[1];
  this.v[2] += other.v[2];
 }

CPL.Core.Vector3.prototype.applyTransform = function(matrix)
 {
  var m = matrix.m;
  var v = this.v;

  var x = m[0] * v[0] + m[4] * v[1] + m[8]  * v[2] + m[12];
  var y = m[1] * v[0] + m[5] * v[1] + m[9]  * v[2] + m[13];
  var z = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];

  v[0] = x; v[1] = y; v[2] = z;
 }

CPL.Core.Vector3.prototype.apply3x3SubTransform = function(matrix)
 {
  var m = matrix.m;
  var v = this.v;

  var x = m[0] * v[0] + m[4] * v[1] + m[8]  * v[2];
  var y = m[1] * v[0] + m[5] * v[1] + m[9]  * v[2];
  var z = m[2] * v[0] + m[6] * v[1] + m[10] * v[2];

  v[0] = x; v[1] = y; v[2] = z;
 }

CPL.Core.Vector3.scalarProduct = function(v1,v2)
 {
  return v1.v[0] * v2.v[0] + v1.v[1] * v2.v[1] + v1.v[2] * v2.v[2];
 }

CPL.Core.Vector3.crossProduct = function(v1,v2)
 {
  var vv1 = v1.v;
  var vv2 = v2.v;

  var v0 = vv1[1] * vv2[2] - vv1[2] * vv2[1];
  var v1 = vv1[2] * vv2[0] - vv1[0] * vv2[2];
  var v2 = vv1[0] * vv2[1] - vv1[1] * vv2[0];

  return new CPL.Core.Vector3(v0,v1,v2);
 }

CPL.Core.Matrix3x3 = function()
 {
  this.m = new Float32Array(9);
 }

CPL.Core.Matrix3x3.prototype.toString = function()
 {
  var m = this.m;

  var s = "(" + this.m[0] + "," + this.m[1] + "," + this.m[2] + ")";
      s+= "(" + this.m[3] + "," + this.m[4] + "," + this.m[5] + ")";
      s+= "(" + this.m[6] + "," + this.m[7] + "," + this.m[8] + ")";

  return s;
 }

CPL.Core.Matrix3x3.prototype.transpose = function()
 {
  var m = this.m;

  var t;

  t = m[3]; m[3] = m[1]; m[1] = t;
  t = m[2]; m[2] = m[6]; m[6] = t;
  t = m[7]; m[7] = m[5]; m[5] = t;
 }

CPL.Core.Matrix3x3.prototype.multiplyVector = function(v)
 {
  var m  = this.m;
  var vv = v.v;

  var x = m[0] * vv[0] + m[3] * vv[1] + m[6] * vv[2];
  var y = m[1] * vv[0] + m[4] * vv[1] + m[7] * vv[2];
  var z = m[2] * vv[0] + m[5] * vv[1] + m[8] * vv[2];

  vv[0] = x; vv[1] = y; vv[2] = z;
 }

CPL.Core.Matrix4x4 = function()
 {
  this.m = new Float32Array(16);
 }

CPL.Core.Matrix4x4.prototype.toString = function()
 {
  var m = this.m;

  var s = "(" + this.m[0] + "," + this.m[1] + "," + this.m[2] + "," + this.m[3] + ")";
      s+= "(" + this.m[4] + "," + this.m[5] + "," + this.m[6] + "," + this.m[7] + ")";
      s+= "(" + this.m[8] + "," + this.m[9] + "," + this.m[10] + "," + this.m[11] + ")";
      s+= "(" + this.m[12] + "," + this.m[13] + "," + this.m[14] + "," + this.m[15] + ")";

  return s;
 }

CPL.Core.Matrix4x4.prototype.extract3x3 = function()
 {
  var result = new CPL.Core.Matrix3x3();

  var mSrc = this.m;
  var mDst = result.m;

  mDst[0] = mSrc[0]; mDst[1] = mSrc[1]; mDst[2] = mSrc[2];
  mDst[3] = mSrc[4]; mDst[4] = mSrc[5]; mDst[5] = mSrc[6];
  mDst[6] = mSrc[8]; mDst[7] = mSrc[9]; mDst[8] = mSrc[10];

  return result;
 }

CPL.Core.Matrix4x4.makeIdentity = function()
 {
  var result = new CPL.Core.Matrix4x4();

  var m = result.m;

  m[0]  = 1.0; m[1]  = 0.0; m[2]  = 0.0; m[3]  = 0.0;
  m[4]  = 0.0; m[5]  = 1.0; m[6]  = 0.0; m[7]  = 0.0;
  m[8]  = 0.0; m[9]  = 0.0; m[10] = 1.0; m[11] = 0.0;
  m[12] = 0.0; m[13] = 0.0; m[14] = 0.0; m[15] = 1.0;

  return result;
 }

CPL.Core.Matrix4x4.makeTranslation = function(x,y,z)
 {
  var result = new CPL.Core.Matrix4x4();

  var m = result.m;

  m[0]  = 1.0; m[1]  = 0.0; m[2]  = 0.0; m[3]  = 0.0;
  m[4]  = 0.0; m[5]  = 1.0; m[6]  = 0.0; m[7]  = 0.0;
  m[8]  = 0.0; m[9]  = 0.0; m[10] = 1.0; m[11] = 0.0;
  m[12] =   x; m[13] =   y; m[14] = z;   m[15] = 1.0;

  return result;
 }

CPL.Core.Matrix4x4.makeOrtho = function(left,right,bottom,top,near,far)
 {
  var result = new CPL.Core.Matrix4x4();

  var m = result.m;

  m[0] = 2.0 / (right - left); m[1] = 0.0; m[2] = 0.0; m[3] = 0.0;
  m[4] = 0.0; m[5] = 2.0 / (top - bottom); m[6] = 0.0; m[7] = 0.0;
  m[8] = 0.0; m[9] = 0.0; m[10] = 2.0 / (near - far); m[11] = 0.0;
  m[12] = (right + left) / (left - right);
  m[13] = (top + bottom) / (bottom - top);
  m[14] = (far + near) / (near - far);
  m[15] = 1.0;

  return result;
 }

CPL.Core.Matrix4x4.IDENTITY = CPL.Core.Matrix4x4.makeIdentity();

CPL.Core.Matrix4x4.makePerspective = function(fov,aspect,near,far)
 {
  var result = new CPL.Core.Matrix4x4();

  var m = result.m;

  var tnInv = 1.0 / Math.tan(fov / 2.0);

  m[0] = tnInv / aspect; m[1] = 0.0; m[2] = 0.0; m[3] = 0.0;
  m[4] = 0.0; m[5] = tnInv; m[6] = 0.0; m[7] = 0.0;
  m[8] = 0.0; m[9] = 0.0; m[10] = (far + near) / (near - far); m[11] = -1.0;
  m[12] = 0.0; m[13] = 0.0; m[14] = 2.0 * far * near / (near - far);
  m[15] = 0.0;

  return result;
 }

CPL.Core.Matrix4x4.multiply = function(matrix1,matrix2)
 {
  var result = new CPL.Core.Matrix4x4();

  var m  = result.m;
  var m0 = matrix1.m;
  var m1 = matrix2.m;

  m[0] = m0[0] * m1[0] + m0[4] * m1[1] + m0[8]  * m1[2] + m0[12] * m1[3];
  m[1] = m0[1] * m1[0] + m0[5] * m1[1] + m0[9]  * m1[2] + m0[13] * m1[3];
  m[2] = m0[2] * m1[0] + m0[6] * m1[1] + m0[10] * m1[2] + m0[14] * m1[3];
  m[3] = m0[3] * m1[0] + m0[7] * m1[1] + m0[11] * m1[2] + m0[15] * m1[3];

  m[4] = m0[0] * m1[4] + m0[4] * m1[5] + m0[8]  * m1[6] + m0[12] * m1[7];
  m[5] = m0[1] * m1[4] + m0[5] * m1[5] + m0[9]  * m1[6] + m0[13] * m1[7];
  m[6] = m0[2] * m1[4] + m0[6] * m1[5] + m0[10] * m1[6] + m0[14] * m1[7];
  m[7] = m0[3] * m1[4] + m0[7] * m1[5] + m0[11] * m1[6] + m0[15] * m1[7];

  m[8]  = m0[0] * m1[8] + m0[4] * m1[9] + m0[8]  * m1[10] + m0[12] * m1[11];
  m[9]  = m0[1] * m1[8] + m0[5] * m1[9] + m0[9]  * m1[10] + m0[13] * m1[11];
  m[10] = m0[2] * m1[8] + m0[6] * m1[9] + m0[10] * m1[10] + m0[14] * m1[11];
  m[11] = m0[3] * m1[8] + m0[7] * m1[9] + m0[11] * m1[10] + m0[15] * m1[11];

  m[12] = m0[0] * m1[12] + m0[4] * m1[13] + m0[8]  * m1[14] + m0[12] * m1[15];
  m[13] = m0[1] * m1[12] + m0[5] * m1[13] + m0[9]  * m1[14] + m0[13] * m1[15];
  m[14] = m0[2] * m1[12] + m0[6] * m1[13] + m0[10] * m1[14] + m0[14] * m1[15];
  m[15] = m0[3] * m1[12] + m0[7] * m1[13] + m0[11] * m1[14] + m0[15] * m1[15];

  return result;
 }

CPL.Core.Matrix4x4.prototype.translate = function(x,y,z)
 {
  var m = this.m;

  m[12] = m[0] * x + m[4] * y + m[8]  * z + m[12];
  m[13] = m[1] * x + m[5] * y + m[9]  * z + m[13];
  m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
  m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
 }


CPL.Core.Quaternion = function(x,y,z,w)
 {
  this.q = new Float32Array([x,y,z,w]);
 }

CPL.Core.Quaternion.makeIdentity = function()
 {
  return new CPL.Core.Quaternion(0.0,0.0,0.0,1.0);
 }

CPL.Core.Quaternion.IDENTITY = CPL.Core.Quaternion.makeIdentity();

CPL.Core.Quaternion.prototype.clone = function()
 {
  var q = this.q;

  return new CPL.Core.Quaternion(q[0],q[1],q[2],q[3]);
 }

CPL.Core.Quaternion.prototype.setIdentity = function()
 {
  var q = this.q;

  q[0] = 0.0; q[1] = 0.0; q[2] = 0.0; q[3] = 1.0;
 }

CPL.Core.Quaternion.prototype.toString = function()
 {
  return "(" + this.q[0] + "," + this.q[1] + "," + this.q[2] + "," + this.q[3] + ")";
 }

CPL.Core.Quaternion.prototype.copyFrom = function(source)
 {
  var qSrc = source.q;
  var qDst = this.q;

  qDst[0] = qSrc[0]; qDst[1] = qSrc[1]; qDst[2] = qSrc[2]; qDst[3] = qSrc[3];
 }

CPL.Core.Quaternion.prototype.asMatrix4x4 = function()
 {
  var result = new CPL.Core.Matrix4x4();

  var m = result.m;
  var q = this.q;

  m[0]  = 1.0 - 2.0 * q[1] * q[1] - 2.0 * q[2] * q[2];
  m[1]  = 2.0 * q[0] * q[1] + 2.0 * q[3] * q[2];
  m[2]  = 2.0 * q[0] * q[2] - 2.0 * q[3] * q[1];
  m[3]  = 0.0;

  m[4]  = 2.0 * q[0] * q[1] - 2.0 * q[3] * q[2];
  m[5]  = 1.0 - 2.0 * q[0] * q[0] - 2.0 * q[2] * q[2];
  m[6]  = 2.0 * q[1] * q[2] + 2.0 * q[3] * q[0];
  m[7]  = 0.0;

  m[8]  = 2.0 * q[0] * q[2] + 2.0 * q[3] * q[1];
  m[9]  = 2.0 * q[1] * q[2] - 2.0 * q[3] * q[0];
  m[10] = 1.0 - 2.0 * q[0] * q[0] - 2.0 * q[1] * q[1];
  m[11] = 0.0;

  m[12] = 0.0;
  m[13] = 0.0;
  m[14] = 0.0;
  m[15] = 1.0;

  return result;
 }

CPL.Core.Quaternion.prototype.setFromAxisAndAngle = function(x,y,z,angle)
 {
  var q = this.q;

  var sinHalfA = Math.sin(angle / 2.0);
  var cosHalfA = Math.cos(angle / 2.0);

  q[0] = sinHalfA * x; q[1] = sinHalfA * y; q[2] = sinHalfA * z; q[3] = cosHalfA;
 }

CPL.Core.Quaternion.fromAxisAndAngle = function(x,y,z,angle)
 {
  var sinHalfA = Math.sin(angle / 2.0);
  var cosHalfA = Math.cos(angle / 2.0);

  return new CPL.Core.Quaternion(sinHalfA * x,sinHalfA * y,sinHalfA * z,cosHalfA);
 }

CPL.Core.Quaternion.crossProduct = function(quat1,quat2)
 {
  var result = new CPL.Core.Quaternion(0.0,0.0,0.0,1.0);

  var q  = result.q;
  var q0 = quat1.q;
  var q1 = quat2.q;

  q[3] = (q0[3] * q1[3] - q0[0] * q1[0]) - (q0[1] * q1[1] + q0[2] * q1[2]);
  q[0] = (q0[3] * q1[0] + q0[0] * q1[3]) + (q0[1] * q1[2] - q0[2] * q1[1]);
  q[1] = (q0[3] * q1[1] + q0[1] * q1[3]) + (q0[2] * q1[0] - q0[0] * q1[2]);
  q[2] = (q0[3] * q1[2] + q0[2] * q1[3]) + (q0[0] * q1[1] - q0[1] * q1[0]);

  return result;
 }

CPL.Core.Quaternion.slerp = function(quat1,quat2,t)
 {
  var quat1Inv = quat1.clone();

  quat1Inv.conjugate();

  var delta = CPL.Core.Quaternion.crossProduct(quat1Inv,quat2);

  delta.toPower(t);

  return CPL.Core.Quaternion.crossProduct(quat1,delta);
 }

CPL.Core.Quaternion.prototype.normalize = function()
 {
  var q = this.q;
  var l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);

  q[0] = q[0] / l; q[1] = q[1] / l; q[2] = q[2] / l; q[3] = q[3] / l;
 }

CPL.Core.Quaternion.prototype.conjugate = function()
 {
  var q = this.q;

  q[0] = -q[0]; q[1] = -q[1]; q[2] = -q[2];
 }

CPL.Core.Quaternion.prototype.toPower = function(power)
 {
  var q = this.q;

  if (q[3] <= -1.0 || q[3] >= 1.0)
   {
    return;
   }

  var oldHalfAngle = Math.acos(q[3]);
  var newHalfAngle = oldHalfAngle * power;

  var newSin = Math.sin(newHalfAngle);
  var newCos = Math.cos(newHalfAngle);
  var s      = newSin / Math.sin(oldHalfAngle);

  q[0] *= s; q[1] *= s; q[2] *= s; q[3] = newCos;
 }

CPL.Core.Quaternion.prototype.rotateVectorInPlace = function(vect)
 {
  var v = vect.v;
  var q = this.q;

  var q13 = (-q[0] * v[0]) - (q[1] * v[1] + q[2] * v[2]);
  var q10 = ( q[3] * v[0]) + (q[1] * v[2] - q[2] * v[1]);
  var q11 = ( q[3] * v[1]) + (q[2] * v[0] - q[0] * v[2]);
  var q12 = ( q[3] * v[2]) + (q[0] * v[1] - q[1] * v[0]);

  v[0] = (q10 * q[3] - q13 * q[0]) + (q12 * q[1] - q11 * q[2]);
  v[1] = (q11 * q[3] - q13 * q[1]) + (q10 * q[2] - q12 * q[0]);
  v[2] = (q12 * q[3] - q13 * q[2]) + (q11 * q[0] - q10 * q[1]);
 }

CPL.Core.Quaternion.prototype.rotateVectorInvInPlace = function(vect)
 {
  var v = vect.v;
  var q = this.q;

  var q13 = (q[0] * v[0]) + (q[1] * v[1]) + (q[2] * v[2]);
  var q10 = (q[3] * v[0]) + (q[2] * v[1]) - (q[1] * v[2]);
  var q11 = (q[3] * v[1]) + (q[0] * v[2]) - (q[2] * v[0]);
  var q12 = (q[3] * v[2]) + (q[1] * v[0]) - (q[0] * v[1]);

  v[0] = (q13 * q[0] + q10 * q[3]) + (q11 * q[2] - q12 * q[1]);
  v[1] = (q13 * q[1] + q11 * q[3]) + (q12 * q[0] - q10 * q[2]);
  v[2] = (q13 * q[2] + q12 * q[3]) + (q10 * q[1] - q11 * q[0]);
 }

