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

CPL.Core.StringCodec = (function()
 {
  function isSpecialChar(ch)
   {
    return ch == " " || ch == "\"" || ch == "\\" || ch.charCodeAt(0) < 0x20;
   }

  function strHasSpecialChars(str)
   {
    for (var i = 0; i < str.length; i++)
     {
      if (isSpecialChar(str.charAt(i)))
       {
        return true;
       }
     }

    return false;
   }

  function getEscapedChar(ch)
   {
    var code = ch.charCodeAt(0) % 0x100;

    return "\\" + code.toString(16);
   }

  function escapeString(str)
   {
    var result = "\"";

    for (var i = 0; i < str.length; i++)
     {
      var ch = str.charAt(i);

      if (isSpecialChar(ch))
       {
        result += getEscapedChar(ch);
       }
      else
       {
        result += ch;
       }
     }

    result += "\"";

    return result;
   }

  function unescapeString(str)
   {
    var result = "";

    for (var i = 1; i < str.length - 1; i++)
     {
      var ch = str.charAt(i);

      if (ch == "\\" && i + 2 < str.length)
       {
        result += String.fromCharCode(parseInt(str.substr(i+1,2),16));

        i += 2;
       }
      else
       {
        result += ch;
       }
     }

    return result;
   }

  function encodeString(str)
   {
    if (strHasSpecialChars(str))
     {
      return escapeString(str);
     }
    else
     {
      return str;
     }
   }

  function decodeString(str)
   {
    if (str.startsWith("\"") && str.endsWith("\""))
     {
      return unescapeString(str);
     }
    else
     {
      return str;
     }
   }

  return { "encodeString" : encodeString,
           "decodeString" : decodeString };
 })();

