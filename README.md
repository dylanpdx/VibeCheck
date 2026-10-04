# VibeCheck

<p align="center">
  <img src="./src/icon/icon.svg" height="200px"/>
</p>
<div align="center">
<h3><a href="https://vibecheck.dylanpdx.io/src/VibeCheck.user.js">Install Userscript</a><!-- | <a>View on Firefox Add-Ons</a> | <a>View on Chrome Web Store</a></h3> -->
</div>
<br>

A Userscript<!-- and Browser Extension--> for listing contributions by AI Agents on GitHub repositories, and more sites in the future.

## Why?

No matter your stance on AI generated code, I believe it's important to know where the code for projects you use comes from. This provides an easy way to see at a glance how much of a project's code was contributed by a known AI agent.

## How?
For the full details, see our METHODOLOGY page, but tl;dr:

When an AI agent creates a commit, it can tag itself as a contributor. This project measures how many lines of code are in commits with an AI agent tagged as a contributor, and displays it on top of the page.

(insert picture here)

## False positives?
The way the project works now, the only way for a false positive to happen is if a human manually added an AI agent to a commit's contributors, without any actual generated code being pushed. This is a little silly for a developer to do, so I doubt it'll be a common occurance.

The chance for false negatives, however, is much higher. While an AI Agent can *choose* to add itself as a contributor, it doesn't *have* to. That means AI generated code can be pushed as part of a commit, without any agent being tagged. An owner of a repo can also alter previous commits to remove a contributor from it.
I plan to add more 'tells' to the detection logic eventually, but for now it only scans contributors to a project.

> [!IMPORTANT]
> You should not rely on this project to know for certain if code is or isn't AI generated. It's just a tool for gaining insights into a repository's history.