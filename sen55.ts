

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
     * Get the mass of particles that are up to the given size. Returns NaN on error. 
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
     * Get the count of particles that are up to the given size. Returns NaN on error.
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
     * Get the Sensirion VOC index. Returns NaN on error. See: https://sensirion.com/resource/application_note/voc_index
     * Value is from [1-500]
     * Measurements must be started.
     */
    //% block="VOC index"
    //% shim=sen55::VOC 
    //% weight=600
    export function VOCIndex(): number {
        return 1;
    }

    /**
     * Get the Sensirion NOx index. Returns NaN on error. See: https://sensirion.com/resource/application_note/nox_index
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
     * Get the temperature in °C, compensated based on Sensirion's STAR Engine. Returns NaN on error.
     * Measurements must be started.
     */
    //% block="temperature °C"
    //% shim=sen55::temperature
    //% weight=400
    export function temperature(): number {
        return 26.1;
    }

    /**
     * Get the relative humidity [0-100], compensated based on Sensirion's STAR Engine. Returns NaN on error.
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
     * Get the typical particle size in µm. Returns NaN on error.
     * Measurements must be started and include particle mass values.
     */
    //% block="typical particle size µm" advanced=true
    //% shim=sen55::typicalParticleSize
    //% weight=980
    export function typicalParticleSize(): number {
        return 2.1;
    }

    /**
     * Get the device status. Returns a number with bit masks given in sen55.StatusMasks. Returns -1 on error. 
     */
    //% block="device status" advanced=true
    //% shim=sen55::deviceStatus
    //% weight=950
    export function deviceStatus(): number {
        return 0;
    }

    /**
     * Get the raw VOC value (not an index).  The raw value is proportional to the 
     * logarithm of the corresponding sensor resistance. Returns NaN on error. See https://sensirion.com/media/documents/5FE8673C/61E96F50/Sensirion_Gas_Sensors_Datasheet_SGP41.pdf
     * Measurements must be started.
     */
    //% block="raw VOC index" advanced=true
    //% shim=sen55::rawVOC 
    //% weight=890
    export function rawVOC(): number {
        return 90;
    }


    /**
     * Get the raw NOx value (not an index).  The raw value is proportional to the 
     * logarithm of the corresponding sensor resistance. Returns NaN on error. See https://sensirion.com/media/documents/5FE8673C/61E96F50/Sensirion_Gas_Sensors_Datasheet_SGP41.pdf
     * Measurements must be started.
     */
    //% block="raw NOx index" advanced=true
    //% shim=sen55::rawNOx
    //% weight=880
    export function rawNOx(): number {
        return 1;
    }

    /**
     * Get the raw temperature value °C" (not compensated). Returns NaN on error.
     * Measurements must be started.
     */
    //% block="raw temperature °C" advanced=true
    //% shim=sen55::rawTemperature
    //% weight=870
    export function rawTemperature(): number {
        return 26.1;
    }

    /**
     * Get the raw relative humidity value °C" (not compensated). Returns NaN on error.
     * Measurements must be started.
     */
    //% block="raw humidity (\\% relative)" advanced=true
    //% shim=sen55::rawHumidity
    //% weight=860
    export function rawHumidity(): number {
        return 30.5;
    }

    /**
     * Get the product name. Returns an empty string on error.
     */
    //% block="product name" advanced=true
    //% shim=sen55::productName
    //% weight=830
    export function productName(): string {
        return "SEN55 (SIM)";
    }

    /**
     * Get the serial number.  Returns an empty string on error.
     */
    //% block="serial number" advanced=true
    //% shim=sen55::serialNumber
    //% weight=820
    export function serialNumber(): string {
        return "00";
    }

    /**
     * Get the firmware version.  Returns -1 on error.
     */
    //% block="firmware version" advanced=true
    //% shim=sen55::firmwareVersion
    //% weight=810
    export function firmwareVersion(): number {
        return 2;
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
     * Clear the device status.
     */
    //% block="clear device status" advanced=true
    //% shim=sen55::clearDeviceStatus 
    //% weight=500
    export function clearDeviceStatus() {
        0;
    }

    /** 
     * Start cleaning the fan.
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
