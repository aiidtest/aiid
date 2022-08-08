import React from 'react';
import Popover from 'components/ui/Popover';

// These tooltip messages are displayed on the form elements explaining what is expected to be input.
export const title = Popover({
  title: 'Headline',
  text: `Most works have a title that should be entered here verbatim.
  In the event the work has no title, attempt to summarize the contents in a few words without editorializing.
  This text is featured prominently in incident records.`,
});

export const authors = Popover({
  title: 'Creator of the Linked Content',
  text: `Enter the names of the creators of the linked content.
  You should enter all persons contributing to the written work as a single
  row of a CSV.`,
});

export const submitters = Popover({
  title: 'This is you!',
  text: `Enter your name here. If more than one person contributed to collecting the incident,
  you can enter multiple people separated with commas. Alternatively, you can enter
  "Anonymous" as submitter if you do not want to be attributed in the database.
  Entries in this field will be added to the public leaderboard.`,
});

export const developers = Popover({
  title: 'Alleged developer of AI system',
  text: `Enter the names of the developer(s) of the AI System.
  You should enter all developers of the AI system as a single row of a CSV.`
});

export const deployers = Popover({
  title: 'Alleged deployer of AI system',
  text: `Enter the names of the deployer(s) of the AI System.
  You should enter all deployers of the AI system as a single row of a CSV.`
});

export const harmed_parties = Popover({
  title: 'Alleged harmed or nearly harmed parties',
  text: `Enter the names of the harmed or nearly haermed parties by the AI System.
  You should enter all parties as a single row of a CSV.`
});

export const incident_date = Popover({
  title: 'When did the incident first occur?',
  text: `Many AI incidents are not discrete events (i.e. they happen over a period of time).
  Further, it is often difficult to know when the incident first occured when the first
  public report follows some period of time after the first occurence. In this field
  you should enter either the date of the first report of the incident, or
  an educated guess of when the incident likely first occured. For instance, if
  the incident is pertaining to a search engine feature that launched in January
  and the first public incident report is in February, you should assign an
  incident date in January.`,
});

export const date_published = Popover({
  title: 'When did the report become available?',
  text: (
    <>
      Reports often have a publication date at the URL, but even when it does not, you can visit the{' '}
      <a href="https://archive.org/web/">Wayback Machine</a> to find when the report URL was first
      indexed.text:
    </>
  ),
});

export const date_downloaded = Popover({
  title: 'When did you copy the contents of the report into this form?',
  text: `Reports are often updated through time by news organizations. This
  date helps determine whether the contents could potentially be stale. Typically
  you will put todaytitle: 's date here.`,
});

export const url = Popover({
  title: 'Link to the publicly available report',
  text: `This address will be linked to within many incident database UIs.`,
});

export const image_url = Popover({
  title: 'An image used to preview the incident report',
  text: `This should be a URL for an image that will be indexed and displayed next to the report.
  Most publications now have headline images you can grab a URL from by right-clicking.
  You can also link figure images here instead.`,
});

export const incident_id = Popover({
  title: 'Is this an existing incident?',
  text: `Very often reports are written about incidents that are already in the incident database.
  Before submitting, you should check whether the incident is in the database already by
  visiting the "Discover" application and searching for incidents of a similar nature
  to the incident report you are now submitting. If an incident exists for your report, but
  the report has never been submitted, please enter the corresponding incident identifier
  number here. If the incident report already exists,
  please do not resubmit.`,
});

export const text = Popover({
  title: 'Text of the article or transcript of the rich media',
  text: `Copy, paste, and validate the textual contents of the incident report
  match the contents of the URL linked above. Please scrub it of all advertisements
  and other media that should not be indexed and searched when users are discovering
  incidents in the database.`,
});

export const reportAddress = Popover({
  title: 'Link to the publicly available report',
  text: `This address will be linked to within many incident database UIs.`,
});

export const tags = Popover({
  title: 'Tag the type of incident report',
  text: `The purpose of report tags is to support sorting reports on the citation page for the incident. When in doubt, you can leave this field blank and a database editor will select appropriate tags at ingestion time.`,
});

export const language = Popover({
  title: 'Language of the incident report',
  text: `This is the written language of the text found in the report, not the language of the people or countries involved in the report. The reports will be translated to supported languages when we ingest the text.`,
});
