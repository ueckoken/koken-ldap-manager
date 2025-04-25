import { addUserToGroup, removeUserFromGroup } from "../models/GroupModel";
import {
  createNewUser,
  getAllusers,
  getUser,
  updateUser,
  updateUserPassword,
} from "../models/UserModel";
import { verifyToken } from "../utils/token";
import { LdapUser } from "./../types/LdapUser.d";
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
} from "routing-controllers";
import axios from "axios";

@JsonController("/user")
export class UserController {
  // Discord連携用のエンドポイント
  @Post("/discord/connect")
  @Authorized()
  async connectDiscord(
    @CurrentUser({ required: true }) user: any,
    @BodyParam("code", { required: true }) code: string,
    @BodyParam("redirectUri", { required: true }) redirectUri: string
  ): Promise<any> {
    try {
      // 環境変数のチェック
      if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
        console.error("Discord OAuth環境変数が設定されていません");
        throw new HttpError(500, "サーバー設定エラー: Discord OAuth設定が不足しています");
      }

      console.log("Discord連携開始: ", { user: user.uid, redirectUri });

      // Discord APIにアクセストークンをリクエスト
      let tokenResponse;
      try {
        tokenResponse = await axios.post(
          "https://discord.com/api/oauth2/token",
          new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        console.log("Discord APIトークン取得成功");
      } catch (tokenError: any) {
        console.error("Discord APIトークン取得エラー:", tokenError.response?.data || tokenError.message);
        throw new HttpError(500, "Discord認証に失敗しました: トークン取得エラー");
      }

      const { access_token } = tokenResponse.data;

      // Discord APIからユーザー情報を取得
      let userResponse;
      try {
        userResponse = await axios.get("https://discord.com/api/users/@me", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        console.log("Discordユーザー情報取得成功");
      } catch (userError: any) {
        console.error("Discordユーザー情報取得エラー:", userError.response?.data || userError.message);
        throw new HttpError(500, "Discord認証に失敗しました: ユーザー情報取得エラー");
      }

      const discordId = userResponse.data.id;
      console.log("取得したDiscord ID:", discordId);

      // LDAPから最新のユーザー情報を取得
      let currentUserInfo;
      try {
        currentUserInfo = await getUser(user.uid);
        console.log("現在のユーザー情報取得成功:", currentUserInfo.username);
      } catch (getUserError: any) {
        console.error("ユーザー情報取得エラー:", getUserError.message);
        throw new HttpError(500, `ユーザー情報の取得に失敗しました: ${getUserError.message}`);
      }

      // ユーザー情報を更新
      try {
        await updateUser(
          user.uid,
          discordId,
          currentUserInfo.email,
          currentUserInfo.firstName,
          currentUserInfo.lastName,
          currentUserInfo.telephoneNumber || "",
          currentUserInfo.studentId || ""
        );
        console.log("ユーザー情報更新成功");
      } catch (updateError: any) {
        console.error("ユーザー情報更新エラー:", updateError.message);
        throw new HttpError(500, `ユーザー情報の更新に失敗しました: ${updateError.message}`);
      }

      return { success: true, discordId };
    } catch (error: any) {
      console.error("Discord連携エラー:", error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, `Discord連携に失敗しました: ${error.message}`);
    }
  }

  @Post("/discord/disconnect")
  @Authorized()
  async disconnectDiscord(
    @CurrentUser({ required: true }) user: any
  ): Promise<any> {
    try {
      // LDAPから最新のユーザー情報を取得
      let currentUserInfo;
      try {
        currentUserInfo = await getUser(user.uid);
        console.log("現在のユーザー情報取得成功:", currentUserInfo.username);
      } catch (getUserError: any) {
        console.error("ユーザー情報取得エラー:", getUserError.message);
        throw new HttpError(500, `ユーザー情報の取得に失敗しました: ${getUserError.message}`);
      }

      // Discord IDを"NOSET"に設定
      await updateUser(
        user.uid,
        "NOSET", // 空文字列ではなく"NOSET"に設定
        currentUserInfo.email,
        currentUserInfo.firstName,
        currentUserInfo.lastName,
        currentUserInfo.telephoneNumber || "",
        currentUserInfo.studentId || ""
      );

      return { success: true };
    } catch (error) {
      console.error("Discord連携解除エラー:", error);
      throw new HttpError(500, "Discord連携解除に失敗しました");
    }
  }

  @Authorized("manager")
  @Get("/list")
  async getAllUser(): Promise<LdapUser[]> {
    const users = await getAllusers();
    return users;
  }

  @Authorized()
  @Get("/profile")
  async getProfile(
    @CurrentUser({ required: true }) user: any
  ): Promise<LdapUser> {
    const userInfo = await getUser(user.uid);
    return userInfo;
  }

  @Authorized("manager")
  @Get("/profile/:username")
  async getUserProfile(@Param("username") username: string): Promise<LdapUser> {
    const userInfo = await getUser(username);
    return userInfo;
  }

  @Authorized(["manager", "service"])
  @Get("/exsists/:username")
  async exsistsUser(@Param("username") username: string): Promise<Boolean> {
    try {
      const userInfo = await getUser(username);
      if (userInfo.uid) return true;
      return true;
    } catch (e) {
      return false;
    }
  }

  @Post("/register/token")
  async registerUser(
    @BodyParam("username", { required: true }) username: string,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId") discordId: string = "NOSET", // 必須から任意に変更し、デフォルト値を"NOSET"に設定
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
      const user = await createNewUser(
        username,
        firstName,
        lastName,
        password,
        discordId,
        email,
        phonenumber,
        studentid
      );
      for (let group of groups) {
        await addUserToGroup(username, group);
        user.groups.push(group);
      }
      return user;
    } catch (error) {
      if (error instanceof Error) throw new HttpError(500, error.message);
    }
  }

  @Post("/register/init")
  @Authorized("manager")
  @Authorized("service")
  async registerUserAuto(
    @BodyParam("username", { required: true }) username: string,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId") discordId: string = "NOSET", // 必須から任意に変更し、デフォルト値を"NOSET"に設定
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("phonenumber", { required: true }) phonenumber: string,
    @BodyParam("studentid", { required: true }) studentid: string
  ): Promise<any> {
    const password = Math.random().toString(36).slice(-8);
    const groups = ["Domain Users", "member"];
    try {
      const user = await createNewUser(
        username,
        firstName,
        lastName,
        password,
        discordId,
        email,
        phonenumber,
        studentid
      );
      for (let group of groups) {
        await addUserToGroup(username, group);
        user.groups.push(group);
      }
      return {
        user: user,
        password: password,
      };
    } catch (error) {
      if (error instanceof Error) throw new HttpError(500, error.message);
    }
  }

  @Post("/register")
  @Authorized("manager")
  async createUser(
    @BodyParam("username", { required: true }) username: string,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId") discordId: string = "NOSET", // 必須から任意に変更し、デフォルト値を"NOSET"に設定
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("phonenumber", { required: true }) phonenumber: string,
    @BodyParam("studentid", { required: true }) studentid: string,
    @BodyParam("password") password?: string,
    @BodyParam("groups") groups?: string[]
  ): Promise<any> {
    // Passwordの指定がない場合はランダムなパスワードを生成
    let notifyPassword: Boolean = false;
    if (!password) {
      password = Math.random().toString(36).slice(-8);
      notifyPassword = true;
    }

    // Groupの指定がない場合はデフォルトでDomain Usersを追加
    if (!groups) groups = ["Domain Users"];
    else groups.push("Domain Users");

    const fullName = firstName + " " + lastName;
    const user = await createNewUser(
      username,
      firstName,
      lastName,
      password,
      discordId,
      email,
      phonenumber,
      studentid
    );
    for (let group of groups) {
      await addUserToGroup(username, group);
      user.groups.push(group);
    }
    return {
      user: user,
      password: notifyPassword ? password : "********",
    };
  }

  @Put("/password")
  @Authorized()
  async updateUserPassword(
    @CurrentUser({ required: true }) user: any,
    @BodyParam("password", { required: true }) password: string
  ): Promise<any> {
    await updateUserPassword(user.uid, password);
    return "OK";
  }

  @Put("/password/:username")
  @Authorized("manager")
  async updateUserPasswordByManager(
    @BodyParam("password", { required: true }) password: string,
    @Param("username") username: string
  ): Promise<any> {
    await updateUserPassword(username, password);
    return "OK";
  }

  @Put("/profile/:username")
  @Authorized("manager")
  async updateUser(
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string, // クライアントからは送信されるが使用しない
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("telephoneNumber", { required: true }) telephoneNumber: string,
    @BodyParam("studentId", { required: true }) studentId: string,
    @BodyParam("groups", { required: true }) groups: string[],
    @Param("username") username: string
  ): Promise<any> {
    // 現在のユーザー情報を取得して、Discord IDを維持する
    const user = await getUser(username);

    // Discord IDは手動更新させず、現在の値を使用する
    await updateUser(
      username,
      user.discordId, // クライアントから送信されたdiscordIdを無視
      email,
      firstName,
      lastName,
      telephoneNumber,
      studentId
    );

    // update groups
    const oldGroups = user.groups;
    const newGroups = groups;
    const addGroups = newGroups.filter((x) => !oldGroups.includes(x));
    const removeGroups = oldGroups.filter((x) => !newGroups.includes(x));
    for (let group of addGroups) {
      await addUserToGroup(username, group);
    }
    for (let group of removeGroups) {
      await removeUserFromGroup(username, group);
    }
    return "OK";
  }

  @Put("/profile")
  @Authorized()
  async updateProfile(
    @CurrentUser({ required: true }) user: any,
    @BodyParam("firstName", { required: true }) firstName: string,
    @BodyParam("lastName", { required: true }) lastName: string,
    @BodyParam("discordId", { required: true }) discordId: string, // クライアントからは送信されるが使用しない
    @BodyParam("email", { required: true }) email: string,
    @BodyParam("telephoneNumber", { required: true }) telephoneNumber: string,
    @BodyParam("studentId", { required: true }) studentId: string
  ): Promise<any> {
    // 現在のユーザー情報を取得して、Discord IDを維持する
    const currentUserInfo = await getUser(user.uid);

    // Discord IDは手動更新させず、現在の値を使用する
    await updateUser(
      user.uid,
      currentUserInfo.discordId, // クライアントから送信されたdiscordIdを無視
      email,
      firstName,
      lastName,
      telephoneNumber,
      studentId
    );
    return "OK";
  }
}
