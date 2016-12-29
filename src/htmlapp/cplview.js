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

function View(canvas)
 {
  this.Projection = { ORTHO : 0, PERSPECTIVE : 1 };

  this.plant          = null;
  this.plantMeshes    = [];
  this.plantGenerator = null;
  this.currentLOD     = 1.0;

  this.groundVisible   = true;
  this.backgroundColor = new CPL.Core.RGB(0.5,0.5,0.5);

  var KEYBOARD_ROTATE_STEP = Math.PI / 12;

  var requestAnimationFrame = window.requestAnimationFrame       ||
                              window.mozRequestAnimationFrame    ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame;

  window.requestAnimationFrame = requestAnimationFrame;

  var self = this;

  function createGroundMesh(gl,material)
   {
    var positions = new Float32Array([-20.0,0.0,20.0,
                                       20.0,0.0,20.0,
                                       20.0,0.0,-20.0,
                                      -20.0,0.0,-20.0]);
    var normals   = new Float32Array([0.0,1.0,1.0, 0.0,1.0,0.0, 0.0,1.0,0.0, 0.0,1.0,0.0]);
    var colors    = new Float32Array([1.0,0.0,0.0, 0.0,1.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0]);
    var indices   = new Uint16Array([0,1,2,3,0,2]);

    var mesh = new Mesh(gl,material,4,6,false);

    mesh.updateVertexData(positions,4);
    mesh.updateNormalData(normals,4);
    mesh.updateColorData(colors,4);
    mesh.updateIndices(indices,6);

    return mesh;
   }

  this.gl = WebGLUtils.setupWebGL(canvas,{alpha : false});

  if (!this.gl)
   {
    console.log("Failed to get rendering context for WebGL");

    return;
   }

  handleResize();

  this.textureCache = new TextureCache();

  this.material = new GenericMaterial(this.gl);

  this.groundMesh = createGroundMesh(this.gl,this.material);

  this.camera = new Camera();
  this.zoomFactor = 1.0;
  this.baseNearHalfWidth = 30.0;
  this.baseDistance      = 30.0;
  this.canvasWidth       = canvas.width;
  this.canvasHeight      = canvas.height;
  this.aspect            = this.canvasWidth / this.canvasHeight;
  this.projectionMode    = this.Projection.ORTHO;

  this.camera.rotateInCameraSpace(20.0 / 180.0 * Math.PI,1.0,0.0,0.0);

  // mouse event handling

  this.mousePosX          = undefined;
  this.mousePosY          = undefined;
  this.mouseMiddlePressed = false;
  this.mouseRotXSens      = 0.02;
  this.mouseRotYSens      = 0.02;

  canvas.onmouseup = function(evt)
   {
    if (evt.button == 1)
     {
      self.mouseMiddlePressed = false;
     }
   }

  canvas.onmousedown = function(evt)
   {
    if (evt.button == 1)
     {
      self.mouseMiddlePressed = true;
     }
   }

  canvas.onmousemove = function(evt)
   {
    if (typeof self.mousePosX === "undefined" ||
        typeof self.mousePosY === "undefined")
     {
      self.mousePosX = evt.clientX;
      self.mousePosY = evt.clientY;

      return;
     }

    var deltaX = evt.clientX - self.mousePosX;
    var deltaY = evt.clientY - self.mousePosY;

    if (deltaX != 0 || deltaY != 0)
     {
      if (self.mouseMiddlePressed)
       {
        if (evt.shiftKey)
         {
          self.camera.centerMoveInCameraSpace
           (deltaX * self.baseNearHalfWidth * self.zoomFactor * 2.0 /
             self.canvasWidth,
            -deltaY * self.baseNearHalfWidth * self.zoomFactor * 2.0 /
              self.aspect / self.canvasHeight,
            0.0);
         }
        else
         {
          if (deltaY != 0)
           {
            self.camera.rotateInCameraSpace(deltaY * self.mouseRotYSens,
                                            1.0,0.0,0.0);
           }

          if (deltaX != 0)
           {
            self.camera.rotateInWorldSpace(deltaX * self.mouseRotXSens,
                                           0.0,1.0,0.0);
           }
         }

        self.render();
       }
     }

    self.mousePosX = evt.clientX;
    self.mousePosY = evt.clientY;
   }

  var KeyCodes =
   {
    KEY_0               : 0x30,
    KEY_1               : 0x31,
    KEY_2               : 0x32,
    KEY_3               : 0x33,
    KEY_4               : 0x34,
    KEY_5               : 0x35,
    KEY_6               : 0x36,
    KEY_7               : 0x37,
    KEY_8               : 0x38,
    KEY_9               : 0x39,
    KEY_MINUS           : 173,
    KEY_ASSIGN          : 61,
    KEY_NUMPAD_0        : 96,
    KEY_NUMPAD_1        : 97,
    KEY_NUMPAD_2        : 98,
    KEY_NUMPAD_3        : 99,
    KEY_NUMPAD_4        : 100,
    KEY_NUMPAD_5        : 101,
    KEY_NUMPAD_6        : 102,
    KEY_NUMPAD_7        : 103,
    KEY_NUMPAD_8        : 104,
    KEY_NUMPAD_9        : 105,
    KEY_NUMPAD_MINUS    : 109,
    KEY_NUMPAD_PLUS     : 107,
    KEY_NUMPAD_PAGEUP   : 33,
    KEY_NUMPAD_PAGEDOWN : 34,
    KEY_NUMPAD_END      : 35,
    KEY_NUMPAD_HOME     : 36,
    KEY_NUMPAD_LEFT     : 37,
    KEY_NUMPAD_UP       : 38,
    KEY_NUMPAD_RIGHT    : 39,
    KEY_NUMPAD_DOWN     : 40,
    KEY_NUMPAD_CENTER   : 12
   };

  function switchToXAxisView (turnAround)
   {
    self.camera.setCenter(0.0,0.0,0.0);

    var rotation = CPL.Core.Quaternion.fromAxisAndAngle
                    (0.0,turnAround ? 1.0 : -1.0,0.0,Math.PI * 0.5);

    self.camera.setDirection(rotation.q[0],rotation.q[1],rotation.q[2],rotation.q[3]);

    self.render();
   }

  function switchToYAxisView (turnAround)
   {
    self.camera.setCenter(0.0,0.0,0.0);

    var rotation = CPL.Core.Quaternion.fromAxisAndAngle
                    (turnAround ? -1.0 : 1.0,0.0,0.0,Math.PI * 0.5);

    self.camera.setDirection(rotation.q[0],rotation.q[1],rotation.q[2],rotation.q[3]);

    self.render();
   }

  function switchToZAxisView (turnAround)
   {
    self.camera.setCenter(0.0,0.0,0.0);

    if (turnAround)
     {
      var rotation = CPL.Core.Quaternion.fromAxisAndAngle(0.0,1.0,0.0,Math.PI);

      self.camera.setDirection(rotation.q[0],rotation.q[1],rotation.q[2],rotation.q[3]);
     }
    else
     {
      self.camera.setDirection(0.0,0.0,0.0,1.0);
     }

    self.render();
   }

  function rotateViewAroundWorldYAxis (angle)
   {
    self.camera.rotateInWorldSpace(angle,0.0,1.0,0.0);

    self.render();
   }

  function rotateViewAroundCameraXAxis (angle)
   {
    self.camera.rotateInCameraSpace(angle,1.0,0.0,0.0);

    self.render();
   }

  function zoomInStep ()
   {
    self.zoomFactor *= 0.75;

    self.render();
   }

  function zoomOutStep ()
   {
    self.zoomFactor /= 0.75;

    self.render();
   }

  function onKeyDown(evt)
   {
    var keyCode = evt.keyCode;

    if (keyCode == KeyCodes.KEY_1 ||
        keyCode == KeyCodes.KEY_NUMPAD_1 ||
        keyCode == KeyCodes.KEY_NUMPAD_END)
     {
      switchToZAxisView(evt.shiftKey);
     }
    else if (keyCode == KeyCodes.KEY_7 ||
             keyCode == KeyCodes.KEY_NUMPAD_7 ||
             keyCode == KeyCodes.KEY_NUMPAD_HOME)
     {
      switchToYAxisView(evt.shiftKey);
     }
    else if (keyCode == KeyCodes.KEY_3 ||
             keyCode == KeyCodes.KEY_NUMPAD_3 ||
             keyCode == KeyCodes.KEY_NUMPAD_PAGEDOWN)
     {
      switchToXAxisView(evt.shiftKey);
     }
    else if (keyCode == KeyCodes.KEY_4 ||
             keyCode == KeyCodes.KEY_NUMPAD_4 ||
             keyCode == KeyCodes.KEY_NUMPAD_LEFT)
     {
      rotateViewAroundWorldYAxis(KEYBOARD_ROTATE_STEP);
     }
    else if (keyCode == KeyCodes.KEY_6 ||
             keyCode == KeyCodes.KEY_NUMPAD_6 ||
             keyCode == KeyCodes.KEY_NUMPAD_RIGHT)
     {
      rotateViewAroundWorldYAxis(-KEYBOARD_ROTATE_STEP);
     }
    else if (keyCode == KeyCodes.KEY_8 ||
             keyCode == KeyCodes.KEY_NUMPAD_8 ||
             keyCode == KeyCodes.KEY_NUMPAD_UP)
     {
      rotateViewAroundCameraXAxis(KEYBOARD_ROTATE_STEP);
     }
    else if (keyCode == KeyCodes.KEY_2 ||
             keyCode == KeyCodes.KEY_NUMPAD_2 ||
             keyCode == KeyCodes.KEY_NUMPAD_DOWN)
     {
      rotateViewAroundCameraXAxis(-KEYBOARD_ROTATE_STEP);
     }
    else if (keyCode == KeyCodes.KEY_NUMPAD_PLUS ||
             keyCode == KeyCodes.KEY_ASSIGN)
     {
      zoomInStep();
     }
    else if (keyCode == KeyCodes.KEY_NUMPAD_MINUS ||
             keyCode == KeyCodes.KEY_MINUS)
     {
      zoomOutStep();
     }
    else if (keyCode == KeyCodes.KEY_5 ||
             keyCode == KeyCodes.KEY_NUMPAD_5 ||
             keyCode == KeyCodes.KEY_NUMPAD_CENTER)
     {
      if (self.projectionMode == self.Projection.ORTHO)
       {
        self.projectionMode = self.Projection.PERSPECTIVE;
       }
      else
       {
        self.projectionMode = self.Projection.ORTHO;
       }

      self.render();
     }
   }

  window.addEventListener("keydown",onKeyDown,false);

  function handleResize()
   {
    var canvasWidth  = canvas.clientWidth;
    var canvasHeight = canvas.clientHeight;

    if (canvas.width != canvasWidth || canvas.height != canvasHeight)
     {
      canvas.width  = canvasWidth;
      canvas.height = canvasHeight;

      self.canvasWidth  = canvasWidth;
      self.canvasHeight = canvasHeight;

      self.gl.viewport(0,0,canvasWidth,canvasHeight);
     }
   }

  window.onresize = function()
   {
    handleResize();

    self.render();
   }

  function handleMouseWheel(delta)
   {
    if (delta > 0)
     {
      zoomInStep();
     }
    else if (delta < 0)
     {
      zoomOutStep();
     }
   }

  canvas.onmousewheel = function(evt)
   {
    handleMouseWheel(evt.wheelDelta / 120);
   }

  var isFirefox = (navigator.userAgent.indexOf("Gecko") !== -1);

  if (isFirefox)
   {
    canvas.addEventListener
     ("DOMMouseScroll",
      function(evt)
       {
        handleMouseWheel(-evt.detail / 30);
       },
      false);
   }

  function calculateAlphaLimitValue(LOD,minLOD,maxLOD,alphaFadeIn,alphaFadeOut)
   {
    var LODFraction = (LOD - minLOD) / (maxLOD - minLOD);

    if (LODFraction < 0.0 || LODFraction > 1.0)
     {
      return 0.5;
     }

    if (alphaFadeOut < alphaFadeIn)
     {
      if (LODFraction < alphaFadeOut)
       {
        return LODFraction / alphaFadeOut;
       }
      else if (LODFraction > alphaFadeIn)
       {
        return 1.0 - (LODFraction - alphaFadeIn) / (1.0 - alphaFadeIn);
       }
      else
       {
        return 0.99;
       }
     }
    else
     {
      if (LODFraction < alphaFadeIn)
       {
        return 1.0 - LODFraction / alphaFadeIn;
       }
      else if (LODFraction > alphaFadeOut)
       {
        return (LODFraction - alphaFadeOut) / (1.0 - alphaFadeOut);
       }
      else
       {
        return 0.01;
       }
     }
   }

  function preparePlantMeshes ()
   {
    var meshes                = [];
    var plantGenerator        = self.plantGenerator;
    var totalBranchGroupCount = self.plant.getTotalBranchGroupCount();

    for (var i = 0; i < totalBranchGroupCount; i++)
     {
      var data = plantGenerator.getMeshData(i);
      var visRange = data.visRange;

      if (!visRange.enabled ||
           (self.currentLOD >= visRange.min &&
            self.currentLOD <= visRange.max))
       {
        var material = new GenericMaterial(self.gl);

        var attrCount  = data.positions.length / 3;
        var indexCount = data.indices.length;

        var mesh = new Mesh(self.gl,material,
                            attrCount,indexCount,
                            data.materialDef.diffuseTex != null);

        if (data.materialDef.diffuseTex)
         {
          var diffuseTex = self.textureCache.getTextureByName(data.materialDef.diffuseTex);

          if (diffuseTex)
           {
            material.setDiffuseTexture(diffuseTex);
           }
         }

        material.setDoubleSided(data.materialDef.doubleSided);
        material.setTransparent(data.materialDef.transparent);

        if (data.materialDef.transparent && data.materialDef.alphaCtrlEnabled)
         {
          material.setAlphaTestMode
           (true,
            calculateAlphaLimitValue
             (self.currentLOD,
              visRange.min,visRange.max,
              data.materialDef.alphaFadeIn,data.materialDef.alphaFadeOut));
         }

        meshes.push(mesh);
       }
      else
       {
        meshes.push(null);
       }
     }

    self.plantMeshes = meshes;
   }

  this.updatePlantMeshes = function ()
   {
    var meshes                = self.plantMeshes;
    var plantGenerator        = self.plantGenerator;
    var totalBranchGroupCount = self.plant.getTotalBranchGroupCount();

    for (var i = 0; i < totalBranchGroupCount; i++)
     {
      var data = plantGenerator.getMeshData(i);
      var mesh = meshes[i];

      if (mesh != null)
       {
        var attrCount  = plantGenerator.getMeshAttrCount(i);
        var indexCount = plantGenerator.getMeshIndexCount(i);

        mesh.updateVertexData(data.positions,attrCount);
        mesh.updateNormalData(data.normals,attrCount);
        mesh.updateColorData(data.colors,attrCount);

        if (data.materialDef.diffuseTex)
         {
          mesh.updateTexCoordData(data.texCoords,attrCount);
         }

        mesh.updateIndices(data.indices,indexCount);
       }
     }
   }

  function releasePlantMeshes ()
   {
    for (var i = 0; i < self.plantMeshes.length; i++)
     {
      var mesh = self.plantMeshes[i];

      if (mesh != null)
       {
        mesh.release();
       }
     }

    self.plantMeshes = [];
   }

  function startPlantGenerator (generatorOptions)
   {
    self.plantGenerator = self.plant.createMeshGeneratorI(generatorOptions);
   }

  function stopPlantGenerator ()
   {
    self.plantGenerator = null;
   }

  this.setPlant = function(plant,generatorOptions)
   {
    releasePlantMeshes();
    stopPlantGenerator();

    this.plant = plant;

    startPlantGenerator(generatorOptions);
    preparePlantMeshes();

    window.requestAnimationFrame(this.preAnimationFrameFunc);
   }

  this.preAnimationFrameFunc = function()
   {
    self.render();
   }
 }

View.prototype.render = function()
 {
  var gl = this.gl;

  var bgColor = this.backgroundColor;

  gl.clearColor(bgColor.r,bgColor.g,bgColor.b,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var projectionMatrix;

  if (this.projectionMode == this.Projection.ORTHO)
   {
    var zoomedHalfWidth = this.baseNearHalfWidth * this.zoomFactor;

    projectionMatrix = CPL.Core.Matrix4x4.makeOrtho
                        (-zoomedHalfWidth,
                          zoomedHalfWidth,
                         -zoomedHalfWidth / this.aspect,
                          zoomedHalfWidth / this.aspect,
                          1.0,100.0);

    this.camera.setDistance(this.baseDistance);
   }
  else
   {
    projectionMatrix = CPL.Core.Matrix4x4.makePerspective
                        (45.0,this.aspect,1.0,100.0);

    this.camera.setDistance(this.baseDistance * this.zoomFactor);
   }

  var viewMatrix = this.camera.getTransformToCameraSpace();
  var normalMatrix = viewMatrix.extract3x3();

  var mvpMatrix = CPL.Core.Matrix4x4.multiply(projectionMatrix,viewMatrix);

  var sceneParams =
   {
    "mvpMatrix": mvpMatrix,
    "normalMatrix": normalMatrix
   };

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  if (this.groundVisible)
   {
    this.groundMesh.render(sceneParams);
   }

  if (this.plantGenerator)
   {
    this.plantGenerator.step(100);
    this.updatePlantMeshes();

    if (!this.plantGenerator.done())
     {
      window.requestAnimationFrame(this.preAnimationFrameFunc);
     }
    else
     {
      this.plantGenerator = null;
     }
   }

  for (var i = 0; i < this.plantMeshes.length; i++)
   {
    var mesh = this.plantMeshes[i];

    if (mesh != null)
     {
      mesh.render(sceneParams);
     }
   }
 }

View.prototype.getGLContext = function()
 {
  return this.gl;
 }

View.prototype.getTextureCache = function()
 {
  return this.textureCache;
 }

View.prototype.setTextureCache = function(newTextureCache)
 {
  this.textureCache = newTextureCache;
 }

View.prototype.setCurrentLOD = function(LOD)
 {
  this.currentLOD = LOD;
 }

View.prototype.getCurrentLOD = function()
 {
  return this.currentLOD;
 }

View.prototype.isGroundVisible = function()
 {
  return this.groundVisible;
 }

View.prototype.setGroundVisible = function(visible)
 {
  this.groundVisible = visible;

  this.render();
 }

View.prototype.getBackgroundColor = function()
 {
  return this.backgroundColor.clone();
 }

View.prototype.setBackgroundColor = function(color)
 {
  this.backgroundColor = color.clone();

  this.render();
 }

