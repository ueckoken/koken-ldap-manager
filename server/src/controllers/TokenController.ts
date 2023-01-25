import {
  JsonController,
  Get,
  QueryParam,
  Authorized
} from 'routing-controllers';

import { generateToken, verifyToken } from '../utils/token';

@JsonController('/token')
export class TokenController {
  @Authorized("manager","service")
  @Get('/issue')
  async totp(): Promise<any> {
    const token = generateToken()
    return {
      token: token
    };
  }

  @Get('/verify')
  async verify(
    @QueryParam("token") token: string
  ): Promise<any> {
    return {
      valid: verifyToken(token)
    };
  }
}