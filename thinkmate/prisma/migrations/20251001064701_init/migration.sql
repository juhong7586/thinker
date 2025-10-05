-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "students" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "studentColor" TEXT,
    CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "socialImpact" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "interests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inviteCode" TEXT NOT NULL,
    "teacherId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "groups_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "group_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "groups_inviteCode_key" ON "groups"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_studentId_key" ON "group_members"("groupId", "studentId");
