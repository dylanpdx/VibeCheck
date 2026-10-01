// ==UserScript==
// @name         VibeCheck
// @namespace    https://vibecheck.dylanpdx.io
// @version      0.1.1
// @description  Userscript for listing contributions by AI Agents
// @author       dylanpdx
// @match        https://github.com/*
// @icon         https://vibecheck.dylanpdx.io/src/icon/icon.png
// @grant        GM_setValue
// @grant        GM_getValue
// @downloadURL  https://vibecheck.dylanpdx.io/src/VibeCheck.user.js
// ==/UserScript==


const uidRegex = /\.com\/u\/([0-9]+)/gm
const cacheDays = 1;
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
    "Copilot" // app
]

async function getValue(key){
    if (typeof GM !== 'undefined'){
        return GM.getValue(key)
    }else if (typeof browser.storage !== 'undefined'){
        const result = await browser.storage.local.get(key);
        return result[key];
    }
    console.error("no suitable storage");
    return undefined;
    
}

async function setValue(key,value){
    if (typeof GM !== 'undefined'){
        return GM.setValue(key,value);
    }else if (typeof browser.storage !== 'undefined'){
        return browser.storage.local.set({[key]: value});
    }
    console.error("no suitable storage");
}

function newElement(type, attrs) {
    const element = document.createElement(type);
    for (const attr of Object.keys(attrs)) {
        element.setAttribute(attr, attrs[attr]);
    }
    return element;
}

async function getRepoContribs(username, reponame) {
    const contributors_data = (await window.fetch(`https://github.com/${username}/${reponame}/graphs/contributors-data`, {
            "headers": {
                "Accept": "application/json"
            }
        })).json();

    const sidebar = (await window.fetch(`https://github.com/${username}/${reponame}/_sidebar/contributors`, {
            "headers": {
                "Accept": "application/json"
            }
        })).json();
    
    return {"contributors":(await contributors_data),"sidebar":(await sidebar)}
}

function parseWeeks(weeks) {
    let a = 0;
    let d = 0;
    for (const week of weeks) {
        a += week.a;
        d += week.d;
    }
    return [a, d];
}

async function detectRepoAgents(username, reponame) {
    const when = Date.now();
    const sbKey = `sbvibecheck/${username}/${reponame}`;
    const stored = await getValue(sbKey);
    if (stored != null && stored != undefined) {
        const jStored = JSON.parse(stored);
        const lastFetched = jStored.t;
        if (when <= (lastFetched + (86400000*cacheDays)))
            return jStored.d;
    }
    const contributorData = await getRepoContribs(username, reponame);
    const contributors = contributorData.contributors;
    const sidebar = contributorData.sidebar;
    let totalA = 0;
    let totalD = 0;
    let agentA = 0;
    let agentD = 0;
    let agentC = 0;
    let perAgent = {}
    for (const contribution of contributors) {
        const weekTotals = parseWeeks(contribution.weeks);
        weekTotals.push(contribution.total);
        const author = contribution.author;
        if (agents.includes(author.login)) {
            agentA += weekTotals[0];
            agentD += weekTotals[1];
            agentC += contribution.total;
            perAgent[author.login] = {
                "id": author.id,
                "totals": weekTotals,
            };
        }
        totalA += weekTotals[0];
        totalD += weekTotals[1];
    }

    // check sidebar next
    for (const contributor of sidebar.contributors){
        if (agents.includes(contributor.login) && perAgent[contributor.login] == undefined) {
            parsedUid = uidRegex.exec(contributor.avatarUrl);
            perAgent[contributor.login] = {
                "id":parseInt(parsedUid[1]),
                "totals":[0,0,0]
            }
        }
    }

    const detected = {
        "totalC": [totalA, totalD],
        "agentC": [agentA, agentD, agentC],
        "hasagent": Object.keys(perAgent).length > 0,
        "agents": perAgent
    }

    await setValue(sbKey, JSON.stringify({
            "t": when,
            "d": detected
        }));

    return detected;
}

function calcMetric(agentC, totalC) {
    if (agentC[0] == 0 || agentC[1] == 0 || totalC[0] == 0 || totalC[1] == 0)
    {
        return 0;
    }
    return ((agentC[0] / totalC[0]) + (agentC[1] / totalC[1])) / 2;
}

async function runScan(){
    const path = window.location.pathname.split("/")
    if (path.length != 3) {
        return;
    }
    const username = path[1]
    const repo = path[2];
    const found = await detectRepoAgents(username, repo);

    if (found.hasagent) {
        const header = document.querySelectorAll('div[class^="OverviewContent-"].mt-0')[0];
        var agentBusterSection = newElement("section", {"class":"sb Banner"});

        var container = newElement("div", {"class":"BannerContainer"});
        agentBusterSection.appendChild(container)

        var content = newElement("div", {"class":"BannerContent"});

        var warning = newElement("span", {});

        const agentMetric = calcMetric(found.agentC, found.totalC);

        if (agentMetric != 0)
        {
            warning.innerHTML = `<b>${parseFloat((agentMetric*100)).toFixed( 2 )}%</b> of contributions to this repository are from known AI Agents.`;
        }
        else
        {
            // big repos don't populate change count
            
            if (found.agentC[2] > 0){
                warning.innerHTML = `<b>${found.agentC[2]}</b> commits to this repository are from known AI Agents.`;
            }else{
                warning.innerHTML = `This repository tags a known AI Agent as a contributor.`;
            }
        }

        const tooltip = newElement("div", {"class":"sbTooltip"});

        for (const agentName of Object.keys(found.agents)) {
            const agent = found.agents[agentName];
            const agentInfo = newElement("div", {"class":"agentInfo"});
            const agentPic = newElement("img", {"src":`https://avatars.githubusercontent.com/u/${agent.id}?size=40`,"height":"20","class": "sbAvatar"});
            const agentData = newElement("span", {"class":"agentData"});
            const agentMetric = calcMetric(agent.totals, found.totalC);
            if (agentMetric != 0){
                agentData.innerHTML = `<a href="https://github.com/${agentName}">${agentName}</a> <span class="sbAdd">+${agent.totals[0]}</span> <span class="sbDel">-${agent.totals[1]}</span> <span>(${parseFloat((agentMetric*100)).toFixed( 2 )}%)</span>`
            }else{
                if (agent.totals[2] > 0){
                    agentData.innerHTML = `<a href="https://github.com/${agentName}">${agentName}</a> <span>${agent.totals[2]} commits</span>`
                }else{
                    agentData.innerHTML = `<a href="https://github.com/${agentName}">${agentName}</a> <span>(tagged)</span>`
                }
            }
            agentInfo.appendChild(agentPic);
            agentInfo.appendChild(agentData);
            tooltip.appendChild(agentInfo);
        }

        warning.appendChild(tooltip);

        content.appendChild(warning);

        container.appendChild(content);
        header.prepend(agentBusterSection)
    }
}

(async function () {
    'use strict';

    var dom_observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.tagName != "REACT-APP" && mutation.target.className != "loaded")
                return;
            const nclass = mutation.target.getAttribute("app-name");
            if (nclass == "code-view"){
                runScan();
            }
        })
    });

    dom_observer.observe(document.documentElement || document.body, { subtree:true,attributeFilter:["class"],attributes:true });
    
    document.head.append(Object.assign(document.createElement("style"), {
            type: "text/css",
            textContent: `
.sb{
display: flex;
}

.sb .BannerContainer{
width: 100%;
}

.sbTooltip {
  visibility: hidden;
  background-color: black;
  color: #ffffff;
  padding: 5px 0;
  border-radius: 6px;
  position: absolute;
  z-index: 1;
  padding: .7em;
}

.agentInfo .agentData {
vertical-align: super;
padding-left: .5em;
}

.sb:hover .sbTooltip {
  visibility: visible;
}

.sbAvatar{
border-radius: 50%;
}

.sbAdd{
color: var(--fgColor-success,var(--color-success-fg)) !important
}

.sbDel{
color: var(--fgColor-danger,var(--color-danger-fg)) !important
}

`
        }))
})();
