import { Address } from '../models/address.model';

export class AddressDto {
  id: number;

  zipCode: string;

  streetAddress: string;

  addressDetail: string;

  static fromEntity(address: Address): AddressDto {
    const dto = new AddressDto();
    dto.id = address.id;
    dto.streetAddress = address.streetAddress;
    dto.zipCode = address.zipCode;
    dto.addressDetail = address.addressDetail;
    return dto;
  }
}
