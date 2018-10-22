var web3 = new Web3();
var provider = new web3.providers.HttpProvider("http://localhost:8545");
web3.setProvider(provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
var stop = false;

var contractAddr = "0xc3032677f47b7135eaba178121406e1de95dc849";
var ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"hashData","type":"string"}],"name":"putPhrHash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"patient","type":"address"},{"name":"phrIndex","type":"uint8"},{"name":"signData","type":"string"}],"name":"putSign","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"phrHashCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"phrHashes","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"phrSigns","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"initialSupply","type":"uint256"},{"name":"tokenName","type":"string"},{"name":"tokenSymbol","type":"string"},{"name":"tokenDecimals","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]
var MedS = web3.eth.contract(ABI).at(contractAddr);

/*** 병원 ***/
function handData() {
    $('#data_pt').val($('#data_hp').val());
}

function sign() {
    // validate
    var hashData = web3.sha3($('#data_hp').val()).substring(0,32);
    var userData = $('#tx_hp').val().split(":");
    var txInfo = web3.eth.getTransaction(userData[1]);
    if(txInfo)
        var hashDataInBC = MedS.phrHashes(txInfo.from, userData[0]);

    if(hashData != hashDataInBC) {
        alert("데이터가 일치하지 않습니다.");
        return;
    }

    $('#sign_hp').val(web3.sha3($('#tx_hp').val()));
}

function wbcSign() {
    var userData = $('#tx_hp').val().split(":");
    var txInfo = web3.eth.getTransaction(userData[1]);
    var signData = $('#sign_hp').val().substring(0,32);
    var signTxHash = web3.eth.sendTransaction({
        to: contractAddr
        , from: web3.eth.accounts[1]
        , data: MedS.putSign.getData(txInfo.from, userData[0], signData)});

    $('#signtx_hp').val(signTxHash);
}

function handSignTxToPatient() {
    $('#signtx_pt').val($('#signtx_hp').val());
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

function readTxInfoFromBlockchain(phrIndex, txHash) {
    var txInfo = web3.eth.getTransaction(txHash);
    if(txInfo.blockNumber)
        $('#tx_pt').val(phrIndex + ":" + txHash);
    else
        setTimeout(function () {
            readTxInfoFromBlockchain(phrIndex, txHash);
        }, 1000)
}

function wbcPhrHash() {
    var phrIndex = MedS.phrHashCount(web3.eth.accounts[2]).c[0]
    var hashData = $('#hash_pt').val().substring(0,32);
    var txHash = web3.eth.sendTransaction({
        to: contractAddr
        , from: web3.eth.accounts[2]
        , data: MedS.putPhrHash.getData(hashData)});

    readTxInfoFromBlockchain(phrIndex, txHash);
}

function handTx() {
    $('#tx_hp').val($('#tx_pt').val());
}

function handDataToResearcher() {
    $('#data_rs').val($('#data_pt').val());
    $('#tx_rs').val($('#tx_pt').val());
    $('#signtx_rs').val($('#signtx_pt').val());
}

/*** 연구소 ***/
function verify() {
    var data = $('#data_rs').val();
    var tx = $('#tx_rs').val();
    var signTx = $('#signtx_rs').val();

    var txInfo = web3.eth.getTransaction(tx.split(":")[1]);
    var signTxInfo = web3.eth.getTransaction(signTx);

    // sign 검증
    if(!signTxInfo || signTxInfo.from != web3.eth.accounts[1]) {
        alert("의사의 서명이 아닙니다.");
        return;
    }

    // tx 에 대한 sign 여부 검증
    if(!txInfo || web3.sha3(tx).substring(0,32) != MedS.phrSigns(txInfo.from, tx.split(":")[0])) {
        alert("전달된 transaction 에 대한 서명이 아닙니다.");
        return;
    }

    // hash 검증
    if(!txInfo || web3.sha3(data).substring(0,32) != MedS.phrHashes(txInfo.from, tx.split(":")[0])) {
        alert("전달된 data 와 hash 값이 일치하지 않습니다.");
        return;
    }

    alert("진본 확인 완료");
}

function sendMedS() {

}

/*** Monitor ***/
var startBlockNo = web3.eth.blockNumber - 5; //5건 전 블록부터 참조
monitorBlockNo = Math.max(0, startBlockNo);

// 감시 개시
function startMonitor() {
    stop = false;
    var table = document.getElementById('tbMonitor');
    for (; monitorBlockNo <= web3.eth.blockNumber; monitorBlockNo++) {
        var result = web3.eth.getBlock(monitorBlockNo);
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
