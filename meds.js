var web3 = new Web3();
var provider = new web3.providers.HttpProvider("http://localhost:8545");
web3.setProvider(provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
var stop = false;

var ABI = [{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":false,"inputs":[{"name":"hashData","type":"string"}],"name":"putPhrHash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"initialSupply","type":"uint256"},{"name":"tokenName","type":"string"},{"name":"tokenSymbol","type":"string"},{"name":"tokenDecimals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"phrHashCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"phrHashes","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
var MedS = web3.eth.contract(ABI).at("0x40af181010193fbe1516877563c40cc88c72d95a");

/*** 병원 ***/
function handData() {
    $('#data_pt').val($('#data_hp').val());
}

/*** 환자 ***/
function hashing() {
    var data = $('#data_pt').val();
    if(!data) {
        alert("data가 없습니다.");
        return;
    }
    var hash = web3.sha3(data);
    $('#hash_pt').val(hash);
}

function readTxInfoFromBlockchain(txHash) {
    var txInfo = web3.eth.getTransaction(txHash);
    if(txInfo.blockNumber)
        $('#tx_pt').val(txInfo.blockNumber + ":" + txInfo.transactionIndex + ":" + txHash);
    else
        setTimeout(function () {
            readTxInfoFromBlockchain(txHash);
        }, 1000)
}

function wbcPhrHash() {
    var hashData = $('#hash_pt').val().substring(0,32);
    var txHash = MedS.putPhrHash(hashData);
    readTxInfoFromBlockchain(txHash);
}

function handTx() {
    $('#tx_hp').val($('#tx_pt').val());
}

/*** 연구소 ***/


/*** Monitor ***/
var startBlockNo = web3.eth.blockNumber - 5; //5건 전 블록부터 참조
monitorBlockNo = Math.max(0, startBlockNo);

// 감시 개시
function startMonitor() {
    stop = false;
    var table = document.getElementById('tbMonitor');
    for (; monitorBlockNo <= web3.eth.blockNumber; monitorBlockNo++) {
        var result = web3.eth.getBlock(monitorBlockNo);
        //console.log(result);
        insertBlockRow(result, table, monitorBlockNo);
    }
    setTimeout(function() {
        watchBlock(table, monitorBlockNo);
    }, 1000);
}

// 블록 감시
function watchBlock(table, blockNumber) {
    if (stop) {
        return;
    }
    if (blockNumber > parseInt(web3.eth.blockNumber)) {
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
    td = row.insertCell(1);
    if(result.timestamp) td.innerHTML = new Date(parseInt(result.timestamp) * 1000).toTimeString().split(' ')[0];
    td = row.insertCell(2);
    td.innerHTML = result.hash.substring(0,15)+"...";
    td = row.insertCell(3);
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

setTimeout(startMonitor, 500);
