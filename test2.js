//var TelldusAPI = require('telldus-live');

var publicKey    = 'FEHUVEW84RAFR5SP22RABURUPHAFRUNU'
  , privateKey   = 'ZUXEVEGA9USTAZEWRETHAQUBUR69U6EF'
  , token        = 'c69a4a33f2cf4015e1da11c39b1bc9f105ac8c0f9'
  , tokenSecret  = '4996c7ee33d583f6c5bc1df464a399ec'
  , cloud
  ;

// Create a Telldus Cloud Object
cloud = new TelldusAPI.TelldusAPI({ publicKey  : publicKey
                                  , privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
  if (!!err) return console.log('login error: ' + err.message);

  console.log('user: '); console.log(user); console.log(''); console.log('');


cloud.getDevices(function(err, devices) {
  if (!!err) return console.log('getDevices: ' + err.message);
  cloud.getDeviceInfo(devices[0], function(err, device) {
    if (!!err) return console.log('getDevice: ' + err.message);
  });
});

return;

  cloud.getSensors(function(err, sensors) {
    var f, i;

    if (!!err) return console.log('getSensors: ' + err.message);

    f = function(offset, p, s) {
      return function(err, sensor) {
        var i, prop, props, type;

        if (!!err) return console.log(s + ' id=' + p.id + ': ' + err.message);

        console.log('sensor #' + offset + ' ' + s + ': '); console.log(sensor);
        props =  { temp     : [ 'temperature', 'celcius',    'meteo' ]
                 , humidity : [ 'humidity',    'percentage', 'meteo' ]
                 };

        type = null;
        for (i = 0; i < sensor.data.length; i++) {
          type = props[sensor.data[i].name];
          if (!!type) break;
        }
        if (!type) return;

        console.log('/device/climate/' + (sensor.protocol || 'telldus') + '/' + type[2]);
        console.log('    uuid=teldus:' + sensor.id);
        console.log('    name: ' + sensor.name);
        console.log('    status: ' + (p.online === '1' ? 'present' : 'absent'));
        console.log('    lastSample: ' + sensor.lastUpdated * 1000);
        console.log('    info:');
        for (i = 0; i < sensor.data.length; i++) {
          prop =  props[sensor.data[i].name];
          if (prop) console.log('      ' + prop[0] + ': "' + prop[1] + '"');
        }
        console.log('    values:');
        for (i = 0; i < sensor.data.length; i++) {
          prop =  props[sensor.data[i].name];
          if (prop) console.log('      ' + prop[0] + ': ' + sensor.data[i].value);
        }
        console.log('');
      };
    };

    for (i = 0; i < sensors.length; i++) cloud.getSensorInfo(sensors[i], f(i, sensors[i], 'getSensorInfo'));
  }).getDevices(function(err, devices) {
    var f, i;

    if (!!err) return console.log('getDevices: ' + err.message);

    f = function(offset, p, s) {
      return function(err, device) {
        var d, type, types;

        if (!!err) return console.log(s + ' id=' + p.id + ': ' + err.message);

        console.log('device #' + offset + ' ' + s + ': '); console.log(device);
        types = { 'selflearning-switch' : 'onoff'
                , 'selflearning-dimmer' : 'dimmer'
                , 'codeswitch'          : 'onoff' };

        type = null;
        d = device.model.split(':');
        type = types[d[0]];
        if (!type) return;

        console.log('/device/switch' + '/' + (d[d.length - 1] || 'telldus') + '/' + type);
        console.log('    uuid=teldus:' + device.id);
        console.log('    perform: off, on');
        console.log('    name: ' + device.name);
        console.log('    status: ' + (device.online === '0' ? 'absent' : device.status));
        console.log('    info:');
        if (type === 'dimmer') console.log('      dimmer: percentage');
        console.log('    values:');
        if (type === 'dimmer') console.log('      dimmer: ' + Math.round((1-(255 - device.statevalue)/255)*100) + '%');
        console.log('');
      };
    };

    for (i = 0; i < devices.length; i++) {
      if (devices[i].type === 'device') cloud.getDeviceInfo(devices[i], f(i, devices[i], 'getDeviceInfo'));
    }
  });
}).on('error', function(err) {
  console.log('background error: ' + err.message);
});
	

