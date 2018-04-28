var routes = function(app, yahooFinance, Stock, io, socket) {

  io.on('connection', function(socket) {
    console.log('Socket connection ', socket.id);
    socket.on('addStock', function(stock) {
      add_stock(stock);
      console.log(stock);
    });
    socket.on('deleteStock', function(stock) {
      delete_stock(stock);
      console.log(stock);
    })
    // disconnect
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
  });

  var add_stock = function(stock_name) {
    var stock = new Stock();
    var symbol = stock_name;

    Stock.findOne({ 'symbol': symbol }, function(err, stocks) {
      if (err) {
        console.log(err);
      }
      // if stocks do not exist in database check if valid stock
      if (!stocks) {
        var myPromise = new Promise(function(resolve, reject) {
          var d = new Date();
          var pastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
          yahooFinance.historical({
            symbol: symbol,
            from: pastYear,
            to: d
          }, function (err, stock) {
            if (err) {
              reject(err);
            }
            // if stock does not exist reject data
            if (!stock || stock.length === 0) {
              console.log('stock does exist');
              reject(stock);
            } else {
              // else if stock exists accept data
              console.log('stock exists');
              resolve(stock);
            };
          });
        });
        // save stock if data is a valid stock
        myPromise.then(function whenOk() {
          stock.symbol = symbol;
          stock.save(function(err, symbol) {
            if (err) {
              console.log(err);
            } else {
              console.log('symbol saved: ' + symbol);
              io.sockets.emit('addStock', symbol);
            }
          });
        }).catch(function notOk(err) {
          console.log(err);
        });
      } else {
        // if stock exists redirect back
        console.log('stock: ' + stocks + ' already exists');
      };
    })
  };

  var delete_stock = function(stock) {
    var symbol = stock;
    Stock.findOneAndRemove({ "symbol": symbol }, function(err, stock) {
      if (err) {
        console.log(err);
      };
      console.log(stock + "has been deleted");
      io.sockets.emit('deleteStock', symbol);
    });
  };

  app.get('/', function(req, res) {
    // retrieve all stocks in database render data to client side along with template
    Stock.find({}, function(err, stocks) {
      if (err) {
        console.log(err);
      } else {
        // console.log(stocks);
        res.render('index.html', { stocks: stocks });
      }
    });
  });

  app.get('/stocks/data', function(req, res) {
    // find all stocks in databse
    Stock.find({}, function(err, stocks) {
      if (err) {
        console.log(err);
      } else {
        if (stocks.length !== 0) {
          // present day and past year to retrieve full year of stock data
          var d = new Date();
          var pastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
          // array to render with template and display stock data on client side
          var sData = [];
          // list of stock symbols in database
          var stockSymbols = [];
          // loop through length of database stocks and push symbols in stock Symbols array
          // console.log('this is the stock ',stocks);
          for (var i = 0; i < stocks.length; i++) {
            stockSymbols.push(stocks[i].symbol);
          };
          // retrieve stock data from symbols
          yahooFinance.historical({
            symbols: stockSymbols,
            from: pastYear,
            to: d
          }, function (err, data) {
            if (err) {
              console.log(err);
            };
            // loop through data object to retrieve stock property names
            for (var stock in data) {
              // get all stock data from stock property
              let dataStock = data[stock];
              // loop through all stock data and change timestamp to date then push stock information to sData array
              for (var i = 0; i < dataStock.length; i++) {
                let month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                let weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                let d = new Date(dataStock[i].date);
                let m = d.getMonth();
                let y = d.getFullYear();
                let getDate = d.getDate();
                let day = d.getDay();

                dataStock[i].date =  weekday[day] + ', ' + month_names_short[m] + ' ' + getDate + ', ' + y;
                dataStock[i].high = dataStock[i].high.toFixed(2);
              };
            };
            res.send(data);
          });
        } else {
          res.send({ 'data': null });
        }
      };
    });
  });
};

module.exports = routes;
