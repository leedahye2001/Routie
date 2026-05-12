# Routie Backend Service

NestJS 11 + Prisma 기반의 도메인 서비스. TypeScript, PostgreSQL, JWT 인증을 사용한다.

---

## 1. 아키텍처 원칙 (5대 강제 사항)

### 1.1 Controller 규칙 (Web 계층)

- 요청 바인딩 및 응답 매핑 책임만 담당한다.
- `@Body()`, `@Param()`, `@Query()` 등 HTTP 관련 데코레이터는 Controller에서만 사용한다.
- Repository(QueryRepository, CommandRepository)를 Controller에서 직접 호출하는 것을 금지한다.
- 인증/인가 처리는 `@UseGuards()` 데코레이터를 통해 Guard에 위임한다. Service에서 토큰을 직접 검증하지 않는다.
- 입력 유효성 검사는 `class-validator` 기반의 DTO + `ValidationPipe`를 통해 Controller 진입 전에 처리한다.

### 1.2 Service 규칙 (Application 계층)

- 순수 비즈니스 로직의 단위인 유스케이스 중심으로 메서드를 구성한다.
- `PrismaClient`를 Service에서 직접 주입하거나 호출하는 것을 엄격히 금지한다. Repository 인터페이스를 통해서만 데이터에 접근한다.
- Prisma 생성 타입(`Prisma.UserWhereInput` 등 `Prisma` 네임스페이스)을 Service 계층에서 참조하는 것을 금지한다. 자체 정의한 DTO 또는 도메인 타입만 사용한다.
- 트랜잭션이 필요한 경우 `PrismaService.$transaction()`을 Service에서 호출하고, 생성된 `tx` 클라이언트를 Repository에 전달한다.

### 1.3 QueryRepository 규칙 (Infrastructure 읽기 계층)

- 읽기 전용(`SELECT`) 데이터 접근의 전담 경계다.
- `PrismaClient` 또는 `Prisma.TransactionClient`를 인자로 받아 사용하며, 직접 주입받은 PrismaService에 의존해도 된다.
- 반환 타입은 구체적인 DTO 또는 도메인 타입으로 한정한다. Prisma 모델 타입을 그대로 외부로 노출하는 것을 금지한다.
- `select`를 통해 필요한 필드만 조회한다. `findFirst` / `findUnique`에 `select` 없는 전체 조회를 지양한다.
- 조회 조건은 Criteria 또는 Filter 타입 객체로 캡슐화하여 메서드 시그니처를 단순하게 유지한다.

### 1.4 CommandRepository 규칙 (Infrastructure 쓰기 계층)

- 상태 변경(`INSERT`, `UPDATE`, `DELETE`) 전용 데이터 접근 경계다.
- `commit`에 해당하는 행위(트랜잭션 종료)는 CommandRepository 내부에서 수행하지 않는다. 트랜잭션 범위는 반드시 Service가 결정한다.
- 트랜잭션이 필요한 작업은 `Prisma.TransactionClient`(`tx`)를 메서드 인자로 받아 처리한다.
- 변경 결과를 반환할 때도 Prisma 모델 타입을 그대로 노출하지 않는다.

### 1.5 Transaction 규칙 (일관성 보장)

- `prisma.$transaction()`은 Service 계층에서만 호출한다.
- 하나의 유스케이스는 하나의 트랜잭션으로 완결되어야 한다. 트랜잭션 범위를 분산하지 않는다.
- 단일 쓰기 작업처럼 트랜잭션이 불필요한 경우 CommandRepository를 직접 호출해도 된다. 불필요한 트랜잭션을 남용하지 않는다.

---

## 2. 프로젝트 구조

```
src/
  {domain}/                        # 도메인 단위 모듈 (auth, group, time-block 등)
    {domain}.module.ts
    {domain}.controller.ts
    {domain}.service.ts
    dto/
      {action}-{domain}.dto.ts     # 입력 DTO (e.g. create-user.dto.ts)
      {domain}.response.dto.ts     # 응답 DTO
    repository/
      {domain}.query.repository.ts    # 읽기 전용
      {domain}.command.repository.ts  # 쓰기 전용
  prisma/
    prisma.module.ts               # PrismaService 전역 등록
    prisma.service.ts
  common/
    guards/                        # JwtAuthGuard 등 인증/인가 Guard
    decorators/                    # @CurrentUser() 등 커스텀 데코레이터
    filters/                       # 전역 Exception Filter
    pipes/                         # ValidationPipe 등 전역 Pipe
```

- 도메인 모듈 간 직접 의존(import)은 지양한다. 공유 로직은 `common` 또는 별도 `shared` 모듈로 분리한다.
- 순환 의존(`forwardRef`)은 아키텍처 설계 문제의 신호다. 발생 시 모듈 경계를 재검토한다.

---

## 3. 개발 가이드라인

### 3.1 비동기 처리

- `Observable` 대신 `Promise` / `async-await`를 기본으로 사용한다.
- NestJS의 `rxjs` 기반 인터셉터 등 프레임워크 내부에서는 Observable을 그대로 두되, 직접 작성하는 비즈니스 로직에서는 사용하지 않는다.

### 3.2 환경 변수 및 설정

- 민감 정보(DB URL, JWT Secret 등)를 소스코드에 하드코딩하는 것을 금지한다.
- 환경 변수는 `.env` 파일로 관리하고, `process.env`를 Service/Repository에서 직접 참조하지 않는다. 필요 시 ConfigModule + ConfigService를 도입한다.

### 3.3 DTO 및 유효성 검사

- 모든 Controller 입력은 DTO 클래스로 정의하고 `class-validator` 데코레이터로 유효성 검사를 선언한다.
- 응답 타입도 DTO로 명시하여 Prisma 모델이 HTTP 응답에 그대로 직렬화되지 않도록 한다.

### 3.4 인증

- JWT 검증은 `JwtAuthGuard`(Passport Strategy)가 담당한다. Service에서 토큰을 직접 파싱하거나 검증하지 않는다.
- 현재 사용자 정보는 `@CurrentUser()` 커스텀 데코레이터를 통해 Controller에서 주입받는다.
- Refresh Token은 단방향 해시(bcrypt)로 저장한다. 평문 저장을 금지한다.

### 3.5 에러 처리

- 도메인 에러는 NestJS 내장 `HttpException` 또는 이를 상속한 커스텀 예외 클래스로 표현한다.
- 전역 `ExceptionFilter`를 등록하여 에러 응답 포맷을 일관되게 유지한다.
- `try-catch`로 모든 에러를 삼키지 않는다. 의미 있는 예외만 잡아 변환하고 나머지는 필터에 위임한다.

### 3.6 Prisma

- `prisma generate` 결과물(`@prisma/client`)은 Repository 계층에서만 직접 사용한다.
- 스키마 변경 시 `prisma migrate dev`로 마이그레이션을 생성하고, 마이그레이션 파일을 반드시 커밋한다.
- `prisma db push`는 개발 초기 스키마 탐색 용도로만 허용한다. 팀 공유 환경 및 운영에서는 사용하지 않는다.
