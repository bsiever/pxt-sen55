serial.writeLine("Starting prog...")

input.onButtonPressed(Button.A, function () {
    serial.writeLine("Name = ")
    serial.writeLine(Sen55.productName() + "!")
    serial.writeLine(Sen55.serialNumber() + "!")
    serial.writeLine(Sen55.firmwareVersion() + "!")
})


Sen55.onError(function (reason: string) {
    serial.writeLine("Error! "+ reason)
});

basic.showNumber(2)

input.onButtonPressed(Button.B, function () {
//    Sen55.readValues()
})

Sen55.startMeasurements()
serial.writeLine("Starting meas...")
// pause(5*60*1000)
// Sen55.stopMeasurements()
// serial.writeLine("Done meas...")
