import { EmailParams, MailerSend, Recipient } from "mailersend";
import config from "../config";
import templates from "./templates";
import * as reporter from '../reporter';
import assert from "assert";

interface SendEmailParams {
    recipients: {
        email: string;
        userId: string;
    }[];
    subject: string;
    dynamicData: {
        incidentId?: string;
        incidentTitle?: string;
        incidentUrl?: string;
        incidentDescription?: string;
        incidentDate?: string;
        developers?: string; // HTML string of developers
        deployers?: string;   // HTML string of deployers
        entitiesHarmed?: string; // HTML string of harmed entities
        reportUrl?: string;   // URL for a specific report (optional)
        reportTitle?: string; // Title of the report (optional)
        reportAuthor?: string; // Author of the report (optional)
        entityName?: string;   // Entity name (optional)
        entityUrl?: string;    // Entity URL (optional)
    };
    templateId: string; // Email template ID
}

export const replacePlaceholdersWithAllowedKeys = (template: string, data: { [key: string]: string }, allowedKeys: string[]): string => {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
        return allowedKeys.includes(key) && key in data ? data[key] : match;
    });
}

export const mailersendBulkSend = async (emails: EmailParams[]) => {

    const mailersend = new MailerSend({
        apiKey: config.MAILERSEND_API_KEY,
    });

    assert(emails.every(email => email.to.length == 1), 'Emails must have exactly one recipient');

    await mailersend.email.sendBulk(emails);
}

export const sendEmail = async ({ recipients, subject, dynamicData, templateId }: SendEmailParams) => {

    const emailTemplateBody = templates[templateId];

    if (!emailTemplateBody) {
        throw new Error(`Template not found: ${templateId}`);
    }

    try {

        const bulk: EmailParams[] = [];

        for (const recipient of recipients) {

            const personalizations = [{
                email: recipient.email,
                data: {
                    ...dynamicData,
                    email: recipient.email,
                    userId: recipient.userId,
                    siteUrl: config.SITE_URL,
                }
            }]

            // We have to do this because MailerSend is escaping the placeholders containing html tags
            const html = replacePlaceholdersWithAllowedKeys(emailTemplateBody, dynamicData, ['developers', 'deployers', 'entitiesHarmed'])

            const emailParams = new EmailParams()
                .setFrom({ email: config.NOTIFICATIONS_SENDER, name: config.NOTIFICATIONS_SENDER_NAME })
                .setTo([new Recipient(recipient.email, '')])
                .setPersonalization(personalizations)
                .setSubject(subject)
                .setHtml(html);
            //TODO: add a text version of the email
            // .setText("Greetings from the team, you got this message through MailerSend.");

            bulk.push(emailParams);
        }

        await mailersendBulkSend(bulk);

    } catch (error: any) {
        error.message = `[Send Email]: ${error.message}`;
        reporter.error(error);

        throw error;
    }
}
