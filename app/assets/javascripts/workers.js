importScripts('combined.js');
onmessage = function(e) {
    var compoundSearcher = new Openphacts.CompoundSearch(e.data[0], e.data[1], e.data[2]);
    console.log('Message received from main script');
    var workerResult = 'Result: ' + e.data[0] + ' ' + e.data[1] + ' ' + e.data[2];
    console.log('Posting message back to main script');
    postMessage(workerResult);
}
