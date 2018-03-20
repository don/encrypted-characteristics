
// Cordova Bluetooth Low Energy Service with Encrypted Characteristic
// (c) 2018 Don Coleman

// UUIDs are UPPERCASE on iOS
var SERVICE_UUID = '24E1B2B0-3218-425E-B940-F52CF4F7D88C';
var CHARACTERISTIC_UUID = '24E1B2B1-3218-425E-B940-F52CF4F7D88C'; 

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.querySelector('input').addEventListener('blur', app.valueChanged, false);
    },

    onDeviceReady: function() {
        blePeripheral.onWriteRequest(app.didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(app.onBluetoothStateChange);
        app.createService();
    },

    createService: function () {

        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        var service = {
            uuid: SERVICE_UUID,
            characteristics: [
                {
                    uuid: CHARACTERISTIC_UUID,
                    properties: property.WRITE | property.READ | property.NOTIFY,
                    permissions: permission.WRITEABLE | permission.READABLE | permission.READ_ENCRYPTION_REQUIRED | permission.WRITE_ENCRYPTION_REQUIRED,
                    descriptors: [
                        {
                            uuid: '2901',
                            value: 'Encryption Required'
                        }
                    ]
                }
            ]
        };

        Promise.all([
            blePeripheral.createServiceFromJSON(service),
            blePeripheral.startAdvertising(service.uuid, 'Cordova')
        ]).then(
            function () { console.log('Created Service'); },
            app.onError
        );
    },

    valueChanged: function(e) {
        const numberAsString = e.target.value;
        const number = parseInt(numberAsString);
        console.log('Updating characteristic to', number);
        const buffer = new ArrayBuffer(4);
        const dataView = new DataView(buffer);
        dataView.setUint32(0, number, true);

        const success = function () {
            console.log('Update successful');
        };
        const failure = function (message) {
            console.log('Error updating characteristic.', message);
        };

        blePeripheral.setCharacteristicValue(SERVICE_UUID, CHARACTERISTIC_UUID, buffer).
            then(success, failure);
    },

    didReceiveWriteRequest: function(request) {
        console.log(request);
        if (request.characteristic === CHARACTERISTIC_UUID) {
            var data = new Uint32Array(request.value);
            document.querySelector('input').value = data[0];
        }
    },
    onBluetoothStateChange: function(state) {
        console.log('Bluetooth State is', state);
        if (state === 'off') {
            navigator.notification.alert('This application requires Bluetooth', null, 'Bluetooth is off');            
        }
    }

};

app.initialize();