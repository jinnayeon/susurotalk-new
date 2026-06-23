-- ChildProfile: levelTested, subjectLevels 컬럼 추가
ALTER TABLE "ChildProfile"
  ADD COLUMN IF NOT EXISTS "levelTested"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "subjectLevels" JSONB   NOT NULL DEFAULT '{}';

-- MentorProfile 테이블
CREATE TABLE IF NOT EXISTS "MentorProfile" (
    "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"      TEXT         NOT NULL,
    "name"        TEXT         NOT NULL,
    "bio"         TEXT         NOT NULL DEFAULT '',
    "subjects"    JSONB        NOT NULL DEFAULT '[]',
    "isAvailable" BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MentorProfile_pkey"  PRIMARY KEY ("id"),
    CONSTRAINT "MentorProfile_userId_key" UNIQUE ("userId")
);

ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- BoardPost 테이블
CREATE TABLE IF NOT EXISTS "BoardPost" (
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"    TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "content"   TEXT         NOT NULL,
    "subject"   TEXT         NOT NULL,
    "grade"     INTEGER      NOT NULL,
    "status"    TEXT         NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoardPost_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BoardPost" ADD CONSTRAINT "BoardPost_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- BoardComment 테이블
CREATE TABLE IF NOT EXISTS "BoardComment" (
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "postId"    TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "content"   TEXT         NOT NULL,
    "isAnswer"  BOOLEAN      NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoardComment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "BoardComment" ADD CONSTRAINT "BoardComment_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "BoardPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BoardComment" ADD CONSTRAINT "BoardComment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MentorMatch 테이블
CREATE TABLE IF NOT EXISTS "MentorMatch" (
    "id"           TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "postId"       TEXT         NOT NULL,
    "mentorUserId" TEXT         NOT NULL,
    "status"       TEXT         NOT NULL DEFAULT 'ACTIVE',
    "matchedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt"   TIMESTAMP(3),
    CONSTRAINT "MentorMatch_pkey"    PRIMARY KEY ("id"),
    CONSTRAINT "MentorMatch_postId_key" UNIQUE ("postId")
);

ALTER TABLE "MentorMatch" ADD CONSTRAINT "MentorMatch_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "BoardPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MentorMatch" ADD CONSTRAINT "MentorMatch_mentorUserId_fkey"
    FOREIGN KEY ("mentorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- LevelTestResult 테이블
CREATE TABLE IF NOT EXISTS "LevelTestResult" (
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"    TEXT         NOT NULL,
    "subject"   TEXT         NOT NULL,
    "score"     INTEGER      NOT NULL,
    "level"     TEXT         NOT NULL,
    "answers"   JSONB        NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LevelTestResult_pkey"              PRIMARY KEY ("id"),
    CONSTRAINT "LevelTestResult_userId_subject_key" UNIQUE ("userId", "subject")
);

ALTER TABLE "LevelTestResult" ADD CONSTRAINT "LevelTestResult_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
