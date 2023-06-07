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

enum SEN55ParticleMasses
{
    PM10,
    PM25,
    PM40,
    PM100, 
    PMCount
};

enum SEN55ParticleCounts
{
    NC05,
    NC10,
    NC25,
    NC40,
    NC100,
    NCCount
};


namespace sen55 {



    // Sensirion SEN55 address is 0x69:
    const int address = 0x69 << 1;
    const int staleDataTime = 1050;   // ms until data is considered stale
    const uint16_t UINT_INVALID = (uint16_t)0xFFFF;
    const int16_t  INT_INVALID = (int16_t)0x7FFF;

    // State variables
    static Action errorHandler = NULL;
    static String _lastError = PSTR("");

    static SEN55RunMode mode = Idle; 
    static unsigned long _lastReadTime;
    static uint16_t _pm[PMCount] ;
    static int16_t  _rh  ;     // TODO: Confirm int16?
    static int16_t  _temp;  
    static int16_t  _voci;     // TODO:Confirm int16?
    static int16_t  _noxi;     // TODO:  Confirm int16?
    static uint16_t _rawRh;
    static uint16_t _rawTemp;  // TODO: Confirm uint16?
    static uint16_t _rawVoc;
    static uint16_t _rawNox;

    static uint16_t _nc[NCCount];
    static uint16_t _typicalSize;

    static void invalidateValues() {
        _lastReadTime = 0;  // No valid read has occurred
        for (int i = 0;i<PMCount;i++) {
            _pm[i] = UINT_INVALID;
        }
        _rh   = INT_INVALID;
        _temp = INT_INVALID;
        _voci = INT_INVALID;
        _noxi = INT_INVALID;
        _rawRh  = UINT_INVALID;
        _rawTemp= UINT_INVALID;
        _rawVoc = UINT_INVALID;
        _rawNox = UINT_INVALID;

        for (int i = 0;i<NCCount;i++) {
            _nc[i] = UINT_INVALID;
        }
        _typicalSize  = UINT_INVALID;
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


    static inline float roundP1(float value) {
        // Round to nearest sixteenth  (0.0625)
        return round(value*16)/16.0f;
    }
    static inline float roundP01(float value) {
        // Round to nearest 1/128th  (0.0078125)
        return round(value*128)/128.0f;
    }
    static inline float roundP001(float value) {
        // Round to the nearest 1/1023 (0.0009765625)
        return round(value*1024)/1024.0f;
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
        uint8_t data[24];
        bool commandStatus = sendCommand(0x03C4, 20);
        bool readStatus = readData(data, sizeof(data));
        if(mode==Idle || commandStatus==false || readStatus==false || checkBuffer(data, sizeof(data))==false) {
            invalidateValues();
            sen55_error("Read Sensor Data Error");
            return;
        }

        // Now read the raw data values
        uint8_t rawData[12];
        commandStatus = sendCommand(0x03D2, 20);
        readStatus = readData(rawData, sizeof(rawData));
        if(commandStatus==false || readStatus==false || checkBuffer(rawData, sizeof(rawData))==false) {
            invalidateValues();
            sen55_error("Read Sensor Raw Data Error");
            return;
        }

        // Now read the raw data values for PM
        uint8_t rawPmData[30];
        commandStatus = sendCommand(0x0413, 20);
        readStatus = readData(rawPmData, sizeof(rawPmData));
        if(commandStatus==false || readStatus==false || checkBuffer(rawPmData, sizeof(rawPmData))==false) {
            invalidateValues();
            sen55_error("Read Sensor Raw PM Data Error");
            return;
        }

        // Valid read: Update state
        _lastReadTime = uBit.systemTime();
        _pm[PM10]    = (uint16_t)(data[0]<<8 | data[1]);
        _pm[PM25]    = (uint16_t)(data[3]<<8 | data[4]);
        _pm[PM40]    = (uint16_t)(data[6]<<8 | data[7]);
        _pm[PM100]   = (uint16_t)(data[9]<<8 | data[10]);
        _rh     = (int16_t)(data[12]<<8 | data[13]);
        _temp   = (int16_t)(data[15]<<8 | data[16]);
        _voci   = (int16_t)(data[18]<<8 | data[19]);
        _noxi   = (int16_t)(data[21]<<8 | data[22]);

        _rawRh = (uint16_t)(rawData[0]<<8 | rawData[1]);
        _rawTemp = (uint16_t)(rawData[3]<<8 | rawData[4]);
        _rawVoc = (uint16_t)(rawData[6]<<8 | rawData[7]);
        _rawNox = (uint16_t)(rawData[9]<<8 | rawData[10]);

        _nc[NC05] = (uint16_t)(rawPmData[12]<<8 | rawPmData[13]);
        _nc[NC10] = (uint16_t)(rawPmData[15]<<8 | rawPmData[16]);
        _nc[NC25] = (uint16_t)(rawPmData[18]<<8 | rawPmData[19]);
        _nc[NC40] = (uint16_t)(rawPmData[21]<<8 | rawPmData[22]);
        _nc[NC100] = (uint16_t)(rawPmData[24]<<8 | rawPmData[25]);
        _typicalSize = (uint16_t)(rawPmData[27]<<8 | rawPmData[28]);
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

    //%
    float typicalParticleSize() {
        readIfStale();
        return _typicalSize == UINT_INVALID ? NAN : roundP001(_typicalSize/1000.0f);
    }

    //% 
    float temperature() {
        readIfStale();
        return _temp == INT_INVALID ? NAN : roundP01(_temp/200.0f);
    }

    //% 
    float humidity() {
        readIfStale();
        return _rh == INT_INVALID ? NAN : roundP01(_rh/100.0f);
    }

    //%
    float VOC() {
        readIfStale();
        return _voci == INT_INVALID ? NAN : roundP1(_voci/10.0f);
    }

    //%
    float NOx() {
        readIfStale();
        return _noxi == INT_INVALID ? NAN : roundP1(_noxi/10.0f);
    }

    //%
    float rawHumidity() {
        readIfStale();
        return _rawRh == UINT_INVALID ? NAN : roundP01(_rawRh/100.0f);
    }

    //% 
    float rawTemperature() {
        readIfStale();
        return _rawTemp == UINT_INVALID ? NAN : roundP01(_rawTemp/200.0f);
    }

    //%
    float rawVOC() {
        readIfStale();
        return _rawVoc == UINT_INVALID ? NAN : (_rawVoc/1.0f);
    }

    //% 
    float rawNOx() {
        readIfStale();
        return _rawNox == UINT_INVALID ? NAN : (_rawNox/1.0f);
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
    float particleMass(SEN55ParticleMasses mass) {
        if(mass < PM10 || mass > PM100) {
            return NAN;
        }
        readIfStale();
        return _pm[mass] == UINT_INVALID ? NAN : roundP1(_pm[mass]/10.0);
    }

    //% 
    float particleCount(SEN55ParticleCounts count) {
        if(count < NC05 || count > NC100) {
            return NAN;
        }
        readIfStale();
        return _nc[count] == UINT_INVALID ? NAN : roundP1(_nc[count]/10.0);
    }

    //% 
    void clearDeviceStatus() {
        bool commandStatus = sendCommand(0xD210, 20);
        if(commandStatus == false) {
            sen55_error("Device Status Clear Error");
        } 
    }

    //% 
    String lastError() {
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

        README and Docstrings. 

    */
}
