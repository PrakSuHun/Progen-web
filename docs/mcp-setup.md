# MCP 설정 (Claude Code CLI)

프로젝트 루트 [.mcp.json](../.mcp.json) 에 git·supabase·github·vercel MCP 서버를 정의했다.
이제 **claude.ai 웹/데스크톱 통합과 무관하게**, 이 폴더에서 `claude`(Claude Code CLI)를 실행하면
같은 MCP 서버를 그대로 쓴다. (다른 MCP 클라이언트로 옮길 때도 이 정의를 재사용 가능.)

> `.mcp.json` 은 git에 커밋된다. 그래서 **비밀값(토큰)은 파일에 직접 넣지 않고 환경변수로 참조**한다.
> 토큰은 아래처럼 셸 환경에 export 해야 `${...}` 가 치환된다.

## 1. 서버별 토큰

| 서버 | 인증 방식 | 필요한 것 |
|------|-----------|-----------|
| git | 없음 | 로컬 저장소(`.`) 직접 조작. uvx(uv)로 실행 — 이미 설치됨 |
| supabase | Personal Access Token | `SUPABASE_ACCESS_TOKEN` 환경변수 |
| github | Personal Access Token | `GITHUB_PAT` 환경변수 |
| vercel | OAuth (브라우저) | 없음 — 최초 사용 시 `/mcp` 로 로그인 |

### Supabase Access Token
- 발급: https://supabase.com/dashboard/account/tokens → "Generate new token"
- ⚠️ 이 토큰은 `SUPABASE_SERVICE_ROLE_KEY`(앱 런타임용)와 **다른 것**. 계정 단위 관리 토큰이다.
- `.mcp.json` 의 `--project-ref=xtbtufdycegfylsoerqq` 로 PROGEN 프로젝트에 스코프됨.
- 읽기 전용으로 쓰려면 args 에 `"--read-only"` 추가. (현재는 마이그레이션 적용을 위해 쓰기 가능 상태)

### GitHub PAT
- 발급: https://github.com/settings/personal-access-tokens (Fine-grained 권장) 또는 classic 토큰.
- 원격 GitHub MCP 서버(`api.githubcopilot.com/mcp/`)에 `Authorization: Bearer` 헤더로 전달.

## 2. 환경변수 등록 (zsh)

`~/.zshrc` 에 추가 후 새 터미널을 열거나 `source ~/.zshrc`:

```sh
export SUPABASE_ACCESS_TOKEN="sbp_..."   # Supabase 대시보드에서 발급
export GITHUB_PAT="github_pat_..."       # GitHub 설정에서 발급
```

> Claude Code 는 `.mcp.json` 의 `${VAR}` 를 **CLI를 실행한 셸의 환경**에서 치환한다.
> 앱의 `.env.local` 은 Next.js 런타임 전용이라 자동으로 안 읽힌다 — 위처럼 셸에 export 해야 한다.

## 3. 적용 / 확인

1. 새 터미널에서 이 폴더로 이동 후 `claude` 실행.
2. 프로젝트 `.mcp.json` 신뢰 여부를 한 번 물어보면 승인.
3. `/mcp` 명령으로 4개 서버 연결 상태 확인. vercel 은 여기서 OAuth 로그인.
4. 토큰이 비어 있으면 해당 서버만 연결 실패로 표시되고 나머지는 정상 동작.
