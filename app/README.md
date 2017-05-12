# Application ServU
:warning: Paul est le seul autorisé a modifier, car il sait ce qui est implémenté __**actuellement**__ !
## Tableau des Probes
|Probes     |  data 	| status |  test 	|
|:---	      |:---	    |:---	   |:---:   |
|network   	| state  	|  `Unknow connection`<br> `Ethernet connection`<br>`WiFi connection`<br> `Cell 2G connection`<br> `Cell 3G connection`<br> `Cell 4G connection`<br>`Cell generic connection` <br> `No network connection` |  =  	|
|bluetooth  | isEnable <br> isConnected| `true`-`false` <br> `true`-`false` |  = <br> =	|
|localisation   	| lat <br> long <br> timestamp  	| `float` <br> `float` <br> `int` | <, >, = <br> <, >, = <br> <, >, =	|
|battery   	| level <br> isPlugged  	| 0 < `int` < 100 <br> `true`-`false`| <, >, = <br> =	|
|flashlight   	| isActivated  	| `true`-`false`|  =	|

## Tableau des Actions
|Action     |  data 	|type   |
|:---	      |:---	    |:---   |
|ring   	  |time     |`int`  |
|vibrate    |time     |`int`  |
|sms		|dest <br> msg | `string` <br> `string` |

