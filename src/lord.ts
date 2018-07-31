import { Minister } from 'minister';

import { Brew } from 'plugins/brew';
import { Cask } from 'plugins/cask';
import { Mas } from 'plugins/mas';
import { Node } from 'plugins/node';

import { printTitle, listFromStoreObjects } from 'utils';
import { outdent } from "outdent";

export class Lord
{
    private static instance: Lord;
    private constructor ()
    {
        // Check Available ministers
        this.ministers = this.ministers.filter( minister => minister.exist() );
        console.log( `Found Ministers: ${ Array.from( this.ministers, minister => minister.getName() ).join( ', ' ) }` );
    }
    static getInstance ()
    {
        if ( !Lord.instance )
        {
            Lord.instance = new Lord();
        }
        return Lord.instance;
    }

    ministers: Minister[] = [
        Brew.getInstance() as Minister,
        Cask.getInstance() as Minister,
        Mas.getInstance() as Minister,
        Node.getInstance() as Minister,
    ];

    // async formatlist ( minister: Minister )
    // {
    //     console.log( 'a' );
    //     const apps = await minister.apps();

    //     console.log( minister.name );
    //     let join = '';
    //     apps.forEach( app => join += `${ app.name } ` );
    //     console.log( join );
    // }

    // async formatlist ( minister: Minister, x: any )
    // {
    //     console.log( 'a', x );
    //     minister.apps()
    //         .then( apps =>
    //         {
    //             console.log();
    //             console.log( minister.name );
    //             console.log();
    //             let join = '';
    //             apps.forEach( app => join += `${ app.name } ` );
    //             console.log( join );
    //         } )
    //     console.log( 'b', x );
    // }

    async diff ()
    {
        this.ministers
            .map
            ( async minister =>
            {
                const { deltaMachineObjects, deltaStoreObjects } = await minister.data();

                let listDeltaLocalObjects = listFromStoreObjects( deltaMachineObjects );
                let listDeltaStoreObjects = listFromStoreObjects( deltaStoreObjects );

                printTitle( minister.getName() );
                listDeltaLocalObjects &&
                    console.log( `Store Add:\n${ listDeltaLocalObjects }\n` );

                listDeltaStoreObjects &&
                    console.log( `Store Remove:\n${ listDeltaStoreObjects }\n` );

                ( !listDeltaStoreObjects && !listDeltaLocalObjects ) &&
                    console.log( `Up to date` );

            }
            );
    }

    async list ()
    {
        this.ministers
            .map
            ( async minister =>
            {
                const apps = await minister.listLocalObjects();

                let listLocal = listFromStoreObjects( apps );

                printTitle( minister.getName() );

                console.log( listLocal );
            }
            );
    }

    async store ()
    {
        this.ministers
            .map
            ( async minister =>
            {
                const apps = await minister.readStore();

                let listStore = listFromStoreObjects( apps );

                printTitle( minister.getName() )

                if ( listStore )
                {
                    console.log( listStore );
                }
                else
                {
                    console.log( "Upto Date" );
                }

            }
            );
    }

    async push ()
    {
        console.log( '\nPushing...' );

        Promise.all
            (
            this.ministers.map( async minister => await minister.push() )
            );
    }

    async pull ()
    {
        console.log( '\nPulling...' );

        for ( let minister of this.ministers )
        {
            await minister.pull();
        }
    }

    async backup ()
    {
        console.log( '\nBacking Up...' );

        Promise.all(
            await this.ministers
                .map( async minister => await minister.backup() )
        );
    }

    async restore ()
    {
        console.log( '\nRestoring...' );

        for ( let minister of this.ministers )
        {
            await minister.restore();
        }
    }

    async versions ()
    {
        printTitle( 'Versions' )
        Promise.all(
            this.ministers.map(
                async minister =>
                    console.log(
                        outdent
                            `
                            ${ outdent }
                            ${ minister.getName() }:
                            ${  await minister.version() }
                            `
                    ) )
        )
    }

}
