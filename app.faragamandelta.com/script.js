function closest(array, num) {
    var i = 0;
    var minDiff = 5;
    var ans = num;
    for (i in array) {
        var m = Math.abs(num - array[i]);
        if (m < minDiff) {
            minDiff = m;
            ans = array[i];
        }
    }
    return ans;
}

function update_name(e) {
    console.log(e)
}


function elem(elem_tag, innerHTML) {
    let ret = document.createElement(elem_tag)
    ret.innerHTML = innerHTML
    return ret
}

var paper = document.createElement("div")
var toolbox_container = document.createElement("div")
paper.id = "paper"
toolbox_container.id = "toolbox-container"
document.body.appendChild(paper)
document.body.appendChild(toolbox_container)

var toolbox = document.createElement("div")
toolbox.id = "toolbox"
    // toolbox.appendChild(elem('p', 'One'))
toolbox_container.appendChild(toolbox)