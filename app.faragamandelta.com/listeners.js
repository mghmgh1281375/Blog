var temp_area;
var mousedown = false
var mousedown_X, mousedown_Y

var x_array = Array();
var y_array = Array();

function create_temp_area(x, y) {
    temp_area = document.createElement('div')
    temp_area.className = "area"
    temp_area.style.width = "1px"
    temp_area.style.height = "1px"
    temp_area.style.left = X + "px"
    temp_area.style.top = Y + "px"

    temp_area_size = document.createElement('p')
    temp_area.appendChild(temp_area_size)

    temp_area_name = document.createElement('input')
    temp_area_name.value = "area#" + paper.children.length
        // temp_area_name.addEventListener('keydown', function(e) {
        //     console.log(e);
        // });
    temp_area.appendChild(temp_area_name)
    temp_area.addEventListener('dragstart', function(e) {
        this.delta_dragstartX = e.clientX
        this.delta_dragstartY = e.clientY
    })
    temp_area.addEventListener('dragend', function(e) {
        drag_width = e.clientX - this.delta_dragstartX
        drag_height = e.clientY - this.delta_dragstartY
        new_left = closest(x_array, (this.offsetLeft + drag_width))
        new_top = closest(y_array, (this.offsetTop + drag_height))
        this.style.left = new_left + "px"
        this.style.top = new_top + "px"

        x_array.push(new_left)
        x_array.push(new_left + this.offsetWidth)
        y_array.push(new_top)
        y_array.push(new_top + this.offsetHeight)
    })
    temp_area.addEventListener('mousedown', function(e) {
        // console.log(e)
        e.stopPropagation()
    })
    return temp_area
}

paper.addEventListener('mousedown', function(e) {
    mousedown = true
    X = e.clientX
    Y = e.clientY
    mousedown_X = X
    mousedown_Y = Y
    temp_area = create_temp_area(X, Y)
    this.appendChild(temp_area)
});
paper.addEventListener('mousemove', function(e) {
    if (mousedown)
        if (temp_area) {
            width = e.clientX - mousedown_X
            height = e.clientY - mousedown_Y
            if (Math.abs(width) > 100 && Math.abs(height) > 30) {
                temp_area.firstChild.innerHTML = Math.abs(width * 1.5) / 100 + "m x " + Math.abs(height * 1.5) / 100 + "m"
            } else {
                temp_area.firstChild.innerHTML = ""
            }

            x_closest = closest(x_array, e.clientX)
            y_closest = closest(y_array, e.clientY)

            if (width > 0)
                width = mousedown_X - closest(x_array, mousedown_X + width)
            if (height > 0)
                height = mousedown_Y - closest(y_array, mousedown_Y + height)

            temp_area.style.width = Math.abs(width) + "px"
            temp_area.style.height = Math.abs(height) + "px"
            if (e.clientX - mousedown_X < 0) {
                temp_area.style.left = x_closest + "px"
            }
            if (e.clientY - mousedown_Y < 0) {
                temp_area.style.top = y_closest + "px"
            }

        }
});

paper.addEventListener('mouseup', function(e) {
    if (mousedown) {
        x_array.push(e.clientX)
        x_array.push(mousedown_X)
        y_array.push(e.clientY)
        y_array.push(mousedown_Y)
        if (temp_area != null) {
            if (temp_area.offsetWidth < 100 || temp_area.offsetHeight < 30) {
                paper.removeChild(paper.lastChild);
            } else {
                paper.lastChild.draggable = true
            }
        }
        mousedown = false
        temp_area = null
    }
});

document.addEventListener('keydown', function(e) {
    if (e.keyCode == 90 && e.ctrlKey)
        paper.removeChild(paper.lastChild);
});