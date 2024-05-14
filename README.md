![Logo](https://avatars.githubusercontent.com/u/151680118?s=200&v=4 "Logo")

# SFCC Docs

Unofficial community edition of the Salesforce Commerce Cloud developer documentation.

## Instant Setup

If you've got [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed, are using [VS Code](https://code.visualstudio.com) with [CLI code](https://code.visualstudio.com/docs/editor/command-line) enabled, and have the [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) installed, you can click this button to get instantly set up.

[![Open in Remote - Containers](https://img.shields.io/static/v1?style=for-the-badge&label=Remote%20-%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=git@github.com:opensfcc/sfcc-docs.git)

## Manual Installation

> You'll need to be using Node v18+ in order to build this project.

```bash
# Clone Repository
git clone git@github.com:opensfcc/sfcc-docs.git

# Change into this projects directory
cd sfcc-docs

# Install Dependencies
npm install

# Run All CLI Commands
npm run cli:all

# Start Dev Server
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.

## Global search

This template includes a global search that's powered by the [FlexSearch](https://github.com/nextapps-de/flexsearch) library. It's available by clicking the search input or by using the `⌘K` shortcut.

This feature requires no configuration, and works out of the box by automatically scanning your documentation pages to build its index. You can adjust the search parameters by editing the `/src/markdoc/search.mjs` file.

## Learn more

To learn more about the technologies used in this site template, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [Markdoc](https://markdoc.io) - the official Markdoc documentation
- [Algolia Autocomplete](https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete/) - the official Algolia Autocomplete documentation
- [FlexSearch](https://github.com/nextapps-de/flexsearch) - the official FlexSearch documentation

## Tailwind UI License

This website is based on the "Syntax" [Tailwind UI](https://tailwindui.com) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).
This site template is a commercial product purchased by OpenSFCC and is distributed under the [Tailwind UI license](https://tailwindui.com/license).

**This project meets the following distribution criteria:**

```text
Use the Components and Templates to create End Products that are open source and freely available to End Users.
```

## Disclaimer

> The trademarks and product names of Salesforce®, including the mark Salesforce®, are the property of Salesforce.com. OpenSFCC is not affiliated with Salesforce.com, nor does Salesforce.com sponsor or endorse the OpenSFCC products or website. The use of the Salesforce® trademark on this project does not indicate an endorsement, recommendation, or business relationship between Salesforce.com and OpenSFCC.
