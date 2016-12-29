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

CPL.Core.RNGSimple = function(startSeed)
 {
  var seed = startSeed;

  rand();

  function setSeed(newSeed)
   {
    seed = newSeed;

    rand();
   }

  function randomInt(min,max)
   {
    return min + Math.floor((max - min + 1.0) * rand() / (0xFFFFFFFF + 1.0));
   }

  function uniformFloat(min,max)
   {
    return min + rand() / (0xFFFFFFFF + 1.0) * (max - min);
   }

  function rand()
   {
    seed = (1664525 * seed + 1013904223) % 0x100000000;

    return seed;
   }

  this.setSeed      = setSeed;
  this.randomInt    = randomInt;
  this.uniformFloat = uniformFloat;
 }

