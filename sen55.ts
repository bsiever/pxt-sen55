

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


//% color=#149ef5
//% icon="\uf0c2"
//% block="SEN55"
namespace Sen55 {
    //% whenUsed
    let errorHandler: Action = null;
    //% whenUsed
    let lastError: string = null;

    // ************** Private helpers **************

    //% shim=sen55::setErrorHandler
    function setErrorHandler(a: Action) {
        errorHandler = a; 
    }

    //% shim=sen55::_startMeasurements
    function _startMeasurements(withPM: boolean) {
        0;
    }

    //% shim=sen55::getLastError
    function getLastError(): string {
        return lastError;
    }

    //% shim=sen55::pm10
    function pm10(): number {
        return 0;
    }

    //% shim=sen55::pm25
    function pm25(): number {
        return 0;
    }

    //% shim=sen55::pm40
    function pm40(): number {
        return 0;
    }

    //% shim=sen55::pm100
    function pm100(): number {
        return 0;
    }

    // ************** Exposed primary blocks **************

    /**
      * Start Measurements
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
    //% weight=700
    export function particleMass(choice: Sen55ParticleMasses) {
        switch(choice) {
            case Sen55ParticleMasses.PM10:
                return pm10()
            case Sen55ParticleMasses.PM25:
                return pm25()
            case Sen55ParticleMasses.PM40:
                return pm40()
            case Sen55ParticleMasses.PM100:
                return pm100()
        }
        return 65535;
    }

    //% block="VOC index"
    //% shim=sen55::VOC 
    //% weight=600
    export function VOC(): number {
        return 0;
    }

    //% block="NOx index"
    //% shim=sen55:NOx
    //% weight=500
    export function NOx(): number {
        return 0;
    }

    //% block="temperature °C"
    //% shim=sen55::temperature
    //% weight=400
    export function temperature(): number {
        return 0;
    }

    //% block="humidity (%%relative)"
    //% shim=sen55::humidity
    //% weight=300
    export function humidity(): number {
        return 0;
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
                let le = getLastError();
                errCallback(le);
            };
        } else {
            errorHandler = null;
        }
        setErrorHandler(errorHandler);
    }


    // ************** Exposed ADVANCED blocks **************

    //% block="device status" advanced=true
    //% shim=sen55:deviceStatus
    //% weight=1000
    export function deviceStatus(): number {
        return 0;
    }

    //% block="product name" advanced=true
    //% shim=sen55::productName
    //% weight=830
    export function productName(): string {
        return "SEN-55 (SIM)";
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
     * Get all sensor values in "non-error" context.  
     */
    //% block="on valid sensor values $pm10, $pm25, $pm40, $pm100, $rh, $temp, $VOC, $NOx" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=720
    export function allSensorValues(handler: (pm10: number, pm25: number, pm40: number, pm100: number, rh: number, temp: number, VOC: number, NOx: number) => void) {
        // get values...If not error, call handler
        const _pm10 = pm10()
        if (_pm10 == 65535) return
        const _pm25 = pm25()
        if (_pm25 == 65535) return
        const _pm40 = pm40()
        if (_pm40 == 65535) return
        const _pm100 = pm100()
        if (_pm100 == 65535) return
        const _rh = humidity()
        if (_rh == 65535) return
        const _temp = temperature()
        if (_temp == 65535) return
        const _voc = VOC()
        if (_voc == 65535) return
        const _NOx = NOx()
        if (_NOx == 65535) return
        handler(_pm10, _pm25, _pm40, _pm100, _rh, _temp, _voc, _NOx)
    }

    /**
     * Get all sensor values in "non-error" context.  
     */
    //% block="on valid sensor values $rh, $temp, $VOC, $NOx" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=710
    export function allGasSensorValues(handler: (rh: number, temp: number, VOC: number, NOx: number) => void) {
        // get values...If not error, call handler
        const _rh = humidity()
        if (_rh == 65535) return
        const _temp = temperature()
        if (_temp == 65535) return
        const _voc = VOC()
        if (_voc == 65535) return
        const _NOx = NOx()
        if (_NOx == 65535) return
        handler(_rh, _temp, _voc, _NOx)
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
