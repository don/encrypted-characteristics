Experimental projects looking at Bluetooth services with encrypted characteristics.

The service has one characteristic with read, write, notify properties. The permissions require encryption for read and write. Write Uint32LE values to the characteristic.

istic with read, write, notify properties. The permissions require encryption for read and write. Write Uint32LE values to the characteristic.

SERVICE_UUID 24E1B2B0-3218-425E-B940-F52CF4F7D88C
CHARACTERISTIC_UUID 24E1B2B1-3218-425E-B940-F52CF4F7D88C 4 byte Uint32LE

## bleno

The bleno example only runs on macOS. macOS is the peripheral.

    cd bleno
    npm install
    node index

Connect to the peripheral using Light Blue Explorer or nRF Connect. The first time you read or write the characteristic, the OS should initiate the pairing process to create a bond.

## Corodva

The cordova example only runs on iOS. Cordova is the peripheral.

	cd cordova
    cordova platform add ios
	cordova run ios --device

Connect to the peripheral using Light Blue Explorer or nRF Connect. The first time you read or write the characteristic, the OS should initiate the pairing process to create a bond.

Note: The first time you run on iOS you might need to open Xcode and set the development team and certificate.

	open platforms/ios/Encrypted.xcworkspace
	
	
Tested with macOS 10.13.2 and iOS 11.2.6 as peripherals. Used iOS 11.2.6 and Android 8.1.0 as central.
