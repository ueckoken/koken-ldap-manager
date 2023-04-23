import { addUserToGroup, getAllgroups } from "../models/GroupModel";
import {
  createNewUser,
  getAllusers,
  getUser,
  updateUser,
  updateUserPassword,
} from "../models/UserModel";
import { LdapGroup } from "../types/LdapGroup";
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

@JsonController("/group")
@Authorized()
export class GroupController {
  @Get("/list")
  async getAllGroup(): Promise<string[]> {
    const groups = await getAllgroups();
    if (groups == undefined) throw new HttpError(500, "Internal Server Error");
    const gropuNames = groups.map((group) => group.name);
    return gropuNames;
  }
}
