String.prototype.splice = function (index, count) {
    let splicedStr = this.slice(0, index) + this.slice(index + count, this.length)
    let extractStr = ""
    for(i = index; i < index+count; i++) {
        extractStr += this[i.toString()]
    }
    return [splicedStr, extractStr]
}

String.prototype.lines = function () {
    return this.split('\n')
}

Array.prototype.remove = function(value) {
    let newArr = this.filter(function(item) {
        return item !== value
    })

    return newArr
}