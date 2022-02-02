function Node(valor){
    this.value = valor;
    this.next = null;
}

function LinkedList() {
    this.head = null;
}

LinkedList.prototype.add = function(valor) {
    var nuevoNodo = new Node(valor);

    if(!this.head){
        this.head = nuevoNodo;
    } else {
        var tailActual = this.head;
        while (tailActual.next !== null) {
        tailActual = tailActual.next;
        }
        tailActual.next = nuevoNodo;
    }
}

LinkedList.prototype.remove = function() {
    if(!this.head){
        return undefined;
    }

    if(this.head.next === null){
        var unicoNodo = this.head;
        this.head = null;
        return unicoNodo.value;
    }

    var nodoActual = this.head.next;
    var nodoPrevious = this.head;
    while (nodoActual.next !== null) {
        nodoPrevious = nodoActual;
        nodoActual = nodoActual.next;
    }
    nodoPrevious.next = null;
    return nodoActual.value;
}

LinkedList.prototype.search = function(arg) {
    var nodoActual = this.head;

    if(nodoActual === null){
        return null;
}

while (nodoActual !== null) {
        if(typeof arg === "function"){
        if(arg(nodoActual.value)){
            return nodoActual.value;
        }
        } else if(nodoActual.value === arg){
            return nodoActual.value;
        }
        nodoActual = nodoActual.next;
    }

return null;
}

let linkedList = new LinkedList
linkedList.add(6)
linkedList.add(4)
linkedList.add(2)
linkedList.add(7)
linkedList.add(8)
linkedList.add(1)

LinkedList.prototype.orderList = function() {
    let _this = this
    let logic = "_this.head"
    let current = eval(logic)
    let arr = []

    function getAndAdd(evalu, array) {
        arr.push(current.value)

        logic = logic + ".next"    

        current = eval(logic)
        if (current != null) getAndAdd(evalu, array)
    }
    
    getAndAdd(logic, arr)

    arr.sort()
    console.log(arr)
    return arr
}

linkedList.orderList()