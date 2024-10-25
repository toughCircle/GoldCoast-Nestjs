import { HttpStatus } from '@nestjs/common';

export enum StatusCode {
  // 200 번대 CODE
  SUCCESS = HttpStatus.OK,
  CREATED = HttpStatus.CREATED,
  ORDER_SUCCESS = HttpStatus.OK,
  ORDER_CREATED = HttpStatus.CREATED,
  ITEM_CREATED = HttpStatus.OK,
  ITEM_SUCCESS = HttpStatus.OK,

  // 400 번대 CODE (클라이언트 에러)
  BAD_REQUEST = HttpStatus.BAD_REQUEST,
  VALIDATION_FAILED = HttpStatus.BAD_REQUEST,
  UNAUTHORIZED = HttpStatus.UNAUTHORIZED,
  FORBIDDEN = HttpStatus.FORBIDDEN,
  NOT_FOUND = HttpStatus.NOT_FOUND,
  CONFLICT = HttpStatus.CONFLICT,
  INVALID_ADDRESS = HttpStatus.BAD_REQUEST,
  DEFAULT_ADDRESS_UPDATE_FAILED = HttpStatus.BAD_REQUEST,
  ORDER_CREATION_FAILED = HttpStatus.INTERNAL_SERVER_ERROR,
  ORDER_BAD_REQUEST = HttpStatus.BAD_REQUEST,
  ORDER_NOT_FOUND = HttpStatus.NOT_FOUND,
  ORDER_QUANTITY_INVALID = HttpStatus.BAD_REQUEST,
  ORDER_PRICE_INVALID = HttpStatus.BAD_REQUEST,
  ORDER_ADDRESS_NOT_FOUND = HttpStatus.NOT_FOUND,
  ITEM_NOT_FOUND = HttpStatus.NOT_FOUND,
  ORDER_QUANTITY_EXCEEDED = HttpStatus.BAD_REQUEST,
  INVALID_STATUS_UPDATE = HttpStatus.CONFLICT,
  CANNOT_CANCEL_SHIPPED_ORDER = HttpStatus.FORBIDDEN,
  INVALID_REFUND_REQUEST = HttpStatus.BAD_REQUEST,
  INVALID_RETURN_REQUEST = HttpStatus.BAD_REQUEST,
  ORDER_CANNOT_BE_DELETED = HttpStatus.CONFLICT,
  REFUND_REQUIRED = HttpStatus.CONFLICT,
  RETURN_OR_REFUND_REQUIRED = HttpStatus.CONFLICT,

  // 500 번대 CODE (서버 에러)
  INTERNAL_SERVER_ERROR = HttpStatus.INTERNAL_SERVER_ERROR,
  DATABASE_ERROR = HttpStatus.INTERNAL_SERVER_ERROR,
  SERVICE_UNAVAILABLE = HttpStatus.SERVICE_UNAVAILABLE,
  TIMEOUT = HttpStatus.GATEWAY_TIMEOUT,
}

// 이름으로 StatusCode 찾고, 없으면 기본 StatusCode 로 반환하는 함수
export function findStatusCodeByNameSafe(
  name: string,
  defaultStatusCode: StatusCode,
): StatusCode {
  if (Object.keys(StatusCode).includes(name)) {
    return StatusCode[name as keyof typeof StatusCode];
  }
  return defaultStatusCode;
}
