# Notes & Tasks — Figma Make Sample

A sample notes and task management app built with React, TypeScript, and Vite. This repo is intended to be used as a local codebase with [Figma Make](https://www.figma.com/make/) to demonstrate connecting Make to an existing project.

## Stack

- React + TypeScript
- Vite
- IndexedDB (via `idb`) for local persistence

## Getting started with Figma Make

This repo includes the `.figma/make` configuration files, so Make will automatically install dependencies, start the dev server, and load the preview when you open it.

**Requirements:** [Figma Beta desktop app](https://www.figma.com/downloads/) for Mac and access to the [Make local codebase closed beta](https://www.figma.com/join-waitlist-make).

**Option 1 — Open a local clone:**
1. Clone this repo locally
2. In the Figma Beta app, create a Make file and click **Open a folder**
3. Select the cloned folder and click **New session**

**Option 2 — Clone from Make directly:**
1. In the Figma Beta app, create a Make file and click **Clone a repository**
2. Paste `https://github.com/ccwilson10/notes` and choose a local destination

## Run locally (without Make)

```bash
npm install
npm run dev
```
