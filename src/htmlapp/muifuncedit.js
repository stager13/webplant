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

function FuncEdit(parent,sourceSpline,changeFunc)
 {
  var canvas = null;
  var spline = sourceSpline.clone();

  var activePoint = null;

  function splineXToCanvas(splineX,canvasWidth)
   {
    return splineX * canvasWidth;
   }

  function splineYToCanvas(splineY,canvasHeight)
   {
    if (splineY < 0.0)
     {
      splineY = 0.0;
     }
    else if (splineY > 1.0)
     {
      splineY = 1.0;
     }

    return canvasHeight - splineY * canvasHeight;
   }

  function canvasXToSpline(canvasX,canvasWidth)
   {
    return canvasX / canvasWidth;
   }

  function canvasYToSpline(canvasY,canvasHeight)
   {
    return (canvasHeight - canvasY) / canvasHeight;
   }

  function redraw()
   {
    var width  = canvas.width;
    var height = canvas.height;
    var pointCount = spline.pointsCount;

    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000000";

    ctx.fillRect(0,0,width,height);

    ctx.beginPath();

    var xPx = 0;
    var yPx = splineYToCanvas(spline.getValue(0.0),height);

    ctx.moveTo(xPx,yPx);

    for (var xPx = 1; xPx < width; xPx++)
     {
      yPx = splineYToCanvas(spline.getValue(xPx / width),height);

      ctx.lineTo(xPx,yPx);
     }

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#FF0000";

    for (var i = 0; i < pointCount; i++)
     {
      ctx.beginPath();
      ctx.arc(splineXToCanvas(width,spline.getPointX(i),width),
              splineYToCanvas(spline.getPointY(i),height),
              3,
              0,
              2 * Math.PI);
      ctx.fill();
     }
   }

  function findPointByCanvasPos(x,y)
   {
    var pointCount = spline.pointsCount;
    var width      = canvas.width;
    var height     = canvas.height;

    for (var i = 0; i < pointCount; i++)
     {
      var px = splineXToCanvas(spline.getPointX(i),width);
      var py = splineYToCanvas(spline.getPointY(i),height);

      var dx = x - px;
      var dy = y - py;

      if (dx >= -3 && dx <= 3 && dy >= -3 && dy <= 3)
       {
        return i;
       }
     }

    return null;
   }

  function deletePointAt(pos)
   {
    var pointCount = spline.pointsCount;
    var pointIndex = findPointByCanvasPos(pos.x,pos.y);

    if (pointIndex === null)
     {
      return;
     }

    if (pointIndex == 0 || pointIndex == pointCount - 1)
     {
      return;
     }

    spline.delPoint(pointIndex);

    activePoint = null;

    redraw();

    changeFunc(spline);
   }

  function startDrag(pos)
   {
    activePoint = findPointByCanvasPos(pos.x,pos.y);

    if (activePoint === null)
     {
      dragSplineTo(pos);
     }
   }

  function stopDrag()
   {
    activePoint = null;
   }

  function moveActivePointTo(pos)
   {
    var width  = canvas.width;
    var height = canvas.height;
    var pointCount = spline.pointsCount;

    var splineX = canvasXToSpline(pos.x,width);
    var splineY = canvasYToSpline(pos.y,height);

    if      (activePoint == 0)
     {
      splineX = 0.0;
     }
    else if (activePoint == pointCount - 1)
     {
      splineX = 1.0;
     }
    else if (splineX < 0.0)
     {
      splineX = 0.0;
     }
    else if (splineX > 1.0)
     {
      splineX = 1.0;
     }

    if (splineY < 0.0)
     {
      splineY = 0.0;
     }
    else if (splineY > 1.0)
     {
      splineY = 1.0;
     }

    spline.updatePoint(splineX,splineY,activePoint);

    redraw();

    changeFunc(spline);
   }

  function dragSplineTo(pos)
   {
    var width  = canvas.width;
    var height = canvas.height;

    var splineX = canvasXToSpline(pos.x,width);
    var splineY = spline.getValue(splineX);
    var canvasY = splineYToCanvas(splineY,height);

    var dy = canvasY - pos.y;

    if (dy >= -3 && dy <= 3)
     {
      spline.addPoint(splineX,splineY);

      activePoint = findPointByCanvasPos(pos.x,pos.y);
     }
   }

  function create()
   {
    canvas = document.createElement("canvas");

    canvas.width  = 120;
    canvas.height = 40;

    canvas.onmousedown = function(evt)
     {
      if (evt.button == 0)
       {
        startDrag(uiTools.getMouseEventLocalPos(evt));
       }
      else if (evt.button == 1)
       {
        deletePointAt(uiTools.getMouseEventLocalPos(evt));
       }
     }

    canvas.onmouseup = function(evt)
     {
      if (evt.button == 0)
       {
        stopDrag();
       }
     }

    canvas.onmousemove = function(evt)
     {
      if (activePoint !== null)
       {
        moveActivePointTo(uiTools.getMouseEventLocalPos(evt));
       }
     }

    parent.appendChild(canvas);

    redraw();
   }

  function setData(sourceSpline)
   {
    spline.copyFrom(sourceSpline);

    redraw();
   }

  this.create  = create;
  this.redraw  = redraw;
  this.setData = setData;
 }

