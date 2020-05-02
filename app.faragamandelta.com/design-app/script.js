const canvas = document.querySelector('#canvas')
var fabricCanvas = new fabric.Canvas(canvas);
const checkbox = document.querySelector('#checkbox')
let initialPos, bounds, rect, dragging = false,
    freeDrawing = checkbox.checked

var ctx = fabricCanvas.getSelectionContext(),
    aligningLineOffset = 5,
    aligningLineMargin = 4,
    aligningLineWidth = 1,
    aligningLineColor = 'rgb(0,255,0)',
    viewportTransform,
    zoom = 1;
var verticalLines = [],
    horizontalLines = []
const options = {
    drawRect: drawRect.checked,
    onlyOne: onlyOne.checked,
    rectProps: {
        stroke: 'red',
        strokeWidth: 1,
        fill: ''
    }
}

function cache_xy(x, y) {
    x_array.push(x)
    y_array.push(y)
    x_array.sort()
    y_array.sort()
}

function onObjMove(e) {
    console.log(e)
}

function onMouseDown(e) {
    dragging = true;
    if (!freeDrawing) {
        return
    }
    initialPos = {...e.pointer
    }
    bounds = {}
    if (options.drawRect) {
        rect = new fabric.Rect({
            left: initialPos.x,
            top: initialPos.y,
            width: 0,
            height: 0,
            ...options.rectProps
        });
        fabricCanvas.add(rect)
    }

    viewportTransform = fabricCanvas.viewportTransform;
    zoom = fabricCanvas.getZoom();
}

function update(pointer) {
    if (initialPos.x > pointer.x) {
        bounds.x = Math.max(0, pointer.x)
        bounds.width = initialPos.x - bounds.x
    } else {
        bounds.x = initialPos.x
        bounds.width = pointer.x - initialPos.x
    }
    if (initialPos.y > pointer.y) {
        bounds.y = Math.max(0, pointer.y)
        bounds.height = initialPos.y - bounds.y
    } else {
        bounds.height = pointer.y - initialPos.y
        bounds.y = initialPos.y
    }
    if (options.drawRect) {
        rect.left = bounds.x
        rect.top = bounds.y
        rect.width = bounds.width
        rect.height = bounds.height
        rect.dirty = true
        fabricCanvas.requestRenderAllBound()
    }
}

function onMouseMove(e) {
    if (!dragging || !freeDrawing) {
        return
    }
    requestAnimationFrame(() => update(e.pointer))
}

function onMouseUp(e) {
    dragging = false;
    if (!freeDrawing) {
        return
    }
    if (options.drawRect && rect && (rect.width == 0 || rect.height === 0)) {
        fabricCanvas.remove(rect)
    }
    if (!options.drawRect || !rect) {
        rect = new fabric.Rect({
            ...bounds,
            left: bounds.x,
            top: bounds.y,
            ...options.rectProps
        });
        fabricCanvas.add(rect)
        rect.dirty = true
        fabricCanvas.requestRenderAllBound()
    }
    rect.setCoords() // important!
        // cache_xy(rect.aCoords.tl.x, rect.aCoords.tl.y)
        // cache_xy(rect.aCoords.br.x, rect.aCoords.br.y)
        // rect.on('moving', onObjMove)
    verticalLines.length = horizontalLines.length = 0;
    fabricCanvas.renderAll();
    options.onlyOne && uninstall()
}

fabricCanvas.on('object:moving', function(e) {

    var activeObject = e.target,
        canvasObjects = fabricCanvas.getObjects(),
        activeObjectCenter = activeObject.getCenterPoint(),
        activeObjectLeft = activeObjectCenter.x,
        activeObjectTop = activeObjectCenter.y,
        activeObjectBoundingRect = activeObject.getBoundingRect(),
        activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
        activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
        horizontalInTheRange = false,
        verticalInTheRange = false,
        transform = fabricCanvas._currentTransform;

    if (!transform) return;

    // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
    // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

    for (var i = canvasObjects.length; i--;) {

        if (canvasObjects[i] === activeObject) continue;

        var objectCenter = canvasObjects[i].getCenterPoint(),
            objectLeft = objectCenter.x,
            objectTop = objectCenter.y,
            objectBoundingRect = canvasObjects[i].getBoundingRect(),
            objectHeight = objectBoundingRect.height / viewportTransform[3],
            objectWidth = objectBoundingRect.width / viewportTransform[0];

        // snap by the horizontal center line
        if (isInRange(objectLeft, activeObjectLeft)) {
            verticalInTheRange = true;
            verticalLines.push({
                x: objectLeft,
                y1: (objectTop < activeObjectTop) ?
                    (objectTop - objectHeight / 2 - aligningLineOffset) :
                    (objectTop + objectHeight / 2 + aligningLineOffset),
                y2: (activeObjectTop > objectTop) ?
                    (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) :
                    (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
        }

        // snap by the active left edge to obj left edge
        if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
            verticalInTheRange = true;
            verticalLines.push({
                x: objectLeft - objectWidth / 2,
                y1: (objectTop < activeObjectTop) ?
                    (objectTop - objectHeight / 2 - aligningLineOffset) :
                    (objectTop + objectHeight / 2 + aligningLineOffset),
                y2: (activeObjectTop > objectTop) ?
                    (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) :
                    (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the active left edge to obj right edge
        if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
            verticalInTheRange = true;
            verticalLines.push({
                x: objectLeft - objectWidth / 2,
                y1: (objectTop < activeObjectTop) ?
                    (objectTop - objectHeight / 2 - aligningLineOffset) :
                    (objectTop + objectHeight / 2 + aligningLineOffset),
                y2: (activeObjectTop > objectTop) ?
                    (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) :
                    (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the active right edge to obj right edge
        if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
            verticalInTheRange = true;
            verticalLines.push({
                x: objectLeft + objectWidth / 2,
                y1: (objectTop < activeObjectTop) ?
                    (objectTop - objectHeight / 2 - aligningLineOffset) :
                    (objectTop + objectHeight / 2 + aligningLineOffset),
                y2: (activeObjectTop > objectTop) ?
                    (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) :
                    (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the active left edge to obj right edge
        if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
            verticalInTheRange = true;
            verticalLines.push({
                x: objectLeft + objectWidth / 2,
                y1: (objectTop < activeObjectTop) ?
                    (objectTop - objectHeight / 2 - aligningLineOffset) :
                    (objectTop + objectHeight / 2 + aligningLineOffset),
                y2: (activeObjectTop > objectTop) ?
                    (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset) :
                    (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the vertical center line
        if (isInRange(objectTop, activeObjectTop)) {
            horizontalInTheRange = true;
            horizontalLines.push({
                y: objectTop,
                x1: (objectLeft < activeObjectLeft) ?
                    (objectLeft - objectWidth / 2 - aligningLineOffset) :
                    (objectLeft + objectWidth / 2 + aligningLineOffset),
                x2: (activeObjectLeft > objectLeft) ?
                    (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) :
                    (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
        }

        if (isInRange(objectTop + objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
            horizontalInTheRange = true;
            horizontalLines.push({
                y: objectTop + objectHeight / 2,
                x1: (objectLeft < activeObjectLeft) ?
                    (objectLeft - objectWidth / 2 - aligningLineOffset) :
                    (objectLeft + objectWidth / 2 + aligningLineOffset),
                x2: (activeObjectLeft > objectLeft) ?
                    (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) :
                    (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
        }

        // snap by the top edge
        if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
            horizontalInTheRange = true;
            horizontalLines.push({
                y: objectTop - objectHeight / 2,
                x1: (objectLeft < activeObjectLeft) ?
                    (objectLeft - objectWidth / 2 - aligningLineOffset) :
                    (objectLeft + objectWidth / 2 + aligningLineOffset),
                x2: (activeObjectLeft > objectLeft) ?
                    (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) :
                    (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
        }

        if (isInRange(objectTop - objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
            horizontalInTheRange = true;
            horizontalLines.push({
                y: objectTop - objectHeight / 2,
                x1: (objectLeft < activeObjectLeft) ?
                    (objectLeft - objectWidth / 2 - aligningLineOffset) :
                    (objectLeft + objectWidth / 2 + aligningLineOffset),
                x2: (activeObjectLeft > objectLeft) ?
                    (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) :
                    (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
        }

        // snap by the bottom edge
        if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
            horizontalInTheRange = true;
            horizontalLines.push({
                y: objectTop + objectHeight / 2,
                x1: (objectLeft < activeObjectLeft) ?
                    (objectLeft - objectWidth / 2 - aligningLineOffset) :
                    (objectLeft + objectWidth / 2 + aligningLineOffset),
                x2: (activeObjectLeft > objectLeft) ?
                    (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset) :
                    (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
            });
            activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
        }
    }

    if (!horizontalInTheRange) {
        horizontalLines.length = 0;
    }

    if (!verticalInTheRange) {
        verticalLines.length = 0;
    }
});

fabricCanvas.on('before:render', function() {
    fabricCanvas.clearContext(fabricCanvas.contextTop);
});

fabricCanvas.on('after:render', function() {
    for (var i = verticalLines.length; i--;) {
        drawVerticalLine(verticalLines[i]);
    }
    for (var i = horizontalLines.length; i--;) {
        drawHorizontalLine(horizontalLines[i]);
    }

    verticalLines.length = horizontalLines.length = 0;
});

function install() {
    freeDrawing = true;
    dragging = false;
    rect = null
    checkbox.checked = true
    fabricCanvas.on('mouse:down', onMouseDown);
    fabricCanvas.on('mouse:move', onMouseMove);
    fabricCanvas.on('mouse:up', onMouseUp);
}

function uninstall() {
    freeDrawing = false;
    dragging = false;
    rect = null
    checkbox.checked = false
    fabricCanvas.off('mouse:down', onMouseDown);
    fabricCanvas.off('mouse:move', onMouseMove);
    fabricCanvas.off('mouse:up', onMouseUp);
}

// the following is OOT - it's just for the controls above
checkbox.addEventListener('change', e =>
    e.currentTarget.checked ? install() : uninstall()
)
document.querySelector('#drawRect').addEventListener('change', e => {
    options.drawRect = e.currentTarget.checked
})
document.querySelector('#onlyOne').addEventListener('change', e => {
    options.onlyOne = e.currentTarget.checked
})
freeDrawing && install()
document.querySelector('#changeCanvasPosition').addEventListener('click', () => {
    const el = document.querySelector(`.wrapper`)
    el.style.marginTop = Math.trunc(Math.random() * 300) + 'px'
    el.style.marginLeft = Math.trunc(Math.random() * 200) + 'px'
})