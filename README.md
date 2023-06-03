# SEN55 Air Quality Sensor

<!-- This extension expands the behaviors supported by the A & B buttons.  It supports (mutually exclusive) detection of a single click of a button, a double click of a button, or holding a button down. 



# Single Button Clicks

```sig
buttonClicks.onButtonSingleClicked(button: buttonClicks.AorB, body: Action) : void
``` 

Set the actions to do on a single click. 

# Double Button Clicks

```sig
buttonClicks.onButtonDoubleClicked(button: buttonClicks.AorB, body: Action) : void
``` 

Set the actions to do on a double click. 

# Holding Buttons (Long Clicks)

```sig
buttonClicks.onButtonHeld(button: buttonClicks.AorB, body: Action) : void
``` 

Set the actions to do while the button is held down.

### ~alert

# Holding a button down 

Holding the button will cause this event to happen repeated while the button is held.  
 -->

# Example 

The following program will show ...

<!-- ```block

buttonClicks.onButtonSingleClicked(buttonClicks.AorB.B, function () {
    serial.writeLine("B single")
    basic.showLeds(`
        . . . . #
        . . . . .
        . . . . .
        . . . . .
        # . . . .
        `)
    showClear()
})


``` -->


# Acknowledgements 

Icon based on [Font Awesome icon 0xf0c2](https://www.iconfinder.com/search?q=f0c2) SVG.

# Misc. 

I develop micro:bit extensions in my spare time to support activities I'm enthusiastic about, like summer camps and science curricula.  You are welcome to become a sponsor of my micro:bit work (one time or recurring payments), which helps offset equipment costs: [here](https://github.com/sponsors/bsiever). Any support at all is greatly appreciated!

## Supported targets

for PXT/microbit

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
