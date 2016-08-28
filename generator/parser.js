var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');

var output = [];
var parser = parse({delimiter: ','})
var input = fs.createReadStream('data/PPR-2016.csv');


function countyAndPrice(record){
    var price = record[4];
    price = price.substring(1, price.indexOf('.'));
    price = price.replace(',', '');
    return [record[3], parseInt(price)];
}

var merged = {};
function mergeCounties(records){
    var i;

    for(i = 0; i < records.length; i++) {
        var county = records[i][0];
        var price = records[i][1];

        if(!merged[county]) {
            merged[county] = [];
        }

        merged[county].push(price);
    }


    return merged;
}

var averagePrices = [];
function calculateAverages(records) {
    for (var property in records) {
        if (records.hasOwnProperty(property)) {
            var prices = records[property];
            var aver = average(prices);
            averagePrices.push({county : property , averagePrice : aver});
        }
    }
    return averagePrices;
}

function average(nums) {
    var total = 0;
    nums.map(function(value){
        total = total + value;
    });

    return Math.round(total / nums.length);
}

var output = [];
var record;
var header = true;
// Use the writable stream api
parser.on('readable', function(){
    if(header) {
        header = false;
        parser.read();
    }
    while(record = parser.read()){
        output.push(countyAndPrice(record));
    }
});

parser.on('finish', function(){
    //console.log(output);
    var merged = mergeCounties(output);
    var averages = calculateAverages(merged);
    //console.log(JSON.stringify(averages));

    fs.writeFile('../js/county-averages-data.js', "var countyAverages = " + JSON.stringify(averages));
});

input.pipe(parser);