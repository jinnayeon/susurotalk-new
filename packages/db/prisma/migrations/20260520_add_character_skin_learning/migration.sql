-- AddTable: Reward (스킨 상점 아이템)
CREATE TABLE "Reward" (
    "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "title"       TEXT         NOT NULL,
    "price"       INTEGER      NOT NULL,
    "rewardType"  TEXT         NOT NULL DEFAULT 'SKIN',
    "stock"       INTEGER      NOT NULL DEFAULT -1,
    "skinName"    TEXT,
    "characterId" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- AddTable: StudentSkin (아이가 구매한 스킨)
CREATE TABLE "StudentSkin" (
    "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"      TEXT         NOT NULL,
    "rewardId"    TEXT         NOT NULL,
    "skinName"    TEXT         NOT NULL,
    "characterId" TEXT         NOT NULL,
    "isEquipped"  BOOLEAN      NOT NULL DEFAULT false,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentSkin_pkey" PRIMARY KEY ("id")
);

-- AddUniqueIndex: 아이당 같은 스킨 중복 구매 방지
CREATE UNIQUE INDEX "StudentSkin_userId_rewardId_key" ON "StudentSkin"("userId", "rewardId");

-- AddTable: LearningState (학습 세션 + SOS 상태)
CREATE TABLE "LearningState" (
    "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"      TEXT         NOT NULL,
    "taskId"      TEXT         NOT NULL,
    "characterId" TEXT         NOT NULL,
    "status"      TEXT         NOT NULL DEFAULT 'IN_PROGRESS',
    "wrongCount"  INTEGER      NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearningState_pkey" PRIMARY KEY ("id")
);

-- AddUniqueIndex: 과제당 학습 상태 1개
CREATE UNIQUE INDEX "LearningState_taskId_key" ON "LearningState"("taskId");

-- AddForeignKey: StudentSkin -> User
ALTER TABLE "StudentSkin" ADD CONSTRAINT "StudentSkin_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: StudentSkin -> Reward
ALTER TABLE "StudentSkin" ADD CONSTRAINT "StudentSkin_rewardId_fkey"
    FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: LearningState -> User
ALTER TABLE "LearningState" ADD CONSTRAINT "LearningState_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: LearningState -> StudyTask
ALTER TABLE "LearningState" ADD CONSTRAINT "LearningState_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "StudyTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SeedData: 초기 스킨 상점 아이템
INSERT INTO "Reward" ("title", "price", "rewardType", "skinName", "characterId") VALUES
('[스킨] 탐정 똥이',      1500, 'SKIN', '탐정 똥이',      'ddong-i'),
('[스킨] 화가 똥이',      1500, 'SKIN', '화가 똥이',      'ddong-i'),
('[스킨] 축구왕 뽕구',    2000, 'SKIN', '축구왕 뽕구',    'bonggu'),
('[스킨] 우주비행사 뽕구', 2000, 'SKIN', '우주비행사 뽕구', 'bonggu'),
('[스킨] 피아노 토핑',    2000, 'SKIN', '피아노 토핑',    'topping'),
('[스킨] 파티시에 토핑',  2000, 'SKIN', '파티시에 토핑',  'topping');
