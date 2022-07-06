import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { openSegment, closeSegment } from 'aws-xray-sdk-express';
import config from './config';
console.log(config);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

import routes from './routes';
if(config.xrayEnabled) {
    app.use(openSegment);
    app.use(routes);
    app.use(closeSegment);
}
else {
    app.use(routes);
}

import errorHandler from './errorHandler';
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`listening on port ${config.port}...`);
});
