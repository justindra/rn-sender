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
        name: type,
        value: json[type].raw
      });
    }
  }
  return fields;
}

exports.generatePayload = function generatePayload(data) {
  const fields = exports.generateFields(data.body);
  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": data.color || "36a64f",
    "summary": data.title || '',
    "sections": [{
        "activityTitle": data.title && `[${data.title}](${data.url})` || '',
        "activitySubtitle": data.pretext || null,
        // "activityImage": data.useravatar || null,
        "facts": fields,
        "markdown": true
    }]
  };
};

exports.generateCircleCIPayload = function(data) {
  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": data.color || "36a64f",
    "summary": data.title || '',
    "sections": [{
        "activityTitle": data.title && `[${data.title}](${data.url})` || '',
        "activitySubtitle": data.body || data.pretext || null,
        "activityImage": data.useravatar || null,
        "facts": [
          { name: 'Project', value: data.projectName },
          { name: 'Branch',  value: data.branch },
          { name: 'Author',  value: data.username },
        ],
        "markdown": true
    }]
  };
};
