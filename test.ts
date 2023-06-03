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
    serial.writeValue("raw temp", Sen55.rawTemperature())
    serial.writeValue("raw humidity", Sen55.rawHumidity())
    serial.writeValue("raw NOx", Sen55.rawNOx())
    serial.writeValue("raw VOC", Sen55.rawVOC())
}) 
input.onButtonPressed(Button.B, function () {
    serial.writeLine(Sen55.productName())
    serial.writeLine(Sen55.serialNumber())
    serial.writeLine("" + (Sen55.firmwareVersion()))
    let stat = Sen55.deviceStatus()
    serial.writeLine("Status: " + stat)
    serial.writeLine("Fan status " + ((stat & Sen55.StatusMasks.FanFailure) == 0) ? "off" : "on");
    Sen55.startFanCleaning()
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
