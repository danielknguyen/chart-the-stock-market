var routes = function(app, yahooFinance, Stock) {

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

  app.post('/stocks/add', function(req, res) {
    var stock = new Stock();
    var symbol = req.body.stocksInput.toUpperCase();

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
              res.redirect('/');
            }
          });
        }).catch(function notOk(err) {
          console.log(err)
          res.redirect('/');
        });
      } else {
        // if stock exists redirect back
        console.log('stock: ' + stocks + ' already exists');
        res.redirect('/');
      };
    })
  });

  app.get('/stocks/delete/:symbol', function(req, res) {
    var symbol = req.params.symbol;
    Stock.findOneAndRemove({ "symbol": symbol }, function(err, stock) {
      if (err) {
        console.log(err);
      };
      console.log(stock + "has been deleted");
      res.redirect('/');
    });
  });

  app.get('/stocks/data', function(req, res) {
    // find all stocks in databse
    Stock.find({}, function(err, stocks) {
      if (err) {
        console.log(err);
      } else {
        // present day and past year to retrieve full year of stock data
        var d = new Date();
        var pastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        // array to render with template and display stock data on client side
        var sData = [];
        // list of stock symbols in database
        var stockSymbols = [];
        // loop through length of database stocks and push symbols in stock Symbols array
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
      }
    });
  });
};

module.exports = routes;
