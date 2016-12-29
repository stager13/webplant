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

var CPLGenericMaterialVS =
"const vec4 ambientGlobal = vec4(0.2,0.2,0.2,1.0);\n" +
"const vec4 ambientLight  = vec4(0.2,0.2,0.2,1.0);\n" +
"const vec4 diffuseLight  = vec4(0.4,0.4,0.4,1.0);\n" +
"\n" +
"uniform mat3   uniNormalMatrix;\n" +
"uniform mat4   uniModelViewProjectionMatrix;\n" +
"attribute vec4 attrVertex;\n" +
"attribute vec3 attrNormal;\n" +
"attribute vec4 attrColor;\n" +
"\n" +
"varying vec4 varColor;\n" +
"\n" +
"#if CPL_HAS_DIFFUSE_TEX\n" +
"attribute vec2 attrTexCoord;\n" +
"varying vec2 varTexCoord;\n" +
"#endif\n" +
"\n" +
"void main ()\n" +
" {\n" +
"  vec3  normalInEyeSpace = uniNormalMatrix * attrNormal;\n" +
"  float diffuseFactor    = max(0.0,dot(vec3(0.0,0.0,1.0),normalInEyeSpace));\n" +
"\n" +
"  gl_Position = uniModelViewProjectionMatrix * attrVertex;\n" +
"\n" +
"  varColor = attrColor * ambientGlobal +\n" +
"              attrColor * ambientLight +\n" +
"               attrColor * diffuseFactor * diffuseLight;\n" +
"#if CPL_HAS_DIFFUSE_TEX\n" +
"  varTexCoord = attrTexCoord;\n" +
"#endif\n" +
" }";

var CPLGenericMaterialFS =
"precision mediump float;\n" +
"\n" +
"#if CPL_HAS_DIFFUSE_TEX\n" +
"uniform sampler2D uniDiffuseTexSampler;\n" +
"varying vec2 varTexCoord;\n" +
"#endif\n" +
"\n" +
"#if CPL_ALPHA_TEST_ENABLED\n" +
"uniform float uniAlphaThreshold;\n" +
"#endif\n" +
"\n" +
"varying vec4 varColor;\n" +
"\n" +
"void main ()\n" +
" {\n" +
"#if CPL_HAS_DIFFUSE_TEX\n" +
"  vec4 texColor = texture2D(uniDiffuseTexSampler,varTexCoord);\n" +
"#if CPL_TRANSPARENT\n" +
" #if CPL_ALPHA_TEST_ENABLED\n" +
"  if (texColor.a < uniAlphaThreshold) discard;\n" +
" #else\n" +
"  if (texColor.a < 0.5) discard;\n" +
" #endif\n" +
"#endif\n" +
"  gl_FragColor = varColor * texColor;\n" +
"#else\n" +
"  gl_FragColor = varColor;\n" +
"#endif\n" +
" }";

function GenericMaterial(gl)
 {
  this.gl          = gl;
  this.shader      = null;
  this.diffuseTex  = null;
  this.doubleSided = false;
  this.transparent = false;
  this.alphaTestEnabled   = false;
  this.alphaTestThreshold = null;
 }

GenericMaterial.prototype.setDiffuseTexture = function(texture)
 {
  this.diffuseTex = texture;
  this.shader     = null; // force shader regeneration
 }

GenericMaterial.prototype.setDoubleSided = function(doubleSided)
 {
  this.doubleSided = doubleSided;
 }

GenericMaterial.prototype.setTransparent = function(transparent)
 {
  this.transparent = transparent;
  this.shader      = null; // force shader regeneration
 }

GenericMaterial.prototype.setAlphaTestMode = function(enabled,threshold)
 {
  this.alphaTestThreshold = threshold;

  if (this.alphaTestEnabled != enabled)
   {
    this.shader = null; // force shader regeneration

    this.alphaTestEnabled = enabled;
   }
 }

GenericMaterial.prototype.renderMesh = function(mesh,sceneParams)
 {
  var gl     = this.gl;
  var shader = this.shader;

  if (!shader)
   {
    this.prepareShader();

    shader = this.shader;
   }

  var hasDiffuseTex = this.diffuseTex;

  shader.bind();
  shader.setUniformMatrix4fv(this.mvpMatrixLocation,sceneParams.mvpMatrix.m);
  shader.setUniformMatrix3fv(this.normalMatrixLocation,sceneParams.normalMatrix.m);

  mesh.bindVertexBuffer(this.vertexLocation);
  mesh.bindNormalBuffer(this.normalLocation);
  mesh.bindColorBuffer(this.colorLocation);

  if (hasDiffuseTex)
   {
    mesh.bindTexCoordBuffer(this.texCoordLocation);

    this.diffuseTex.bind(0);
    shader.setUniform1i(this.diffuseTexSamplerLocation,0);
   }

  if (this.alphaTestEnabled)
   {
    shader.setUniform1f(this.alphaThresholdLocation,this.alphaTestThreshold);
   }

  if (this.doubleSided)
   {
    gl.disable(gl.CULL_FACE);
   }
  else
   {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
   }

  mesh.dispatchGeometry();

  gl.disableVertexAttribArray(this.vertexLocation);
  gl.disableVertexAttribArray(this.normalLocation);
  gl.disableVertexAttribArray(this.colorLocation);

  if (hasDiffuseTex)
   {
    gl.disableVertexAttribArray(this.texCoordLocation);
   }
 }

GenericMaterial.prototype.prepareShader = function()
 {
  var hasDiffuseTex = this.diffuseTex;

  var diffuseDefine = "#define CPL_HAS_DIFFUSE_TEX " +
                       (hasDiffuseTex ? "1" : "0") + "\n";
  var transparentDefine = "#define CPL_TRANSPARENT " +
                           (this.transparent ? "1" : "0") + "\n";
  var alphaTestDefine = "#define CPL_ALPHA_TEST_ENABLED " +
                           (this.alphaTestEnabled ? "1" : "0") + "\n";

  var vs = diffuseDefine + transparentDefine + CPLGenericMaterialVS;
  var fs = diffuseDefine + transparentDefine + alphaTestDefine + CPLGenericMaterialFS;

  var shader = new Shader(this.gl,vs,fs);

  this.shader               = shader;
  this.mvpMatrixLocation    = shader.getUniformLocation("uniModelViewProjectionMatrix");
  this.normalMatrixLocation = shader.getUniformLocation("uniNormalMatrix");

  this.vertexLocation   = shader.getAttribLocation("attrVertex");
  this.normalLocation   = shader.getAttribLocation("attrNormal");
  this.colorLocation    = shader.getAttribLocation("attrColor");

  if (hasDiffuseTex)
   {
    this.diffuseTexSamplerLocation = shader.getUniformLocation("uniDiffuseTexSampler");
    this.texCoordLocation          = shader.getAttribLocation("attrTexCoord");
   }

  if (this.alphaTestEnabled)
   {
    this.alphaThresholdLocation = shader.getUniformLocation("uniAlphaThreshold");
   }
 }

