CREATE TABLE "incidentEmbeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"incidentId" integer,
	"chunkIndex" integer NOT NULL,
	"chunkText" text NOT NULL,
	"embedding" vector(1024),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"model" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reportEmbeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"reportNumber" integer,
	"chunkIndex" integer NOT NULL,
	"chunkText" text NOT NULL,
	"embedding" vector(1024),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"model" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incidentEmbeddings" ADD CONSTRAINT "incidentEmbeddings_incidentId_incidents_incidentId_fk" FOREIGN KEY ("incidentId") REFERENCES "public"."incidents"("incidentId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportEmbeddings" ADD CONSTRAINT "reportEmbeddings_reportNumber_reports_reportNumber_fk" FOREIGN KEY ("reportNumber") REFERENCES "public"."reports"("reportNumber") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "incidentEmbeddingIdx" ON "incidentEmbeddings" USING btree ("incidentId","chunkIndex");--> statement-breakpoint
CREATE UNIQUE INDEX "reportEmbeddingIdx" ON "reportEmbeddings" USING btree ("reportNumber","chunkIndex");