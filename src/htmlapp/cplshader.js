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

function Shader(gl,vs,fs)
 {
  this.gl      = gl;
  this.program = createProgram(gl,vs,fs);

  function createProgram(gl,vs,fs)
   {
    var vertexShader = createShader(gl,gl.VERTEX_SHADER,vs);

    if (!vertexShader)
     {
      return null;
     }

    var fragmentShader = createShader(gl,gl.FRAGMENT_SHADER,fs);

    if (!fragmentShader)
     {
      gl.deleteShader(vertexShader);

      return null;
     }

    var program = gl.createProgram();

    if (!program)
     {
      console.log("Unable to create shader program");

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
     }

    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);

    gl.linkProgram(program);

    var isLinked = gl.getProgramParameter(program,gl.LINK_STATUS);

    if (!isLinked)
     {
      var errorMessage = gl.getProgramInfoLog(program);

      console.log("Shader program linking failed: " + errorMessage);

      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      return null;
     }

    return program;
   }

  function createShader(gl,type,src)
   {
    var shader = gl.createShader(type);

    if (shader == null)
     {
      console.log("unable to create shader");

      return null;
     }

    gl.shaderSource(shader,src);
    gl.compileShader(shader);

    var isCompiled = gl.getShaderParameter(shader,gl.COMPILE_STATUS);

    if (!isCompiled)
     {
      var errorMessage = gl.getShaderInfoLog(shader);

      console.log("Shader compilation failed:" + errorMessage);

      gl.deleteShader(shader);

      return null;
     }

    return shader;
   }
 }

Shader.prototype.getUniformLocation = function(name)
 {
  return this.gl.getUniformLocation(this.program,name);
 }

Shader.prototype.getAttribLocation = function(name)
 {
  return this.gl.getAttribLocation(this.program,name);
 }

Shader.prototype.bind = function()
 {
  this.gl.useProgram(this.program);
 }

Shader.prototype.setUniformMatrix4fv = function(location,value)
 {
  this.gl.uniformMatrix4fv(location,false,value);
 }

Shader.prototype.setUniformMatrix3fv = function(location,value)
 {
  this.gl.uniformMatrix3fv(location,false,value);
 }

Shader.prototype.setUniform1i = function(location,value)
 {
  this.gl.uniform1i(location,value);
 }

Shader.prototype.setUniform1f = function(location,value)
 {
  this.gl.uniform1f(location,value);
 }

