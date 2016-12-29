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

function Texture(gl,image)
 {
  // NPOT textures support is based on code from
  // https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences

  function isPowerOfTwo (x)
   {
    return (x & (x - 1)) == 0;
   }

  function nextHighestPowerOfTwo (x)
   {
    x--;

    for (var i = 1; i < 32; i <<= 1)
     {
      x |= x >> i;
     }

    return x + 1;
   }

  var handle = gl.createTexture();

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D,handle);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);

  if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height))
   {
    var canvas = document.createElement("canvas");

    canvas.width  = nextHighestPowerOfTwo(image.width);
    canvas.height = nextHighestPowerOfTwo(image.height);

    var context = canvas.getContext("2d");

    context.drawImage(image,0,0,canvas.width,canvas.height);

    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);
   }
  else
   {
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
   }

  this.gl     = gl;
  this.handle = handle;
 }

Texture.prototype.dispose = function()
 {
  this.gl.deleteTexture(this.handle);
 }

Texture.prototype.bind = function(texUnitIndex)
 {
  var gl = this.gl;

  gl.activeTexture(gl.TEXTURE0 + texUnitIndex);
  gl.bindTexture(gl.TEXTURE_2D,this.handle);
 }

