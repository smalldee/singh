import { homedir } from "os";
import { join } from "path";
import { StoreObject } from 'store_object';
import { pathExists, readJson, writeJson, unlink, ensureFile } from "fs-extra";
import { deltaObject, printTitle, listFromStoreObjects } from 'utils';
import { outdent } from 'outdent';


interface IData
{
    machineObjects: StoreObject[],
    storeObjects: StoreObject[],
    deltaStoreObjects: StoreObject[],
    deltaMachineObjects: StoreObject[],
}

export abstract class Minister
{
    abstract dependancies: Minister[];
    // abstract exist (): Promise<boolean>;
    abstract version (): Promise<string>;
    abstract install ( objs: StoreObject[] ): Promise<string | undefined>;
    abstract uninstall ( objs: StoreObject[] ): Promise<string | undefined>;
    abstract listLocalObjects (): Promise<StoreObject[]>;
    abstract getName (): string;

    path = '';

    constructor ()
    {
        this.path = join( homedir(), `.lord/${ this.getName() }/${ this.getName() }.json` )
    }


    async data (): Promise<IData>
    {
        let debug = false;
        debug && console.log( `${ this.getName().toUpperCase() }: Feaching Data Objects...` );
        const [ machineObjects, storeObjects ] = await Promise.all(
            [ this.listLocalObjects(), this.readStore() ]
        );

        debug && console.log( outdent
            `${ this.getName().toLocaleUpperCase() }:
                Machine Object:
                ${ JSON.stringify( machineObjects ) }
                Store Objects:
                ${JSON.stringify( storeObjects ) }`
        );

        const deltaMachineObjects = await deltaObject( machineObjects, storeObjects );
        debug && console.log( outdent
            `
            Delta Machine Objects:
            ${JSON.stringify( deltaMachineObjects ) }
            `
        );

        const deltaStoreObjects = await deltaObject( storeObjects, machineObjects );
        debug && console.log( outdent
            `
            Delta Store Objects:
            ${JSON.stringify( deltaStoreObjects ) }
            `
        );

        return { machineObjects, storeObjects, deltaMachineObjects, deltaStoreObjects }
    }

    async backup ()
    {
        // Run dependancy
        await Promise.all(
            this.dependancies.map
                (
                async dependancy => { return await dependancy.backup() }
                )
        );
        const { machineObjects, deltaMachineObjects, deltaStoreObjects } = await this.data();

        let listDeltaMachineObjects = listFromStoreObjects( deltaMachineObjects );
        let listDeltaStoreObjects = listFromStoreObjects( deltaStoreObjects );

        printTitle( this.getName() );
        listDeltaMachineObjects &&
            console.log( `Store Add:\n${ listDeltaMachineObjects }\n` );

        listDeltaStoreObjects &&
            console.log( `Store Remove:\n${ listDeltaStoreObjects }\n` );

        ( !listDeltaStoreObjects || !listDeltaMachineObjects ) &&
            console.log( `Up to date` );

        await this.writeStore( machineObjects );

    }

    async push ()
    {
        // Run dependancy
        await Promise.all(
            this.dependancies.map
                (
                async minister => { return await minister.push() }
                )
        );

        const { storeObjects, deltaMachineObjects } = await this.data();

        let listDeltaMachineObjects = listFromStoreObjects( deltaMachineObjects );

        printTitle( this.getName() );
        listDeltaMachineObjects &&
            console.log( `Store Add:\n${ listDeltaMachineObjects }\n` );

        !listDeltaMachineObjects &&
            console.log( `Up to date` );

        await this.writeStore( storeObjects.concat( deltaMachineObjects ) );

    }

    async restore ()
    {
        // Run dependancy
        await Promise.all(
            this.dependancies.map
                (
                async minister => { return await minister.restore() }
                )
        );

        const { deltaMachineObjects, deltaStoreObjects } = await this.data();

        let listDeltaMachineObjects = listFromStoreObjects( deltaMachineObjects );
        let listDeltaStoreObjects = listFromStoreObjects( deltaStoreObjects );

        printTitle( this.getName() );
        listDeltaMachineObjects &&
            console.log( `Machine Add:\n${ listDeltaStoreObjects }\n` );

        listDeltaStoreObjects &&
            console.log( `Machine Remove:\n${ listDeltaMachineObjects }\n` );

        ( !listDeltaStoreObjects || !listDeltaMachineObjects ) &&
            console.log( `Up to date` );

        await this.install( deltaStoreObjects )
            .catch( e => console.log( e ) );

        await this.uninstall( deltaMachineObjects )
            .catch( e => console.log( e ) );

    }

    async pull ()
    {
        // Run dependancy
        await Promise.all(
            this.dependancies.map
                (
                async minister => { return await minister.pull() }
                )
        );

        const { deltaStoreObjects } = await this.data();

        let listDeltaStoreObjects = listFromStoreObjects( deltaStoreObjects );

        printTitle( this.getName() );
        listDeltaStoreObjects &&
            console.log( `Store Add:\n${ listDeltaStoreObjects }\n` );

        !listDeltaStoreObjects &&
            console.log( `Up to date` );

        await this.install( deltaStoreObjects );

    }

    async writeStore ( objs: StoreObject[] )
    {
        await ensureFile( this.path );
        await writeJson( this.path, objs, { spaces: 2 } );
    }

    async readStore (): Promise<StoreObject[]>
    {
        if ( await pathExists( this.path ) )
        {
            return await readJson( this.path ) as StoreObject[];
        }
        else
        {
            await this.writeStore( [] );
            return [];
        }
    }
}