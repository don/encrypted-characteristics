const bleno = require('bleno');
const inquirer = require('inquirer');

const SERVICE_UUID = '24E1B2B0-3218-425E-B940-F52CF4F7D88C';
const CHARACTERISTIC_UUID = '24E1B2B1-3218-425E-B940-F52CF4F7D88C'; 

class Characteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: CHARACTERISTIC_UUID,
      properties: ['read', 'write', 'notify'],
      secure: ['read', 'write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Encrypted'
        })
      ]
    });
  }

  onSubscribe(maxValueSize, callback) {
    this.updateValueCallback = callback;
  }

  onUnsubscribe() {
    this.updateValueCallback = null;
  }

  onReadRequest(offset, callback) {
    callback(this.RESULT_SUCCESS, this.value);
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    console.log('Central updated value to', data.readUIntLE());
    this.value = data;
    callback(this.RESULT_SUCCESS);
  }

  // allows the local UI to update the charcateristic value
  setValue(number) {
    console.log('Characteristic value updated to ' + number);
    // update the value
    const buffer = new Buffer(4);
    buffer.writeUInt32LE(number);
    this.value = buffer;

    // send notications if there are subscribers
    if (this.updateValueCallback) {
      this.updateValueCallback(buffer)
    }
  }

}

const characteristic = new Characteristic();
const service = new bleno.PrimaryService({
  uuid: SERVICE_UUID,
  characteristics: [
    characteristic
  ]
});

bleno.on('stateChange', state => {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('EncryptedDemo', [service.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', error => {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([service]);
    ask();
  }
});

function ask() {
  inquirer.prompt(questions).then(answers => {
      // console.log(answers);
      switch (answers.action) {
          case 'set value':
              characteristic.setValue(answers.value);
              break;
          default:
              process.exit();
      }
      ask(); // recursive
  });    
};

const questions = [
  {
      type: 'list',
      name: 'action',
      message: 'Which function?',
      choices: ['Set Value', 'Quit'],
      filter: function (val) {
          return val.toLowerCase();
      }
  },
  {
      type: 'input',
      name: 'value',
      message: 'Characteristic value?',
      validate: function (value) {
          const valid = value >= 0 && value <= Number.MAX_SAFE_INTEGER;
          return valid || `Please enter a number`;
      },
      filter: Number,
      when: function (answers) {
          return answers.action === 'set value';
      }
  }
];