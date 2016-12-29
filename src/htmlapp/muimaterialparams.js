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

function MaterialParams(parent,app)
 {
  this.colorInput         = null;
  this.diffuseTexInput    = null;
  this.normalTexInput     = null;
  this.aux1TexInput       = null;
  this.aux2TexInput       = null;
  this.doubleSidedInput   = null;
  this.transparentInput   = null;
  this.billboardModeInput = null;

  function create()
   {
    this.colorInput =
     uiTools.addRGBParameter(parent,"materialColor","Color",
                             new CPL.Core.RGB(1.0,1.0,1.0),
     function(value)
      {
       app.execCommand
        (new uiTools.RGBChangeCommand
              (app.getCurrentBranchGroup().materialDef,"color",value));
      });

    this.doubleSidedInput =
     uiTools.addCheckBoxParameter(parent,"materialDoubleSided","Double-sided",
                                  false,
     function(checked)
      {
       app.execCommand
        (new uiTools.BoolChangeCommand
              (app.getCurrentBranchGroup().materialDef,"doubleSided",checked));
      });

    this.transparentInput =
     uiTools.addCheckBoxParameter(parent,"materialTransparent","Transparent",
                                  false,
     function(checked)
      {
       app.execCommand
        (new uiTools.BoolChangeCommand
              (app.getCurrentBranchGroup().materialDef,"transparent",checked));
      });

    this.diffuseTexInput =
     uiTools.addImageParameter(parent,"materialDiffuseTexInput","Diffuse texture",
     function(fileName,image)
      {
       if (image != null)
        {
         var texture = new Texture(app.getGLContext(),image);

         app.getTextureCache().putTexture(fileName,texture,image.src,image);
        }

       app.execCommand
        (new uiTools.ImageChangeCommand
              (app.getCurrentBranchGroup().materialDef,"diffuseTex",fileName));
      });

    this.normalTexInput =
     uiTools.addImageParameter(parent,"materialNormalTexInput","Normal texture",
     function(fileName,image)
      {
       if (image != null)
        {
         var texture = new Texture(app.getGLContext(),image);

         app.getTextureCache().putTexture(fileName,texture,image.src,image);
        }

       app.execCommand
        (new uiTools.ImageChangeCommand
              (app.getCurrentBranchGroup().materialDef,"normalTex",fileName));
      });

    this.aux1TexInput =
     uiTools.addImageParameter(parent,"materialAux1TexInput","Aux1 texture",
     function(fileName,image)
      {
       if (image != null)
        {
         var texture = new Texture(app.getGLContext(),image);

         app.getTextureCache().putTexture(fileName,texture,image.src,image);
        }

       app.execCommand
        (new uiTools.ImageChangeCommand
              (app.getCurrentBranchGroup().materialDef,"aux1Tex",fileName));
      });

    this.aux2TexInput =
     uiTools.addImageParameter(parent,"materialAux2TexInput","Aux2 texture",
     function(fileName,image)
      {
       if (image != null)
        {
         var texture = new Texture(app.getGLContext(),image);

         app.getTextureCache().putTexture(fileName,texture,image.src,image);
        }

       app.execCommand
        (new uiTools.ImageChangeCommand
              (app.getCurrentBranchGroup().materialDef,"aux2Tex",fileName));
      });

    this.alphaCtrlEnabledInput =
     uiTools.addCheckBoxParameter(parent,"materialAlphaCtrlEnabled","Alpha control",
                                  false,
     function(checked)
      {
       app.execCommand
        (new uiTools.BoolChangeCommand
              (app.getCurrentBranchGroup().materialDef,"alphaCtrlEnabled",checked));
      });


    this.alphaFadeInInput =
     uiTools.addRangeParameter(parent,"materialAlphaFadeIn","Alpha fade-in",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand(app.getCurrentBranchGroup().materialDef,"alphaFadeIn",value));
      });

    this.alphaFadeOutInput =
     uiTools.addRangeParameter(parent,"materialAlphaFadeOut","Alpha fade-out",
                               0.0,0.0,1.0,0.05,
     function(value)
      {
       app.execCommand
        (new uiTools.NumberChangeCommand(app.getCurrentBranchGroup().materialDef,"alphaFadeOut",value));
      });
  }

  function show()
   {
    parent.style.display = "block";
   }

  function hide()
   {
    parent.style.display = "none";
   }

  function update()
   {
    var materialDef = app.getCurrentBranchGroup().materialDef;

    this.colorInput.setValue(materialDef.color);
    this.doubleSidedInput.setValue(materialDef.doubleSided);
    this.transparentInput.setValue(materialDef.transparent);
    this.diffuseTexInput.setValue(app.getTextureCache().getThumbnailByName(materialDef.diffuseTex));
    this.normalTexInput.setValue(app.getTextureCache().getThumbnailByName(materialDef.normalTex));
    this.aux1TexInput.setValue(app.getTextureCache().getThumbnailByName(materialDef.aux1Tex));
    this.aux2TexInput.setValue(app.getTextureCache().getThumbnailByName(materialDef.aux2Tex));
    this.alphaCtrlEnabledInput.setValue(materialDef.alphaCtrlEnabled);
    this.alphaFadeInInput.setValue(materialDef.alphaFadeIn);
    this.alphaFadeOutInput.setValue(materialDef.alphaFadeOut);
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

