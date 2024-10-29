import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.model';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  streetAddress: string;

  @Column()
  addressDetail: string;

  @Column()
  zipCode: string;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  static create(
    streetAddress: string,
    zipCode: string,
    addressDetail: string,
    user: User,
  ): Address {
    const address = new Address();
    (address.streetAddress = streetAddress),
      (address.addressDetail = addressDetail),
      (address.zipCode = zipCode),
      (address.user = user);

    // 주소를 User의 addresses 리스트에 추가
    if (!user.addresses) {
      user.addresses = []; // 만약 주소 리스트가 초기화되지 않았으면 빈 배열로 초기화
    }
    user.addresses.push(address); // 주소를 사용자 리스트에 추가

    return address;
  }
}
