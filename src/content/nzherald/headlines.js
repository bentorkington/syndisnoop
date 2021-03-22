import * as nzh from '../../lib/nzh';
import {forEachNode} from '../../lib/lib';
import browser from 'webextension-polyfill';

function makeHttpObject() {
    try { return new XMLHttpRequest(); }
    catch (error) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (error) { }
    try { return new ActiveXObject("Microsoft.XMLHTTP"); }
    catch (error) { }

    throw new Error("Could not create HTTP request object.");
}

function new6GotResponse() {    
    if (this.readyState == 4) {
        var articleParser = new DOMParser();
        var articleDoc = articleParser.parseFromString(this.responseText, "text/html");

        var slug = this.parent;
        var syndicator = firstOrNull(articleDoc.getElementsByClassName("syndicator-name"));

        var title = slug.headlineText;

        var pageArticle = articleDoc.getElementsByClassName('article-header')[0];
        var pageFigure;
        var pageHeadline;

        if (pageArticle) {
            pageFigure = pageArticle.getElementsByTagName('figure')[0];
            if (pageFigure) {
                pageHeadline = pageFigure.getElementsByTagName('h1')[0];   
                slug.headline.setAttribute('title', pageHeadline.innerText);  
                
                checkOpiners(pageHeadline, slug);
            }
            else {
                console.log("no headline " + title);
            }
        } 
        else {
            console.log("no figure " + title);
        }

        // XXX need to find a better way of identifying Spy content
        if (firstOrNull(articleDoc.getElementsByClassName("header-main__logo"))) {
            // todo: this should replace the section header, not just add to it
            slug.warningFunc(slug, "SPY.CO.NZ");
        }

        var articleBody = articleDoc.getElementById('article-content');
        if (articleBody) {
            // metaTags= articleBody.getElementsByTagName('meta');
            // console.log("META TAG: " + metaTags[0].getAttribute('content'));

            var archiveRegex = /Herald archive originally apper?ared in (\w+ \d+)\./g;
            var match = archiveRegex.exec(articleBody.innerText);
            if (match) {
                slug.warningFunc(slug, match[1]);
            }

            archiveRegex = /In case you missed it/g;
            match = archiveRegex.exec(articleBody.innerText);
            if (match) {
                slug.warningFunc(slug, "REPOSTED ");
            }

            archiveRegex = /top stories for 2017/g;
            match = archiveRegex.exec(articleBody.innerText);
            if (match) {
                slug.warningFunc(slug, "REPOSTED ");
            }
        }

        checkSyndicator(this.parent, articleDoc, syndicator, this.parent.warningFunc);
    }   
}

function checkOpiners(pageHeadline, slug) {
    opiners.forEach(function(opiner) {
        if (pageHeadline.innerText.includes(opiner.name + ":")) {
            slug.warningFunc(slug, opiner.tag.toUpperCase() + " ");
        }
    });
}

function parseHeadDate(str) {
    // example: //      3:08pm Wed 8 March
    //                 1 hour,   2 min,  3 am/pm 4 dayName 5 day  6 monthname
    var m = str.match(/(\d{1,2}):(\d{2})([ap]m) (\w{3}) (\d{1,2}) (\w+)/);
    var year = new Date().getFullYear();
    if (m[3] == "pm")
        m[1] = parseInt(m[1]) + 12;

    return (m) ? new Date(year, getMonthFromString(m[6]), m[5], /* hours */ m[1], m[2]) : null;
}

function findBaileys() {

    var frames = document.getElementsByTagName('iframe');
    var frameArray = Array.from(frames);
    var filtered = frameArray.filter(e => e.getAttribute('src').match(/.*Bayleys_v3$/));

    return firstOrNull(filtered).parentNode.parentNode;
}

function findFocus(heading) {
    // var headers = Array.from(document.getElementsByTagName('h3'));
    // var filtered = headers.filter(e => e.innerText == "NZ Herald Focus and Local Focus videos");
    // return filtered[0].parentNode.parentNode.parentNode;
    return Array.from(document.getElementsByTagName('h3')).filter(e => e.innerText == heading)[0].parentNode.parentNode.parentNode;
}

var warningStyle;
var mutedAuthors;
var frontPageSectionHide;
// read settings
const prom = browser.storage.sync.get({
    warningStyle: "greyfloat",
    mutedAuthors: [ ],
    frontPageSectionHide: [ ],
    licensed: false,
}).then((items) => {
  warningStyle = items.warningStyle;
  mutedAuthors = items.mutedAuthors.filter(name => name.length > 0).map(name => name.toUpperCase());
  frontPageSectionHide = items.frontPageSectionHide;

  scanPage();
})

var articleStore = [];
var lavaStore = [];

function scanPage() {
    var navBar = document.querySelector("header");
    const mast = navBar.querySelector('div.header__search');

    var syndiSnoopName = document.createElement('div');
    syndiSnoopName.classList.add('site-text', 'site-name');
    syndiSnoopName.appendChild(document.createTextNode("with SyndiSnoop"));
    syndiSnoopName.setAttribute('style', 'color: #ccc;')


    var syndiLogoWrapper = document.createElement("div");
    var syndiLogoImage = document.createElement("img");

    var syndiLogo = chrome.extension.getURL("icon_48.png");
    syndiLogoImage.attributes.src = syndiLogo;
    syndiLogoImage.setAttribute('src', syndiLogo);
    syndiLogoImage.setAttribute('style', 'height: 32px; color: #ccc');

    syndiLogoWrapper.appendChild(syndiSnoopName);

    navBar.insertBefore(syndiLogoImage, mast);
    navBar.insertBefore(syndiLogoWrapper, mast);

    // logoWrapper.setAttribute('style', 'text-align: center; margin: 2px; color: #ccc;');
    // logoWrapper.insertBefore(syndiLogoWrapper, logoWrapper.children[3]);

    const premiumToaster = document.querySelector('div#premium-toaster');
    if (premiumToaster) {
      premiumToaster.remove();
    }

    const mo = new MutationObserver((mutations, observer)  => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.getAttribute('id') === 'premium-toaster') {
              syndilog('removed premium-toaster');
              node.remove();
            }
          })
        }
        else if (mutation.type === 'attributes') {
          // an attribute was modified
        }
      }
    });

    mo.observe(document, {attributes: true, childList: true, subtree: true});

    processNew();
}

function queueNewArticle(articleObject) {
        articleStore.push(articleObject);

        var authorName;
        if (authorName = articleObject.headlineText.toUpperCase().match(/^(.*):/)) {      
            if (mutedAuthors.indexOf(authorName[1]) > -1)
            {
                articleObject.element.parentNode.removeChild(articleObject.element);
                return;
            }
        }

        // console.log(articleObject.headlineText);
        // console.log(articleObject.url);
        // console.log(articleObject.articleId);

        // var parent = articleObject.element.parentElement;
        //console.log(parent.className + " -- " + articleObject.headlineText);

        if (/^\//.test(articleObject.url))      // don't fetch across domains, not allowed
        {
            //console.log('fetching ' + articleObject.headlineText + " at " + articleObject.url)
            articleObject.request.parent = articleObject;
            articleObject.request.open("GET", articleObject.url);
            articleObject.request.send(null);
            articleObject.request.onreadystatechange = new6GotResponse;
        }
}

function queueHero(article) {
    try {
        queueNewArticle(new NewArticleHero(article, makeHttpObject()));
    }
    catch (err) {
        console.log("Exception building NewHero: " + err);
    }
}

function queueArticle(article) {
    try {
        queueNewArticle(new NewArticle6(article, makeHttpObject()));
    }
    catch (err) {
        console.log("Exception building NewArticle6: " + err);
    }
}

function syndilog(message) {
  console.log('syndisnoop:', message);
}

function processNew() {
    var hero = document.getElementById("main").getElementsByClassName("story-hero");

    //var breakingBanner = document.getElementById("breaking-alert");
    //treatBreaker(breakingBanner);

    //var mo = new MutationObserver(breakingBannerModified);
    //mo.observe(breakingBanner, { childList: true, subtree: true});

    // slug-less headlines   
    var articles = document.getElementsByTagName('article');
    var feed = document.getElementsByClassName("pb-f-homepage-story-feed"); 

    const observer = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => {
        const t = e.target;
        try {
          const headline = t.querySelector('.story-card__heading').innerText;
          const link = t.querySelector('a.story-card__heading__link').href;
          // syndilog({headline, link});  
        }
        catch(err) {
          syndilog(`failed to parse intersection result`);
          syndilog(t);
        }
      })
    }, { root: null });


    Array.from(articles).forEach(e => observer.observe(e));

    setTimeout(function() {
    // var bayleys = findBaileys();
    // bayleys.parentNode.removeChild(bayleys);

        frontPageSectionHide.map(x => frontPageSectionTitles[x]).forEach(titleText => {
            var focus = findFocus(titleText);
            focus.parentNode.removeChild(focus);
        });

    }, 1000);
}

function breakingBannerModified(modifiedObjects, observer) {
    console.log("BREAK BREAK OMG");
    console.log(modifiedObjects);
    if (modifiedObjects.addedNodes.count > 0) {
        var added = modifiedObjects.addedNodes[0];

        treatBreaker(document.getElementById('breaking-alert'))
    }
}

function treatBreaker(breaker) {
    var message = firstOrNull(breaker.getElementsByClassName('breaking-news-item'))
    
    if (message) {
        console.log("break: " + message.innerText);
        var avoids = [
            /\bdie[ds]\b/i,
            /\bdead\b/i,
            /\binjur(ed?|ies|ing)\b/i,
            /\bkill(ed)?\b/i,
            /\brap(ed?|ing)?\b/i,
            /\bmurder(ed|ing)?\b/i,
            /\bhurt\b/i,
            /\bfuneral\b/i,
        ];
        var doIt = true

        avoids.forEach(function (avoid) {
            console.log("considering " + avoid);
            if (message.innerText.match(avoid)) {
            
                console.log("that did it");
                doIt = false;
            }
        })

        if (doIt) {
            var label = breaker.children[0].children[0];
            label.innerHTML = "Oh my<span>God:</span>";
        }

        var breakurl = breaker.children[1].children[0].getAttribute('href');

        var req = new XMLHttpRequest();
        req.parent = breaker;
        req.open("GET", breakurl);
        req.onreadystatechange = breakerResponse;
        req.send(null);
    }
}

function breakerResponse() {    
    if (this.readyState == 4) {
        var articleParser = new DOMParser();
        var articleDoc = articleParser.parseFromString(this.responseText, "text/html");

        var breaker = this.parent;

        var pageArticle = articleDoc.getElementsByClassName('article-header')[0];
        var pageFigure;
        var pageHeadline;
        var opine = false;

        if (pageArticle) {
            pageFigure = pageArticle.getElementsByTagName('figure')[0];
            if (pageFigure) {
                pageHeadline = pageFigure.getElementsByTagName('h1')[0];   
                
                console.log("BREAK RESPONSSE");
                console.log(pageHeadline);
                
                opiners.forEach(function(opiner) {
                    if (pageHeadline.innerText.includes(opiner.name + ":")) {
                        breaker.children[0].children[0].innerHTML = opiner.nick + " has got <span>a reckon:</span>"
                    }
                });            
            }
            else {
                console.log("no headline " + title);
            }
        } 
        else {
            console.log("no figure " + title);
        }
    }   
}
