-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "isOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "netMonthlySalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "annualBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherMonthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last12MonthRevenue" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "avgMonthlyProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emergencyFundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlySavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastScoreCalculatedAt" TIMESTAMP(3),
    "houseRent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "groceries" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "electricityBill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gasBill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterBill" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internetMobile" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "medicalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vehicleFuel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "schoolFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCard" (
    "id" SERIAL NOT NULL,
    "financialProfileId" INTEGER NOT NULL,
    "cardName" TEXT NOT NULL DEFAULT 'Credit Card',
    "creditLimit" DOUBLE PRECISION NOT NULL,
    "outstandingBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "loanType" TEXT NOT NULL,
    "lenderName" TEXT NOT NULL DEFAULT 'Bank/NBFC',
    "principalAmount" DOUBLE PRECISION NOT NULL,
    "outstandingBalance" DOUBLE PRECISION NOT NULL,
    "monthlyEMI" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "remainingMonths" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🎯',
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT NOT NULL DEFAULT '',
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" SERIAL NOT NULL,
    "goalId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "achievedAt" TIMESTAMP(3),

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "needsPercent" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "wantsPercent" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "savingsPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "month" TEXT,
    "needsHouseRentBudgeted" DOUBLE PRECISION,
    "needsHouseRentActual" DOUBLE PRECISION,
    "needsGroceriesBudgeted" DOUBLE PRECISION,
    "needsGroceriesActual" DOUBLE PRECISION,
    "needsUtilitiesBudgeted" DOUBLE PRECISION,
    "needsUtilitiesActual" DOUBLE PRECISION,
    "needsTransportBudgeted" DOUBLE PRECISION,
    "needsTransportActual" DOUBLE PRECISION,
    "needsInsuranceBudgeted" DOUBLE PRECISION,
    "needsInsuranceActual" DOUBLE PRECISION,
    "needsMedicalBudgeted" DOUBLE PRECISION,
    "needsMedicalActual" DOUBLE PRECISION,
    "needsLoanEMIsBudgeted" DOUBLE PRECISION,
    "needsLoanEMIsActual" DOUBLE PRECISION,
    "wantsDiningBudgeted" DOUBLE PRECISION,
    "wantsDiningActual" DOUBLE PRECISION,
    "wantsEntertainmentBudgeted" DOUBLE PRECISION,
    "wantsEntertainmentActual" DOUBLE PRECISION,
    "wantsShoppingBudgeted" DOUBLE PRECISION,
    "wantsShoppingActual" DOUBLE PRECISION,
    "wantsSubscriptionsBudgeted" DOUBLE PRECISION,
    "wantsSubscriptionsActual" DOUBLE PRECISION,
    "wantsTravelBudgeted" DOUBLE PRECISION,
    "wantsTravelActual" DOUBLE PRECISION,
    "savingsEmergencyBudgeted" DOUBLE PRECISION,
    "savingsEmergencyActual" DOUBLE PRECISION,
    "savingsInvestmentsBudgeted" DOUBLE PRECISION,
    "savingsInvestmentsActual" DOUBLE PRECISION,
    "savingsGoalsBudgeted" DOUBLE PRECISION,
    "savingsGoalsActual" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetWorth" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetWorth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "netWorthId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "purchaseValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liability" (
    "id" SERIAL NOT NULL,
    "netWorthId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "outstandingAmount" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Liability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" SERIAL NOT NULL,
    "netWorthId" INTEGER NOT NULL,
    "totalAssets" DOUBLE PRECISION NOT NULL,
    "totalLiabilities" DOUBLE PRECISION NOT NULL,
    "netWorthValue" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "dtiScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "savingsScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emergencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expenseScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMonthlyEMI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMonthlyExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "savingsRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dtiRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditUtilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emergencyFundMonths" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionLabel" TEXT,
    "actionRoute" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scoreId" INTEGER,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionStep" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialProfile_userId_key" ON "FinancialProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_key" ON "Budget"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NetWorth_userId_key" ON "NetWorth"("userId");

-- AddForeignKey
ALTER TABLE "FinancialProfile" ADD CONSTRAINT "FinancialProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_financialProfileId_fkey" FOREIGN KEY ("financialProfileId") REFERENCES "FinancialProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetWorth" ADD CONSTRAINT "NetWorth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_netWorthId_fkey" FOREIGN KEY ("netWorthId") REFERENCES "NetWorth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_netWorthId_fkey" FOREIGN KEY ("netWorthId") REFERENCES "NetWorth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_netWorthId_fkey" FOREIGN KEY ("netWorthId") REFERENCES "NetWorth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE SET NULL ON UPDATE CASCADE;
