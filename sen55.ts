

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
      * Measurements must be started before data can be read.  Some sensors require a warm-up period before measurements are accurate.
      * @param measurementType to use
      */
    //% block="start measurements || $measurementType"
    //% expandableArgumentMode="enabled"
    //% measurementType.defl=Sen55SensorMode.WithParticulateMatter
    //% weight=1000
    export function startMeasurements(measurementType?: Sen55SensorMode) {
        serial.writeLine("Starting measurements..." + isNaN(measurementType) ? "undefined" : measurementType.toString());
        _startMeasurements(isNaN(measurementType) ? true : measurementType == Sen55SensorMode.WithParticleMass);
    }


    //% block="particle mass $choice µg/m³"
    //% shim=sen55::particleMass
    //% weight=700
    export function particleMass(choice: Sen55ParticleMasses) : number {
        switch(choice) {
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

    //% block="particle $choice #/cm³"
    //% shim=sen55::particleCount
    //% weight=650
    export function particleCount(choice: Sen55ParticleCounts) : number {
        switch(choice) {
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

    //% block="VOC index"
    //% shim=sen55::VOC 
    //% weight=600
    export function VOCIndex(): number {
        return 90;
    }

    //% block="NOx index"
    //% shim=sen55::NOx
    //% weight=500
    export function NOxIndex(): number {
        return 1;
    }

    //% block="temperature °C"
    //% shim=sen55::temperature
    //% weight=400
    export function temperature(): number {
        return 26.1;
    }

    //% block="humidity (\\% relative)"
    //% shim=sen55::humidity
    //% weight=300
    export function humidity(): number {
        return 30.5;
    }

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

    //% block="device status" advanced=true
    //% shim=sen55::deviceStatus
    //% weight=950
    export function deviceStatus(): number {
        return 0;
    }

    //% block="raw VOC index"
    //% shim=sen55::rawVOC 
    //% weight=890
    export function rawVOC(): number {
        return 90;
    }

    //% block="typical particle size µm"
    //% shim=sen55::typicalParticleSize
    export function typicalParticleSize(): number {
      return 2.1;
    }


    //% block="raw NOx index"
    //% shim=sen55::rawNOx
    //% weight=880
    export function rawNOx(): number {
        return 1;
    }

    //% block="raw temperature °C"
    //% shim=sen55::rawTemperature
    //% weight=870
    export function rawTemperature(): number {
        return 26.1;
    }

    //% block="raw humidity (\\% relative)"
    //% shim=sen55::rawHumidity
    //% weight=860
    export function rawHumidity(): number {
        return 30.5;
    }



    //% block="product name" advanced=true
    //% shim=sen55::productName
    //% weight=830
    export function productName(): string {
        return "SEN55 (SIM)";
    }

    //% block="serial number" advanced=true
    //% shim=sen55::serialNumber
    //% weight=820
    export function serialNumber(): string {
        return "00";
    }

    //% block="firmware version" advanced=true
    //% shim=sen55::firmwareVersion
    //% weight=810
    export function firmwareVersion(): number {
        return 2;
    }

    /**
     * On all valid data ("non-error" context).  
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
     */
    //% block="on valid sensor gas values $rh, $temp, $VOC, $NOx" advanced=true
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
     * On all valid raw gas data ("non-error" context).   
     */
    //% block="on valid raw values $rawRh, $rawTemp, $rawVOC, $rawNOx" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=710
    export function onRawGasValues(handler: (rawRh: number, rawTemp: number, rawVOC: number, rawNOx: number) => void) {
        // get values...If not error, call handler
        const _rawRh = rawHumidity()
        if (Number.isNaN(_rawRh)) return
        const _rawTemp = rawTemperature()
        if (Number.isNaN(_rawTemp)) return
        const _rawVOC = rawVOC()
        if (Number.isNaN(_rawVOC)) return
        const _rawNOx = rawNOx()
        if (Number.isNaN(_rawNOx)) return
        handler(_rawRh, _rawTemp, _rawVOC, _rawNOx)
    }
    
    //% block="reset" advanced=true
    //% shim=sen55::reset
    //% weight=600
    export function reset() {
        0;
    }


    //% block="clear device status" advanced=true
    //% shim=sen55::clearDeviceStatus 
    //% weight=500
    export function clearDeviceStatus() {
        0;
    }

    //% block="start fan cleaning" advanced=true
    //% shim=sen55::startFanCleaning
    //% weight=400
    export function startFanCleaning() {
        0;
    }
}
