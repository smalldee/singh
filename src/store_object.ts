export class StoreObject
{
    id: string;
    alias?: string;
    version?: string;

    constructor ( id: string )
    {
        this.id = id;
    }
}