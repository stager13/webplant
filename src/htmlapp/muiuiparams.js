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

function UIParams(parent,app)
 {
  this.groundVisibleInput   = null;
  this.backgroundColorInput = null;

  function create()
   {
    parent.style.display = "none";

    var view = app.getView();

    this.groundVisibleInput =
     uiTools.addCheckBoxParameter(parent,"groundVisible","Display ground",
                                  view.isGroundVisible(),
     function(checked)
      {
       view.setGroundVisible(checked)
      });

    this.backgroundColorInput =
     uiTools.addRGBParameter(parent,"backgroundColor","Background color",
                             view.getBackgroundColor(),
     function(value)
      {
       view.setBackgroundColor(value);
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
    var view = app.getView();

    this.groundVisibleInput.setValue(view.isGroundVisible());
    this.backgroundColorInput.setValue(view.getBackgroundColor());
   }

  this.create = create;
  this.show   = show;
  this.hide   = hide;
  this.update = update;
 }

