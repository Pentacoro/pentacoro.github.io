pocket = {
    icon: [],
    clip: [],

    remove: function(arr, value) {
        arr = arr.filter(function(item) {
            return item !== value
        })
    }
}