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


function Command (doFunc,undoFunc)
 {
  this.exec = doFunc;
  this.undo = undoFunc;
 }

function CommandArray ()
 {
  var UNDO_BUFFER_MAX_LEN = 1000;

  var index    = 0;
  var commands = [];

  this.pushAndExec = function(cmd)
   {
    cmd.exec();

    if      (index < commands.length)
     {
      commands[index++] = cmd;

      commands.splice(index,commands.length - index);
     }
    else if (commands.length < UNDO_BUFFER_MAX_LEN)
     {
      commands.push(cmd);

      index++;
     }
    else
     {
      commands.shift();
      commands.push(cmd);
     }
   }

  this.undo = function()
   {
    if (index > 0)
     {
      commands[--index].undo();
     }
   }

  this.redo = function()
   {
    if (index < commands.length)
     {
      commands[index++].exec();
     }
   }

  this.canUndo = function()
   {
    return index > 0;
   }

  this.canRedo = function()
   {
    return index < commands.length;
   }
 }

