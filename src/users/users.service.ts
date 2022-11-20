import { Injectable } from "@nestjs/common";
import { log } from "console";

interface IUser {
  userId: number;
  username: string;
  password: string;
  hashedToken?: string;
}
@Injectable()
export class UsersService {
  private users: IUser[] = [
    { userId: 1, username: "jhon", password: "123123" },
  ];
  create(user: Omit<IUser, "userId">) {
    this.users.push({ userId: this.users.at(-1).userId + 1, ...user });
    return this.users.at(-1);
  }
  findById(id: number) {
    return this.users.find((user) => user.userId === id);
  }

  findByName(name: string) {
    return this.users.find((user) => user.username === name);
  }
  update(id: number, data: Partial<IUser>) {
    this.findById(id).hashedToken = data.hashedToken;
    log(this.users);
  }
}
