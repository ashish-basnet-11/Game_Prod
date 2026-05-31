-- CreateTable
CREATE TABLE "spin_rewards" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#00d4ff',
    "weight" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spin_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymous_spins" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "lastSpunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymous_spins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anonymous_spins_fingerprint_key" ON "anonymous_spins"("fingerprint");
