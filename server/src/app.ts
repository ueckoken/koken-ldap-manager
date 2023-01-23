import { GroupController } from './controllers/GroupController';
import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import {
  Action,
  useExpressServer
} from 'routing-controllers';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { TokenController } from './controllers/TokenController';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const PORT = 3000;

async function bootstrap() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors())

  useExpressServer(app, {
    controllers: [
      UserController,
      AuthController,
      TokenController,
      GroupController
    ],
    authorizationChecker: async (action: Action, roles: string[]): Promise<boolean> => {
      const token = action.request.headers.authorization.split(' ')[1];
      const user: any = jwt.verify(token, "secret");
      if (user && !roles.length) return true;
      if (user && roles.find(role => user.groups.includes(role))) return true;
      return false
    },
    currentUserChecker: async (action: Action): Promise<any> => {
      const token = action.request.headers.authorization.split(' ')[1];
      const user: any = jwt.verify(token, "secret");
      return user;
    }
  });

  app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
  });
}

bootstrap();
