Earthbound Battle Backgrounds JS
============================================

Earthbound Battle Background JS is exactly what its name implies: the battle
backgrounds from the SNES RPG Earthbound/Mother 2, rendered entirely in client-side
JavaScript.

If you like this project, you might also like the [Earthbound Battle
Backgrounds Live
Wallpaper](https://github.com/gjtorikian/Earthbound-Battle-Backgrounds/), which
is a Java/Android implementation.

## How it works

Every battle background is composed of two layers, each with 327 possible
styles (including "blank"/zero). The layer styles can be interchanged, such that 
[Layer 1: 50 and Layer 2: 300](http://gjtorikian.github.io/Earthbound-Battle-Backgrounds-JS/?layer1=50&layer2=300)
is the same as [Layer 1: 300 and Layer 2: 50](http://gjtorikian.github.io/Earthbound-Battle-Backgrounds-JS/?layer1=300&layer2=50).
Thus, there are C(n,r) = 52,650 possible different background combinations. Obviously, 
this many don't exist in the game--the SNES's graphical capabilities only allow it to
properly render 3,176 of these combinations, and of those, only 225 are ever used.

The data for each of the 327 styles is bundled within the SNES cartridge.
Tiles are
constructed from various memory addresses in Earthbound game data. To create
the distortion effect, the following function is used:

```
Offset (y, t) = A sin ( F*y + S*t )
```

where:

*  _y_ is the vertical coordinate being transformed
*  _t_ is time that's elapsed
*  _A_ is the amplitude
*  _F_ is the frequency
*  _S_ is the speed or frameskip of the transformation

Offest refers to the _y_ direction of the shift at a given time _t_.

There are also three types of distortions that use the result of the Offset
function:

*  Horizontal translations, where each line is shifted left by the given number
of pixels
*  Horizontal interlaced translations, where every other line is shifted right
by the given number of pixels
*  Vertical compression translations, where each line is shifted up or down by
the given number of pixels

Different backgrounds use different distortion effects.

## List of backgrounds

For a list of every possible background, visit [this
link](http://gjtorikian.github.io/Earthbound-Battle-Backgrounds-JS/samples).

It's pretty damn hard to find out which battle backgrounds correspond to which
enemies. You can review the list of enemies matched with known battle
backgrounds to try and get your favorite on the **Suggested Layers** option. If
you discover a new one, please, email me and I'll add it to the list, giving
you full credit!

## Running locally

Make sure you have Node.js and NPM on your system. Then:

``` bash
npm install
node server.js
open http://localhost:8888
```

Note that this code runs entirely in the browser! Node is only used to start an
Express server.

## Why is this code so terrible?

The code might look terrible to you for one of two reasons:

1. I have no goddamn clue how JavaScript's "prototypical OOP" is supposed to
work. No clue at all. Add `requirejs` to the mix so that I can get some
modularity, and yeah, you'll see a bunch of messy parenthesis and brackets.
Sorry.

2. The pointer calculations depend on a bunch of bitwise operations.
These calculations depend on values being `short`--that is, fitting within a
certain byte address. Since JavaScript doesn't have types, you'll see me cheat
in a few places by doing `Int8Array(1)`, and messing with the value added to
the index.

I've also intentionally chosen not to pull in libraries like jQuery or Underscore,
simply because I didn't want to.

## License

This app is in no way endorsed or affiliated by Nintendo, Ape, HAL Laboratory,
Shigesato Itoi, e.t.c. It's licensed under MIT.

## Credits

I am entirely indebted to Mr. Accident of forum.starmen.net for the original
battle background generation code, which was a C# project that uses the battle
backgrounds as Windows screensavers. He also provided me with help along the
way, and as far as I'm aware, he discovered the math behind it all, including
the entire Offset function calculation. *This port would be nothing without
him.*

Additionally, everyone who worked on PK Hack or was even associated with the
project. It's incredible to witness such a powerful community of fans who have
turned a wonderful game inside-out over and over again.
