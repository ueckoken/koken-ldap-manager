import {
  JsonController,
  Get,
  Post,
  BodyParam,
  HeaderParam,
  HttpError,
} from "routing-controllers";
import jwt from "jsonwebtoken";

import { IClientConfig, Client } from "ldap-ts-client";
import { getUserGroup } from "../models/GroupModel";

const config: IClientConfig = {
  ldapServerUrl: "ldap://ldap.ueckoken.club",
  user: "cn=admin,dc=ldap,dc=ueckoken,dc=club",
  pass: process.env["ADMIN_PASSWORD"],
};

@JsonController("/auth")
export class AuthController {
  @Post("/login")
  async pokemons(
    @BodyParam("username") username: string,
    @BodyParam("password") password: string
  ): Promise<any> {
    const client = new Client(config);
    try {
      await client.bind({
        user: `uid=${username},ou=people,dc=ldap,dc=ueckoken,dc=club`,
        pass: password,
      });
      const userGroups = await getUserGroup(username);
      if (!userGroups) return new HttpError(500, "Group not found");
      const userGroupNames: string[] = userGroups.map((group) => group.name);
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          uid: username,
          groups: userGroupNames,
        },
        "secret"
      );
      return {
        token: token,
      };
    } catch (e) {
      return new HttpError(403, "Invalid username or password");
    }
  }

  @Get("/verify")
  async verify(@HeaderParam("Authorization") bearToken: string): Promise<any> {
    const token = bearToken.split(" ")[1];
    try {
      const data = jwt.verify(token, "secret");
      return data;
    } catch (e) {
      return new HttpError(403, "Invalid token");
    }
  }

  @Get("/admin-verify")
  async verifyAdmin(
    @HeaderParam("Authorization") bearToken: string
  ): Promise<any> {
    const token = bearToken.split(" ")[1];
    try {
      const data: any = jwt.verify(token, "secret");
      if (!data.groups.includes("manager"))
        return new HttpError(400, "You are not admin");
      return data;
    } catch (e) {
      return new HttpError(403, "Invalid token");
    }
  }
}
