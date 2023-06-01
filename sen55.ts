

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
    let errorHandler:Action = null;

    // Helper function
    //% shim=sen55::setErrorHandler
    export function setErrorHandler(a: Action) {
        errorHandler = a; 
    }

    //% shim=sen55::_startMeasurements
    export function _startMeasurements(withPM: boolean) {
        0;
    }


    /**
     * Set a handler for errors 
     * @param errCallback The error handler 
     */
    //% blockId="error" block="SEN55 error"
    //% draggableParameters="reporter" weight=0
    export function onError(errCallback: () => void) { 
       setErrorHandler(errCallback);
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

    //% shim=sen55::readValues
    export function readValues() {
        0;
    }

}
