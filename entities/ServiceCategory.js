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
        return this.#title;
    }

    set title(newTitle){
        if (typeof newTitle !== 'string') {
            throw new TypeError("Title must be a string!");
        }
        this.#title = newTitle;
    }

    get description(){
        return this.#description
    }

    set description(newDescription){
        if (typeof newDescription !== 'string') {
            throw new TypeError("Description must be a string!");
        }
        this.#description = newDescription;      
    }

    
}