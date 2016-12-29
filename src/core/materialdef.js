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

CPL.Core.MaterialDef = function()
 {
  var self = this;

  reset();

  function reset ()
   {
    self.color         = new CPL.Core.RGB(1.0,1.0,1.0);
    self.diffuseTex    = null;
    self.normalTex     = null;
    self.aux1Tex       = null;
    self.aux2Tex       = null;
    self.doubleSided   = false;
    self.transparent   = false;
    self.billboardMode = CPL.Core.BILLBOARD_MODE_NONE;

    self.alphaCtrlEnabled = false;
    self.alphaFadeIn      = 0.0;
    self.alphaFadeOut     = 0.0;
   }

  this.load = function(loader,versionMajor,versionMinor)
   {
    var args = [];

    reset();

    loader.readTagged(args,"BaseColor","fff");

    self.color.r = args[0];
    self.color.g = args[1];
    self.color.b = args[2];

    if (versionMajor == 0 && versionMinor < 4)
     {
      self.diffuseTex = loader.readTaggedValue("BaseTexture","s");
     }
    else
     {
      self.diffuseTex = loader.readTaggedValue("DiffuseTexture","s");
      self.normalTex  = loader.readTaggedValue("NormalMap","s");
      self.aux1Tex    = loader.readTaggedValue("AuxTexture0","s");
      self.aux2Tex    = loader.readTaggedValue("AuxTexture1","s");
     }

    self.doubleSided = loader.readTaggedValue("DoubleSided","b");
    self.transparent = loader.readTaggedValue("Transparent","b");

    var billboardModeName = loader.readTaggedValue("BillboardMode","s");

    if      (billboardModeName == "spherical")
     {
      self.billboardMode = CPL.Core.BILLBOARD_MODE_SPHERICAL;
     }
    else if (billboardModeName == "cylindrical")
     {
      self.billboardMode = CPL.Core.BILLBOARD_MODE_CYLINDRICAL;
     }
    else
     {
      // ignore invalid billboard mode
     }

    self.alphaCtrlEnabled = loader.readTaggedValue("AlphaCtrlEnabled","b");

    var fadeIn  = loader.readTaggedValue("AlphaFadeIn","f");
    var fadeOut = loader.readTaggedValue("AlphaFadeOut","f");

    self.alphaFadeIn  = fadeIn  < 0.0 ? 0.0 : (fadeIn  > 1.0 ? 1.0 : fadeIn);
    self.alphaFadeOut = fadeOut < 0.0 ? 0.0 : (fadeOut > 1.0 ? 1.0 : fadeOut);
   }

  this.save = function(writer)
   {
    writer.writeTagged("Material","s","Simple");
    writer.writeTagged("BaseColor","fff",self.color.r,self.color.g,self.color.b);

    writer.writeTagged("DiffuseTexture","s",self.diffuseTex);
    writer.writeTagged("NormalMap","s",self.normalTex);
    writer.writeTagged("AuxTexture0","s",self.aux1Tex);
    writer.writeTagged("AuxTexture1","s",self.aux2Tex);

    writer.writeTagged("DoubleSided","b",self.doubleSided);
    writer.writeTagged("Transparent","b",self.transparent);

    if (self.billboardMode == CPL.Core.BILLBOARD_MODE_SPHERICAL)
     {
      writer.writeTagged("BillboardMode","s","spherical");
     }
    else if (self.billboardMode == CPL.Core.BILLBOARD_MODE_CYLINDRICAL)
     {
      writer.writeTagged("BillboardMode","s","cylindrical");
     }
    else
     {
      writer.writeTagged("BillboardMode","s","__None__");
     }

    writer.writeTagged("AlphaCtrlEnabled","b",self.alphaCtrlEnabled);
    writer.writeTagged("AlphaFadeIn","s",self.alphaFadeIn);
    writer.writeTagged("AlphaFadeOut","s",self.alphaFadeOut);
   }
 }

CPL.Core.MaterialDef.load = function(loader,versionMajor,versionMinor)
 {
  var materialDef = new CPL.Core.MaterialDef();

  materialDef.load(loader,versionMajor,versionMinor);

  return materialDef;
 }

