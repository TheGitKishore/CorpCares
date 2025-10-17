import { UserProfile } from './UserProfile.js';

export class ServiceRequest {
    
    static #nextID = 1;

    #id
    #title;
    #description;
    #category;
    #owner;
    #datePosted;

    constructor(id, title, description, category, owner, datePosted){
        this.#id = ServiceRequest.#nextID++;
        this.#title = title;
        this.#description = description;
        this.#category
    }
}