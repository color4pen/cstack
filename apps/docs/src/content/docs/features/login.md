---
title: guestユーザー向けログイン機能設計
---

1. メールアドレスを入力する。
2. メールにログインリンクが送られる。
3. ログインできる。

login_challenge テーブル
リンクの内容を検証するためのテーブル、リンクのパラメーターが検証できれば、破棄される。
RDSでなくても揮発性の高いデータベースを使ってもよい


## adminユーザーのログイン

- adminユーザーはログイン時にパスワードを必須とする。
- その代わりメールアドレスでのログインチャレンジはしない

## コンテンツユーザーのログイン

- 1/22: あまり考えられていない。
- コンテンツアプリに対してのみログインする。
- 