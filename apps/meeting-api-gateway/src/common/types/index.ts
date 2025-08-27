import { WebSocket } from 'ws';
import { REQUEST_USER_KEY } from '../../constants';
import { ActiveUserData } from '../../iam/src/interfaces/active-user-data.interface';

export type AuthenticatedWebSocket = WebSocket & {
  [REQUEST_USER_KEY]?: ActiveUserData;
};
