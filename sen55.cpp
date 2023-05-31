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
    
    //%
    string productName() {
        return PSTR("SEN-55");
    }
}