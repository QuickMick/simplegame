'use strict';
console.log("DEBUG:", process.env.DEBUG);
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
//process.env['DEBUG'] = '*';
const debug = require('debug')('wastelandworld:app');
const http = require('http');

const index = require('./routes/index');
const users = require('./routes/users');

const GameServer = require('./server/gameserver');

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

class App {

  constructor() {
    this.app = null;
    this.server = null;
    this.gameServer = null;
  }

  run() {
    this.initApp();
    this.initRoutes();
  }

  initApp() {
    this.app = express();

    // view engine setup
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'pug');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    this.app.use(logger('dev'));
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
      extended: false
    }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));


    const port = normalizePort(process.env.PORT || '3000');
    this.app.set('port', port);
    this.server = http.createServer(this.app);

    this.gameServer = new GameServer();
    this.gameServer.run(this.server);

    this.server.listen(port);
    this.server.on('error', (error) => {
      if (error.syscall !== 'listen') throw error;

      const bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    this.server.on('listening', () => {
      var addr = this.server.address();
      var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
      debug('Listening on ' + bind);
    });
  }

  initRoutes() {
    this.app.use('/', index);
    this.app.use('/users', users);

    // catch 404 and forward to error handler
    this.app.use(function (req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handler
    this.app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  }
}

debug("init");
new App().run();