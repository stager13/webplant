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

CPL.Core.LineReader = function()
 {
  this.readLine = function()
   {
    return null;
   }
 }

CPL.Core.TextLineReader = function (text)
 {
  var lines = text.split("\n");
  var count = lines.length;
  var pos   = 0;

  function readLine ()
   {
    if (pos < count)
     {
      return lines[pos++];
     }
    else
     {
      return null;
     }
   }

  this.readLine = readLine;
 }

CPL.Core.LineWriter = function()
 {
  this.writeLine = function(line)
   {
    return null;
   }
 }

CPL.Core.TextLineWriter = function()
 {
  var text = "";

  this.writeLine = function(line)
   {
    text += line + "\n";
   }

  this.getText = function()
   {
    return text;
   }
 }

CPL.Core.FmtInputStream = function(lineReader)
 {
  var lineNumber      = 0;
  var escCharsEnabled = true;

  function formatErrorMessage (message)
   {
    return message + " (line " + lineNumber + ")";
   }

  function enableEscapeChars ()
   {
    escCharsEnabled = true;
   }

  function disableEscapeChars ()
   {
    escCharsEnabled = false;
   }

  function splitToWords (str)
   {
    var words = str.split(" ");

    return words.filter(function(e) { return e != "" });
   }

  function readLineLow ()
   {
    var line = lineReader.readLine();

    if (line !== null)
     {
      lineNumber++;
     }

    return line;
   }

  function castStringToUnsigned (str)
   {
    var val = parseInt(str);

    if (isNaN(val))
     {
      return undefined;
     }
    else if (val < 0)
     {
      return undefined;
     }
    else
     {
      return val;
     }
   }

  function castStringToFloat (str)
   {
    var val = parseFloat(str);

    if (isNaN(val))
     {
      return undefined;
     }
    else
     {
      return val;
     }
   }

  function castStringToBool (str)
   {
    if      (str === "true")
     {
      return true;
     }
    else if (str === "false")
     {
      return false;
     }
    else
     {
      return undefined;
     }
   }

  function unescapeString (str)
   {
    if (str == "__None__")
     {
      return null;
     }
    else if (escCharsEnabled)
     {
      return CPL.Core.StringCodec.decodeString(str);
     }
    else
     {
      return str;
     }
   }

  function castStringToType (str,typeChar)
   {
    if      (typeChar == "u")
     {
      return castStringToUnsigned(str);
     }
    else if (typeChar == "f")
     {
      return castStringToFloat(str);
     }
    else if (typeChar == "b")
     {
      return castStringToBool(str);
     }
    else if (typeChar == "s")
     {
      return unescapeString(str);
     }
    else
     {
      return undefined;
     }
   }

  function readTagged (args,tag,format)
   {
    var line  = readLineLow();
    var words = splitToWords(line);
    var types = format.split("");
    var count = words.length;

    args.splice(0,args.length);

    if (count == 0)
     {
      throw new CPL.Core.Error(formatErrorMessage("tag not found"));
     }

    if (words.shift() != tag)
     {
      throw new CPL.Core.Error(formatErrorMessage("tag " + tag + " expected"));
     }

    count--;

    if (count != types.length)
     {
      throw new CPL.Core.Error(formatErrorMessage("invalid number of arguments"));
     }

    for (var i = 0; i < count; i++)
     {
      var val = castStringToType(words[i],types[i]);

      if (val === undefined)
       {
        throw new CPL.Core.Error(formatErrorMessage("invalid argument type"));
       }

      args.push(val);
     }
   }

  var readTaggedValueTempArgs = [];

  function readTaggedValue (tag,format)
   {
    readTagged(readTaggedValueTempArgs,tag,format);

    return readTaggedValueTempArgs[0];
   }

  function readTaggedSpline (tag)
   {
    var args = [];

    readTagged(args,tag,"s");

    if (args[0] != "CubicSpline")
     {
      throw new CPL.Core.Error(formatErrorMessage("unsupported curve type"));
     }

    readTagged(args,"CPCount","u");

    var n = args[0];
    var spline = new CPL.Core.Spline();

    for (var i = 0; i < n; i++)
     {
      readTagged(args,"Point","ff");

      spline.addPoint(args[0],args[1]);
     }

    return spline;
   }

  this.formatErrorMessage = formatErrorMessage;
  this.readTagged         = readTagged;
  this.readTaggedValue    = readTaggedValue;
  this.readTaggedSpline   = readTaggedSpline;
  this.enableEscapeChars  = enableEscapeChars;
  this.disableEscapeChars = disableEscapeChars;
 }

CPL.Core.FmtOutputStream = function(lineWriter)
 {
  function formatUnsignedValue (value)
   {
    return value.toString();
   }

  function formatFloatValue (value)
   {
    return value.toString();
   }

  function formatBoolValue (value)
   {
    return value ? "true" : "false";
   }

  function escapeString (value)
   {
    if (value === null)
     {
      return "__None__";
     }
    else
     {
      return CPL.Core.StringCodec.encodeString(value);
     }
   }

  function formatValue (typeChar,value)
   {
    if      (typeChar == "u")
     {
      return formatUnsignedValue(value);
     }
    else if (typeChar == "f")
     {
      return formatFloatValue(value);
     }
    else if (typeChar == "b")
     {
      return formatBoolValue(value);
     }
    else if (typeChar == "s")
     {
      return escapeString(value);
     }
    else
     {
      return "";
     }
   }

  function writeTagged (tag,format)
   {
    var str   = tag;
    var types = format.split("");

    for (var i = 0; i < types.length; i++)
     {
      str += " " + formatValue(types[i],arguments[2 + i]);
     }

    lineWriter.writeLine(str);
   }

  function writeTaggedSpline (tag,spline)
   {
    var pointCount = spline.pointsCount;

    lineWriter.writeLine(tag + " CubicSpline");
    lineWriter.writeLine("CPCount " + pointCount);

    for (var i = 0; i < pointCount; i++)
     {
      lineWriter.writeLine("Point " + spline.pointsX[i] + " " + spline.pointsY[i]);
     }
   }

  this.writeTagged       = writeTagged;
  this.writeTaggedSpline = writeTaggedSpline;
 }

