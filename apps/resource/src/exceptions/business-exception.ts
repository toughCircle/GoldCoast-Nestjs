import { HttpException } from '@nestjs/common';
import { StatusCode } from '../enums/status-code.enum';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: StatusCode) {
    super(message, statusCode);
  }

  // 추가적인 커스텀 로직을 넣고 싶다면 이곳에 작성 가능
  static fromStatusCode(statusCode: StatusCode): BusinessException {
    const message = `Error with status code: ${statusCode}`;
    return new BusinessException(message, statusCode);
  }
}
