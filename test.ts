sen55.onError(function (reason) {
    serial.writeLine(reason)
})
input.onButtonPressed(Button.A, function () {
    serial.writeValue("pm10", sen55.particleMass(Sen55ParticleMasses.PM10))
    serial.writeValue("pm25", sen55.particleMass(Sen55ParticleMasses.PM25))
    serial.writeValue("pm40", sen55.particleMass(Sen55ParticleMasses.PM40))
    serial.writeValue("pm100", sen55.particleMass(Sen55ParticleMasses.PM100))
    pause(100)
    serial.writeValue("temp", sen55.temperature())
    serial.writeValue("humidity", sen55.humidity())
    serial.writeValue("VOC", sen55.VOCIndex())
    serial.writeValue("NOx", sen55.NOxIndex())
    pause(100)
    serial.writeValue("rawtemp", sen55.rawTemperature())
    serial.writeValue("rawhumidity", sen55.rawHumidity())
    serial.writeValue("rawNOx", sen55.rawNOx())
    serial.writeValue("rawVOC", sen55.rawVOC())
    pause(100)

    serial.writeValue("nv0p5", sen55.particleCount(Sen55ParticleCounts.PC05))
    serial.writeValue("nv1p0", sen55.particleCount(Sen55ParticleCounts.PC10))
    serial.writeValue("nv2p5", sen55.particleCount(Sen55ParticleCounts.PC25))
    pause(100)
    serial.writeValue("nv4p0", sen55.particleCount(Sen55ParticleCounts.PC40))
    serial.writeValue("nv10p0", sen55.particleCount(Sen55ParticleCounts.PC100))
    pause(100)

    serial.writeValue("sz", sen55.typicalParticleSize())
    pause(100)
    serial.writeLine("-------------")
    serial.writeLine("-------------")
    serial.writeLine("-------------")

}) 
input.onButtonPressed(Button.B, function () {
    serial.writeLine(sen55.productName())
    serial.writeLine(sen55.serialNumber())
    serial.writeLine("" + (sen55.firmwareVersion()))
    let stat = sen55.deviceStatus()
    serial.writeLine("Status: " + stat)
    serial.writeLine("Fan status " + ((stat & sen55.StatusMasks.FanFailure) == 0) ? "off" : "on");
    sen55.startFanCleaning()
})
sen55.startMeasurements()


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
