#!/usr/bin/env node
const md2json = require('md-2-json');
var exports = module.exports = {};

exports.generateFields = function(raw) {
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
};

exports.generatePayload = function(data) {
  const fields = exports.generateFields(data.body);
  return {
    "attachments": [
      {
        "fallback": data.title,
        "pretext": data.pretext,
        "color": data.color || "#36a64f",
        "title": data.title || '',
        "title_link": data.url,
        "fields": fields,
        "footer": data.username,
        "footer_icon": data.useravatar,
        "mrkdwn_in": ["text"]
      }
    ]
  };
};

exports.generateCircleCIPayload = function(data) {
  return {
    "attachments": [
      {
        "fallback": data.title,
        "pretext": data.pretext,
        "color": data.color || "#36a64f",
        "title": data.title || '',
        "title_link": data.url,
        "text": data.body,
        "fields": [
          {
            "title": "Project",
            "value": data.projectName,
            "short": true
          },
          {
            "title": "Branch",
            "value": data.branch,
            "short": true
          }
        ],
        "footer": data.username,
        "footer_icon": data.useravatar
      }
    ]
  };
};
