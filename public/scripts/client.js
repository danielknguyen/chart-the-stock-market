$(document).ready(function() {

  var socket = io.connect('https://watch-stocks.herokuapp.com');

  var stockSymbols = [];

  var s = document.getElementsByClassName("stocks-title");
  for (var i = 0; i < s.length; i++) {
    stockSymbols.push(s[i].innerText);
  };

  $('#addStockBtn').on('click', function() {
    var stockInputVal = $('#stockInput').val().toUpperCase();
    socket.emit('addStock', stockInputVal);
  });

  // select stock element div
  $('.stocks').on('click', function() {
    var input =  $(this).find('p');
    var stock = input[0].innerHTML;
    console.log(stock);
    socket.emit('deleteStock', stock);
  });

  socket.on('addStock', function(data) {
    console.log('Stock added ', data.symbol);
    var html = '<button id="' + data.symbol + '" val="' + data.symbol + '" class="stocks col-xs-12 col-sm-6 col-md-4 col-lg-4"> \
      <p class="stocks-title">' + data.symbol + '</p> \
    </button>';
    $('#stock-row').append(html);
    stockSymbols.push(data.symbol);
    // console.log('this is the stock symbol array, ' + stockSymbols);
    $('#stockInput').val('');
    highCharts();
  });

  socket.on('deleteStock', function(data) {
    console.log('symbol deleted ', data);
    $('#' + data).remove();
    stockSymbols.filter(function(symbol) {
      if (symbol !== data) {
        return symbol;
      };
    });
    location.reload();
  });

  // console.log('this is the stock symbols ', stockSymbols);
  var highCharts = function () {
    // console.log('high charts ran');
    // render graph if stocks exists
    if (stockSymbols.length !== 0) {
      $.ajax({
        url: "https://watch-stocks.herokuapp.com/stocks/data",
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
            s.lineWidth = 3;
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
  };

  highCharts();

});
