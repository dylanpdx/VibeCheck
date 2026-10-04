# Methodology

Here's what determines what is shown when you visit a repo

## What is measured

When visiting a Github repository, a short summary is shown with a percentage of how many contributions are from known AI Agents. If no contributions are detected, then nothing is shown.

A contribution is counted as a line addition or deletion, as reported by Github. For certain repositories where this information cannot be retrieved, a commit count is shown instead. 

It (currently) does not inspect code or commit messages, only when an Agent is tagged as a contributor.

## Data Sources
### /graphs/contributors-data
As reported by Github: Contributions per week to main, excluding merge commits

### /_sidebar/contributors
Contributors shown in the repository's sidebar.
Note that this may not show some contributors if they are not enough to show in the sidebar, which is why you should not use this tool as final judgement on a repository's code quality.

## Agents
A list of known agents is maintained in the main script file:
```js
const agents = [
    "claude",
    "cursoragent",
    "codex",
    "ampagent",
    "blackboxaicode",
    "ellipsis-agent",
    "Auto-GPT-Bot",
    "openhands-agent",
    "careerops-ledger",
    "compozybot",
    "ouroboros-agent",
    "leeroo-coder",
    "InsightFactoryAPP",
    "Orkas-AI",
    "Copilot"
]
```

Any agents not in this list will not be reported, but you are encouraged to send a pull request or issue if you find any missing ones.

## Limitations

### False Negatives
The chance for false negatives is quite high. Agents are not always tagged as a contributor. This tool will not detect that as it does not analyze the code itself. This can apply for merge commits as well.

Additionally, as mentioned above, any new agents not in the list above will not be caught.

### Metrics

The percentage shown on a repo is of commits with a tagged contributor, not of the entire codebase.

### Default branch
Github only reports contributors data for the default branch- If contributions by an Agent are in another branch, they will not be counted.

### Quality

The amount of code contributed by an AI agent might not always reflect the quality of the code.