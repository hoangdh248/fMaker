

let url = "wss://stream.binance.com:9443/ws/btcusdt@trade"
let webSocketInstance = new WebSocket(url);
let dataSource = []
var lineChartInstance = null
let intervalInstance = null
const func = () => {
    let data = [...dataSource]
    dataSource = dataSource.slice(data.length - 1)
    renderChart(lineChartInstance, data)
}
let flag = -1
webSocketInstance.onmessage = function (event) {
    dataSource.push(event.data)
    if(flag < 0){
        func()
    }
    flag = 0
}
function renderChart(lineChart, dataSrc) {
    let labels = []
    let datasets = [{
        label: "Price Avg",
        data: [],
        fill: false,
        borderColor: "blue"
    }, {
        label: "Amount Trade",
        data: [],
        fill: false,
        borderColor: "red"
    }, {
        label: "Quantity Avg",
        data: [],
        fill: false,
        borderColor: "green"
    }]




    let currentPricesCalculate = []
    let currentQuantityCalculate = []
    let amountTrade = 0

    if(dataSrc.length > 0){
        dataSrc.forEach(e => {
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
    
        if(typeof dataSrc[0] === "string"){
            dataSrc[0] = JSON.parse(dataSrc[0])
        }
        if(typeof dataSrc[dataSrc.length - 1] === "string"){
            dataSrc[dataSrc.length - 1] = JSON.parse(dataSrc[dataSrc.length - 1])
        }
       let objectKeys = Object.keys(dataSrc[0]) 
      
        let fromDateTime = new Date(dataSrc[0][objectKeys[8]]).toLocaleString("en-GB")
        let toDateTime = new Date(dataSrc[dataSrc.length - 1][objectKeys[8]]).toLocaleString("en-GB")
    
    
    
    
    
    
    
    
        if (lineChart === null) {
            labels.push(fromDateTime + " – " + toDateTime)
            datasets[0].data.push(avgPrice)
            datasets[2].data.push(avgQuantity)
            datasets[1].data.push(amountTrade)
            let speedCanvas = document.getElementById("speedChart");
    
    
    
            Chart.defaults.global.defaultFontFamily = "Lato";
            Chart.defaults.global.defaultFontSize = 18;
            Chart.defaults.line.spanGaps = true;
    
    
            let speedData = {
                labels,
                datasets
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
                        ticks: {
                            maxTicksLimit: 999999999,
    
                        }
                    }]
                },
                responsive: true
            };
            // console.log(lineChart);
            lineChart = new Chart(speedCanvas, {
                type: 'line',
                data: speedData,
                options: chartOptions
            })
            lineChartInstance = lineChart
            // console.log(lineChart);
        } else {
            lineChart.data.labels.push(fromDateTime + " – " + toDateTime);
            lineChart.data.datasets[0].data.push(avgPrice)
            lineChart.data.datasets[2].data.push(avgQuantity)
            lineChart.data.datasets[1].data.push(amountTrade)
            lineChart.update();
        }
    }

    

}


setInterval(func, (5 * 1000));

