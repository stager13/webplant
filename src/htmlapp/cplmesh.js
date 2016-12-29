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

function Mesh(gl,material,attrCount,indexCount,hasTexCoords)
 {
  this.material = material;

  function createDataBuffer(gl,dataSize)
   {
    var buffer = gl.createBuffer();

    if (!buffer)
     {
      console.log("unable to create vertex buffer");

      return;
     }

    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,dataSize,gl.STATIC_DRAW);

    return buffer;
   }

  function createIndexBuffer(gl,indexCount)
   {
    var buffer = gl.createBuffer();

    if (!buffer)
     {
      console.log("unable to create index buffer");

      return;
     }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexCount * 2,gl.STATIC_DRAW);

    return buffer;
   }

  this.gl           = gl;
  this.vertexBuffer = createDataBuffer(gl,attrCount * 3 * 4);
  this.normalBuffer = createDataBuffer(gl,attrCount * 3 * 4);
  this.colorBuffer  = createDataBuffer(gl,attrCount * 3 * 4);

  if (hasTexCoords)
   {
    this.texCoordBuffer = createDataBuffer(gl,attrCount * 2 * 4);
   }

  this.indexBuffer = createIndexBuffer(gl,indexCount);
  this.indexCount  = 0;
 }

Mesh.prototype.release = function()
 {
  var gl = this.gl;

  if (this.vertexBuffer)
   {
    gl.deleteBuffer(this.vertexBuffer);
   }

  if (this.normalBuffer)
   {
    gl.deleteBuffer(this.normalBuffer);
   }

  if (this.colorBuffer)
   {
    gl.deleteBuffer(this.colorBuffer);
   }

  if (this.texCoordBuffer)
   {
    gl.deleteBuffer(this.texCoordBuffer);
   }

  if (this.indexBuffer)
   {
    gl.deleteBuffer(this.indexBuffer);
   }
 }

Mesh.prototype.updateVertexData = function(positions,attrCount)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,new DataView(positions.buffer,0,attrCount * 3 * 4));
 }

Mesh.prototype.updateNormalData = function(normals,attrCount)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,new DataView(normals.buffer,0,attrCount * 3 * 4));
 }

Mesh.prototype.updateColorData = function(colors,attrCount)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,new DataView(colors.buffer,0,attrCount * 3 * 4));
 }

Mesh.prototype.updateTexCoordData = function(texCoords,attrCount)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.texCoordBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,new DataView(texCoords.buffer,0,attrCount * 2 * 4));
 }

Mesh.prototype.updateIndices = function(indices,indexCount)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
  gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,new DataView(indices.buffer,0,indexCount * 2));

  this.indexCount = indexCount;
 }

Mesh.prototype.bindVertexBuffer = function(location)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
  gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(location);
 }

Mesh.prototype.bindNormalBuffer = function(location)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
  gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(location);
 }

Mesh.prototype.bindColorBuffer = function(location)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
  gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(location);
 }

Mesh.prototype.bindTexCoordBuffer = function(location)
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ARRAY_BUFFER,this.texCoordBuffer);
  gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(location);
 }

Mesh.prototype.dispatchGeometry = function()
 {
  var gl = this.gl;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);

  gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
 }

Mesh.prototype.render = function(sceneParams)
 {
  if (this.indexCount > 0)
   {
    this.material.renderMesh(this,sceneParams);
   }
 }

