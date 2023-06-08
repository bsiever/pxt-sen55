

```package
sen55=github:bsiever/pxt-sen55
```

# SEN55 Air Quality Sensor

This extension supports the [Sensirion SEN55](https://sensirion.com/products/catalog/SEN55/) Environmental Sensor Node, which includes sensors for:

* Airborne Particulate Matter (Particle sizes of up to 1.0, 2.5, 4.0, and 10.0 µm)
* Volatile Organic Compounds (VOCs)
* Nitrogen Oxides (NOx)
* Relative Humidity
* Temperature

Sensor details and data sheets can be found at: [https://sensirion.com/products/catalog/SEN55/](https://sensirion.com/products/catalog/SEN55/)

# Parts & Wiring

## Parts 

Almost all the parts necessary for this project can be purchased from DigiKey:

1. Sensirion SEN55: https://www.digikey.com/en/products/detail/sensirion-ag/SEN55-SDN-T/16342756
2. Cable to connect SEN55 to a breadboard: https://www.digikey.com/en/products/detail/sparkfun-electronics/CAB-18079/14322699
3. A MicroBit Breakout Board: https://www.digikey.com/en/products/detail/sparkfun-electronics/BOB-16446/14557733

There are also a few parts that are available in a variety of kits and from other sources.  Below are variations that are available via Amazon:


1. A breadboard (only one needed)
2. Jumper wires (only a single wire needed)
3. A 5v power supply.  

All three are available in this Amazon kit: https://www.amazon.com/HJ-Garden-Electronic-Component-Breadboard/dp/B077SFGWYP/ 

## Wiring

Using parts like those from the Amazon kit, there are 9 major steps to wiring:

1. Plug the power supply into the bread board and configure the jumper so it provides 5v to the bottom rails on the bread board. 
2. Plug the micro:bit breakout board into the breadboard 
3. Connect a jumper wire between the ground on the bottom rail of the breadboard (the "-" rail) and the micro:bit's GND on the breakout board. 
4. Plug the cable into the SEN55 
5. Connect the SEN55's pins:
   1. Pin 1 (green wire in the picture) to the "+" rail from the 5V power supply. 
   2. Pin 2 (blue wire in the picture) to the "-" rail from the 5V power supply. 
   3. Pin 3 (yellow wire in the picture) to the "SDA" pin from the micro:bit (Micro:bit's pin 20).
   4. Pin 4 (black wire in the picture) to the "SCL" pin from the micro:bit (Micro:bit's pin 19).
   5. Pin 5 (red wire in the picture) to the "-" rail from the 5V power supply.
   6. Pin 6 (brown wire in the picure) is not connected.  In the picure it is plugged into an arbitrary row that is not connected to anything else to ensure it is out of the way.

![](https://raw.githubusercontent.com/bsiever/pxt-sen55/master/wiring/sen55_wiring.jpg)

### ~alert

# Errors on Numeric Values

Errors most reading numeric values (sensor values, not firmware version) or reported as `NaN` ("Not a Number").  `Number.isNaN()` can be used to determine if the returned value is not valid (is `NaN`).
### ~


# Start Measurements

```sig
sen55.startMeasurements(measurementType?: Sen55SensorMode) : void
```

Start making measurements.  If no argument is provided, it defaults to including measurements of particles.  Measurements that include particles (no argument or `Sen55SensorMode.WithParticleMass`) use more power than measurements of gasses only (`Sen55SensorMode.WithoutParticleMass`).

# Mass of particles by particle size

```sig
sen55.particleMass(size?: Sen55ParticleMasses) : number
```

Get the mass of particles of size 0.3µm up to the given size per volume (µg/m³). Returns `NaN` on error.

Measurements must be started via `sen55.startMeasurements(Sen55SensorMode.WithParticleMass)` prior to use.  

# Count of particles by particle size

```sig
sen55.particleCount(size?: Sen55ParticleCounts) : number
```

Get the count of particles of size 0.3µm up to the given size per volume (#/cm³).

Measurements must be started via `sen55.startMeasurements(Sen55SensorMode.WithParticleMass)` prior to use.  Returns `NaN` on error.

# VOC Index 

```sig
sen55.VOCIndex(): number
```

Get the VOC index [1-500]. See https://sensirion.com/media/documents/02232963/6294E043/Info_Note_VOC_Index.pdf .  Returns `NaN` on error.


# NOx Index 

```sig
sen55.NOxIndex(): number
```

Get the NOx index [1-500]. See https://sensirion.com/media/documents/9F289B95/6294DFFC/Info_Note_NOx_Index.pdf .  Returns `NaN` on error.

# Temperature 

```sig
sen55.temperature(): number
```

Get the temperature in Celsius.  The temperature value will be compensated based on Sensirion's STAR algorithm.

# Humidity

```sig
sen55.humidity(): number
```

Get the relative humidity (0-100%).  The humidity value will be compensated based on Sensirion's STAR algorithm.  Returns `NaN` on error.

# Stop Measurements

```sig
sen55.stopMeasurements() : void
```

Stop making measurements and return to low-power idle mode.

# On Error 

```sig
sen55.onError(errCallback: (reason: string) => void) : void
```

Respond to any errors.  `reason` will be a description of the error. 

# Typical Particle Size

```sig
sen55.typicalParticleSize(): number
```

Get the typical particle size in µm.  Returns `NaN` on error.

# Typical Particle Size

```sig
sen55.typicalParticleSize(): number
```

Get the typical particle size in µm.  Returns `NaN` on error.

# Device Status

```sig
sen55.deviceStatus(): number
```

Get the device status. Returns a number with bit masks given in `sen55.StatusMasks`. Returns -1 on error.

# Raw VOC

```sig
sen55.rawVOC(): number
```

Get the raw VOC value (not an index).  The raw value is proportional to the logarithm of the corresponding sensor resistance. Returns `NaN` on error. See https://sensirion.com/media/documents/5FE8673C/61E96F50/Sensirion_Gas_Sensors_Datasheet_SGP41.pdf .


# Raw NOx

```sig
sen55.rawNOx(): number
```

Get the raw NOx value (not an index).  The raw value is proportional to the logarithm of the corresponding sensor resistance. Returns `NaN` on error. See  https://sensirion.com/media/documents/5FE8673C/61E96F50/Sensirion_Gas_Sensors_Datasheet_SGP41.pdf .

# Raw Temperature

```sig
sen55.rawTemperature(): number
```

Get the raw temperature value °C" (not compensated). Returns `NaN` on error.

# Raw Humidity

```sig
sen55.rawHumidity(): number
```

Get the raw relative humidity" (not compensated). Returns `NaN` on error.

# Product Name

```sig
sen55.productName(): string
```

Get the product name. Returns an empty string on error.

# Serial Number

```sig
sen55.serialNumber(): string
```

Get the Serial number. Returns an empty string on error.

# Firmware Version

```sig
sen55.firmwareVersion(): number
```

Get the firmware version.  Returns -1 on error.

# Reset

```sig
sen55.reset(): void
```

Reset the sensor (back to startup conditions; Not performing measurements).

# Clear Device Status

```sig
sen55.clearDeviceStatus(): void
```

Clear the device status.

# Start Fan Cleaning

```sig
sen55.startFanCleaning(): void
```

Start cleaning the fan. Takes ~10s and all values are invalid while cleaning. 

Fan will automatically be cleaned if the device is continuously running without reset/restart for 1 week (168 hours).  Ideally fan should be cleaned after 168 hours of use, even if not continuously in use.

# Example

The following program will get air quality measures every second and relay them to the serial console / logger.
```block

basic.showIcon(IconNames.Heart)
sen55.startMeasurements()

sen55.onError(function (reason) {
    serial.writeLine(reason)
})

loops.everyInterval(1000, function () {
    serial.writeValue("pm10", sen55.particleMass(Sen55ParticleMasses.PM100))
    serial.writeValue("voc", sen55.VOCIndex())
    serial.writeValue("NOx", sen55.NOxIndex())
    serial.writeValue("temp", sen55.temperature())
    serial.writeValue("rh", sen55.humidity())
})


``` 


# Acknowledgements 

Icon based on [Font Awesome icon 0xf0c2](https://www.iconfinder.com/search?q=f0c2) SVG.

# Misc. 

I develop micro:bit extensions in my spare time to support activities I'm enthusiastic about, like summer camps and science curricula.  You are welcome to become a sponsor of my micro:bit work (one time or recurring payments), which helps offset equipment costs: [here](https://github.com/sponsors/bsiever). Any support at all is greatly appreciated!

## Supported targets

for PXT/microbit

<script src="https://makecode.com/gh-pages-embed.js"></script>
<script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
