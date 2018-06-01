#!/usr/bin/env node

const program = require('commander');
const config = require('./package.json');
const GitHub = require('github-api');

const token = '';

program
  .version(config.version)
  .description(config.description);

program
  .command('get-latest <user> <repo>')
  .alias('l')
  .description('Get the latest release note for a particular repo')
  .option('-t, --token <token>', 'Your Github Personal Access Token')
  .action((user, repo, cmd) => {
    console.log(user, repo, cmd.token);
    const gh = new GitHub({
      token: cmd.token || token
    });

    const ghRepo = gh.getRepo(user, repo);
    ghRepo.listReleases()
      .then(result => {
        const latestRelease = result.data[0];
        const body = latestRelease.body;
      });
  });

program.parse(process.argv);