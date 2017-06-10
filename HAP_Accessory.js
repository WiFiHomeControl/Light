/**
 * Created by tom on 09.06.17.
 */
const Accessory = require('../').Accessory;
const Service = require('../').Service;
const Characteristic = require('../').Characteristic;
const uuid = require('../').uuid;
const request = require('request');

const IP = "<IP from your ESP>";

const LightController = {
    name: "Stehlampe", //name the HomeKit app shows
    pincode: "031-45-154", //PinCode to pair the devices
    username: "FA:3C:ED:5A:1A:1A", //MAC Address of our fake device
    manufacturer: "IKEA", //optional ManuFactor
    setPower: function (power) {
        const status = power ? 1 : 0;
        request.post('http://'+IP+':1337/change?state='+status, function (err, resp) {
            if (err) throw err;
            if(resp.statusCode == 500){
                console.error('Cannot change Light due 500');
            }
        });
    },
    power: false,
    getPower: function () {
        return this.power;
    },
};

//Thats a bad method to check current state - change this someday
setInterval(function () {
    request.get('http://'+IP+':1337/status', function (err, res, body) {
        if(err) return;
        LightController.power = Boolean(JSON.parse(body).currentState);
    });
}, 10000);

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
const lightUUID = uuid.generate('hap-nodejs:accessories:light' + LightController.name);

// This is the Accessory that we'll return to HAP-NodeJS that represents our light.
let lightAccessory = exports.accessory = new Accessory(LightController.name, lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
lightAccessory.username = LightController.username;
lightAccessory.pincode = LightController.pincode;

// set some basic properties (these values are arbitrary and setting them is optional)
lightAccessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer);

lightAccessory.on('identify', function (paired, callback) {
    callback();
});

lightAccessory
    .addService(Service.Lightbulb, LightController.name)
    .getCharacteristic(Characteristic.On)
    .updateValue(true)
    .on('set', function (value, callback) {
        LightController.setPower(value);
        callback();
    })
    .on('get', function (callback) {
        callback(null, LightController.getPower());
    });