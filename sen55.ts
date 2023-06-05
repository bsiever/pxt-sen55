

enum Sen55SensorMode {
    //% block="with particle mass"
    WithParticleMass,
    //% block="without particle mass"
    WithoutParticleMass
}

enum Sen55ParticleMasses {
    //% block="1.0"
    PM10,
    //% block="2.5"
    PM25,
    //% block="4.0"
    PM40,
    //% block="10.0"
    PM100
}

enum Sen55ParticleCounts {
    //% block="0.5"
    PC05,
    //% block="1.0"
    PC10,
    //% block="2.5"
    PC25,
    //% block="4.0"
    PC40,
    //% block="10.0"
    PC100
}



//% color=#149ef5
//% icon="\uf0c2"
//% block="SEN55"
namespace sen55 {

    export enum StatusMasks {
        //% block="fan speed warning"
        FanSpeedWarning = 1 << 21,
        //% block="fan is cleaning"
        FanIsCleaning = 1 << 19,
        //% block="gas sensor failure"
        GasFailure = 1 << 7,
        //% block="temperature and humidity failure"
        RHTFailure = 1 << 6,
        //% block="particle mass laser failure"
        PMLaserFailure = 1 << 5,
        //% block="fan failure"
        FanFailure = 1 << 4,
    }

    //% whenUsed
    let errorHandler: Action = null;
    //% whenUsed
    let _lastError: string = null;

    // ************** Private helpers **************

    //% shim=sen55::setErrorHandler
    function setErrorHandler(a: Action) {
        errorHandler = a; 
    }

    //% shim=sen55::_startMeasurements
    function _startMeasurements(withPM: boolean) {
        0;
    }

    //% shim=sen55::lastError
    function lastError(): string {
        return _lastError;
    }

    // ************** Exposed primary blocks **************

    /**
      * Start Measurements with the given measurement type.  
      * Measurements must be started before data can be read.  Some sensors require a warm-up period before measurements are accurate (See page 6 of https://sensirion.com/media/documents/6791EFA0/62A1F68F/Sensirion_Datasheet_Environmental_Node_SEN5x.pdf#page=6).
      * @param measurementType to use.  Include particle mass values, which is the default, or just Gases, which uses less power.
      */
    //% block="start measurements || $measurementType"
    //% expandableArgumentMode="enabled"
    //% measurementType.defl=Sen55SensorMode.WithParticulateMatter
    //% weight=1000
    export function startMeasurements(measurementType?: Sen55SensorMode) {
        serial.writeLine("Starting measurements..." + isNaN(measurementType) ? "undefined" : measurementType.toString());
        _startMeasurements(isNaN(measurementType) ? true : measurementType == Sen55SensorMode.WithParticleMass);
    }

    /**
     * Get the mass of particles that are up to the given size.
     * @param size the upper limit on particle size to include (defaults to 10µm)
     * Measurements must be started and include particle mass values.
     */
    //% block="mass of particles from 0.3 to $size µm in µg/m³"
    //% shim=sen55::particleMass
    //% weight=700
    export function particleMass(size?: Sen55ParticleMasses) : number {
        // If undefined, default to largest (includes others)
        if(size == undefined) 
          size = Sen55ParticleMasses.PM100
        switch(size) {
            case Sen55ParticleMasses.PM10:
                return 1.0
            case Sen55ParticleMasses.PM25:
                return 2.5
            case Sen55ParticleMasses.PM40:
                return 4.0
            case Sen55ParticleMasses.PM100:
                return 10.0
        }
        return NaN;
    }


    /**
     * Get the count of particles that are up to the given size. 
     * @param size the upper limit on particle size to include (defaults to 10µm)
     * Measurements must be started and include particle mass values.
     */
    //% block="count of particles from 0.3 to $size µm in #/cm³"
    //% shim=sen55::particleCount
    //% weight=650
    export function particleCount(size?: Sen55ParticleCounts) : number {
        if (size == undefined)
            size = Sen55ParticleCounts.PC100
        switch(size) {
            case Sen55ParticleCounts.PC05:
                return 0.5
            case Sen55ParticleCounts.PC10:
                return 1.0
            case Sen55ParticleCounts.PC25:
                return 2.5
            case Sen55ParticleCounts.PC40:
                return 4.0
            case Sen55ParticleCounts.PC100:
                return 10.0
        }
        return NaN;
    }

    /**
     * Get the Sensirion VOC index.  See: https://sensirion.com/resource/application_note/voc_index
     * Value is from [1-500]
     * Measurements must be started.
     */
    //% block="VOC index"
    //% shim=sen55::VOC 
    //% weight=600
    export function VOCIndex(): number {
        return 90;
    }

    /**
     * Get the Sensirion NOx index.  See: https://sensirion.com/resource/application_note/nox_index
     * Value is from [1-500]
     * Measurements must be started.
     */
    //% block="NOx index"
    //% shim=sen55::NOx
    //% weight=500
    export function NOxIndex(): number {
        return 1;
    }

    /**
     * Get the temperature in °C (Compensated based on Sensirion's STAR Engine)
     * Measurements must be started.
     */
    //% block="temperature °C"
    //% shim=sen55::temperature
    //% weight=400
    export function temperature(): number {
        return 26.1;
    }

    /**
     * Get the relative humidity [0-100] (Compensated based on Sensirion's STAR Engine)
     * Measurements must be started.
     */
    //% block="humidity (\\% relative)"
    //% shim=sen55::humidity
    //% weight=300
    export function humidity(): number {
        return 30.5;
    }

    /**
     * Stop all measurements. 
     */
    //% block="stop measurements"
    //% shim=sen55::stopMeasurements
    //% weight=200
    export function stopMeasurements() {
        0;
    }

    /**
     * Set a handler for errors 
     * @param errCallback The error handler 
     */
    //% blockId="error" block="SEN55 error"
    //% draggableParameters="reporter" weight=0
    //% weight=100
    export function onError(errCallback: (reason: string) => void) {
        if (errCallback) {
            errorHandler = () => {
                let le = lastError();
                errCallback(le);
            };
        } else {
            errorHandler = null;
        }
        setErrorHandler(errorHandler);
    }


    // ************** Exposed ADVANCED blocks **************

    /**
     * Get the typical particle size in µm.
     * Measurements must be started and include particle mass values.
     */
    //% block="typical particle size µm" advanced=true
    //% shim=sen55::typicalParticleSize
    //% weight=980
    export function typicalParticleSize(): number {
        return 2.1;
    }

    /**
     * Get the device status. Returns a number with bit masks given in sen55.StatusMasks.
     */
    //% block="device status" advanced=true
    //% shim=sen55::deviceStatus
    //% weight=950
    export function deviceStatus(): number {
        return 0;
    }

    /**
     * Get the raw VOC value (not an index)
     * Measurements must be started.
     */
    //% block="raw VOC index" advanced=true
    //% shim=sen55::rawVOC 
    //% weight=890
    export function rawVOC(): number {
        return 90;
    }


    /**
     * Get the raw NOx value (not an index)
     * Measurements must be started.
     */
    //% block="raw NOx index" advanced=true
    //% shim=sen55::rawNOx
    //% weight=880
    export function rawNOx(): number {
        return 1;
    }

    /**
     * Get the raw temperature value °C" (not compensated)
     * Measurements must be started.
     */
    //% block="raw temperature °C" advanced=true
    //% shim=sen55::rawTemperature
    //% weight=870
    export function rawTemperature(): number {
        return 26.1;
    }

    /**
     * Get the raw relative humidity value °C" (not compensated)
     * Measurements must be started.
     */
    //% block="raw humidity (\\% relative)" advanced=true
    //% shim=sen55::rawHumidity
    //% weight=860
    export function rawHumidity(): number {
        return 30.5;
    }

    /**
     * Get the product name
     */
    //% block="product name" advanced=true
    //% shim=sen55::productName
    //% weight=830
    export function productName(): string {
        return "SEN55 (SIM)";
    }

    /**
     * Get the serial number
     */
    //% block="serial number" advanced=true
    //% shim=sen55::serialNumber
    //% weight=820
    export function serialNumber(): string {
        return "00";
    }

    /**
     * Get the firmware version
     */
    //% block="firmware version" advanced=true
    //% shim=sen55::firmwareVersion
    //% weight=810
    export function firmwareVersion(): number {
        return 2;
    }

    /**
     * On all valid (non-raw) basic data ("non-error" context).  
     * Only enters the context if all basic data values are valid:  
     *      pm10, pm25, pm40, and pm100 are particle masses up to 1.0, 2.3, 4.0, and 10.0 µm respectively;
     *      rh is relative humidity
     *      temp is temperature 
     *      VOC is the VOC index 
     *      NOx is the NOx index
     */
    //% block="on valid sensor values $pm10, $pm25, $pm40, $pm100, $rh, $temp, $VOC, $NOx" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=720
    export function onValidData(handler: (pm10: number, pm25: number, pm40: number, pm100: number, rh: number, temp: number, VOC: number, NOx: number) => void) {
        // get values...If not error, call handler
        const _pm10 = particleMass(Sen55ParticleMasses.PM10)
        if (Number.isNaN(_pm10)) return
        const _pm25 = particleMass(Sen55ParticleMasses.PM25)
        if (Number.isNaN(_pm25)) return
        const _pm40 = particleMass(Sen55ParticleMasses.PM40)
        if (Number.isNaN(_pm40)) return
        const _pm100 = particleMass(Sen55ParticleMasses.PM100)
        if (Number.isNaN(_pm100)) return
        const _rh = humidity()
        if (Number.isNaN(_rh)) return
        const _temp = temperature()
        if (Number.isNaN(_temp)) return
        const _voc = VOCIndex()
        if (Number.isNaN(_voc)) return
        const _NOx = NOxIndex()
        if (Number.isNaN(_NOx)) return
        handler(_pm10, _pm25, _pm40, _pm100, _rh, _temp, _voc, _NOx)
    }

    /**
     * On all valid gas data ("non-error" context).
     * Only enters the context if all basic data values are valid:
     *      rh is relative humidity
     *      temp is temperature
     *      VOC is the VOC index
     *      NOx is the NOx index
     */    //% block="on valid sensor gas values $rh, $temp, $VOC, $NOx" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=710
    export function onValidGasData(handler: (rh: number, temp: number, VOC: number, NOx: number) => void) {
        // get values...If not error, call handler
        const _rh = humidity()
        if (Number.isNaN(_rh)) return
        const _temp = temperature()
        if (Number.isNaN(_temp)) return
        const _voc = VOCIndex()
        if (Number.isNaN(_voc)) return
        const _NOx = NOxIndex()
        if (Number.isNaN(_NOx)) return
        handler(_rh, _temp, _voc, _NOx)
    }

    /**
     * On all valid raw data ("non-error" context).
     * Only enters the context if all basic data values are valid:
     *      rawRh is rawnrelative humidity
     *      rawTemp is raw temperature
     *      rawVOC is the raw VOC 
     *      rawNOx is the raw NOx 
     *      no05, no10, no24, no40, and no100 are the particle counts for sizes up to 0.5, 1.0, 2.5, 4.0 and 10.0 µm respectively
     */
    //% block="on valid raw values $rawRh, $rawTemp, $rawVOC, $rawNOx, $no05, $no10, $no25, $no40, $no100" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=710
    export function onRawGasValues(handler: (rawRh: number, rawTemp: number, rawVOC: number, rawNOx: number, no05: number, no10: number, no25: number, no40:number, no100:number) => void) {
        // get values...If not error, call handler
        const _rawRh = rawHumidity()
        if (Number.isNaN(_rawRh)) return
        const _rawTemp = rawTemperature()
        if (Number.isNaN(_rawTemp)) return
        const _rawVOC = rawVOC()
        if (Number.isNaN(_rawVOC)) return
        const _rawNOx = rawNOx()
        if (Number.isNaN(_rawNOx)) return
        const _no05 = particleCount(Sen55ParticleCounts.PC05)
        if (Number.isNaN(_no05)) return
        const _no10 = particleCount(Sen55ParticleCounts.PC10)
        if (Number.isNaN(_no10)) return
        const _no25 = particleCount(Sen55ParticleCounts.PC25)
        if (Number.isNaN(_no25)) return
        const _no40 = particleCount(Sen55ParticleCounts.PC40)
        if (Number.isNaN(_no40)) return
        const _no100 = particleCount(Sen55ParticleCounts.PC100)
        if (Number.isNaN(_no100)) return
    
        handler(_rawRh, _rawTemp, _rawVOC, _rawNOx, _no05, _no10, _no25, _no40, _no100)
    }
    
    /**
     * Reset the sensor (back to startup conditions; Not performing measurements)
     */
    //% block="reset" advanced=true
    //% shim=sen55::reset
    //% weight=600
    export function reset() {
        0;
    }

    /**
     * Clear the device status
     */
    //% block="clear device status" advanced=true
    //% shim=sen55::clearDeviceStatus 
    //% weight=500
    export function clearDeviceStatus() {
        0;
    }

    /** 
     * Start cleaning the fan
     * Takes ~10s and all values are invalid while cleaning. 
     * Fan will automatically be cleaned if the device is continuously running without reset/restart for 1 week (168 hours). 
     */
    //% block="start fan cleaning" advanced=true
    //% shim=sen55::startFanCleaning
    //% weight=400
    export function startFanCleaning() {
        0;
    }
}
