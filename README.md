# Introduction

This is my take on the regular expression crossword that got some attention recently. The original (in pdf format) can be found here:

http://www.coinheist.com/rubik/a_regular_crossword/

# Using it

In the directory holding this file, run

    python -mSimpleHTTPServer

Then visit this page:

    http://localhost:8000/regexpuzzle.html

The state is maintained in a [fragment identifier](http://en.wikipedia.org/wiki/Fragment_identifier). This means you can bookmark your current state and retrieve it later.

# Free idea

Register the name regexpuzzles.com and do something awesome.

# Bugs

When you open the puzzle using a bookmark, the state isn't loaded immediately. Just go to the address bar and hit enter to make it load

When you change the zoom level in your browser you need to reload the page to align the regex labels.
