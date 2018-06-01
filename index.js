#!/usr/bin/env node

const program = require('commander');
const config = require('./package.json');
const GitHub = require('github-api');
const rp = require('request-promise');
const md2json = require('md-2-json');

program
  .version(config.version)
  .description(config.description);

program
  .command('post-latest <user> <repo> [pretext]')
  .alias('l')
  .description('Post the latest release note for a particular repo to slack')
  .option('-t, --token <token>', 'Your Github Personal Access Token')
  .option('-s, --slack-url <url>', 'The slack webhook url')
  .action((user, repo, pretext, cmd) => {
    const gh = new GitHub({
      token: cmd.token
    });

    const ghRepo = gh.getRepo(user, repo);
    ghRepo.listReleases()
      .then(result => {
        const latestRelease = getLatestRelease(result.data);
        const body = latestRelease.body;
        const username = latestRelease.author.login;
        const useravatar = latestRelease.author.avatar_url;
        const title = latestRelease.name;
        const url = latestRelease.html_url;
        const fields = generateFields(body);
        const options = {
          method: 'POST',
          uri: cmd.slackUrl,
          body: {
            "attachments": [
              {
                "fallback": title,
                "pretext": pretext,
                "color": "#36a64f",
                "title": title,
                "title_link": url,
                "fields": fields,
                "footer": username,
                "footer_icon": useravatar,
                "mrkdwn_in": ["text"]
              }
            ]
          },
          json: true // Automatically stringifies the body to JSON
      };
      
      rp(options)
          .then(function (parsedBody) {
              console.log(parsedBody);
          })
          .catch(function (err) {
              console.error(err);
          });
      });
  });

program.parse(process.argv);

function generateFields(raw) {
  const json = md2json.parse(raw);
  const fields = [];
  const types = ['Features', 'Fixes', 'Chores'];
  for (const type of types) {
    if (json[type]) {
      fields.push({
        title: type,
        value: json[type].raw,
        short: false
      });
    }
  }
  return fields;
}

function getLatestRelease(releases) {
  for (const x of releases) {
    if (!x.draft) {
      return x;
    }
  }
  return releases[0];
}