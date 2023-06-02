Sen55.onError(function (reason) {
    serial.writeLine(reason)
})
input.onButtonPressed(Button.A, function () {
    serial.writeValue("pm10", Sen55.particleMass(Sen55ParticleMasses.PM10))
    serial.writeValue("pm25", Sen55.particleMass(Sen55ParticleMasses.PM25))
    serial.writeValue("temp", Sen55.temperature())
    serial.writeValue("humidity", Sen55.humidity())
    serial.writeValue("VOC", Sen55.VOC())
    serial.writeValue("NOx", Sen55.NOx())
})
input.onButtonPressed(Button.B, function () {
    serial.writeLine(Sen55.productName())
    serial.writeLine(Sen55.serialNumber())
    serial.writeLine("" + (Sen55.firmwareVersion()))
})
Sen55.startMeasurements()


// serial.writeLine("Starting prog...")

// input.onButtonPressed(Button.A, function () {
//     serial.writeLine("Name = ")
//     serial.writeLine(Sen55.productName() + "!")
//     serial.writeLine(Sen55.serialNumber() + "!")
//     serial.writeLine(Sen55.firmwareVersion() + "!")
// })


// Sen55.onError(function (reason: string) {
//     serial.writeLine("Error! "+ reason)
// });

// basic.showNumber(2)

// input.onButtonPressed(Button.B, function () {
// //    Sen55.readValues()
// })

// Sen55.startMeasurements()
// serial.writeLine("Starting meas...")
// // pause(5*60*1000)
// // Sen55.stopMeasurements()
// // serial.writeLine("Done meas...")
