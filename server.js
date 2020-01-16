const express = require('express');

const server = require('./config/server');

const app = express();

server.config(app)

server.routes(app)
server.start(app)

