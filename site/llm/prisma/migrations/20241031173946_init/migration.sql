-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT,
    "editor_notes" TEXT,
    "epoch_date_modified" INTEGER,
    "incident_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "editor_dissimilar_incidents" INTEGER[],
    "editor_similar_incidents" INTEGER[],
    "flagged_dissimilar_incidents" INTEGER[],

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "authors" TEXT[],
    "cloudinary_id" TEXT NOT NULL,
    "date_downloaded" TIMESTAMP(3) NOT NULL,
    "date_modified" TIMESTAMP(3) NOT NULL,
    "date_published" TIMESTAMP(3) NOT NULL,
    "date_submitted" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "editor_notes" TEXT,
    "embedding" JSONB,
    "epoch_date_downloaded" INTEGER NOT NULL,
    "epoch_date_modified" INTEGER NOT NULL,
    "epoch_date_published" INTEGER NOT NULL,
    "epoch_date_submitted" INTEGER NOT NULL,
    "flag" BOOLEAN,
    "image_url" TEXT NOT NULL,
    "inputs_outputs" TEXT[],
    "is_incident_report" BOOLEAN,
    "language" TEXT NOT NULL,
    "plain_text" TEXT NOT NULL,
    "report_number" INTEGER NOT NULL,
    "source_domain" TEXT NOT NULL,
    "submitters" TEXT[],
    "tags" TEXT[],
    "text" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER,
    "quiet" BOOLEAN,
    "incidentId" INTEGER,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "adminData" JSONB,
    "first_name" TEXT,
    "last_name" TEXT,
    "roles" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "entity_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "date_modified" TIMESTAMP(3),

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classification" (
    "id" SERIAL NOT NULL,
    "attributes" JSONB[],
    "namespace" TEXT NOT NULL,
    "notes" TEXT,
    "publish" BOOLEAN,

    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxa" (
    "id" SERIAL NOT NULL,
    "complete_entities" BOOLEAN,
    "description" TEXT,
    "dummy_fields" JSONB[],
    "field_list" JSONB[],
    "namespace" TEXT,
    "weight" INTEGER,

    CONSTRAINT "Taxa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentEmbedding" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "from_reports" INTEGER[],
    "vector" DOUBLE PRECISION[],

    CONSTRAINT "IncidentEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentTsne" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,

    CONSTRAINT "IncidentTsne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentNlpSimilarIncident" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "incident_id" INTEGER,
    "similarity" DOUBLE PRECISION,

    CONSTRAINT "IncidentNlpSimilarIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IncidentEditors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DeployerIncidents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DeveloperIncidents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_HarmedPartyIncidents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_IncidentClassifications" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ReportClassifications" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Incident_incident_id_key" ON "Incident"("incident_id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_report_number_key" ON "Report"("report_number");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_entity_id_key" ON "Entity"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentEmbedding_incidentId_key" ON "IncidentEmbedding"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentTsne_incidentId_key" ON "IncidentTsne"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "_IncidentEditors_AB_unique" ON "_IncidentEditors"("A", "B");

-- CreateIndex
CREATE INDEX "_IncidentEditors_B_index" ON "_IncidentEditors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DeployerIncidents_AB_unique" ON "_DeployerIncidents"("A", "B");

-- CreateIndex
CREATE INDEX "_DeployerIncidents_B_index" ON "_DeployerIncidents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DeveloperIncidents_AB_unique" ON "_DeveloperIncidents"("A", "B");

-- CreateIndex
CREATE INDEX "_DeveloperIncidents_B_index" ON "_DeveloperIncidents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_HarmedPartyIncidents_AB_unique" ON "_HarmedPartyIncidents"("A", "B");

-- CreateIndex
CREATE INDEX "_HarmedPartyIncidents_B_index" ON "_HarmedPartyIncidents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IncidentClassifications_AB_unique" ON "_IncidentClassifications"("A", "B");

-- CreateIndex
CREATE INDEX "_IncidentClassifications_B_index" ON "_IncidentClassifications"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ReportClassifications_AB_unique" ON "_ReportClassifications"("A", "B");

-- CreateIndex
CREATE INDEX "_ReportClassifications_B_index" ON "_ReportClassifications"("B");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentEmbedding" ADD CONSTRAINT "IncidentEmbedding_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentTsne" ADD CONSTRAINT "IncidentTsne_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentNlpSimilarIncident" ADD CONSTRAINT "IncidentNlpSimilarIncident_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncidentEditors" ADD CONSTRAINT "_IncidentEditors_A_fkey" FOREIGN KEY ("A") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncidentEditors" ADD CONSTRAINT "_IncidentEditors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeployerIncidents" ADD CONSTRAINT "_DeployerIncidents_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeployerIncidents" ADD CONSTRAINT "_DeployerIncidents_B_fkey" FOREIGN KEY ("B") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperIncidents" ADD CONSTRAINT "_DeveloperIncidents_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperIncidents" ADD CONSTRAINT "_DeveloperIncidents_B_fkey" FOREIGN KEY ("B") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HarmedPartyIncidents" ADD CONSTRAINT "_HarmedPartyIncidents_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HarmedPartyIncidents" ADD CONSTRAINT "_HarmedPartyIncidents_B_fkey" FOREIGN KEY ("B") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncidentClassifications" ADD CONSTRAINT "_IncidentClassifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Classification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncidentClassifications" ADD CONSTRAINT "_IncidentClassifications_B_fkey" FOREIGN KEY ("B") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportClassifications" ADD CONSTRAINT "_ReportClassifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Classification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportClassifications" ADD CONSTRAINT "_ReportClassifications_B_fkey" FOREIGN KEY ("B") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
