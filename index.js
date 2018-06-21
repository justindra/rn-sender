#!/usr/bin/env node
const program = require('commander');
const config = require('./package.json');
const GitHub = require('github-api');
const rp = require('request-promise');
const md2json = require('md-2-json');

const slackGeneratePayload = require('./slack.js').generatePayload;
const slackGenerateCircleCI = require('./slack.js').generateCircleCIPayload;
const teamsGeneratePayload = require('./teams.js').generatePayload;
const teamsGenerateCircleCI = require('./teams.js').generateCircleCIPayload;

program
  .version(config.version)
  .description(config.description);

program
  .command('post-latest <user> <repo> [pretext]')
  .alias('l')
  .description('Post the latest release note for a particular repo to slack or teams')
  .option('-t, --token <token>', 'Your Github Personal Access Token')
  .option('-s, --slack-url <url>', 'The slack webhook url')
  .option('-a, --teams-url <url>', 'The teams webhook url')
  .action((user, repo, pretext, cmd) => {
    if (!cmd.slackUrl && !cmd.teamsUrl) return;

    const gh = new GitHub({
      token: cmd.token
    });

    const ghRepo = gh.getRepo(user, repo);
    ghRepo.listReleases()
    .then(result => {
        const latestRelease = getLatestRelease(result.data);
        const data = {
          body: latestRelease.body,
          username: latestRelease.author.login,
          useravatar: latestRelease.author.avatar_url,
          title: latestRelease.name,
          url: latestRelease.html_url,
          pretext
        };

        if (cmd.slackUrl) {
          const payload = slackGeneratePayload(data);
          sendData(cmd.slackUrl, payload);
        }
        
        if (cmd.teamsUrl) {
          const payload = teamsGeneratePayload(data);
          sendData(cmd.teamsUrl, payload);
        }
      });
  });

program
  .command('post-circle-ci <user> <repo> <sha> [pretext]')
  .alias('c')
  .description('Post the details of the latest CircleCI build to slack or teams')
  .option('-t, --token <token>', 'Your Github Personal Access Token')
  .option('-s, --slack-url <url>', 'The slack webhook url')
  .option('-a, --teams-url <url>', 'The teams webhook url')
  .action((user, repo, sha, pretext, cmd) => {
    if (!cmd.slackUrl && !cmd.teamsUrl) return;

    const gh = new GitHub({
      token: cmd.token
    });

    const ghRepo = gh.getRepo(user, repo);
    ghRepo.getCommit(sha)
      .then(result => {
        const data = {
          body: result.data.message,
          username: process.env.CIRCLE_USERNAME,
          useravatar: `https://github.com/${process.env.CIRCLE_USERNAME}.png?size=32`,
          title: "Build #" + process.env.CIRCLE_BUILD_NUM,
          url: process.env.CIRCLE_BUILD_URL,
          projectName: repo,
          branch: process.env.CIRCLE_BRANCH,
          pretext
        };

        if (cmd.slackUrl) {
          const payload = slackGenerateCircleCI(data);
          sendData(cmd.slackUrl, payload);
        }
        
        if (cmd.teamsUrl) {
          const payload = teamsGenerateCircleCI(data);
          sendData(cmd.teamsUrl, payload);
        }
      });
  });

program.parse(process.argv);

function getLatestRelease(releases) {
  for (const x of releases) {
    if (!x.draft) {
      return x;
    }
  }
  return releases[0];
}

function sendData(url, payload) {
  const options = {
    method: 'POST',
    uri: url,
    body: payload,
    json: true // Automatically stringifies the body to JSON
  };

  rp(options)
    .then(function (parsedBody) {
        console.log(parsedBody);
    })
    .catch(function (err) {
        console.error(err);
    });
}
