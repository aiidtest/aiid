import { expect, jest, it } from '@jest/globals';
import { ApolloServer } from "@apollo/server";
import { makeRequest, seedFixture, startTestServer } from "./utils";
import * as context from '../context';

describe(`Reports`, () => {
    let server: ApolloServer, url: string;

    beforeAll(async () => {
        ({ server, url } = await startTestServer());
    });

    afterAll(async () => {
        await server?.stop();
    });


    it(`Flag report`, async () => {

        const mutationData = {
            query: `
                mutation($reportNumber: Int!, $input: Boolean!) {
                    flagReport(report_number: $reportNumber, input: $input) {
                        report_number
                        flag
                        date_modified
                        epoch_date_modified
                    }
                }
                    `,
            variables: {

                "reportNumber": 1,
                "input": true
            }
        };


        await seedFixture({
            customData: {
                users: [
                    {
                        userId: "123",
                        roles: [],
                    }
                ],
            },
            aiidprod: {
                reports: [
                    {
                        report_number: 1,
                        flag: false
                    }
                ]
            }
        });


        jest.spyOn(context, 'verifyToken').mockResolvedValue({ sub: "123" })

        const response = await makeRequest(url, mutationData);

        expect(response.body.data).toMatchObject({
            flagReport: {
                report_number: 1,
                flag: true,
                date_modified: expect.any(String),
                epoch_date_modified: expect.any(Number),
            }
        })
    });

    it(`Update reports translations`, async () => {

        const mutationData = {
            query: `
               mutation (
                    $input: UpdateOneReportTranslationInput!
                    $language: String!
                ) {
                updateOneReportTranslation(input: $input) {
                        translations(input: $language) {
                        title
                        text
                        }
                    }
                }`,
            variables: {
                input: {
                    language: "es",
                    plain_text: "this is plain text",
                    report_number: 1,
                    text: "this is the text",
                    title: "this is the title"
                },
                language: "es"
            }
        };


        await seedFixture({
            customData: {
                users: [
                    {
                        userId: "123",
                        roles: ['incident_editor'],
                    }
                ],
            },
            aiidprod: {
                reports: [
                    {
                        report_number: 1,
                        flag: false
                    }
                ]
            }
        });


        jest.spyOn(context, 'verifyToken').mockResolvedValue({ sub: "123" })

        const response = await makeRequest(url, mutationData);

        expect(response.body.data).toMatchObject({
            updateOneReportTranslation: {
                translations: {
                    title: "this is the title",
                    text: "this is the text"
                }
            }
        })
    });
});
