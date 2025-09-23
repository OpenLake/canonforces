export interface User {
    fullname?: string;
    username: string;
    dateCreated: Date | null;
    userId: string;
    email: string;
    photoURL: string;
    followers: Array<string>;
    following: Array<string>;
}