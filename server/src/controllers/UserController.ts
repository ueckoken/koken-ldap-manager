require('dotenv').config();
import { addUserToGroup } from '../models/GroupModel';
import { createNewUser, getAllusers, getUser, updateUser, updateUserPassword } from '../models/UserModel';
import { LdapUser } from './../types/LdapUser.d';
import {
  JsonController,
  Get,
  Authorized,
  CurrentUser,
  Post,
  BodyParam,
  Param,
  QueryParam,
  HttpError,
} from 'routing-controllers';
import totp from "totp-generator";

@JsonController('/user')
export class UserController {
  @Authorized("manager")
  @Get('/all')
  async getAllUser(
  ): Promise<LdapUser[]> {
    const users = await getAllusers();
    return users;
  }

  @Authorized()
  @Get('/profile')
  async getProfile(
    @CurrentUser({ required: true }) user: any
  ): Promise<any> {
    const userInfo = await getUser(user.uid);
    return userInfo;
  }

  @Post('/register')
  async registerUser(
    @BodyParam("username", { required: true }) username: string,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("token", { required: true }) token: string,
    @BodyParam("password", { required: true }) password: string,
  ): Promise<any> {
    // verify token
    const currentToken = totp(String(process.env["TOTP_TOKEN"]), {
      digits: 8,
      algorithm: "SHA-512",
      period: 60 * 60 * 60 * 3, // 3時間
      timestamp: new Date().getTime(),
    });
    if (token !== currentToken) {
      // Tokenが正しくない場合は拒否する
      throw new HttpError(401, "Invalid token");
    }
    const groups = ["Domain Users", "member"];
    const user = await createNewUser(username, firstName, lastName, password, discordId, email);
    for (let group of groups) {
      await addUserToGroup(username, group)
      user.groups.push(group)
    }
    return user;
  }

  @Post('/create')
  @Authorized("manager")
  async createUser(
    @BodyParam("username", { required: true }) username: string,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("password") password?: string,
    @BodyParam("groups") groups?: string[],
  ): Promise<any> {
    // Passwordの指定がない場合はランダムなパスワードを生成
    let notifyPassword: Boolean = false
    if (!password) {
      password = Math.random().toString(36).slice(-8);
      notifyPassword = true
    }

    // Groupの指定がない場合はデフォルトでDomain Usersを追加
    if (!groups)
      groups = ["Domain Users"];
    else
      groups.push("Domain Users")

    const fullName = firstName + " " + lastName
    const user = await createNewUser(username, firstName, lastName, password, discordId, email);
    for (let group of groups) {
      await addUserToGroup(username, group)
      user.groups.push(group)
    }
    return {
      user: user,
      password: notifyPassword ? password : "********"
    }
  }

  @Post('/updateMyPassword')
  @Authorized()
  async updateUserPassword(
    @CurrentUser({ required: true }) user: any,
    @BodyParam("newPassword", { required: true }) password: string,
  ): Promise<any> {
    await updateUserPassword(user.uid, password)
    return "OK"
  }

  @Post('/updatePassword/:username')
  @Authorized("manager")
  async updateUserPasswordByManager(
    @BodyParam("newPassword", { required: true }) password: string,
    @Param("username") username: string,
  ): Promise<any> {
    await updateUserPassword(username, password)
    return "OK"
  }

  @Post('/updateuser/:username')
  @Authorized("manager")
  async updateUser(
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
    @Param("username") username: string
  ): Promise<any> {
    await updateUser(username, discordId, email, firstName, lastName);
    return "OK"
  }

  @Post('/updateprofile')
  @Authorized()
  async updateProfile(
    @CurrentUser({ required: true }) user: any,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
  ): Promise<any> {
    await updateUser(user.uid, discordId, email, firstName, lastName);
    return "OK"
  }
}