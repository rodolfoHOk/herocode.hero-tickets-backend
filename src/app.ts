import express, { Application } from 'express';
import { connect } from './infra/database';
import { errorMiddleware } from './middlewares/error.middleware';
import { EventRoutes } from './routes/event.routes';

class App {
  public app: Application;
  private eventRoutes = new EventRoutes();

  constructor() {
    this.app = express();
    this.middlewaresInitialize();
    this.initializeRoutes();
    this.interceptionError();
    connect();
  }

  middlewaresInitialize() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  initializeRoutes() {
    this.app.use('/events', this.eventRoutes.router);
  }

  interceptionError() {
    this.app.use(errorMiddleware);
  }

  listen() {
    this.app.listen(3333, () => console.log('server is running on port 3333'));
  }
}

export { App };