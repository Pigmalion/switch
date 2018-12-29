let aEvents, aEvents1;
aEvents = [
    {id: 111, start: 50, end: 190},
    {id: 222, start: 360, end: 420},
    {id: 333, start: 380, end: 440},
    {id: 444, start: 430, end: 490},
    {id: 555, start: 500, end: 590},
    {id: 666, start: 435, end: 590},


];
aEvents1 = [
    {
        "id": 1,
        "start": 23,
        "end": 113
    },
    {
        "id": 2,
        "start": 81,
        "end": 455
    },
    {
        "id": 3,
        "start": 339,
        "end": 597
    },
    {
        "id": 4,
        "start": 387,
        "end": 686
    },
    {
        "id": 5,
        "start": 454,
        "end": 673
    }
];
const containerWidth = 600;


function createElements(aRes) {
    let result = [];
    for (let i = 0; i < aRes.length; ++i) {
        const innerElementAsString = "<div class=\"tileTitle\">Sample Item - " +
            aRes[i].id + "</div>" +
            "<div class=\"tileTitle tileSubTitle\">Sample Location</div>";
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

function _increaseNextTilesDivider(eventArray, nextCollisions, divider) {
    if (nextCollisions && eventArray) {
        nextCollisions.forEach(e => {
            let event = _findElementByID(eventArray, e);
            if (event && event.divider) {
                event.divider = Math.max(event.divider, divider);
            }
        });
    }
}

function _increasePrevTilesDividerRec(eventArray, prevCollisions, location) {

    if (prevCollisions && prevCollisions.length > 0) {
        prevCollisions.forEach((e) => {
            let elem = _findElementByID(eventArray, e);
            if (elem && elem.prevCollisions) {
                elem.divider = Math.max(location, elem.divider);
                _increasePrevTilesDividerRec(eventArray, elem.prevCollisions, location);
            } else if (elem) {
                elem.divider = Math.max(location, elem.divider);

            }
        });
    }
}

function _locationProcess(eventArray) {
    for (let i = 0; i < eventArray.length; ++i) {
        if (eventArray[i].root) {
            eventArray[i].location = 1;
        } else {
            eventArray[i].location = eventArray[i].hasOwnProperty("prevCollisions") ? eventArray[i].prevCollisions.length + 1 : 1;
            if (eventArray[i].location > eventArray[i].divider) {
                console.log("This is where you dance!! " + eventArray[i].id);
                eventArray[i].divider = eventArray[i].location;
                _increaseNextTilesDivider(eventArray, eventArray[i].nextCollisions, eventArray[i].location);
                _increasePrevTilesDividerRec(eventArray, eventArray[i].prevCollisions, eventArray[i].location);
            }
        }
    }
}

function _rearangeRoots(eventArray) {
    eventArray.forEach((event, i) => {
        if (event.hasOwnProperty("nextCollisions") || event.hasOwnProperty("prevCollisions")) {
            if (event.root) {
                event.location = 0;
                if (event.nextCollisions && !event.prevCollisions) {
                    event.divider = event.nextCollisions.length + 1;
                    event.nextCollisions.forEach((e) => {
                        const nextE = _findElementByID(eventArray, e);
                        event.divider = nextE.divider = Math.max(event.divider, nextE.divider);
                    });
                } else if (event.nextCollisions && event.prevCollisions) {
                    event.prevCollisions.forEach((e) => {
                        const prevE = _findElementByID(eventArray, e);
                        event.divider = prevE.divider = Math.max(event.divider, prevE.divider);
                    });
                    event.nextCollisions.forEach((e) => {
                        const nextE = _findElementByID(eventArray, e);
                        event.divider = nextE.divider = Math.max(event.divider, nextE.divider);
                    });

                } else if (event.prevCollisions) {
                    let element = _findElementByID(eventArray, event.prevCollisions[event.prevCollisions.length - 1]);
                    event.divider = element.divider;
                }

                if (event.nextCollisions && eventArray.length - 1 > i + event.nextCollisions.length) {
                    eventArray[i + 1 + event.nextCollisions.length].root = true;
                }

            } else {
                if (event.nextCollisions && event.nextCollisions.length > 1 && _findElementByID(eventArray, event.nextCollisions[0]).root) {
                }
            }
        }
    });
}

function _checkAllCollisions(eventArray) {
    eventArray[0].root = true;


    for (let i = 0; i < eventArray.length; ++i) {
        eventArray[i].location = 0;
        eventArray[i].divider = 1;

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

function _processAllCollidedEvents(aEvents) {
    if (!aEvents || aEvents.length === 0) {
        return;
    } else {
        aEvents.forEach((e) => {
            e.width = containerWidth / e.divider;
            e.left = (e.location - 1) * e.width;
        });
    }

}

function sortEvents(aEvents) {
    aEvents = aEvents.filter(a => a.start < a.end);
    aEvents.sort((a, b) => a.start - b.start);
    aEvents[0].top = aEvents[0].start;
    aEvents[0].left = 0;
    _checkAllCollisions(aEvents);
    _rearangeRoots(aEvents);
    _locationProcess(aEvents);
    _processAllCollidedEvents(aEvents);

    return aEvents;
}

function appendChildren(elem, tiles) {
    for (let i = 0; i < tiles.length; i++) {
        elem.appendChild(tiles[i]);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const aRes = sortEvents(aEvents1);
    console.log(aEvents);
    const tiles = createElements(aRes);
    const elem = document.getElementById("container");
    appendChildren(elem, tiles);
    console.log(elem + "GOT IT ")
}, false);
