

function insert6Warning (article, syndicator) {
    var synNode = document.createTextNode(syndicator);
    var synPara = document.createElement("span");

    synPara.className = "section-lifestyle-color caps-header";

    synPara.appendChild(synNode);

    var headerLabel = article.element.getElementsByClassName('header-label')[0];
    headerLabel.appendChild(synPara);

    if (!hasAncestorWithClass(article.element, 'section-entertainment-background')) { 
        // actually the Spy section, has burgundy b/g so we shouldn't override it
        switch (warningStyle) {
            case 'yellow':
                article.element.setAttribute("style", "background: #ffffcc;");
                break;
            case 'greyfloat':
            default:
                article.element.setAttribute("style", "background: #eeeeee; opacity: 0.6; ");
                //article.headline.setAttribute("style", "-webkit-filter: blur(1px); -moz-filter: blur(1px); -o-filter: blur(1px); -ms-filter: blur(1px); filter: blur(1px);")
                break;
        }
    }
}

function insert6HeroWarning (article, syndicator) {
    var synNode = document.createTextNode(syndicator);
    var synPara = document.createElement("span");

    synPara.className = "section-lifestyle-color caps-header";
    synPara.setAttribute('style', 'background: #ffffcc;');

    synPara.appendChild(synNode);

    var headerLabel = article.element.getElementsByClassName('header-label')[0];
    headerLabel.appendChild(synPara);

    var headline = article.element.getElementsByTagName('h3')[0];
    switch(warningStyle) {
        case 'yellow':
            headline.setAttribute("style", "color: #ffffcc;");
            break;
        case 'greyfloat':
        default:
            headline.setAttribute("style", "color: #ffffcc; filter: blur(6);");
            article.element.setAttribute('style', 'opacity: 0.6;');
            break;
    }
}

function NewArticle6(rootElement, theRequest) {
    this.element = rootElement;
    this.request = theRequest;
    this.headline = rootElement.getElementsByClassName("headline")[0].children[1];
    this.headlineText = this.headline.innerText;
    
    this.articleCopy = rootElement.getElementsByClassName("blurb");
    this.url = this.element.getElementsByTagName('h3')[0].getElementsByTagName('a')[0].getAttribute("href");
    if (this.url.match(/objectid=\d+/)) {
        this.articleId = this.url.match(/objectid=(\d+)/)[1];
    } else {
        this.articleId = -1;
    }    

    this.warningFunc = insert6Warning;
}

function NewArticleHero(rootElement, theRequest) {
    this.element = rootElement;
    this.request = theRequest;


    var heroHeadline = rootElement.getElementsByClassName("text-wrapper")[0];
    if (heroHeadline.children[0].className == "super") {
        this.headline = rootElement.getElementsByClassName("text-wrapper")[0].children[0].children[1].children[0];
    }
    else {
        this.headline = rootElement.getElementsByClassName("text-wrapper")[0].children[1].children[0];
    }

    this.headlineText = this.headline.innerText;
    
    this.url = this.headline.getAttribute("href");
    if (this.url.match(/objectid=\d+/)) {
        this.articleId = this.url.match(/objectid=(\d+)/)[1];
    } else {
        this.articleId = -1;
    }    
    this.warningFunc = insert6HeroWarning;
}


function checkSyndicator(article, articleDoc, syndicator, callback) {
    if (syndicator != null)
    {
        var syntext = syndicator.innerHTML;

        var synFound = syndicators.find( function(syn) {
            return syntext.includes(syn.name);
        })
        if (synFound != null)
            callback(article, synFound.name);
    }
    else {
        // try this instead
        var articleBody = articleDoc.getElementById("articleBody");
        if (articleBody != null) {
            paragraphs = articleBody.getElementsByTagName("p");
            lastPara = paragraphs[paragraphs.length - 1];

            var syntext = lastPara.innerText;
            var synFound = syndicators.find ( function(syn) {
                return syntext.includes(syn.name);
            });
            if (synFound != null) {
                callback(article, synFound.name);
            }
            else if (lastPara.innerHTML.includes("spy.nzherald.co.nz")) {
                callback(article, "Spy");
            }
            else if (lastPara.innerText.includes("Bang! Showbiz")) {
                callback(article, "Bang!");
            }
        }
    }    
}
