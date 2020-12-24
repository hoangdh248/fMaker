

let url = "wss://stream.binance.com:9443/ws/btcusdt@trade"
let webSocketInstance = new WebSocket(url);
let dataSource = []
var otherChartInstance = null
var priceChartInstance = null
let intervalInstance = null
let width = 800
let speedPriceOnMinute = 0
let beginTime
let beginPrice
Date.prototype.addMinutes = function (minutes) {
    var copiedDate = new Date(this.getTime());
    return new Date(copiedDate.getTime() + minutes * 60000);
}
const func = () => {
    let data = [...dataSource]
    dataSource = dataSource.slice(data.length - 1)
    renderChart(otherChartInstance, priceChartInstance, data)
}
let flag = -1
webSocketInstance.onmessage = function (event) {
    dataSource.push(event.data)

    if (flag < 0) {
        let objectKeys = Object.keys(dataSource[0])
        beginTime = new Date(dataSource[0][objectKeys[8]])
        beginPrice = +JSON.parse(dataSource[0]).p
        func()
    }
    flag = 0
}
function renderChart(otherChart, priceChart, dataSrc) {
    let labels = []
    let priceLabels = []
    let datasets = [{
        label: "Amount Trade",
        data: [],
        fill: false,
        borderColor: "orange"
    }, {
        label: "Quantity Avg",
        data: [],
        fill: false,
        borderColor: "purple"
    }]
    let priceDatasets = [{
        label: "Price Avg",
        data: [],
        fill: false,
        borderColor: "blue"
    }]



    let currentPricesCalculate = []
    let currentQuantityCalculate = []
    let amountTrade = 0

    if (dataSrc.length > 0) {

        dataSrc.forEach((e, i) => {
            e = JSON.parse(e)
            currentPricesCalculate.push(+e["p"])
            currentQuantityCalculate.push(+e["q"])
            amountTrade = amountTrade + 1

        });

        let sumPrice = 0;
        currentPricesCalculate.forEach(price => {
            sumPrice += price;
        });
        let avgPrice = sumPrice / (currentPricesCalculate.length);




        let sumQuantity = 0;
        currentQuantityCalculate.forEach(q => {
            sumQuantity += q;
        });
        let avgQuantity = sumQuantity / (currentQuantityCalculate.length);

        if (typeof dataSrc[0] === "string") {
            dataSrc[0] = JSON.parse(dataSrc[0])
        }
        if (typeof dataSrc[dataSrc.length - 1] === "string") {
            dataSrc[dataSrc.length - 1] = JSON.parse(dataSrc[dataSrc.length - 1])
        }
        let objectKeys = Object.keys(dataSrc[0])
        let fromDateTime = new Date(dataSrc[0][objectKeys[8]]).toLocaleString("en-GB")
        let toDateTime = new Date(dataSrc[dataSrc.length - 1][objectKeys[8]]).toLocaleString("en-GB")








        if (!otherChart || !priceChart) {
            labels.push(fromDateTime + " – " + toDateTime)
            priceLabels.push(fromDateTime + " – " + toDateTime)
            priceDatasets[0].data.push(avgPrice)
            datasets[1].data.push(avgQuantity)
            datasets[0].data.push(amountTrade)
            let otherCanvas = document.getElementById("otherChart");
            let priceCanvas = document.getElementById("priceChart");



            Chart.defaults.global.defaultFontFamily = "Lato";
            Chart.defaults.global.defaultFontSize = 18;
            Chart.defaults.line.spanGaps = true;


            let otherData = {
                labels,
                datasets
            }
            let priceData = {
                labels: priceLabels,
                datasets: priceDatasets
            }
            let chartOptions = {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 80,
                        fontColor: 'black'
                    }
                },
                scales: {
                    xAxes: [{
                        // stacked: false,
                        ticks: {
                            maxTicksLimit: 999999999,

                        }
                    }],
                    // yAxes: [{
                    //     stacked: true
                    // }]
                },
                responsive: true,
                maintainAspectRatio: true,
            };
            // console.log(lineChart);
            otherChart = new Chart(otherCanvas, {
                type: 'line',
                data: otherData,
                options: chartOptions
            })
            priceChart = new Chart(priceCanvas, {
                type: 'line',
                data: priceData,
                options: chartOptions
            })
            otherChartInstance = otherChart
            priceChartInstance = priceChart
            // console.log(lineChart);
        } else {
            if (otherChartInstance) {
                otherChart.data.labels.push(fromDateTime + " – " + toDateTime);

                otherChart.data.datasets[1].data.push(avgQuantity)

                otherChart.data.datasets[0].data.push(amountTrade)


                otherChart.data.labels.length > 20 && otherChart.data.labels.shift();
                otherChart.data.datasets[1].data.length > 20 && otherChart.data.datasets[1].data.shift()
                otherChart.data.datasets[0].data.length > 20 && otherChart.data.datasets[0].data.shift()
                otherChart.update();
            }
            if (priceChartInstance) {
                priceChart.data.labels.push(fromDateTime + " – " + toDateTime);
                priceChart.data.labels.length > 20 && priceChart.data.labels.shift();
                priceChart.data.datasets[0].data.push(avgPrice)
                priceChart.data.datasets[0].data.length > 20 && priceChart.data.datasets[0].data.shift()
                priceChart.update();
            }


        }
    }



}


setInterval(func, (4 * 1000));
setInterval(function (params) {
    let speedPriceOnMinute = (+JSON.parse(dataSource[dataSource.length - 1]).p - beginPrice) * 60
    beginPrice = +JSON.parse(dataSource[dataSource.length - 1]).p
    document.getElementById("vprice").innerHTML = speedPriceOnMinute
    document.getElementById("vprice").style.color = speedPriceOnMinute < 0 ? "red" : "green"

}, 1000)

