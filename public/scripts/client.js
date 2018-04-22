$(document).ready(function() {

  var stockSymbols = [];
  var s = document.getElementsByClassName("stocks-title");
  for (var i = 0; i < s.length; i++) {
    stockSymbols.push(s[i].innerHTML);
  };
  // console.log(stockSymbols);

  $(function () {
    // render graph if stocks exists
    if (stockSymbols.length !== 0) {
      $.ajax({
        url: "http://localhost:27017/stocks/data",
        type: "GET",
        success: function(data) {
          // console.log(data);
          var stocks = data;
          var categories = [];
          var series = [];
          for (var stock in stocks) {
            let stockData = stocks[stock];
            var price = [];
            var s = {};
            for (var i = stockData.length - 1; i > 0; i--) {
              categories.push(stockData[i].date);
              price.push(Number(stockData[i].high));
            };
            s.name = stock;
            s.data = price;
            series.push(s);
          };
          // console.log(series);
          var myChart = Highcharts.chart('myChart', {
            chart: {
              type: 'line'
            },
            title: {
              text: 'STOCKS'
            },
            xAxis: {
              categories: categories,
              labels: {
                enabled: false
              }
            },
            yAxis: {
              title: {
                text: 'Price of Stocks'
              }
            },
            series: series
          });
        },
        error: function(err) {
          console.log('error data: ' + err);
        }
      })
    };
  });
  
});
