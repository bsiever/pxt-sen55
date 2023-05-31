serial.writeLine("Starting...")

input.onButtonPressed(Button.A, function () {
    serial.writeLine("Name = ")
    serial.writeLine(Sen55.productName() + "!")
})
basic.showNumber(6)
