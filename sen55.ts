

//% color=#cf64ed
//% icon="\uf0a7"
//% block="SEN55"
//% groups="['Advanced']"
namespace Sen55 {

    const i2cAddr = 0x69;

/** 
 * Return null if the buffer doesn't pass the checksum; Otherwise
 * buffer with raw data (checksums removed)
 */



    function checkBuffer(b: Buffer) : Buffer {
        return null;
    }



    //% block="produce name"
    export function productName(): string {
      // Format:  Command, Delay, buffer returned
      pins.i2cWriteNumber(i2cAddr, 0xD014, NumberFormat.UInt16BE, false)
      pause(20)
      let buffer = pins.i2cReadBuffer(i2cAddr, 32, false)
      let name = ''
      for(let i=0;i<buffer.length;i++) {
        let char = buffer.getUint8(i)
        if(char == 0) {
            serial.writeLine("Got to null at" + i)
            return name;
        }
        let stringForChar = String.fromCharCode(char&0x7f)
        serial.writeLine("Code: " + stringForChar + "(" + char+")")
        name = name.concat(stringForChar)
        serial.writeLine(name)
      }
      return "NONE"
    }

}
