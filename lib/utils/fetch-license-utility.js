'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  licenseFileRegex: /SEE LICENSE IN (.*?)$/i,

  gitHubRegex: /github.com(.*?)$/i,

  gitHubLicenseApiUrl: (owner, repo) => `https://api.github.com/repos/${owner}/${repo}/license`,

  possibleOrigins: {
    packagePropertyLicense: 'Found in license property of package.json',
    fileLicense: 'Found in license file',
    githubLicense: 'Found using the Github API for the repository'
  },

  knownLicenses: {
    'http://www.apache.org/licenses/LICENSE-1.1': 'Apache Software License, Version 1.1',
    'http://www.apache.org/licenses/LICENSE-2.0': 'Apache Software License, Version 2.0',
    'https://opensource.org/licenses/BSD-2-Clause': 'The 2-Clause BSD License',
    'https://opensource.org/licenses/BSD-3-Clause': 'The 3-Clause BSD License',
    'http://repository.jboss.org/licenses/cc0-1.0.txt': 'Creative Commons Legal Code',
    'https://www.eclipse.org/legal/cpl-v10.html': 'Common Public License - v 1.0',
    'https://www.eclipse.org/legal/epl-v10.html': 'Eclipse Public License - v 1.0',
    'https://www.eclipse.org/org/documents/epl-2.0/EPL-2.0.txt': 'Eclipse Public License - v 2.0',
    'https://www.gnu.org/licenses/gpl-1.0': 'GNU GENERAL PUBLIC LICENSE, Version 1',
    'https://www.gnu.org/licenses/gpl-2.0': 'GNU GENERAL PUBLIC LICENSE, Version 2',
    'https://www.gnu.org/licenses/gpl-3.0': 'GNU GENERAL PUBLIC LICENSE, Version 3',
    'https://www.gnu.org/licenses/lgpl-2.1': 'GNU LESSER GENERAL PUBLIC LICENSE, Version 2.1',
    'https://www.gnu.org/licenses/lgpl-3.0': 'GNU LESSER GENERAL PUBLIC LICENSE, Version 3',
    'https://opensource.org/licenses/MIT': 'MIT License',
    'https://www.mozilla.org/en-US/MPL/1.1': 'Mozilla Public License Version 1.1',
    'https://www.mozilla.org/en-US/MPL/2.0': 'Mozilla Public License, Version 2.0'
  }
};