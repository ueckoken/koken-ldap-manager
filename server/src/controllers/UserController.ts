import { addUserToGroup, removeUserFromGroup } from '../models/GroupModel';
import { createNewUser, getAllusers, getUser, updateUser, updateUserPassword } from '../models/UserModel';
import { verifyToken } from '../utils/token';
import { LdapUser } from './../types/LdapUser.d';
import {
  JsonController,
  Get,
  Authorized,
  CurrentUser,
  Post,
  BodyParam,
  Param,
  HttpError,
  Put,
} from 'routing-controllers';

@JsonController('/user')
export class UserController {
  @Authorized("manager")
  @Get('/list')
  async getAllUser(
  ): Promise<LdapUser[]> {
    const users = await getAllusers();
    return users;
  }

  @Authorized()
  @Get('/profile')
  async getProfile(
    @CurrentUser({ required: true }) user: any
  ): Promise<LdapUser> {
    const userInfo = await getUser(user.uid);
    return userInfo;
  }

  @Authorized("manager")
  @Get('/profile/:username')
  async getUserProfile(
    @Param("username") username: string
  ): Promise<LdapUser> {
    const userInfo = await getUser(username);
    return userInfo;
  }

  @Authorized(["manager", "service"])
  @Get('/exsists/:username')
  async exsistsUser(
    @Param("username") username: string
  ): Promise<Boolean> {
    try {
      const userInfo = await getUser(username);
      if (userInfo.uid) return true;
      return true
    } catch (e) {
      return false
    }
  }

  @Post('/register/token')
  async registerUser(
    @BodyParam("username", { required: true }) username: string,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("token", { required: true }) token: string,
    @BodyParam("password", { required: true }) password: string,
    @BodyParam("phonenumber", { required: true }) phonenumber: string,
    @BodyParam("studentid", { required: true }) studentid: string
  ): Promise<any> {

    // verify token
    if (!verifyToken(token)) {
      throw new HttpError(401, "Invalid token");
    }
    const groups = ["Domain Users", "member"];
    try {
      const user = await createNewUser(username, firstName, lastName, password, discordId, email, phonenumber, studentid);
      for (let group of groups) {
        await addUserToGroup(username, group)
        user.groups.push(group)
      }
      return user;
    } catch (error) {
      if (error instanceof Error)
        throw new HttpError(500, error.message)
    }
  }

  @Post('/register')
  @Authorized("manager")
  @Authorized("service")
  async createUser(
    @BodyParam("username", { required: true }) username: string,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("phonenumber", { required: true }) phonenumber: string,
    @BodyParam("studentid", { required: true }) studentid: string,
    @BodyParam("password") password?: string,
    @BodyParam("groups") groups?: string[]
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
    const user = await createNewUser(
      username, firstName, lastName, password, discordId, email, phonenumber, studentid
    );
    for (let group of groups) {
      await addUserToGroup(username, group)
      user.groups.push(group)
    }
    return {
      user: user,
      password: notifyPassword ? password : "********"
    }
  }

  @Put('/password')
  @Authorized()
  async updateUserPassword(
    @CurrentUser({ required: true }) user: any,
    @BodyParam("password", { required: true }) password: string,
  ): Promise<any> {
    await updateUserPassword(user.uid, password)
    return "OK"
  }

  @Put('/password/:username')
  @Authorized("manager")
  async updateUserPasswordByManager(
    @BodyParam("password", { required: true }) password: string,
    @Param("username") username: string,
  ): Promise<any> {
    await updateUserPassword(username, password)
    return "OK"
  }

  @Put('/profile/:username')
  @Authorized("manager")
  async updateUser(
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("telephoneNumber", { required: true }) telephoneNumber: string,
    @BodyParam("studentId", { required: true }) studentId: string,
    @BodyParam("groups", { required: true }) groups: string[],
    @Param("username") username: string
  ): Promise<any> {
    await updateUser(username, discordId, email, firstName, lastName, telephoneNumber, studentId);
    // update groups
    const user = await getUser(username);
    const oldGroups = user.groups;
    const newGroups = groups;
    const addGroups = newGroups.filter(x => !oldGroups.includes(x));
    const removeGroups = oldGroups.filter(x => !newGroups.includes(x));
    for (let group of addGroups) {
      await addUserToGroup(username, group)
    }
    for (let group of removeGroups) {
      await removeUserFromGroup(username, group)
    }
    return "OK"
  }

  @Put('/profile')
  @Authorized()
  async updateProfile(
    @CurrentUser({ required: true }) user: any,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string,
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("telephoneNumber", { required: true }) telephoneNumber: string,
    @BodyParam("studentId", { required: true }) studentId: string,
  ): Promise<any> {
    await updateUser(user.uid, discordId, email, firstName, lastName, telephoneNumber, studentId);
    return "OK"
  }
}