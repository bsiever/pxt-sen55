/**
* Bill Siever
* 2023-05-31 Initial Version
*
* This code is released under the [MIT License](http://opensource.org/licenses/MIT).
* Please review the LICENSE.md file included with this example. If you have any questions 
* or concerns with licensing, please contact techsupport@sparkfun.com.
* Distributed as-is; no warranty is given.
*/

#include "pxt.h"
#include "MicroBitI2C.h"
#include "MicroBit.h"

using namespace pxt;

namespace sen55 {
    // Sensirion SEN55 address is 0x69:
    const int address = 0x69 << 1;
    
    // State variables

    static bool initialized = false; 
    static Action errorHandler = NULL;

    //% 
    void setErrorHandler(Action a) {
       // Release any prior error handler
       if(errorHandler)
         pxt::decr(errorHandler);
        errorHandler = a; 
        if(errorHandler)    
            pxt::incr(errorHandler);
    }

    /*
     * Helper method to send an actual error code to the registered handler.
     * It will scall the handler
     */
    void sen55_error() {
        if(errorHandler) {
            pxt::runAction0(errorHandler);            
        }
    }



    void init() {
        if (initialized) return;
        initialized = true;

        // Other stuff 
    }

    // CRC calculation  
    // Sensirion SEN55 Data Sheet, page 17
    // https://sensirion.com/resource/datasheet/sen5x
    static uint8_t CalcCrc(uint8_t data[2]) {
        uint8_t crc = 0xFF;
        for(int i = 0; i < 2; i++) {
            crc ^= data[i];
            for(uint8_t bit = 8; bit > 0; --bit) {
                if(crc & 0x80) {
                    crc = (crc << 1) ^ 0x31u;
                } else {
                    crc = (crc << 1);
                }
            }   
        }
        return crc; 
    }

    /*
    * Check all the CRCs of a buffer (buffer length must be multiple of 3)
    * returns true if all CRCs are correct, false otherwise.
    */
    bool checkBuffer(uint8_t *buffer, uint8_t length) {
        for (uint8_t i = 0; i < length; i += 3)
        {
            uint8_t crc = CalcCrc(buffer+i);
            if(crc != buffer[i+2]) {
                return false;
            }
        }
        return true;
    }



    // Send a command to the SEN55 and wait for the specified delay
    void sendCommand(uint16_t command, uint16_t delay) {
        init();

        command = ((command & 0xFF00) >> 8) | ((command & 0x00FF) << 8);
#if MICROBIT_CODAL
        uBit.i2c.write(address, (uint8_t *)&command, 2);
#else
        uBit.i2c.write(address, (char *)&command, 2);
#endif
        uBit.sleep(delay);
    }

    // Read data from the SEN55
    // Returns true if successful, false otherwise
    bool readData(uint8_t *data, uint16_t length) {
        uint8_t status = 0;
#if MICROBIT_CODAL
        status = uBit.i2c.read(address, (uint8_t *)data, length);
#else
        status = uBit.i2c.read(address, (char *)data, length);
#endif
        return status == MICROBIT_OK;
    }



    // Both read name and read serial number use the same format
    String read48ByteString(uint16_t command) {
        sendCommand(command, 20);
        uint8_t data[48];
        bool readStatus = readData(data, sizeof(data));
        if(readStatus==false || checkBuffer(data, sizeof(data))==false) {
            sen55_error();
            return PSTR("");
        }
        uint16_t loc = 0;
        // Squeeze all bytes in without CRCs
        for (uint16_t i = 0; i < sizeof(data); i += 3) {
            data[loc++] = data[i];
            data[loc++] = data[i+1];
        }
        data[loc] = 0; // Ensure null termination

        return PSTR((char*)data);
    }

    // Get product name:  Returns null on communication failure. 
    //%
    String productName() {
        return read48ByteString(0xD014);
    }

    // Get serial number:  Returns null on communication failure.
    //%
    String serialNumber() {
        return read48ByteString(0xD033);
    }

    //%
    void _startMeasurements(bool withPM) {
        uBit.serial.printf("Starting measurements with pm %s\n", withPM ? "true" : "false");
        sendCommand(withPM ? 0x0021 : 0x0037, 50);
    }
   
    //%
    void stopMeasurements() {
        sendCommand(0x0104, 200);
    }


    //% 
    void readValues() {
        sendCommand(0x03C4, 20);
        uint8_t data[24];
        bool readStatus = readData(data, sizeof(data));
        if(readStatus==false || checkBuffer(data, sizeof(data))==false) {
            sen55_error();
            uBit.serial.printf("Error reading data\n");
            for (int i = 0; i < 24;i++) {
                uBit.serial.printf("0x%x ", data[i]);
                
            }
            uBit.serial.printf("\n");
            return;
        }
        uint16_t pm1 = *((uint16_t*)(data+0));
        uint16_t pm25 = *((uint16_t*)(data+3));
        uint16_t pm4 = *((uint16_t*)(data+6));
        uint16_t pm10 = *((uint16_t*)(data+9));
        int16_t rh = *((uint16_t*)(data+12));
        int16_t temp = *((uint16_t*)(data+15));
        int16_t voci = *((uint16_t*)(data+18));
        int16_t noxi = *((uint16_t*)(data+21));
        uBit.serial.printf("pm1= %d, pm25= %d, pm4= %d, pm10= %d\n rh= %d, temp= %d, voci= %d, noxi= %d\n", pm1, pm25, pm4, pm10, rh, temp, voci, noxi);
    }
}

