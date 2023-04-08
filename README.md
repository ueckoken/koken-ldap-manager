# Koken LDAP Manager

工研統合認証の為の作成したLDAP管理ツールです

WebのUIからLDAP上のユーザーの追加や管理が可能です

# 環境変数

- ADMIN_PASSWORD:
  LDAPサーバーのAdminパスワード
- SID_PREFIX
　SAMBAのSIDのプレフィックス
- TOTP_TOKEN
  TOTP生成用のSecretKey

TOTPのSecretは以下のスクリプトを用いて生成してください

```python
import base64
import os
print(base64.b32encode(os.urandom(10)).decode('utf-8'))
```