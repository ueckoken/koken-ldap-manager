import {
  JsonController,
  Get,
  QueryParam
} from 'routing-controllers';

import { generateToken, verifyToken } from '../utils/token';

@JsonController('/token')
export class TokenController {
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