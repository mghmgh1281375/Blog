/**
 * Should objects be aligned by a bounding box?
 * [Bug] Scaled objects sometimes can not be aligned by edges
 *
 */



function drawVerticalLine(coords) {
    drawLine(
        coords.x + 0.5,
        coords.y1 > coords.y2 ? coords.y2 : coords.y1,
        coords.x + 0.5,
        coords.y2 > coords.y1 ? coords.y2 : coords.y1);
}

function drawHorizontalLine(coords) {
    drawLine(
        coords.x1 > coords.x2 ? coords.x2 : coords.x1,
        coords.y + 0.5,
        coords.x2 > coords.x1 ? coords.x2 : coords.x1,
        coords.y + 0.5);
}

function drawLine(x1, y1, x2, y2) {
    ctx.save();
    ctx.lineWidth = aligningLineWidth;
    ctx.strokeStyle = aligningLineColor;
    ctx.beginPath();
    ctx.moveTo(((x1 + viewportTransform[4]) * zoom), ((y1 + viewportTransform[5]) * zoom));
    ctx.lineTo(((x2 + viewportTransform[4]) * zoom), ((y2 + viewportTransform[5]) * zoom));
    ctx.stroke();
    ctx.restore();
}

function isInRange(value1, value2) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    if (value2 >= value1 - aligningLineMargin && value2 <= value1 + aligningLineMargin)
        return true
    return false;
}

// var verticalLines = [],
//     horizontalLines = [];