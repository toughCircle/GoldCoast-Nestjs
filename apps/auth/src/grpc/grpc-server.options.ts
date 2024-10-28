import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { appConfig } from '../config/config';

export const grpcServerOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(process.cwd(), 'libs/common/src/proto/auth.proto'),
    url: '0.0.0.0:5001',
  },
};
