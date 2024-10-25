import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { appConfig } from '../config/config';

export const grpcServerOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(process.cwd(), 'apps/auth/src/grpc/proto/auth.proto'),
    url: `${appConfig.grpc.authServerUrl}`,
  },
};
