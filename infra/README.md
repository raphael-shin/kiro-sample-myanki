# MyAnki 인프라 (AWS CDK v2)

MyAnki 정적 빌드(`dist/`)를 ECS Fargate에서 nginx로 서빙하고, 사용자는 CloudFront로만 접속합니다. 앱 루트의 `package.json`과 분리된 별도 npm 패키지입니다.

이 디렉터리의 코드는 리소스를 정의만 합니다. `cdk synth`와 테스트는 AWS 자격 증명 없이 돌아갑니다.

## 아키텍처

```
사용자 ──HTTPS──▶ CloudFront ──HTTPS + X-Origin-Verify──▶ ALB (public subnet) ──HTTP 8080──▶ Fargate 태스크 (isolated subnet)
                  <domainName>                          origin.<domainName>
```

| 구성 요소 | 내용 |
| --- | --- |
| 스택 | `MyAnkiEcr`(ECR 저장소), `MyAnkiApp`(나머지 전부). 이미지를 먼저 push해야 서비스가 뜨므로 둘로 나눴습니다. |
| VPC | AZ 2개. public subnet(ALB)과 isolated subnet(태스크). NAT Gateway 없음. VPC Flow Logs → CloudWatch Logs(30일). |
| VPC 엔드포인트 | ECR API·ECR DKR·CloudWatch Logs는 interface, S3는 gateway. interface 엔드포인트 보안 그룹은 태스크 보안 그룹에서 오는 443만 받습니다. ECS 서비스는 엔드포인트가 모두 만들어진 뒤에 생성됩니다. |
| 태스크 보안 그룹 | 인바운드는 ALB 보안 그룹에서 오는 8080만. 아웃바운드는 interface 엔드포인트 보안 그룹으로 443, S3 gateway prefix list(`com.amazonaws.<region>.s3`)로 443 두 개뿐입니다. |
| ALB 보호 1: 네트워크 | ALB 보안 그룹 인바운드는 `com.amazonaws.global.cloudfront.origin-facing` prefix list에서 오는 443 하나뿐입니다. prefix list ID는 배포할 때 custom resource가 `ec2:DescribeManagedPrefixLists`로 조회합니다(아래 참고). |
| ALB 보호 2: 헤더 | 리스너 기본 동작은 `403` 고정 응답입니다. `X-Origin-Verify` 값이 시크릿 A 또는 B와 일치하는 요청만 대상 그룹으로 갑니다. CloudFront는 그중 활성 슬롯 값을 origin 요청에 붙입니다. |
| TLS | CloudFront 뷰어: HTTPS 리다이렉트, 최소 `TLSv1.2_2021`, us-east-1 ACM 인증서. CloudFront → ALB: `HTTPS_ONLY`, TLSv1.2. ALB 리스너 443, `ELBSecurityPolicy-TLS13-1-2-2021-06`. |
| 응답 헤더 | CloudFront 관리형 `SecurityHeadersPolicy`(HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`). Content-Security-Policy는 앱이 실제로 쓰는 출처를 확인한 뒤 별도로 추가합니다. |
| ECS | Fargate, X86_64, 태스크 2개. uid `101:101`, `readonlyRootFilesystem: true`, 쓰기 경로는 `/tmp` 볼륨 하나. 헬스 체크 `/healthz`(ALB 대상 그룹과 컨테이너 둘 다). 태스크 역할에는 권한이 없습니다. |
| 로그 | ALB·CloudFront 액세스 로그는 S3 버킷 하나(`alb/`, `cloudfront/` 접두사). Block Public Access 4개, SSL 강제, SSE-S3, 90일 만료. 앱·Flow Logs·custom resource 로그 그룹은 30일 보존. |
| ECR | 푸시 시 스캔, 태그 변경 불가(immutable), 최근 30개 이미지 보관. |
| DNS | `<domainName>` A/AAAA → CloudFront, `origin.<domainName>` A → ALB. |

### prefix list 조회 방식

prefix list ID는 리전마다 달라서 하드코딩할 수 없고, `fromLookup` 계열은 `cdk synth` 때 AWS 자격 증명이 필요합니다. 그래서 `lib/managed-prefix-list.ts`의 `AwsCustomResource`가 CloudFormation 배포 중에 `ec2:DescribeManagedPrefixLists`(필터 `prefix-list-name`)를 호출하고, 응답의 `PrefixLists.0.PrefixListId`를 보안 그룹 규칙에 넣습니다. CloudFront origin-facing(ALB 인바운드)과 S3 gateway(태스크 아웃바운드) 두 목록을 이렇게 조회합니다. custom resource의 IAM 정책은 그 API 하나뿐입니다. 이 API는 리소스 수준 권한을 지원하지 않아 `Resource: "*"`입니다.

이 prefix list는 보안 그룹 규칙 할당량을 여러 개 차지합니다. ALB 보안 그룹에는 다른 인바운드 규칙을 추가하지 마세요.

## 사전 준비

배포하는 사람이 미리 만들어 두어야 합니다(이 코드는 만들지 않습니다).

1. `hostedZoneName`의 Route 53 public hosted zone.
2. **us-east-1** ACM 인증서: `domainName`을 포함. CloudFront 뷰어용.
3. **배포 리전** ACM 인증서: `origin.<domainName>`을 포함. ALB 리스너용. CloudFront가 이 이름으로 ALB에 접속해 인증서를 검증합니다.
4. 배포 계정·리전의 CDK bootstrap.

## context 값

| 키 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- |
| `region` | 예 | `ap-northeast-2` | ALB·ECS·VPC·로그 버킷 리전. opt-in 리전(예: `ap-east-1`, `me-south-1`)은 CloudFront 표준 로깅(legacy)이 지원하지 않아 synth가 거부합니다 |
| `domainName` | 예 | `myanki.example.com` | 사용자가 접속하는 이름. `hostedZoneName` 안에 있어야 합니다 |
| `hostedZoneId` | 예 | `Z0000000000EXAMPLE` | Route 53 hosted zone ID. lookup 없이 그대로 씁니다 |
| `hostedZoneName` | 예 | `example.com` | hosted zone 이름 |
| `cloudFrontCertificateArn` | 예 | us-east-1 ACM ARN | 리전이 us-east-1이 아니면 synth가 실패합니다 |
| `albCertificateArn` | 예 | `region`의 ACM ARN | 리전이 `region`과 다르면 synth가 실패합니다 |
| `imageTag` | 예 | `v0.1.0` | `myanki` ECR 저장소의 이미지 태그 |
| `originVerifyActive` | 아니요 | `a` | CloudFront가 보낼 시크릿 슬롯(`a`/`b`). 기본 `a` |
| `originVerifyVersionA` | 아니요 | | 슬롯 A 시크릿 버전 ID. 교체 때만 씁니다 |
| `originVerifyVersionB` | 아니요 | | 슬롯 B 시크릿 버전 ID. 교체 때만 씁니다 |

필수 값이 없으면 synth는 빠진 키 이름을 모두 적은 오류로 실패합니다.

계정 ID는 받지 않습니다. 배포 자격 증명의 계정을 씁니다. 인증서 ARN과 zone ID 같은 실제 값은 저장소에 커밋하지 말고 명령줄 `-c`로 넘기세요.

## synth와 테스트

아래 예시 값은 형식만 맞춘 가짜 값입니다(계정 `000000000000`). 자격 증명이 없어도 됩니다.

```bash
cd infra
npm ci
npx cdk synth \
  -c region=ap-northeast-2 \
  -c domainName=myanki.example.com \
  -c hostedZoneId=Z0000000000EXAMPLE \
  -c hostedZoneName=example.com \
  -c cloudFrontCertificateArn=arn:aws:acm:us-east-1:000000000000:certificate/00000000-0000-0000-0000-000000000000 \
  -c albCertificateArn=arn:aws:acm:ap-northeast-2:000000000000:certificate/00000000-0000-0000-0000-000000000000 \
  -c imageTag=v0.1.0
npm test
```

`cdk synth`는 cdk-nag `AwsSolutions` 규칙 팩을 함께 실행하고, 예외로 처리하지 않은 위반이 하나라도 있으면 실패합니다.

## 배포

> 배포는 비용이 드는 실제 리소스를 만듭니다. 계정과 리전을 확인하고 실행하세요. 아래 `CONTEXT`는 위 표의 필수 값을 `-c key=value`로 나열한 것입니다.

```bash
cd infra
CONTEXT="-c region=... -c domainName=... -c hostedZoneId=... -c hostedZoneName=... \
  -c cloudFrontCertificateArn=... -c albCertificateArn=... -c imageTag=v0.1.0"

# 1. ECR 저장소
npx cdk deploy MyAnkiEcr $CONTEXT

# 2. 이미지 빌드·push (저장소 루트에서). 태그는 immutable이라 매번 새 태그를 씁니다.
cd ..
REGION=ap-northeast-2
REGISTRY="$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${REGION}.amazonaws.com"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker build --platform linux/amd64 -t "$REGISTRY/myanki:v0.1.0" .
docker push "$REGISTRY/myanki:v0.1.0"

# 3. 앱 스택
cd infra
npx cdk deploy MyAnkiApp $CONTEXT
```

새 버전은 새 태그로 push한 뒤 `-c imageTag=<새 태그>`로 `MyAnkiApp`만 다시 배포합니다.

배포 후 확인:

- `https://<domainName>/`은 앱, `https://<domainName>/healthz`는 `ok`를 돌려줍니다.
- `https://origin.<domainName>/`에 직접 접속하면 연결되지 않아야 합니다(보안 그룹이 CloudFront 외 출발지를 막음).

## 삭제

ALB 삭제 보호가 켜져 있어 먼저 꺼야 합니다.

```bash
cd infra
ALB_ARN=$(aws cloudformation describe-stack-resources --stack-name MyAnkiApp \
  --query "StackResources[?ResourceType=='AWS::ElasticLoadBalancingV2::LoadBalancer'].PhysicalResourceId" --output text)
aws elbv2 modify-load-balancer-attributes --load-balancer-arn "$ALB_ARN" \
  --attributes Key=deletion_protection.enabled,Value=false
npx cdk destroy MyAnkiApp $CONTEXT
npx cdk destroy MyAnkiEcr $CONTEXT
```

액세스 로그 버킷과 ECR 저장소는 `RETAIN`이라 스택을 지워도 남습니다. 필요 없으면 내용을 확인한 뒤 직접 지우세요.

origin-verify 시크릿 두 개는 스택과 함께 **삭제 예약**됩니다(Secrets Manager 복구 기간, 기본 30일). 그동안 이름 `MyAnkiApp/origin-verify/a`, `/b`가 점유되어 있어, 복구 기간 안에 `MyAnkiApp`을 다시 배포하면 시크릿 생성에서 실패하고 스택이 롤백됩니다. 복구 기간 안에 다시 배포하려면 먼저 두 시크릿을 즉시 삭제하세요. 재배포하면 새 값이 생성됩니다.

```bash
for slot in a b; do
  aws secretsmanager delete-secret --secret-id "MyAnkiApp/origin-verify/$slot" --force-delete-without-recovery
done
```

## X-Origin-Verify 교체 절차

시크릿은 두 개(`MyAnkiApp/origin-verify/a`, `MyAnkiApp/origin-verify/b`)이고 처음 배포할 때 Secrets Manager가 64자 무작위 값으로 만듭니다. ALB 규칙은 두 값을 모두 받고, CloudFront는 `originVerifyActive` 슬롯 값만 보냅니다.

CloudFront와 ALB는 값을 CloudFormation dynamic reference(`{{resolve:secretsmanager:...}}`)로 읽습니다. 템플릿에는 참조만 있고 값은 없습니다. dynamic reference는 해당 리소스가 바뀌는 스택 업데이트 때만 다시 읽히므로, 교체할 때는 버전 ID를 context로 넘겨 템플릿을 바꿉니다. 자동 교체(rotation Lambda)는 이 구조와 맞지 않아 쓰지 않습니다.

**원칙: 지금 CloudFront가 보내는 활성 슬롯의 값은 절대 먼저 바꾸지 않습니다.** 비활성 슬롯을 바꾸고, ALB에 반영하고, CloudFront를 전환한 다음에 예전 값을 폐기합니다.

예: 현재 활성 슬롯이 `a`일 때

```bash
cd infra
# 1. 비활성 슬롯 b에 새 값을 넣고 버전 ID만 받습니다. 값은 화면에 찍히지 않습니다.
NEW_B=$(aws secretsmanager put-secret-value --secret-id MyAnkiApp/origin-verify/b \
  --secret-string "$(aws secretsmanager get-random-password --password-length 64 \
      --exclude-punctuation --query RandomPassword --output text)" \
  --query VersionId --output text)

# 2. ALB가 새 b 값을 받게 합니다. CloudFront는 아직 a를 보냅니다.
npx cdk deploy MyAnkiApp $CONTEXT -c originVerifyActive=a -c originVerifyVersionB="$NEW_B"

# 3. CloudFront가 b를 보내게 전환합니다. CloudFormation이 배포 완료까지 기다립니다.
npx cdk deploy MyAnkiApp $CONTEXT -c originVerifyActive=b -c originVerifyVersionB="$NEW_B"

# 4. 예전 a 값을 폐기합니다. 이제 a가 비활성 슬롯입니다.
NEW_A=$(aws secretsmanager put-secret-value --secret-id MyAnkiApp/origin-verify/a \
  --secret-string "$(aws secretsmanager get-random-password --password-length 64 \
      --exclude-punctuation --query RandomPassword --output text)" \
  --query VersionId --output text)
npx cdk deploy MyAnkiApp $CONTEXT -c originVerifyActive=b \
  -c originVerifyVersionA="$NEW_A" -c originVerifyVersionB="$NEW_B"
```

다음 교체는 `a`와 `b`를 바꿔서 같은 순서로 합니다. 이후 배포에는 마지막 `originVerifyActive`와 버전 ID 값을 계속 넘기세요. 활성 슬롯을 잘못 넘기면 CloudFront가 다른 값을 보내게 되므로, 현재 값을 팀이 공유하는 곳(예: 배포 기록)에 남겨 두세요.

값은 Secrets Manager, CloudFront 배포 설정, ALB 규칙에만 있습니다. 이 저장소, CDK 코드, CloudFormation 템플릿과 출력, ALB·CloudFront·nginx 로그에는 남지 않습니다. 단, CloudFront 배포 설정과 ALB 규칙을 읽을 권한이 있는 IAM 사용자는 값을 볼 수 있습니다.

## cdk-nag 예외

| 규칙 | 대상 | 이유 |
| --- | --- | --- |
| `AwsSolutions-S1` | 액세스 로그 버킷 | 이 버킷이 ALB·CloudFront 로그의 목적지입니다. 자기 자신에게 서버 액세스 로그를 쓰면 순환합니다. |
| `AwsSolutions-CFR1` | CloudFront | 국가 제한이 없는 공개 앱입니다. |
| `AwsSolutions-CFR2` | CloudFront | AWS WAF는 이 이슈 범위 밖이며 별도 이슈로 다룹니다. |
| `AwsSolutions-SMG4` | origin-verify 시크릿 2개 | 위 2슬롯 절차로 교체합니다. dynamic reference는 스택 업데이트 때만 다시 읽히므로 자동 교체는 CloudFront와 ALB 값을 어긋나게 해 403을 냅니다. |
| `AwsSolutions-IAM5[Resource::*]` | 태스크 실행 역할 | `ecr:GetAuthorizationToken`은 `Resource: "*"`만 지원합니다. 이미지 pull과 로그 쓰기는 MyAnki 저장소와 로그 그룹으로 한정했습니다. |
| `AwsSolutions-IAM5[Resource::*]` | prefix list 조회 custom resource | `ec2:DescribeManagedPrefixLists`는 리소스 수준 권한을 지원하지 않습니다. 허용 동작은 이 하나뿐입니다. |
| `AwsSolutions-IAM4[...AWSLambdaBasicExecutionRole]` | 스택(CDK가 만드는 custom resource provider Lambda) | provider Lambda가 자기 로그를 쓰는 데만 씁니다. 이 Lambda는 CDK가 스택 수준 싱글턴으로 만들어 스택에 걸었고, 이 관리형 정책 하나로 한정했습니다. |

예외는 모두 코드에 `Validations.of(...).acknowledge()`로 이유와 함께 남아 있습니다.
