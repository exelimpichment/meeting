import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { RequestContextStore } from '@/libs/logging/src/types';

@Injectable()
export class RequestContextStorage extends AsyncLocalStorage<RequestContextStore> {}
