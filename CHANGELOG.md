# Change Log

> Here's our record of all notable changes

## v0.3.0

- Major updates to Search Engine to make it easier to use
- Major updates to Main Menu to clean it up and make it easier to use
- Major updates to document structure to make content more accessible
- Removed Version Selection Menu `*`
- Added ISML documentation so you can search for stuff like `iscache` and `iselseif`
- Added support to search the docs via new `/?q=<keyword>` as suggested in #2
- Added debounce to menu filtering as suggested in #2
- Added red coloring to `required` and `[DEPRECATED]` text
- Added manual sort order capabilities to Main Sections
- Added new `npm run cli:update` script to automate tasks after `npm run cli:init`
- Updated Syntax Highlighting of Code to be more accurate
- Updated Search Results to remove duplicates and return most accurate result
- Updated Menu Filter with new Icon and changed input type to Search
- Updated Right Nav with Table of Contents to be more helpful as suggested in #2
- Updated include `code` blocks to remove backticks
- Updated Home Page content blocks and sample code
- Fixed accessibility issues with search results and keyboard navigation
- Fixed #4 and added more context to search results
- Fixed #7 and made more relevant search results sort to top
- Fixed #8 and added support for partial keyword search matching
- Fixed bug in search results listing where scroll top was not being reset on keyword change

`*` This was removed because of the added complexity of supporting multiple versions within the same site. Currently, you can see version history on every page with changes, and this seems good enough for folks that just want to know what changed over time.

## v0.2.0

- Improved DIFFs an added Word DIFF highlighting
- Swapped order of Navigation as suggested in #2
- Updated Tester Menu with some helpful options
- Updated font size in menu reported in #2
- Fixed z-index issues reported in #2
- Fixed issue on server where direct links were throwing 404 errors
- Fixed mobile issues with Open Menu and missing Debug Option
- Fixed broken page rendering reported in #1
- Fixed Bug #5 with Some Pipelet Labels getting cut off

![Screenshot 2023-09-10 at 12 54 43 AM](https://github.com/sfccdevops/sfcc-docs/assets/508411/24b32ac4-b764-4086-a686-ae61e2b23baf)
![Screenshot 2023-09-10 at 12 46 43 AM](https://github.com/sfccdevops/sfcc-docs/assets/508411/64251029-2ed9-402a-ac78-c9d3c1806886)

## v0.1.0

- Initial Release for Testers
