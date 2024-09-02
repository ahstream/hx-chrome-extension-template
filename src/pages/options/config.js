/* eslint-disable */

const config = [
  // Allowlists
  {
    header: 'Allowlists',
    options: [
      ['property', 'CONTENT_PAGE_BLACKLIST', 'Blacklist content page URL:s starting with:'],
      ['property', 'CONTENT_PAGE_WHITELIST', 'Whitelist content page URL:s starting with:'],
    ],
  },

  // All option types
  {
    header: 'Dummy with all option types',
    options: [
      ['description', 'Sub section description'],
      ['property', 'DUMMY_DEFAULT_OPTION1', 'DUMMY_DEFAULT_OPTION1', 'Suffix', 'Help'],
      ['space', 22],
      ['description', 'Sub section description'],
      ['property', 'DUMMY_DEFAULT_OPTION2', 'DUMMY_DEFAULT_OPTION2', '', 'Help'],
      ['property', 'DUMMY_DEFAULT_OPTION3', 'DUMMY_DEFAULT_OPTION3', '', 'Help'],
      ['property', 'DUMMY_DEFAULT_OPTION4', 'DUMMY_DEFAULT_OPTION4', '', 'Help'],
      ['space', 22],
      ['description', 'Table'],
      [
        'table',
        [
          ['propertyCell', 'DUMMY_DEFAULT_OPTION2', 'DUMMY_DEFAULT_OPTION2', '', 'Help'],
          ['propertyCell', 'DUMMY_DEFAULT_OPTION3', 'desc', '', 'Help'],
        ],
      ],
    ],
  },
];

export default config;
