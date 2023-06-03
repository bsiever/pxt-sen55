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


enum SEN55RunMode
{
    Idle,
    Measurement,
    MeasurementGasOnly
};
namespace sen55 {


    // Sensirion SEN55 address is 0x69:
    const int address = 0x69 << 1;
    const int staleDataTime = 1050;   // ms until data is considered stale

    // State variables
    static Action errorHandler = NULL;
    static String _lastError = PSTR("");

    static SEN55RunMode mode = Idle; 
    static unsigned long _lastReadTime;
    static uint16_t _pm1 ;
    static uint16_t _pm25;
    static uint16_t _pm4 ;
    static uint16_t _pm10;
    static int16_t  _rh  ;
    static int16_t  _temp;
    static int16_t  _voci;
    static int16_t  _noxi;


    static void invalidateValues() {
        _pm1  = 0xFFFF;
        _pm25 = 0xFFFF;
        _pm4  = 0xFFFF;
        _pm10 = 0xFFFF;
        _rh   = 0xFFFF;
        _temp = 0xFFFF;
        _voci = 0xFFFF;
        _noxi = 0xFFFF;
        _lastReadTime = 0;  // No valid read has occurred
    }

    // Forward Decls
    int deviceStatus();

    /*
     * Helper method to send an actual error code to the registered handler.
     * It will call the handler
     */
    static void sen55_error(const char *error="") {
        _lastError = PSTR(error);
        if(errorHandler) {
            pxt::runAction0(errorHandler);            
        }
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
    static bool checkBuffer(uint8_t *buffer, uint8_t length) {
        for (uint8_t i = 0; i < length; i += 3)
        {
            uint8_t crc = CalcCrc(buffer+i);
            if(crc != buffer[i+2]) {
                return false;
            }
        }
        return true;
    }


    // Send a command to the SEN55 and wait for the specified delay (in ms)
    static bool sendCommand(uint16_t command, uint16_t delay) {
        command = ((command & 0xFF00) >> 8) | ((command & 0x00FF) << 8);
        uint8_t status; 
#if MICROBIT_CODAL
        status = uBit.i2c.write(address, (uint8_t *)&command, 2);
#else
        status = uBit.i2c.write(address, (char *)&command, 2);
#endif
        uBit.sleep(delay);
        return status == MICROBIT_OK;
    }

    // Read data from the SEN55
    // Returns true if successful, false otherwise
    static bool readData(uint8_t *data, uint16_t length) {
        uint8_t status = 0;
#if MICROBIT_CODAL
        status = uBit.i2c.read(address, (uint8_t *)data, length);
#else
        status = uBit.i2c.read(address, (char *)data, length);
#endif
        return status == MICROBIT_OK;
    }

    // Both name and serial number use the same format
    static String read48ByteString(uint16_t command) {
        bool commandStatus = sendCommand(command, 20);
        uint8_t data[48];
        bool readStatus = readData(data, sizeof(data));
        if(commandStatus==false || readStatus==false || checkBuffer(data, sizeof(data))==false) {
            sen55_error("Read String Error");
            return PSTR("");
        }
        uint16_t loc = 0;
        // Squeeze all bytes in without CRCs
        for (uint16_t i = 0; i < sizeof(data)-2; i += 3) {
            data[loc++] = data[i];
            data[loc++] = data[i+1];
        }
        data[loc] = 0; // Ensure null termination

        return PSTR((char*)data);
    }

    /* 
     * Read the sensor values and update state variables
    */
    static void readValues() {
        if (deviceStatus() != 0)
        {
            invalidateValues();
            sen55_error("Read Sensor: Device Status Error");
            return;
        }
        bool commandStatus = sendCommand(0x03C4, 20);
        uint8_t data[24];
        bool readStatus = readData(data, sizeof(data));
        if(mode==Idle || commandStatus==false || readStatus==false || checkBuffer(data, sizeof(data))==false) {
            invalidateValues();
            sen55_error("Read Sensor Data Error");
            return;
        }

        // Valid read: Update state
        _lastReadTime = uBit.systemTime();
        _pm1    = (uint16_t)(data[0]<<8 | data[1]);
        _pm25   = (uint16_t)(data[3]<<8 | data[4]);
        _pm4    = (uint16_t)(data[6]<<8 | data[7]);
        _pm10   = (uint16_t)(data[9]<<8 | data[10]);
        _rh     = (int16_t)(data[12]<<8 | data[13]);
        _temp   = (int16_t)(data[15]<<8 | data[16]);
        _voci   = (int16_t)(data[18]<<8 | data[19]);
        _noxi   = (int16_t)(data[21]<<8 | data[22]);
    }

    /* 
    * Read state if stored values are stale (more than a second old)
    */
    static void readIfStale() {
        if( (_lastReadTime==0) || ((uBit.systemTime() - _lastReadTime) > staleDataTime) ) {
            readValues();
        }
    }

    //************************ MakeCode Blocks ************************


    //% 
    void setErrorHandler(Action a) {
       // Release any prior error handler
       if(errorHandler)
         pxt::decr(errorHandler);
        errorHandler = a; 
        if(errorHandler)    
            pxt::incr(errorHandler);
    }


    // Get PM1.0 value
    //%
    float pm10() {
        readIfStale();
        return _pm1 == 0xFFFF ? NAN : (_pm1/10.0f);
    }

    // Get PM2.5 value
    //%
    float pm25() {
        readIfStale();
        return _pm25 == 0xFFFF ? NAN : (_pm25/10.0f);
    }

    // Get PM4.0 value
    //%
    float pm40() {
        readIfStale();
        return _pm4 == 0xFFFF ? NAN : (_pm4/10.0f);
    }
    // Get PM10.0 value
    //%
    float pm100() {
        readIfStale();
        return _pm10 == 0xFFFF ? NAN : (_pm10/10.0f);
    }

    //% 
    float temperature() {
        readIfStale();
        return _temp == (int16_t)0xFFFF ? NAN : (_temp/200.0f);
    }

    //% 
    float humidity() {
        readIfStale();
        return _rh == (int16_t)0xFFFF ? NAN : (_rh/100.0f);
    }

    //%
    float VOC() {
        readIfStale();
        return _voci == (int16_t)0xFFFF ? NAN : (_voci/10.0f);
    }

    //%
    float NOx() {
        readIfStale();
        return _noxi == (int16_t)0xFFFF ? NAN : (_noxi/10.0f);
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

    // Get firmware:  Returns firmware version number.
    //%
    int firmwareVersion() {
        bool commandStatus =  sendCommand(0xD100, 20);
        uint8_t data[3];
        bool readStatus = readData(data, sizeof(data));
        if(commandStatus==false || readStatus==false || checkBuffer(data, sizeof(data))==false) {
            sen55_error("Read Firmware Error");
            return -1;
        }
        return data[0];
    }



    //%
    void _startMeasurements(bool withPM) {
        bool commandStatus = sendCommand(withPM ? 0x0021 : 0x0037, 50);
        if(commandStatus == false) {
            sen55_error("Start Measurements Error");
        } else {
            mode = withPM ? Measurement : MeasurementGasOnly;
        }
    }
   
    //%
    void stopMeasurements() {
        bool commandStatus = sendCommand(0x0104, 200);
        if(commandStatus == false) {
            sen55_error("Stop Measurements Error");
        } else {
            mode = Idle;
        }
    }

    //% 
    void reset() {
        bool commandStatus = sendCommand(0xD304, 100);
        if(commandStatus == false) {
            sen55_error("Reset Error");
        } else {
            mode = Idle;
            invalidateValues();
            _lastError = PSTR("");
        }
    }

    //% 
    void clearStatus() {
        bool commandStatus = sendCommand(0xD210, 20);
        if(commandStatus == false) {
            sen55_error("Device Status Clear Error");
        } 
    }

    //% 
    String getLastError() {
        return _lastError;
    }

    //%
    int deviceStatus() {
        bool commandStatus = sendCommand(0xD206, 20);
        uint8_t data[6];
        bool readStatus = readData(data, sizeof(data));
        if(commandStatus==false || readStatus==false || checkBuffer(data, sizeof(data))==false) {
            sen55_error("Read Device Status Error");
            return -1;
        }
        uint32_t status = data[0] << 24 | data[1] << 16 | data[3] << 8 | data[4];
        if(status!=0) {
            if(status & 1<<21) {
                sen55_error("Device Status: Fan Speed Error");
            }
            if(status & 1<<19) {
                sen55_error("Device Status: Fan Cleaning");
            }
            if(status & 1<<7) {
                sen55_error("Device Status: Gas Sensor Error");
            }
            if(status & 1<<6) {
                sen55_error("Device Status: Humidity/Temp Sensor Error");
            }
            if(status & 1<<5) {
                sen55_error("Device Status: Laser Error");
            }
            if(status & 1<<4) {
                sen55_error("Device Status: Fan Error");
            }
        }
        return status;
    }

    //%
    void startFanCleaning() {
        bool commandStatus = sendCommand(0x5607, 20);
        if(commandStatus == false) {
            sen55_error("Start Fan Cleaning Error");
        } 
    }


    /*
    TODOs:
        Reset / set fan interval 
        Advanced blocks for setting and reading values. 
    */
}

