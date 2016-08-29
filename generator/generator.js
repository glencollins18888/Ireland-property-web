var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');

var output = [];
var parser = parse({delimiter: ','})
var input = fs.createReadStream('test.csv');

var headerDropped = false;
var dropHeader = transform(function(record, callback){
    if(headerDropped) {
        callback(null, record);
    } else {
        headerDropped = true;
    }
});

var countryAndPrice = transform(function(record, callback){
    callback(null, [record[3], record[4]]);
});

var formatPrice = transform(function(record, callback){
        var price = record[1];
        price = price.substring(1, price.indexOf('.'));
        price = price.replace(',', '');
        callback(null, [record[0], parseInt(price)]);
});

var calculateAverages = transform(function(record, callback){
    var county = record[0];
    var price = record[1];
    callback(null, [record[0], parseInt(price)]);
});

var toJson = transform(function(record, callback){
    callback(null, JSON.stringify(record));
});


//var Writable = require('stream').Writable;
//var ws = Writable();
//ws._write = function (chunk, enc, next) {
//    console.log(chunk.toString('utf8'));
//    next();
//};

var buffer1;

var aver = transform();
aver._write = function (chunk, enc, next) {
    if(!chunk) {
        console.log("End");
    }
    aver.push(chunk.toString('utf8'));
    next();
};
var c = 97;
aver._read = function () {
    //setTimeout(function() {
    //    aver.push("1234");
    //    aver.push(null);
    //}, 2000);
};

input.pipe(parser)
    .pipe(dropHeader)
    .pipe(countryAndPrice)
    .pipe(formatPrice)
    .pipe(toJson)
    .pipe(aver)
    .pipe(process.stdout);

//fs.createWriteStream('output.txt')