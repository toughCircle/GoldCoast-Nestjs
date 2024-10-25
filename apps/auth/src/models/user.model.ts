import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  role: string;

  static registerUser(
    username: string,
    password: string,
    email: string,
    role: string,
  ): User {
    const user = new User();
    user.username = username;
    user.password = password;
    user.email = email;
    user.role = role;
    return user;
  }
}
