

enum Sen55SensorMode {
    //% block="with particle mass"
    WithParticleMass,
    //% block="without particle mass"
    WithoutParticleMass
}

//% color=#cf64ed
//% icon="\uf0a7"
//% block="SEN55"
//% groups="['Advanced']"
namespace Sen55 {
    //% whenUsed
    let errorHandler: Action = null;
    //% whenUsed
    let lastError: string = null;

    // Helper function
    //% shim=sen55::setErrorHandler
    export function setErrorHandler(a: Action) {
        errorHandler = a; 
    }

    //% shim=sen55::_startMeasurements
    function _startMeasurements(withPM: boolean) {
        0;
    }


    /**
     * Set a handler for errors 
     * @param errCallback The error handler 
     */
    //% blockId="error" block="SEN55 error"
    //% draggableParameters="reporter" weight=0
    export function onError(errCallback: (reason: string) => void) { 
        if(errCallback) {
            errorHandler = () => {
                let le  = getLastError(); 
                errCallback(le);          
            };
        } else {
            errorHandler = null;
        }
        setErrorHandler(errorHandler);        
    }

    //% shim=sen55::getLastError
    export function getLastError(): string {
        return lastError;
    }

    //% block="product name"
    ///% shim=sen55::productName
    export function productName(): string {
        return "SEN-55 (SIM)";
    }

    //% block="serial number"
    ///% shim=sen55::serialNumber
    export function serialNumber(): string {
        return "00";
    }


    //% block="firmware version"
    ///% shim=sen55::firmwareVersion
    export function firmwareVersion(): number {
        return 2;
    }


    /**
     * Start Measurements
     * @param measurementType to use
     */
    //% block="start measurements || $measurementType"
    //% expandableArgumentMode="enabled"
    //% measurementType.defl=Sen55SensorMode.WithParticulateMatter
    export function startMeasurements(measurementType?: Sen55SensorMode) {
        serial.writeLine("Starting measurements..."+isNaN(measurementType)?"undefined":measurementType.toString());
        _startMeasurements(isNaN(measurementType) ? true : measurementType == Sen55SensorMode.WithParticleMass);
    }

    //% shim=sen55::stopMeasurements
    export function stopMeasurements() {
        0;
    }

    //% shim=sen55::pm10
    export function pm10(): number {
        return 0;
    }

    //% shim=sen55::pm25
    export function pm25(): number {
        return 0;
    }

    //% shim=sen55::pm40
    export function pm40(): number {
        return 0;
    }
    
    //% shim=sen55::pm100
    export function pm100(): number {
        return 0;
    }


    //% shim=sen55::temperature
    export function temperature(): number {
        return 0;
    }

    //% shim=sen55::humidity
    export function humidity(): number {
        return 0;
    }

    //% shim=sen55::VOC 
    export function VOC(): number {
        return 0;
    }

    //% shim=sen55:NOx
    export function NOx(): number {
        return 0;
    }

    //% shim=sen55::reset
    export function reset() {
        0;
    }

    //% shim=sen55:deviceStatus
    export function deviceStatus(): number {
        return 0;
    }

    //% shim=sen55::clearDeviceStatus 
    export function clearDeviceStatus() {
        0;
    }

    //% shim=sen55::startFanCleaning
    export function startFanCleaning() {
        0;
    }

    /**
     * Get all sensor values in "non-error" context.  
     */
    //% block="on valid sensor values $pm10, %pm25, %pm40, %pm100, %rh, %temp, %VOC, %NOx" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=100
    export function allSensorValues(handler: (pm10: number, pm25: number, pm40: number, pm100: number, rh: number, temp: number, VOC: number, NOx: number) => void) {
        // get values...If not error, call handler
        const _pm10 = pm10()
        if(_pm10==65535) return 
        const _pm25 = pm25()
        if(_pm25==65535) return
        const _pm40 = pm40()
        if (_pm40 == 65535) return
        const _pm100 = pm100()
        if(_pm100==65535) return
        const _rh = humidity()
        if(_rh==65535) return
        const _temp = temperature()
        if(_temp==65535) return
        const _voc = VOC()
        if(_voc==65535) return
        const _NOx = NOx()
        if(_NOx==65535) return
        handler(_pm10, _pm25, _pm40, _pm100, _rh, _temp, _voc, _NOx)
    }

    /**
     * Get all sensor values in "non-error" context.  
     */
    //% block="on valid sensor values %rh, %temp, %VOC, %NOx" advanced=true
    //% draggableParameters=variable
    //% handlerStatement=1
    //% weight=100
    export function allGasSensorValues(handler: (rh: number, temp: number, VOC: number, NOx: number) => void) {
        // get values...If not error, call handler
        const _rh = humidity()
        if(_rh==65535) return
        const _temp = temperature()
        if(_temp==65535) return
        const _voc = VOC()
        if(_voc==65535) return
        const _NOx = NOx()
        if(_NOx==65535) return
        handler(_rh, _temp, _voc, _NOx)
    }
}
