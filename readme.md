# rn-sender

A tool to get Github Release notes and send it to slack.

## Installation

```
npm install -g git+https://git@github.com/justindra/rn-sender.git
```

## Usage

```
rn-sender l [username] [reponame] [pretext] -t [personal-access-token] -s [slack-webhook-url] -a [microsoft-teams-webhook-url]
rn-sender c [username] [reponame] [sha1] [pretext] -t [personal-access-token] -s [slack-webhook-url] -a [microsoft-teams-webhook-url]
```
