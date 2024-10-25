export enum OrderStatus {
  ORDER_PLACED = 'ORDER_PLACED', // 주문 완료
  ORDER_CANCELLED = 'ORDER_CANCELLED', // 주문 취소
  REFUND_REQUESTED = 'REFUND_REQUESTED', // 환불 요청 (구매)
  REFUND_COMPLETED = 'REFUND_COMPLETED', // 환불 완료 (판매)
  RETURN_REQUESTED = 'RETURN_REQUESTED', // 반품 요청 (구매)
  RETURN_COMPLETED = 'RETURN_COMPLETED', // 반품 완료 (판매)
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED', // 입금 완료 (구매)
  SHIPPED = 'SHIPPED', // 발송 완료 (구매)
  RECEIVED = 'RECEIVED', // 수령 완료 (판매)
}
