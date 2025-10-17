export class ServiceCategory{

    static #nextID = 1;

    #id;
    #title;
    #description;

    constructor(id, title, description){
        this.#id = ServiceCategory.#nextID++;
        this.#title = title;
        this.#description = description;
    }

    get id(){
        return this.#id
    }

    get title(){
        return null
    }
}