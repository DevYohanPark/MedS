var web3 = new Web3();
var provider = new web3.providers.HttpProvider("http://localhost:8545");
web3.setProvider(provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
var stop = false;

var startBlockNo = web3.eth.blockNumber - 20;
monitorBlockNo = Math.max(0, startBlockNo)

// 감시 개시
function startMonitor() {
    stop = false;
    //20건 전 블록부터 참조
    var table = document.getElementById('tbMonitor');
    for (; monitorBlockNo < web3.eth.blockNumber; monitorBlockNo++) {
        var result = web3.eth.getBlock(monitorBlockNo);
        console.log(result);
        insertBlockRow(result, table, monitorBlockNo);
    }
    setTimeout(function() {
        watchBlock(table, i);
    }, 10000);
}

// 블록 감시
function watchBlock(table, blockNumber) {
    if (stop) {
        return;
    }
    if (blockNumber == web3.eth.blockNumber) {
        setTimeout(function() {
            watchBlock(table, blockNumber);
        }, 1000);
        return;
    }
    var result = web3.eth.getBlock(blockNumber);
    insertBlockRow(result, table, blockNumber);
    setTimeout(function() {
        watchBlock(table, ++blockNumber);
    }, 1000);
}

// 행 추가 블록 정보 편집
function insertBlockRow(result, table) {
    var row = table.insertRow();
    var td = row.insertCell(0);
    td.innerHTML = result.number;
    var td = row.insertCell(1);
    if(result.timestamp) td.innerHTML = new Date(parseInt(result.timestamp) * 1000).toTimeString().split(' ')[0];
    var td = row.insertCell(2);
    td.innerHTML = result.hash.substring(0,15)+"...";
    var td = row.insertCell(3);
    if (result.transactions.length > 0) {
        insertTranRow(result.transactions, td);
    }
}

// 행 추가 트랜잭션 정보 편집
function insertTranRow(transactions, td) {
    var allData = "";
    for (var i = 0; i < transactions.length; i++) {
        var data = web3.eth.getTransaction(transactions[i]);
        allData += JSON.stringify(data);
    }
    td.innerHTML = "<input type='text' value='" + transactions.length + "개:" + allData + "' /></td>";
}

// 정지
function stopWatch() {
    stop = true;
}
