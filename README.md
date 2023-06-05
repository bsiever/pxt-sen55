# SEN55 Air Quality Sensor

This extension supports the [Sensirion SEN55](https://sensirion.com/products/catalog/SEN55/) Environmental Sensor Node, which includes sensors for:

* Airborne Particulate Matter (Particle sizes of up to 1.0, 2.5, 4.0, and 10.0 µm)
* Volatile Organic Compounds (VOCs)
* Nitrogen Oxides (NOx)
* Relative Humidity
* Temperature

Sensor details and data sheets can be found at: [https://sensirion.com/products/catalog/SEN55/](https://sensirion.com/products/catalog/SEN55/)


# Start Measurements

```sig
sen55.startMeasurements(measurementType?: Sen55SensorMode) : void
```

Start making measurements.  If no argument is provided, it defaults to including measurements of particles.  Measurements that include particles (no argument or `Sen55SensorMode.WithParticleMass`) use more power than measurements of gasses only (`Sen55SensorMode.WithoutParticleMass`).

# Mass of particles by particle size

```sig
sen55.particleMass(size?: Sen55ParticleMasses) : number
```

Get the mass of particles of size 0.3µm up to the given size per volume (µg/m³).

Measurements must be started via `sen55.startMeasurements(Sen55SensorMode.WithParticleMass)` prior to use.

# Count of particles by particle size

```sig
sen55.particleCount(size?: Sen55ParticleCounts) : number
```

Get the count of particles of size 0.3µm up to the given size per volume (#/cm³).

Measurements must be started via `sen55.startMeasurements(Sen55SensorMode.WithParticleMass)` prior to use.

# VOC Index 

```sig
sen55.VOCIndex(): number
```

Get the VOC index [1-500]. See https://sensirion.com/media/documents/02232963/6294E043/Info_Note_VOC_Index.pdf .


# NOx Index 

```sig
sen55.NOxIndex(): number
```

Get the NOx index [1-500]. See https://sensirion.com/media/documents/9F289B95/6294DFFC/Info_Note_NOx_Index.pdf .

# Temperature 

```sig
sen55.temperature(): number
```

Get the temperature in Celsius.  The temperature value will be compensated based on Sensirion's STAR algorithm.

# Humidity

```sig
sen55.humidity(): number
```

Get the relative humidity (0-100%).  The humidity value will be compensated based on Sensirion's STAR algorithm.


# Stop Measurements

```sig
sen55.stopMeasurements() : void
```

Stop making measurements and return to low-power idle mode.

# On Error 

```sig
sen55.onError(errCallback: (reason: string) => void) : void
```

Repond to any errors.  `reason` will be a description of the error. 


<!-- This extension expands the behaviors supported by the A & B buttons.  It supports (mutually exclusive) detection of a single click of a button, a double click of a button, or holding a button down. 

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
