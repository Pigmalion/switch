let aEvents;
aEvents = [
    {id: 131, start: 50, end: 190},

    {id: 222, start: 360, end: 420},
    {id: 333, start: 380, end: 440},
    {id: 444, start: 430, end: 490},
    {id: 555, start: 480, end: 590},


];
const containerWidth = 600;


function createElements(aRes) {
    let result = [];
    const innerElementAsString = "<div class=\"tileTitle\">Sample Item</div>" +
        "<div class=\"tileTitle tileSubTitle\">Sample Location</div>";


    for (let i = 0; i < aRes.length; ++i) {
        let newElement = document.createElement('div');
        newElement.className = "tile";
        newElement.innerHTML = innerElementAsString.trim();
        const width = aRes[i].hasOwnProperty("width") ? aRes[i].width : 880;
        const height = aRes[i].end - aRes[i].start;
        const left = aRes[i].left || 0;

        const strAttr = "top:" + aRes[i].start + "px;" + "left:" + left + "px;" + "width:" + width + "px;" + "height:" + height + "px;";
        newElement.setAttribute("style", strAttr);
        result.push(newElement);
    }
    return result;
}

function _findElementByID(aEvents, id) {
    if (aEvents && aEvents.length > 0) {
        return aEvents.find(e => e.id === id);
    }
}

function _rearangeRoots(eventArray) {
    eventArray.forEach((event, i) => {
        if (event.hasOwnProperty("nextCollisions") || event.hasOwnProperty("prevCollisions")) {
            if (event.root) {
                if (event.nextCollisions && !event.prevCollisions) {
                    event.devider = event.nextCollisions.length + 1;
                    event.nextCollisions.forEach(e => {
                        const nextE = _findElementByID(eventArray, e);
                        nextE.hasOwnProperty("devider") ? nextE.devider : nextE.devider = 0;
                        event.devider = nextE.devider = Math.max(event.devider, nextE.devider);
                    });
                } else if (event.nextCollisions && event.prevCollisions) {
                    event.prevCollisions.forEach(e => {
                        const prevE = _findElementByID(eventArray, e);
                        event.devider = prevE.devider ;
                    });
                    event.nextCollisions.forEach(e => {
                        const nextE = _findElementByID(eventArray, e);
                        nextE.hasOwnProperty("devider") ? nextE.devider : nextE.devider = 0;
                        event.devider = nextE.devider = Math.max(event.devider, nextE.devider);
                    });

                } else if (event.prevCollisions) {
                    let element = _findElementByID(eventArray, event.prevCollisions[event.prevCollisions.length - 1]);
                    event.devider = element.devider;
                }

                if (event.nextCollisions && eventArray.length - 1 > i + event.nextCollisions.length) {
                    eventArray[i + 1 + event.nextCollisions.length].root = true;
                }

            }
        } else {
            console.log(event);
        }
    });
}

function _checkAllCollisions(eventArray) {
    eventArray[0].root = true;
    for (let i = 0; i < eventArray.length; ++i) {
        for (let j = i + 1; j < eventArray.length; j++) {
            if (eventArray[i].end > eventArray[j].start) {
                eventArray[i].hasOwnProperty("nextCollisions") ? eventArray[i].nextCollisions.push(eventArray[j].id) : eventArray[i].nextCollisions = [eventArray[j].id];
                eventArray[j].hasOwnProperty("prevCollisions") ? eventArray[j].prevCollisions.push(eventArray[i].id) : eventArray[j].prevCollisions = [eventArray[i].id];
                eventArray[j].root = false;
            } else {
                eventArray[j].root = true;
            }
        }
    }
    _rearangeRoots(eventArray);
}

function processAllCollidedEvents(aEvents) {
    if (!aEvents || aEvents.length === 0) {
        return;
    } else {
        let multiplier = 0;
        aEvents.forEach((e) => {
            if (e.devider) {
                e.width = containerWidth / e.devider;
                if (e.root) {
                    e.left = multiplier = 0;

                } else {
                    e.left = ++multiplier * e.width;
                }
            } else {
                e.width = containerWidth;
            }
        });
    }

}

function sortEvents(aEvents) {

    aEvents.sort((a, b) => a.start - b.start);
    aEvents[0].top = aEvents[0].start;
    aEvents[0].left = 0;
    _checkAllCollisions(aEvents);

    processAllCollidedEvents(aEvents);

    return aEvents;

}

function appendChildren(elem, tiles) {
    for (let i = 0; i < tiles.length; i++) {
        elem.appendChild(tiles[i]);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const aRes = sortEvents(aEvents);
    console.log(aRes);
    const tiles = createElements(aRes);

    const elem = document.getElementById("container");
    appendChildren(elem, tiles);
    console.log(elem + "GOT IT ")
}, false);
