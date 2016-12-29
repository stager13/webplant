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

function UITools()
 {
  function addRangeParameter(parent,id,label,value,min,max,step,changeFunc)
   {
    var tr       = document.createElement("tr");
    var label_td = document.createElement("td");
    var label    = document.createTextNode(label);

    label_td.appendChild(label);

    tr.appendChild(label_td);

    var range_td = document.createElement("td");
    var range    = new RangeEdit(range_td,value,min,max,step,changeFunc);

    range.create();

    tr.appendChild(range_td);

    parent.appendChild(tr);

    return range;
   }

  function addRGBParameter(parent,id,label,value,changeFunc)
   {
    var tr       = document.createElement("tr");
    var label_td = document.createElement("td");
    var label    = document.createTextNode(label);

    label_td.appendChild(label);

    tr.appendChild(label_td);

    var color_td   = document.createElement("td");
    var color_edit = new ColorRGBEdit(color_td,value,changeFunc);

    color_edit.create();

    tr.appendChild(color_td);

    parent.appendChild(tr);

    return color_edit;
   }

  function addCheckBoxParameter(parent,id,label,value,changeFunc)
   {
    var tr       = document.createElement("tr");
    var label_td = document.createElement("td");
    var label    = document.createTextNode(label);

    label_td.appendChild(label);

    tr.appendChild(label_td);

    var checkbox_td = document.createElement("td");
    var checkbox    = new CheckBox(checkbox_td,value,changeFunc);

    checkbox.create();

    tr.appendChild(checkbox_td);

    parent.appendChild(tr);

    return checkbox;
   }

  function addFuncParameter(parent,id,label,spline,changeFunc)
   {
    var tr       = document.createElement("tr");
    var label_td = document.createElement("td");
    var label    = document.createTextNode(label);

    label_td.appendChild(label);

    tr.appendChild(label_td);

    var range_td = document.createElement("td");
    var funcEdit = new FuncEdit(range_td,spline,changeFunc);

    funcEdit.create();

    tr.appendChild(range_td);

    parent.appendChild(tr);

    return funcEdit;
   }

  function addDropDownListParameter(parent,id,label,items,selectedId,changeFunc)
   {
    var tr       = document.createElement("tr");
    var label_td = document.createElement("td");
    var label    = document.createTextNode(label);

    label_td.appendChild(label);

    tr.appendChild(label_td);

    var dropDown_td = document.createElement("td");
    var dropDownList = new DropDownList(dropDown_td,items,selectedId,changeFunc);

    dropDownList.create();

    tr.appendChild(dropDown_td);

    parent.appendChild(tr);

    return dropDownList;
   }

  function elementRemoveAllChildren(element)
   {
    while (element.childNodes.length > 0)
     {
      element.removeChild(element.childNodes[0]);
     }
   }

  function addImageParameter(parent,id,label,changeFunc)
   {
    var tr       = document.createElement("tr");
    var label_td = document.createElement("td");
    var label    = document.createTextNode(label);

    label_td.appendChild(label);

    tr.appendChild(label_td);

    var image_td = document.createElement("td");

    var input_table = document.createElement("table");
    var input_table_tr = document.createElement("tr");

    var imageInputLabel = document.createElement("label");
    var imageInputLabelText = document.createTextNode("Load...");

    imageInputLabel.appendChild(imageInputLabelText);
    imageInputLabel.className = "button-style";

    var imageInput = document.createElement("input");

    imageInput.type = "file";
    imageInput.className = "input-file";

    var imagePicture_td = document.createElement("td");

    imageInput.onchange = function()
     {
      if (imageInput.files && imageInput.files[0])
       {
        var file   = imageInput.files[0];
        var reader = new FileReader();

        reader.onload = function(e)
         {
          var image = new Image();

          image.onload = function()
           {
            changeFunc(file.name,image);

            elementRemoveAllChildren(imagePicture_td);

            imagePicture_td.appendChild(image);
           }

          image.src = e.target.result;
          image.className = "texture-thumbnail";
         }

        reader.readAsDataURL(file);
       }
     }

    imageInputLabel.appendChild(imageInput);

    var imageInputLabel_td = document.createElement("td");

    imageInputLabel_td.appendChild(imageInputLabel);

    input_table_tr.appendChild(imagePicture_td);
    input_table_tr.appendChild(imageInputLabel_td);

    var imageInputRemoveButton = document.createElement("button");

    imageInputRemoveButton.appendChild(document.createTextNode("Remove"));

    var imageInputRemoveButton_td = document.createElement("td");

    imageInputRemoveButton_td.appendChild(imageInputRemoveButton);

    imageInputRemoveButton.onclick = function(evt)
     {
      changeFunc(null,null);

      elementRemoveAllChildren(imagePicture_td);
     }

    input_table_tr.appendChild(imageInputRemoveButton_td);

    input_table.appendChild(input_table_tr);

    image_td.appendChild(input_table);

    tr.appendChild(image_td);

    parent.appendChild(tr);

    return {
      "setValue" : function(thumbnail)
       {
        elementRemoveAllChildren(imagePicture_td);

        if (thumbnail != null)
         {
          thumbnail.className = "texture-thumbnail";

          imagePicture_td.appendChild(thumbnail);
         }
       }
     };
   }

  function addStringParameter(parent,id,label,value,changeFunc)
   {
    var tr       = document.createElement("tr");
    var label_td = document.createElement("td");
    var label    = document.createTextNode(label);

    label_td.appendChild(label);

    tr.appendChild(label_td);

    var text_td    = document.createElement("td");
    var text_input = document.createElement("input");

    text_input.type = "text";

    text_input.onchange = function()
     {
      changeFunc(text_input.value);
     }

    text_td.appendChild(text_input);
    tr.appendChild(text_td);

    parent.appendChild(tr);

    return text_input;
   }

  function SimpleValueChangeCommand (obj,param,newValue)
   {
    var oldValue = obj[param];

    this.exec = function ()
     {
      obj[param] = newValue;
     }

    this.undo = function ()
     {
      obj[param] = oldValue;
     }
   }

  var NumberChangeCommand = SimpleValueChangeCommand;
  var BoolChangeCommand   = SimpleValueChangeCommand;
  var ImageChangeCommand  = SimpleValueChangeCommand;
  var StringChangeCommand = SimpleValueChangeCommand;

  function Number2ChangeCommand (obj,param1,param2,newValue1,newValue2)
   {
    var oldValue1 = obj[param1];
    var oldValue2 = obj[param2];

    this.exec = function ()
     {
      obj[param1] = newValue1;
      obj[param2] = newValue2;
     }

    this.undo = function ()
     {
      obj[param1] = oldValue1;
      obj[param2] = oldValue2;
     }
   }

  function RGBChangeCommand (obj,param,value)
   {
    var oldValue = obj[param].clone();
    var newValue = value.clone();

    this.exec = function ()
     {
      obj[param].copyFrom(newValue);
     }

    this.undo = function ()
     {
      obj[param].copyFrom(oldValue);
     }
   }

  function FuncChangeCommand (obj,param,value)
   {
    var oldValue = obj[param].clone();
    var newValue = value.clone();

    this.exec = function()
     {
      obj[param].copyFrom(newValue);
     }

    this.undo = function()
     {
      obj[param].copyFrom(oldValue);
     }
   }

  function getMouseEventLocalPos(evt)
   {
    var offsetX = 0;
    var offsetY = 0;
    var elt     = evt.target;

    while (elt != null)
     {
      offsetX += elt.offsetLeft - elt.scrollLeft;
      offsetY += elt.offsetTop - elt.scrollTop;

      elt = elt.offsetParent;
     }

    return { x : evt.pageX - offsetX, y : evt.pageY - offsetY };
   }

  function saveFile(name,data)
   {
    var downloadLink = document.createElement("a");

    downloadLink.download  = name;
    downloadLink.innerHTML = "Download file";

    if (window.webkitURL != null)
     {
      downloadLink.href = window.webkitURL.createObjectURL(data);
     }
    else
     {
      downloadLink.href = window.URL.createObjectURL(data);
      downloadLink.onclick = function(evt)
       {
        document.body.removeChild(evt.target);
       };
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
     }

    downloadLink.click();
   }

  this.addRangeParameter        = addRangeParameter;
  this.addFuncParameter         = addFuncParameter;
  this.addRGBParameter          = addRGBParameter;
  this.addCheckBoxParameter     = addCheckBoxParameter;
  this.addDropDownListParameter = addDropDownListParameter;
  this.addImageParameter        = addImageParameter;
  this.addStringParameter       = addStringParameter;

  this.NumberChangeCommand       = NumberChangeCommand;
  this.Number2ChangeCommand      = Number2ChangeCommand;
  this.FuncChangeCommand         = FuncChangeCommand;
  this.RGBChangeCommand          = RGBChangeCommand;
  this.BoolChangeCommand         = BoolChangeCommand;
  this.ImageChangeCommand        = ImageChangeCommand;
  this.StringChangeCommand       = StringChangeCommand;

  this.getMouseEventLocalPos = getMouseEventLocalPos;

  this.saveFile = saveFile;
 }

var uiTools = new UITools();

