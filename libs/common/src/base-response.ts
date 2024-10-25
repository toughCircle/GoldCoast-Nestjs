import { HttpStatus } from '@nestjs/common';

export class BaseApiResponse<T> {
  code: number;
  status: HttpStatus;
  message: string;
  data?: T;

  constructor(status: HttpStatus, message: string, data?: T) {
    this.code = status;
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static of<T>(
    status: HttpStatus,
    message: string,
    data?: T,
  ): BaseApiResponse<T> {
    return new BaseApiResponse(status, message, data);
  }

  static fromStatus(status: HttpStatus): BaseApiResponse<void> {
    return BaseApiResponse.of(status, HttpStatus[status]);
  }

  static fromMessage(
    status: HttpStatus,
    message: string,
  ): BaseApiResponse<void> {
    return BaseApiResponse.of(status, message);
  }

  static fromCode<T>(status: HttpStatus, data: T): BaseApiResponse<T> {
    return BaseApiResponse.of(status, HttpStatus[status], data);
  }
}
