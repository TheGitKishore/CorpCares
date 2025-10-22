import { UserAccount } from './UserAccount.js';
import { ServiceCategory } from './ServiceCategory.js';

export class ServiceRequest {
    
    static #nextID = 1;

    #id
    #title;
    #description;
    #category;
    #owner;
    #datePosted;

    constructor(title, description, category, owner){
        
        this.#id = ServiceRequest.#nextID++;
        this.#title = title;
        this.#description = description;

        if (!(category instanceof ServiceCategory)) {
            throw new TypeError("Expected category to be a instance of ServiceCategory");
        }
        this.#category = category;

        if (!(owner instanceof UserAccount)) {
            throw new TypeError("Expected owner to be a instance of UserAccount");
        }
        this.#owner = owner;
        
        this.#datePosted = new Date();
        
    }

    get id(){
        return this.#id;
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
        return this.#description;
    }

    set description(newDescription){
        if (typeof newDescription !== 'string') {
            throw new TypeError("Description must be a string!");
        }
        this.#description = newDescription;      
    }

    get category(){
        return this.#category;
    }

    set category(newCategory){
        if (!(newCategory instanceof ServiceCategory)) {
            throw new TypeError("Expected newCategory to be a instance of UserAccount");
        }

        this.#category = newCategory;
    }

    get owner(){
        return this.#owner;
    }

    set owner(newOwner){
        if (!(newOwner instanceof UserAccount)) {
            throw new TypeError("Expected newOwner to be a instance of UserAccount");
        }
        this.#owner = newOwner;
    }

    get datePosted(){
        return this.#datePosted;
    }
}