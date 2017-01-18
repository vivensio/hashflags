function Main() {}

function getEl(identifier) {
    return document.querySelector(identifier);
}

function scrubElement(identifier) {
    var el = document.querySelector(identifier);
    while (el.firstChild) el.removeChild(el.firstChild);
}

function createElement(type, className) {
    var el = document.createElement(type);
    el.classList.add(className);
    return el;
}

function addRemoveClass(targetClass, operation, classToOperate) {
    document.querySelector('.' + targetClass).classList[operation](classToOperate);
}

var forEach = function (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]); // passes back stuff we need
  }
};

function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready (init);

function getJSON(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
        if (request.status === 200) {
            callback(JSON.parse(request.responseText));
        }
    };
    request.send();
}

function createHeaderBG() {
    var pattern = Trianglify({
        width: window.innerWidth,
        x_colors: ["#225ea8","#253494","#081d58"]
    }).png();
    getEl('.top-container').style.backgroundImage = 'url(' + pattern + ')';
}

function hideLoader() {
    addRemoveClass('spinner', 'add', 'hidden');
    var hashflags = document.querySelectorAll('.hashflag');

    forEach(hashflags, function (index, value) {
        setTimeout(function() {
            value.classList.add('is-visible');
        }, index);
    });
    
    setContainerHeight();
    addRemoveClass('footer', 'add', 'is-visible');
}

var hashflags = {
    "baseUrl": '',
    "getHashflagUrl": function (val) {
        return this.baseUrl + val;
    },
    "getHashtagUrl": function (val) {
        return "https://www.twitter.com/hashtag/" + val;
    }
};

function getHashflags() {
    var queryUrl = (document.location.protocol === "https:" ? "https" : "http") + "://query.yahooapis.com/v1/public/yql?q=select * from html where url='http://twitter.com/twitter'&format=json&diagnosis=true";
    getJSON(queryUrl, function (data) {
        var tw = JSON.parse(data.query.results.body.input[0].value);
        hashflags.baseUrl = tw.hashflagBaseUrl;
        hashflags.unordered = tw.activeHashflags; 
        regroup(hashflags.unordered);
        hideLoader();
    });
}

function regroup(unordered) {
    hashflags.ordered = {};
    for (var item in unordered) {
        var imgLink = unordered[item];
        if (!hashflags.ordered[imgLink]) {
            hashflags.ordered[imgLink] = {};
            hashflags.ordered[imgLink][0] = item;
        } else {
            var count = Object.keys(hashflags.ordered[imgLink]).length - 1 ;
            hashflags.ordered[imgLink][count + 1] = item;
        }
    }
    drawPage();
}

function drawPage() {
    for (var item in hashflags.ordered) {
        var bgSrc = hashflags.getHashflagUrl(item);

        var div = createElement('div', 'hashflag');
        div.style.backgroundImage = 'url('+ bgSrc +')';
        div.dataset.hashtags = '';
        
        for ( var prop in hashflags.ordered[item]) {
            var hash = hashflags.ordered[item][prop];
            div.dataset.hashtags += hash + ' ';
        }

        div.onclick = onHashflagClick;
        getEl('.hashflags-container').appendChild(div);
    }

    getEl('.hashflags-container').appendChild(getEl('.footer'));
    getEl('.what').onclick = function () {
        addRemoveClass('yep', 'add', 'is-visible');
    };

    getEl('.container').addEventListener('click', function (e) {
        addRemoveClass('suggestions', 'remove', 'is-visible');
        getEl('.hint-input').value = '';
        if (getEl('.yep').classList.contains('is-visible') && !e.target.classList.contains('what'))
            getEl('.yep').classList.remove('is-visible');
    });
}

function onHashflagClick(event) {
    var tags = event.target.dataset.hashtags.trim().split(' ');
    var url = hashflags.unordered[tags[0]];
    scrubElement('.details-container');

    var div = createElement('div', 'hashflag-image');
    var src = hashflags.getHashflagUrl(url);
    div.style.backgroundImage = 'url('+ src +')';
    getEl('.details-container').appendChild(div);

    var siblings = createElement('div', 'hashflag-siblings');
    details.renderSiblings(siblings, url, null);
    getEl('.details-container').appendChild(siblings);
    details.showDetails();
    resetSugg();
}

function keyMapper(keyCode) {
    var keyCodes =  {9: "tab", 27: "esc", 37: "left", 39: "right", 13: "enter", 38: "up", 40: "down" };
    return keyCodes[keyCode];
}

function resetSugg(val) {
    scrubElement('.suggestions');
    hashflags.suggCounter = -1;
    getEl('.hint-input').value = val || '';
    getEl('.search-input').value = val || '';
    addRemoveClass('suggestions', 'remove', 'is-visible');
}

function setContainerHeight () {
    var top = document.querySelector('.top-container').offsetHeight;
    var bottom = document.querySelector('.bottom-container').offsetHeight;
    var screenHeight = window.innerHeight;
    addRemoveClass('footer', 'remove', 'is-fixed');

    if (bottom < screenHeight - top) {
        document.querySelector('.bottom-container').style.height = (screenHeight - top) + 'px';
        addRemoveClass('footer', 'add', 'is-fixed');
    }
}


Details = function () {}
Details.prototype = {
    constructor: Details,
    init: function () {
        this.initListener();
    },
    initListener: function () {
        getEl('.close-details').addEventListener('click', this.hideDetails.bind(this));
    },
    renderDetails: function (tag) {
        var url = hashflags.unordered[tag];
        getEl('.search-input').value = tag;
        
        scrubElement('.details-container');
        var div = createElement('div', 'hashflag-image');
        var src = hashflags.getHashflagUrl(url);
        div.style.backgroundImage = 'url('+ src +')';
        getEl('.details-container').appendChild(div);

        var siblings = createElement('div', 'hashflag-siblings');
        this.renderSiblings(siblings, url, tag);
        getEl('.details-container').appendChild(siblings);

        this.showDetails();
        resetSugg(tag);
    },
    showDetails: function () {
        addRemoveClass('details-container', 'add', 'is-visible');
        addRemoveClass('hashflags-container', 'add', 'shrunk');
        addRemoveClass('top-container', 'add', 'shrunk');
        addRemoveClass('close-details', 'add', 'is-visible');
        addRemoveClass('footer', 'remove', 'is-visible');
    },
    hideDetails: function () {
        addRemoveClass('details-container', 'remove', 'is-visible');
        addRemoveClass('hashflags-container', 'remove', 'shrunk');
        addRemoveClass('top-container', 'remove', 'shrunk');
        addRemoveClass('close-details', 'remove', 'is-visible');
        addRemoveClass('footer', 'add', 'is-visible');
    },
    renderSiblings: function (siblings, url, clickedSugg) {
        for (var prop in hashflags.ordered[url]) {
            var tag = hashflags.ordered[url][prop];
            var sibling = createElement('a', 'hashflag-sibling');
            sibling.innerHTML = tag;
            sibling.setAttribute("target", "_blank");
            sibling.href = hashflags.getHashtagUrl(tag);

            if (clickedSugg && clickedSugg == tag)
                siblings.insertBefore(sibling, siblings.firstChild);
            else
                siblings.appendChild(sibling);
        }
    }
}

function Search() {
    suggestionsArr = [];
    input = getEl('.search-input');
    hint = '';
    counter = -1;
    self = this;
}
Search.prototype = {
    constructor: Search,
    initListener: function () {
        this.onKeyup();
    },
    onKeyup: function() {
        input.onkeyup = function(e) {
            self.setHint('');
            var key = keyMapper(e.which);
            if (key == 'right') self.onRightKey();
            suggestionsArr = [];
            addRemoveClass('err-msg', 'remove', 'is-visible');
            addRemoveClass('err-msg', 'remove', 'is-shown');
            var val = this.value;
            if (val.length > 1) {
                if (val.indexOf('#') == 0 && val.length > 2) {
                    for (var hash in hashflags.unordered) {
                        if (suggestionsArr.length < 10) {
                            var index = ('#' + hash).toLowerCase().indexOf(val.toLowerCase());
                            if (index > -1) suggestionsArr.push(hash);
                        }
                    }
                } else {
                    for (var hash in hashflags.unordered) {
                        if (suggestionsArr.length < 10) {
                            var index = hash.toLowerCase().indexOf(val.toLowerCase());
                            if (index == 0) suggestionsArr.unshift(hash);
                            else if (index > 0) suggestionsArr.push(hash);
                        }   
                    }
                }
                self.renderSuggestions();
                self.onSuggestionClick();
                self.toggleSuggestionHint();
            } else {
                self.onEscKey();
            }
            self.onSpecialKey(key);
        };
    },
    renderSuggestions: function () {
        var suggestions = getEl('.suggestions');
        scrubElement('.suggestions');

        if (suggestionsArr.length == 0) {
            addRemoveClass('err-msg', 'add', 'is-visible');
            addRemoveClass('err-msg', 'add', 'is-shown');
        } else {
            addRemoveClass('err-msg', 'remove', 'is-visible');
            addRemoveClass('err-msg', 'remove', 'is-shown');
        }

        for (var i = 0; i < suggestionsArr.length; i+= 1) {
            var div = createElement('div', 'suggestion');
            div.innerHTML = suggestionsArr[i];
            suggestions.appendChild(div);
        }

        addRemoveClass('suggestions', suggestionsArr.length ? 'add' : 'remove', 'is-visible');
    },
    onSpecialKey: function (key) {
        if ((key == 'up' || key == 'down') && suggestionsArr.length) self.onUpDownKey(key);
        else if (key == 'enter') self.onEnterKey();
        else if (key == 'esc') self.onEscKey();
        else if (key == 'right') self.onRightKey();
        else counter = -1;
    },
    onRightKey: function () {
        if (input.selectionStart == input.value.length && hint) {
            input.value = hint;
        }
    },
    onUpDownKey: function (dir) {
        if (dir == 'up') counter -= 1;
        else if (dir == 'down') counter += 1;
        var sel = counter % suggestionsArr.length;
        document.querySelectorAll('.suggestion')[sel].classList.add('hovered');
    },
    onEnterKey: function () {
        var sel = 0;
        if (counter != -1)
            sel = counter % suggestionsArr.length;
        var target = document.querySelectorAll('.suggestion')[sel];
        input.value = target.innerHTML;
        details.renderDetails(target.innerHTML);
    },
    onEscKey: function () {
        scrubElement('.suggestions');
        counter = -1;
        self.setHint('');
        addRemoveClass('suggestions', 'remove', 'is-visible');
    },
    onSuggestionClick: function () {
        var suggestion = document.querySelectorAll('.suggestion');
        for (var i = 0; i < suggestion.length; i += 1) {
            suggestion[i].addEventListener('click', function(e) {
                var text = e.target.innerText || e.target.textContent
                details.renderDetails(text);
            });
        }

        forEach(suggestion, function (index, value) {
            value.addEventListener("mouseenter", function () {
                this.classList.add('hovered');
            });
            value.addEventListener("mouseout", function () {
                this.classList.remove('hovered');
            });
        });
    },
    toggleSuggestionHint: function () {
        var hint = '';
        if (suggestionsArr.length && suggestionsArr[0].indexOf(input.value) == 0)
            hint = suggestionsArr[0];
        
        self.setHint(hint);
    },
    setHint: function(val) {
        getEl('.hint-input').value = val || '';
        hint = val;
    },
    init: function() {
        this.initListener();
    }
}

Main.prototype = {
    constructor: Main,
    init: function () {
        details = new Details;
        details.init();
        search = new Search;
        search.init();
        createHeaderBG();
        window.addEventListener('resize', createHeaderBG, true);
    }
}

var main = new Main;
function init() {
    getHashflags();
    main.init();
}