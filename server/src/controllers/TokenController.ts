import {
  JsonController,
  Get,
  QueryParam
} from 'routing-controllers';

import totp from "totp-generator";

@JsonController('/token')
export class TokenController {
  @Get('/issue')
  async totp(): Promise<any> {
    const token = totp(String(process.env["TOTP_TOKEN"]), {
      digits: 8,
      algorithm: "SHA-512",
      period: 60 * 60 * 60 * 3, // 3時間
      timestamp: new Date().getTime(),
    });
    return {
      token: token
    };
  }

  @Get('/verify')
  async verify(
    @QueryParam("token") token: string
  ): Promise<any> {
    const nowToken = totp(String(process.env["TOTP_TOKEN"]), {
      digits: 8,
      algorithm: "SHA-512",
      period: 60 * 60 * 60 * 3, // 3時間
      timestamp: new Date().getTime(),
    });
    if (token === nowToken) {
      return {
        valid: true
      };
    } else {
      return {
        valid: false
      };
    }
  }
}