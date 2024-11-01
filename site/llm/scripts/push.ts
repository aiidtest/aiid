import { PrismaClient } from '@prisma/client'
import { MongoClient } from 'mongodb'
import {
    DBIncident,
    DBEntity,
    DBClassification,
    DBReport,
    DBUser,
} from '../../gatsby-site/server/interfaces'
import { InputJsonValue } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

class DatabaseMigrator {
    private mongoClient: MongoClient;

    constructor() {
        const mongoUrl = process.env.MONGODB_URL;
        if (!mongoUrl) throw new Error('MONGODB_URL not found in environment variables');
        this.mongoClient = new MongoClient(mongoUrl);
    }

    async connect(): Promise<void> {
        await this.mongoClient.connect();
    }

    async disconnect(): Promise<void> {
        await this.mongoClient.close();
        await prisma.$disconnect();
    }

    private ensureNumberArray(value: any[] | null | undefined): number[] {
        if (!value) return [];
        return value.filter((v): v is number =>
            typeof v === 'number' && !isNaN(v)
        );
    }

    private async migrateEntities(): Promise<void> {
        console.log('Migrating entities...');
        const entities = await this.mongoClient
            .db('aiidprod')
            .collection<DBEntity>('entities')
            .find()
            .toArray();

        for (const entity of entities) {
            await prisma.entity.upsert({
                where: { entity_id: entity.entity_id },
                update: {
                    name: entity.name,
                    created_at: entity.created_at,
                    date_modified: entity.date_modified
                },
                create: {
                    entity_id: entity.entity_id,
                    name: entity.name,
                    created_at: entity.created_at,
                    date_modified: entity.date_modified
                }
            });
        }
    }

    private async migrateUsers(): Promise<void> {
        console.log('Migrating users...');
        const users = await this.mongoClient
            .db('customData')
            .collection<DBUser>('users')
            .find()
            .toArray();

        for (const user of users) {
            await prisma.user.upsert({
                where: { userId: user.userId },
                update: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    roles: user.roles as string[] ?? [],
                },
                create: {
                    userId: user.userId,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    roles: user.roles as string[] ?? []
                }
            });
        }
    }

    private async migrateReports(): Promise<void> {
        console.log('Migrating reports...');
        const reports = await this.mongoClient
            .db('aiidprod')
            .collection<DBReport>('reports')
            .find()
            .toArray();

        for (const report of reports) {
            const user = await prisma.user.findUnique({
                where: { userId: report.user }
            });

            try {
                await prisma.report.create({
                    data: {
                        report_number: report.report_number,
                        authors: report.authors as string[] ?? [],
                        cloudinary_id: report.cloudinary_id,
                        date_downloaded: report.date_downloaded,
                        date_modified: report.date_modified,
                        date_published: report.date_published,
                        date_submitted: report.date_submitted,
                        description: report.description,
                        editor_notes: report.editor_notes,
                        embedding: report.embedding ?? {},
                        epoch_date_downloaded: report.epoch_date_downloaded,
                        epoch_date_modified: report.epoch_date_modified,
                        epoch_date_published: report.epoch_date_published,
                        epoch_date_submitted: report.epoch_date_submitted,
                        flag: report.flag,
                        image_url: report.image_url,
                        inputs_outputs: report.inputs_outputs as string[] ?? [],
                        is_incident_report: report.is_incident_report,
                        language: report.language,
                        plain_text: report.plain_text,
                        source_domain: report.source_domain,
                        submitters: report.submitters as string[] ?? [],
                        tags: report.tags as string[] ?? [],
                        text: report.text,
                        title: report.title,
                        url: report.url,
                        quiet: report.quiet,
                        userId: user?.id
                    }
                });
            } catch (error) {
                console.error(`Failed to migrate report ${report.report_number}:`, error);
            }
        }
    }

    private async migrateIncidents(): Promise<void> {
        console.log('Migrating incidents...');
        const incidents = await this.mongoClient
            .db('aiidprod')
            .collection<DBIncident>('incidents')
            .find()
            .toArray();

        for (const incident of incidents) {
            // Get related entities
            const deployers = await Promise.all(
                incident['Alleged deployer of AI system']
                    .map(name => prisma.entity.findUnique({ where: { entity_id: name } }))
            );

            const developers = await Promise.all(
                incident['Alleged developer of AI system']
                    .map(name => prisma.entity.findUnique({ where: { entity_id: name } }))
            );

            const harmedParties = await Promise.all(
                incident['Alleged harmed or nearly harmed parties']
                    .map(name => prisma.entity.findUnique({ where: { entity_id: name } }))
            );

            // Get editors
            const editors = await Promise.all(
                incident.editors
                    .map(userId => prisma.user.findUnique({ where: { userId } }))
            );

            try {
                const createdIncident = await prisma.incident.create({
                    data: {
                        incident_id: incident.incident_id,
                        date: incident.date,
                        description: incident.description,
                        editor_notes: incident.editor_notes,
                        epoch_date_modified: incident.epoch_date_modified,
                        title: incident.title,
                        editor_dissimilar_incidents: this.ensureNumberArray(incident.editor_dissimilar_incidents),
                        editor_similar_incidents: this.ensureNumberArray(incident.editor_similar_incidents),
                        flagged_dissimilar_incidents: this.ensureNumberArray(incident.flagged_dissimilar_incidents),
                        allegedDeployerOfAISystem: {
                            connect: deployers.filter(Boolean).map(e => ({ id: e!.id }))
                        },
                        allegedDeveloperOfAISystem: {
                            connect: developers.filter(Boolean).map(e => ({ id: e!.id }))
                        },
                        allegedHarmedOrNearlyHarmedParties: {
                            connect: harmedParties.filter(Boolean).map(e => ({ id: e!.id }))
                        },
                        editors: {
                            connect: editors.filter(Boolean).map(e => ({ id: e!.id }))
                        }
                    }
                });

                if (incident.embedding) {
                    await prisma.incidentEmbedding.create({
                        data: {
                            incidentId: createdIncident.id,
                            from_reports: incident.embedding.from_reports as number[] ?? [],
                            vector: incident.embedding.vector as number[] ?? [],
                        }
                    });
                }

                if (incident.tsne) {
                    await prisma.incidentTsne.create({
                        data: {
                            incidentId: createdIncident.id,
                            x: incident.tsne.x,
                            y: incident.tsne.y
                        }
                    });
                }

                if (incident.nlp_similar_incidents) {
                    for (const similar of incident.nlp_similar_incidents) {
                        await prisma.incidentNlpSimilarIncident.create({
                            data: {
                                incidentId: createdIncident.id,
                                incident_id: similar?.incident_id,
                                similarity: similar?.similarity
                            }
                        });
                    }
                }
            } catch (error) {
                console.error(`Failed to migrate incident ${incident.incident_id}:`, error);
            }
        }
    }

    private async migrateClassifications(): Promise<void> {
        console.log('Migrating classifications...');
        const classifications = await this.mongoClient
            .db('aiidprod')
            .collection<DBClassification>('classifications')
            .find()
            .toArray();

        for (const classification of classifications) {
            const incidents = await Promise.all(
                classification.incidents
                    .map(id => prisma.incident.findUnique({ where: { incident_id: id } }))
            );

            const reports = await Promise.all(
                classification.reports
                    .map(id => prisma.report.findUnique({ where: { report_number: id } }))
            );

            try {
                await prisma.classification.create({
                    data: {
                        namespace: classification.namespace,
                        notes: classification.notes,
                        publish: classification.publish,
                        attributes: classification.attributes as InputJsonValue[] ?? {},
                        incidents: {
                            connect: incidents.filter(Boolean).map(i => ({ id: i!.id }))
                        },
                        reports: {
                            connect: reports.filter(Boolean).map(r => ({ id: r!.id }))
                        }
                    }
                });
            } catch (error) {
                console.error(`Failed to migrate classification with namespace ${classification.namespace}:`, error);
            }
        }
    }

    async migrate(): Promise<void> {
        try {
            await this.connect();

            // Migrate in order of dependencies
            await this.migrateEntities();
            await this.migrateUsers();
            await this.migrateReports();
            await this.migrateIncidents();
            await this.migrateClassifications();

            console.log('Migration completed successfully');
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
}


async function main() {

    const migrator = new DatabaseMigrator();

    await migrator.migrate();
}

if (require.main === module) {
    main();
}